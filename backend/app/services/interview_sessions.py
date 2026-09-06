from sqlalchemy.orm import Session, joinedload

from app.models.generated_question import GeneratedQuestion
from app.models.interview_session import InterviewSession
from app.schemas.interview import (
    GeneratedQuestionResponse,
    InterviewSessionResponse,
    InterviewSessionSummaryResponse,
)

SESSION_LOAD_OPTIONS = (
    joinedload(InterviewSession.questions).joinedload(GeneratedQuestion.attempts),
    joinedload(InterviewSession.resume),
    joinedload(InterviewSession.job_description),
    joinedload(InterviewSession.questions).joinedload(
        GeneratedQuestion.suggested_answer
    ),
)

_PREVIEW_MAX_LENGTH = 120


def _job_description_preview(raw_text: str) -> str:
    cleaned = " ".join(raw_text.split())
    if len(cleaned) <= _PREVIEW_MAX_LENGTH:
        return cleaned
    return f"{cleaned[:_PREVIEW_MAX_LENGTH].rstrip()}..."


def _answer_count(session: InterviewSession) -> int:
    return sum(
        1 for question in session.questions if question.suggested_answer is not None
    )


def to_session_summary(session: InterviewSession) -> InterviewSessionSummaryResponse:
    latest_attempt = max((a for q in session.questions for a in q.attempts), key=lambda a: a.id, default=None)
    return InterviewSessionSummaryResponse(
        id=session.id,
        user_id=session.user_id,
        resume_id=session.resume_id,
        job_description_id=session.job_description_id,
        status=session.status,
        difficulty=session.difficulty,
        interview_type=session.interview_type,
        created_at=session.created_at,
        question_count=len(session.questions),
        answer_count=_answer_count(session),
        practiced_count=sum(bool(q.attempts) for q in session.questions),
        attempt_count=sum(len(q.attempts) for q in session.questions),
        next_step=latest_attempt.feedback_json.get("next_step", "") if latest_attempt else "",
        resume_filename=session.resume.original_filename,
        job_description_preview=_job_description_preview(
            (session.job_description.parsed_json or {}).get("title") or session.job_description.raw_text
        ),
    )


def to_session_response(session: InterviewSession) -> InterviewSessionResponse:
    return InterviewSessionResponse(
        id=session.id,
        user_id=session.user_id,
        resume_id=session.resume_id,
        job_description_id=session.job_description_id,
        status=session.status,
        difficulty=session.difficulty,
        interview_type=session.interview_type,
        created_at=session.created_at,
        question_count=len(session.questions),
        answer_count=_answer_count(session),
        practiced_count=sum(bool(q.attempts) for q in session.questions),
        attempt_count=sum(len(q.attempts) for q in session.questions),
        resume_filename=session.resume.original_filename,
        job_description_preview=_job_description_preview(
            (session.job_description.parsed_json or {}).get("title") or session.job_description.raw_text
        ),
        questions=[
            GeneratedQuestionResponse.model_validate(question)
            for question in session.questions
        ],
    )


def load_user_session(
    db: Session,
    session_id: int,
    user_id: int,
) -> InterviewSession | None:
    return (
        db.query(InterviewSession)
        .options(*SESSION_LOAD_OPTIONS)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )
