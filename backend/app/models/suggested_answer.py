from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SuggestedAnswer(Base):
    __tablename__ = "suggested_answers"
    __table_args__ = (UniqueConstraint("question_id", name="suggested_answers_question_id_key"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("generated_questions.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    star_situation: Mapped[str | None] = mapped_column(Text, nullable=True)
    star_task: Mapped[str | None] = mapped_column(Text, nullable=True)
    star_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    star_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    question = relationship("GeneratedQuestion", back_populates="suggested_answer")
