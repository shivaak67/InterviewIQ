from datetime import datetime
from typing import Any
from sqlalchemy import DateTime, ForeignKey, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class PracticeAttempt(Base):
    __tablename__ = 'practice_attempts'
    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey('generated_questions.id'), index=True)
    answer_text: Mapped[str] = mapped_column(Text)
    prompt_text: Mapped[str] = mapped_column(Text)
    feedback_json: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    question = relationship('GeneratedQuestion', back_populates='attempts')
