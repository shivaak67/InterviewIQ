from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class GeneratedQuestion(Base):
    __tablename__ = "generated_questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("interview_sessions.id"), nullable=False, index=True
    )
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    session = relationship("InterviewSession", back_populates="questions")
    suggested_answer = relationship(
        "SuggestedAnswer",
        back_populates="question",
        uselist=False,
        cascade="all, delete-orphan",
    )
