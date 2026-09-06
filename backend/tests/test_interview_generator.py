import json
import unittest
from unittest.mock import patch, MagicMock
from app.services.interview_generator import generate_interview_questions

class GenerationTests(unittest.TestCase):
    @patch('app.services.interview_generator.OpenAI')
    @patch('app.services.interview_generator.settings')
    def test_schema_enforces_categories_and_invalid_output_is_readable(self, settings, client):
        settings.openai_api_key = 'test-only'
        settings.openai_model = 'test-only'
        response = MagicMock()
        response.choices[0].message.content = json.dumps({'questions': [
            {'question_type': 'technical', 'question_text': f'How would you debug failure scenario {i}?'} for i in range(8)]})
        create = client.return_value.chat.completions.create
        create.return_value = response
        self.assertEqual(len(generate_interview_questions('resume', 'role', interview_type='technical')), 8)
        output = create.call_args.kwargs['response_format']['json_schema']
        self.assertTrue(output['strict'])
        self.assertEqual(output['schema']['$defs']['GeneratedQuestionDraft']['properties']['question_type']['enum'], ['technical'])
        response.choices[0].message.content = '{"questions": [{"question_type": "mixed", "question_text": "Explain a debugging approach."}]}'
        with self.assertRaisesRegex(ValueError, 'Please try again'):
            generate_interview_questions('resume', 'role')
