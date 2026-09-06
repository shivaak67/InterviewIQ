"""Local browser smoke fixture. Never used by the production entry point."""
from unittest.mock import patch
import uvicorn
from tests.test_practice import PracticeTests
from app.api.deps import get_current_user
from app.core.security import hash_password
from app.main import app
from app.schemas.practice import Feedback
from app.services.interview_generator import GeneratedQuestionDraft
from app.services.answer_generator import SuggestedAnswerDraft

fixture = PracticeTests()
fixture.setUp()
app.dependency_overrides.pop(get_current_user, None)
fixture.user.hashed_password = hash_password('SmokeTestOnly2026!')
fixture.job.parsed_json = {'title': 'Sample Co — Frontend Engineer', 'technologies': ['React', 'TypeScript'], 'required_skills': ['React'], 'preferred_skills': ['Playwright']}
fixture.db.commit()
feedback = Feedback(relevance=3, specificity=2, structure=3, technical_depth=3, strengths=['You explain a test strategy.'], improvements=['Name an edge case and its expected behavior.'], next_step='Explain how you would handle an API failure without losing user input.', follow_up='How would you test a retry after a network failure?')
with patch('app.api.routes.answers.evaluate_attempt', return_value=feedback), patch('app.api.routes.interviews.generate_interview_questions', return_value=[GeneratedQuestionDraft(question_type='technical', question_text=f'A request fails during form submission. Explain testing scenario {i+1} and the expected user experience.') for i in range(8)]), patch('app.api.routes.answers.generate_suggested_answer', return_value=SuggestedAnswerDraft(answer_text='ANSWER OUTLINE\nExplain the request lifecycle.\nDescribe retry behavior and input preservation.')):
    uvicorn.run(app, host='127.0.0.1', port=8017)
