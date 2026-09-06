import unittest
from app.services.job_description_parser import parse_job_description

class ParserTests(unittest.TestCase):
    def test_boundaries_and_frontend_stack(self):
        parsed = parse_job_description('Required: JavaScript, React, TypeScript, HTML, CSS, Git. Preferred: Playwright and SQL.')
        self.assertNotIn('Java', parsed.technologies)
        self.assertIn('CSS', parsed.technologies)
        self.assertIn('Playwright', parsed.technologies)
        self.assertIn('React', parsed.required_skills)
        self.assertIn('Playwright', parsed.preferred_skills)

    def test_punctuation_aliases_and_false_positives(self):
        parsed = parse_job_description('Build in C++, C#, NodeJS and Golang. Integrate PostgreSQL and GitHub. Go to our website.')
        for name in ['C++', 'C#', 'Node.js', 'Go', 'PostgreSQL']:
            self.assertIn(name, parsed.technologies)
        self.assertNotIn('SQL', parsed.technologies)
        self.assertNotIn('Git', parsed.technologies)
        self.assertNotIn('Go', parse_job_description('We go to great lengths for customers.').technologies)
