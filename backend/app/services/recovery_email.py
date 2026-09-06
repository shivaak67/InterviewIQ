import json
import logging
import smtplib
import ssl
from email.message import EmailMessage
from urllib.request import Request, urlopen
from app.core.config import settings

logger = logging.getLogger(__name__)

def recovery_available() -> bool:
    return bool(settings.email_from and (settings.resend_api_key or
        (settings.smtp_host and settings.smtp_username and settings.smtp_password)))


def send_reset_email(recipient: str, token: str) -> None:
    link = settings.frontend_url.rstrip('/') + '/reset-password#token=' + token
    body = f'Reset your Prep Pilot password using this link:\n\n{link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, ignore this message.'
    try:
        if settings.resend_api_key:
            payload = {'from': settings.email_from, 'to': [recipient], 'subject': 'Reset your Prep Pilot password', 'text': body}
            request = Request('https://api.resend.com/emails', data=json.dumps(payload).encode(),
                headers={'Authorization': 'Bearer ' + settings.resend_api_key, 'Content-Type': 'application/json'}, method='POST')
            with urlopen(request, timeout=15) as response:
                if response.status >= 300:
                    raise RuntimeError('Email delivery failed')
        else:
            message = EmailMessage()
            message['From'] = settings.email_from
            message['To'] = recipient
            message['Subject'] = 'Reset your Prep Pilot password'
            message.set_content(body)
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
                smtp.starttls(context=ssl.create_default_context())
                smtp.login(settings.smtp_username, settings.smtp_password)
                smtp.send_message(message)
    except Exception:
        # Do not log recipient addresses, reset tokens, credentials, or provider response bodies.
        logger.error('Password recovery email delivery failed; check provider configuration.')
