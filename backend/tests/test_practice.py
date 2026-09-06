import unittest
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB
from fastapi.testclient import TestClient
from app.core.database import Base, get_db
from app.api.deps import get_current_user
from app.main import app
from app.models import user, resume, job_description, interview_session, generated_question
from app.schemas.practice import Feedback

@compiles(JSONB, 'sqlite')
def compile_jsonb(element, compiler, **kw):
    return 'JSON'

class PracticeTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine, expire_on_commit=False)()
        self.user = user.User(email='tester@example.com', hashed_password='unused')
        self.db.add(self.user); self.db.flush()
        self.resume = resume.Resume(user_id=self.user.id, original_filename='test.pdf', file_path='test.pdf', extracted_text='Built React features')
        # Only persisted fields are set; the fixture never reads a real resume.
        self.db.add(self.resume)
        self.job = job_description.JobDescription(user_id=self.user.id, raw_text='Build React features and test interfaces for users.', parsed_json={})
        self.db.add(self.job); self.db.flush()
        self.session = interview_session.InterviewSession(user_id=self.user.id, resume_id=self.resume.id, job_description_id=self.job.id, status='completed')
        self.db.add(self.session); self.db.flush()
        self.question = generated_question.GeneratedQuestion(session_id=self.session.id, question_type='technical', question_text='How would you test this?', order_index=0)
        self.db.add(self.question); self.db.commit()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[get_current_user] = lambda: self.user
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear(); self.db.close(); self.engine.dispose()

    @patch('app.api.routes.answers.evaluate_attempt')
    def test_attempt_persistence_retry_followup_and_progress(self, evaluate):
        evaluate.return_value = Feedback(relevance=3, specificity=2, structure=3, technical_depth=2,
            strengths=['Explains testing.'], improvements=['Add boundary cases.'], next_step='Explain an edge case.', follow_up='What happens when the API fails?')
        endpoint = f'/answers/{self.question.id}'
        draft = self.client.patch(endpoint + '/practice', json={'draft_text': 'I would test API failures.', 'bookmarked': True})
        self.assertEqual(draft.status_code, 200)
        first = self.client.post(endpoint + '/attempts', json={'answer_text': 'I would test API failures and invalid user input.'})
        self.assertEqual(first.status_code, 201, first.text)
        second = self.client.post(endpoint + '/attempts', json={'answer_text': 'I would test retry limits and keep the user input.'})
        self.assertEqual(second.status_code, 201)
        self.assertEqual(evaluate.call_args.args[-1], first.json()['answer_text'])
        follow = self.client.post(endpoint + '/attempts', json={'answer_text': 'I show an error and offer a retry without losing input.', 'follow_up_from': first.json()['id']})
        self.assertEqual(follow.json()['prompt_text'], 'What happens when the API fails?')
        self.assertEqual(len(self.client.get(endpoint + '/attempts').json()), 3)
        self.db.expire_all()
        session = self.client.get(f'/interviews/{self.session.id}').json()
        self.assertEqual(session['practiced_count'], 1)
        self.assertEqual(session['attempt_count'], 3)
        self.assertEqual(session['answer_count'], 0)
        self.assertTrue(session['questions'][0]['bookmarked'])

    def test_ownership_and_input_validation(self):
        other = user.User(email='other@example.com', hashed_password='unused')
        self.db.add(other); self.db.commit()
        app.dependency_overrides[get_current_user] = lambda: other
        self.assertEqual(self.client.get(f'/answers/{self.question.id}/attempts').status_code, 404)
        self.assertEqual(self.client.patch(f'/answers/{self.question.id}/practice', json={'draft_text': 'x'}).status_code, 404)
        app.dependency_overrides[get_current_user] = lambda: self.user
        self.assertEqual(self.client.post(f'/answers/{self.question.id}/attempts', json={'answer_text': '   '}).status_code, 422)
        self.assertEqual(self.client.post(f'/answers/{self.question.id}/attempts', json={'answer_text': 'A sufficiently long answer for testing.', 'follow_up_from': 999}).status_code, 404)

    @patch('app.api.routes.answers.evaluate_attempt', side_effect=RuntimeError('provider unavailable'))
    def test_feedback_failure_keeps_saved_draft(self, evaluate):
        endpoint = f'/answers/{self.question.id}'
        self.client.patch(endpoint + '/practice', json={'draft_text': 'My saved practice answer.'})
        result = self.client.post(endpoint + '/attempts', json={'answer_text': 'My saved practice answer.'})
        self.assertEqual(result.status_code, 502)
        self.assertEqual(self.db.get(generated_question.GeneratedQuestion, self.question.id).draft_text, 'My saved practice answer.')
        self.assertEqual(self.client.get(endpoint + '/attempts').json(), [])


    @patch('app.api.routes.interviews.generate_interview_questions')
    def test_generation_settings_and_reroll_preserve_existing_session(self, generate):
        from app.services.interview_generator import GeneratedQuestionDraft
        generate.return_value = [GeneratedQuestionDraft(question_type='technical', question_text=f'Explain debugging scenario {i} in detail.') for i in range(8)]
        created = self.client.post('/interviews/generate', json={'resume_id': self.resume.id, 'job_description_id': self.job.id, 'difficulty': 'beginner', 'interview_type': 'technical'})
        self.assertEqual(created.status_code, 201, created.text)
        self.assertEqual(created.json()['difficulty'], 'beginner')
        self.assertEqual(generate.call_args.kwargs['interview_type'], 'technical')
        rerolled = self.client.post(f'/interviews/{self.session.id}/reroll')
        self.assertEqual(rerolled.status_code, 200, rerolled.text)
        self.assertNotEqual(rerolled.json()['id'], self.session.id)
        old = self.client.get(f'/interviews/{self.session.id}').json()
        self.assertEqual(old['questions'][0]['id'], self.question.id)
        invalid = self.client.post('/interviews/generate', json={'resume_id': self.resume.id, 'job_description_id': self.job.id, 'difficulty': 'unknown'})
        self.assertEqual(invalid.status_code, 422)

    @patch('app.api.routes.recovery.send_reset_email')
    @patch('app.api.routes.recovery.recovery_available', return_value=True)
    def test_recovery_single_use_expiry_throttling_and_revocation(self, available, send):
        from datetime import UTC, datetime, timedelta
        from app.models.password_reset import PasswordReset
        from app.core.security import create_access_token, verify_password
        old_access = create_access_token(self.user.email)
        known = self.client.post('/auth/forgot-password', json={'email': self.user.email})
        unknown = self.client.post('/auth/forgot-password', json={'email': 'missing@example.com'})
        self.assertEqual(known.status_code, 202)
        self.assertEqual(known.json(), unknown.json())
        token = send.call_args.args[1]
        self.client.post('/auth/forgot-password', json={'email': self.user.email})
        self.assertEqual(send.call_count, 1)
        stored = self.db.query(PasswordReset).one()
        self.assertNotEqual(stored.token_hash, token)
        stored.expires_at = datetime.now(UTC) - timedelta(seconds=1); self.db.commit()
        expired = self.client.post('/auth/reset-password', json={'token': token, 'password': 'ReplacementOnly123!'})
        self.assertEqual(expired.status_code, 400)
        stored.expires_at = datetime.now(UTC) + timedelta(minutes=15); self.db.commit()
        reset = self.client.post('/auth/reset-password', json={'token': token, 'password': 'ReplacementOnly123!'})
        self.assertEqual(reset.status_code, 200, reset.text)
        self.assertTrue(verify_password('ReplacementOnly123!', self.user.hashed_password))
        self.assertEqual(self.client.post('/auth/reset-password', json={'token': token, 'password': 'ReplacementOnly123!'}).status_code, 400)
        app.dependency_overrides.pop(get_current_user)
        self.assertEqual(self.client.get('/auth/me', headers={'Authorization': 'Bearer ' + old_access}).status_code, 401)
        login = self.client.post('/auth/login', json={'email': self.user.email, 'password': 'ReplacementOnly123!'})
        self.assertEqual(login.status_code, 200)
        self.assertEqual(self.client.get('/auth/me', headers={'Authorization': 'Bearer ' + login.json()['access_token']}).status_code, 200)

    @patch('app.api.routes.recovery.recovery_available', return_value=False)
    def test_recovery_disabled_without_delivery_configuration(self, available):
        self.assertFalse(self.client.get('/auth/recovery-status').json()['available'])
        self.assertEqual(self.client.post('/auth/forgot-password', json={'email': self.user.email}).status_code, 503)

    @patch('app.api.routes.resumes.delete_resume_file')
    def test_linked_material_deletion_is_blocked_before_file_removal(self, remove_file):
        self.assertEqual(self.client.delete(f'/resumes/{self.resume.id}').status_code, 409)
        self.assertEqual(self.client.delete(f'/job-descriptions/{self.job.id}').status_code, 409)
        remove_file.assert_not_called()
        self.assertEqual(self.client.get(f'/interviews/{self.session.id}').status_code, 200)

    def test_job_corrections_are_owned_and_used_in_session_labels(self):
        result = self.client.patch(f'/job-descriptions/{self.job.id}', json={'title': 'Sample Co — Frontend Intern', 'technologies': ['React', 'CSS', 'React'], 'required_skills': ['React'], 'preferred_skills': ['Playwright']})
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual(result.json()['parsed_json']['technologies'], ['React', 'CSS'])
        session = self.client.get(f'/interviews/{self.session.id}').json()
        self.assertEqual(session['job_description_preview'], 'Sample Co — Frontend Intern')
