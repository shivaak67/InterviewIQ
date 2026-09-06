import unittest
from app.services.answer_generator import CoachingPlan, _render_plan


class AnswerGuidanceTests(unittest.TestCase):
    def test_only_resume_quotes_are_used_as_evidence(self):
        plan = CoachingPlan(evidence=['Built a React app', 'Improved satisfaction by 30%'],
                            outline=['Explain your implementation.', 'Discuss an alternative.'],
                            missing_details=['What outcome did you observe?'])
        answer = _render_plan(plan, 'Experience: Built a React app', 'behavioral')
        self.assertIn('Built a React app', answer.answer_text)
        self.assertNotIn('30%', answer.answer_text)
        self.assertIn('verified outcome', answer.star_result)

    def test_no_star_for_hypothetical_design(self):
        answer = _render_plan(CoachingPlan(outline=['Clarify requirements.', 'Discuss tradeoffs.']), '', 'system_design')
        self.assertIsNone(answer.star_result)

    def test_rejects_invented_first_person_and_metrics(self):
        for claim in ['I improved customer satisfaction.', 'Delivered a 30% improvement.']:
            with self.assertRaises(ValueError):
                _render_plan(CoachingPlan(outline=[claim, 'Discuss tradeoffs.']), '', 'technical')
