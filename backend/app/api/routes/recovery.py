import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.models.password_reset import PasswordReset
from app.services.recovery_email import recovery_available, send_reset_email

router = APIRouter(prefix='/auth', tags=['auth'])

class RecoveryRequest(BaseModel):
    email: EmailStr

class ResetRequest(BaseModel):
    token: str = Field(min_length=32, max_length=128)
    password: str = Field(min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def validate_password_bytes(cls, value):
        if len(value.encode()) > 72:
            raise ValueError('Password must be at most 72 UTF-8 bytes')
        return value

@router.get('/recovery-status')
def recovery_status():
    return {'available': recovery_available()}

@router.post('/forgot-password', status_code=202)
def forgot_password(payload: RecoveryRequest, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not recovery_available():
        raise HTTPException(status_code=503, detail='Password recovery email is not configured yet. Please contact the site owner.')
    message = {'message': 'If an account exists for that email, a reset link will be sent. Check your inbox and spam folder.'}
    user = db.query(User).filter(User.email == payload.email).with_for_update().first()
    if user is None:
        return message
    now = datetime.now(UTC)
    recent = db.query(PasswordReset).filter(PasswordReset.user_id == user.id,
        PasswordReset.created_at > now - timedelta(minutes=1)).first()
    if recent:
        return message
    db.query(PasswordReset).filter(PasswordReset.user_id == user.id).delete()
    token = secrets.token_urlsafe(32)
    db.add(PasswordReset(user_id=user.id, token_hash=hashlib.sha256(token.encode()).hexdigest(),
                        expires_at=now + timedelta(minutes=15)))
    db.commit()
    tasks.add_task(send_reset_email, user.email, token)
    return message

@router.post('/reset-password')
def reset_password(payload: ResetRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    # Use the same account-then-token lock order as recovery requests.
    reset = db.query(PasswordReset).filter(PasswordReset.token_hash == token_hash,
        PasswordReset.expires_at > datetime.now(UTC)).first()
    if reset is None:
        raise HTTPException(status_code=400, detail='This reset link is invalid or expired. Request another link.')
    user = db.query(User).filter(User.id == reset.user_id).with_for_update().one()
    reset = db.query(PasswordReset).filter(PasswordReset.token_hash == token_hash,
        PasswordReset.expires_at > datetime.now(UTC)).with_for_update().first()
    if reset is None:
        raise HTTPException(status_code=400, detail='This reset link is invalid or expired. Request another link.')
    user.hashed_password = hash_password(payload.password)
    user.auth_version += 1
    db.query(PasswordReset).filter(PasswordReset.user_id == user.id).delete()
    db.commit()
    return {'message': 'Password updated. Sign in with your new password.'}
