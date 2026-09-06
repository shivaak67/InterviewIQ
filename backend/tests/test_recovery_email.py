import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

from app.services import recovery_email


class RecoveryEmailTests(unittest.TestCase):
    @patch.object(recovery_email, 'urlopen')
    @patch.object(recovery_email, 'settings')
    def test_resend_request_contract(self, settings, urlopen):
        settings.resend_api_key = 'test-key'
        settings.email_from = 'Prep Pilot <noreply@example.com>'
        settings.frontend_url = 'https://example.com/'
        urlopen.return_value.__enter__.return_value.status = 200
        recovery_email.send_reset_email('tester@example.com', 'test-token')
        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, 'https://api.resend.com/emails')
        self.assertEqual(request.get_method(), 'POST')
        self.assertEqual(request.get_header('User-agent'), 'PrepPilot/1.0')
        self.assertEqual(request.get_header('Authorization'), 'Bearer test-key')
        body = json.loads(request.data)
        self.assertEqual(body['to'], ['tester@example.com'])
        self.assertIn('https://example.com/reset-password#token=test-token', body['text'])

    @patch.object(recovery_email, 'urlopen')
    @patch.object(recovery_email, 'settings')
    def test_provider_failure_logs_status_without_secrets(self, settings, urlopen):
        settings.resend_api_key = 'secret-key'
        settings.email_from = 'noreply@example.com'
        settings.frontend_url = 'https://example.com'
        urlopen.side_effect = HTTPError('https://api.resend.com/emails', 403,
            'private provider response', {}, None)
        with self.assertLogs(recovery_email.logger, level='ERROR') as logs:
            recovery_email.send_reset_email('private@example.com', 'secret-token')
        output = '\n'.join(logs.output)
        self.assertIn('HTTP 403', output)
        for private_value in ('secret-key', 'secret-token', 'private@example.com', 'private provider response'):
            self.assertNotIn(private_value, output)
