import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.generated_question import GeneratedQuestion
from app.models.interview_session import InterviewSession
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.user import User
from app.schemas.interview import (
    InterviewGenerateRequest,
    InterviewSessionResponse,
    InterviewSessionSummaryResponse,
)
from app.services.interview_generator import generate_interview_questions
from app.services.interview_sessions import (
    SESSION_LOAD_OPTIONS,
    load_user_session,
    to_session_response,
    to_session_summary,
)

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post(
    "/generate",
    response_model=InterviewSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_interview(
    payload: InterviewGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSessionResponse:
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume has no extracted text",
        )

    job_description = (
        db.query(JobDescription)
        .filter(
            JobDescription.id == payload.job_description_id,
            JobDescription.user_id == current_user.id,
        )
        .first()
    )
    if job_description is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found",
        )

    try:
        drafts = generate_interview_questions(
            resume_text=resume.extracted_text,
            job_description_text=job_description.raw_text + "\nCandidate-reviewed role data: " + json.dumps(job_description.parsed_json or {}),
            difficulty=payload.difficulty,
            interview_type=payload.interview_type,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to generate interview questions",
        ) from exc

    session = InterviewSession(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description_id=job_description.id,
        status="completed",
        difficulty=payload.difficulty,
        interview_type=payload.interview_type,
    )
    db.add(session)
    db.flush()

    for index, draft in enumerate(drafts):
        db.add(
            GeneratedQuestion(
                session_id=session.id,
                question_type=draft.question_type,
                question_text=draft.question_text,
                order_index=index,
            )
        )

    db.commit()

    loaded_session = load_user_session(db, session.id, current_user.id)
    if loaded_session is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load generated interview session",
        )
    return to_session_response(loaded_session)


@router.get("/", response_model=list[InterviewSessionSummaryResponse])
def list_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[InterviewSessionSummaryResponse]:
    sessions = (
        db.query(InterviewSession)
        .options(*SESSION_LOAD_OPTIONS)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )
    return [to_session_summary(session) for session in sessions]


@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSessionResponse:
    session = load_user_session(db, session_id, current_user.id)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )
    return to_session_response(session)


@router.post("/{session_id}/reroll", response_model=InterviewSessionResponse)
def reroll_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSessionResponse:
    session = load_user_session(db, session_id, current_user.id)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    resume = session.resume
    job_description = session.job_description
    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume has no extracted text",
        )

    previous_questions = [question.question_text for question in session.questions]

    try:
        drafts = generate_interview_questions(
            resume_text=resume.extracted_text,
            job_description_text=job_description.raw_text + "\nCandidate-reviewed role data: " + json.dumps(job_description.parsed_json or {}),
            previous_questions=previous_questions,
            difficulty=session.difficulty,
            interview_type=session.interview_type,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to reroll interview questions",
        ) from exc

    # A reroll creates another session, retaining earlier answers and practice history.
    new_session = InterviewSession(user_id=current_user.id, resume_id=resume.id,
        job_description_id=job_description.id, status="completed",
        difficulty=session.difficulty, interview_type=session.interview_type)
    db.add(new_session)
    db.flush()
    for index, draft in enumerate(drafts):
        db.add(
            GeneratedQuestion(
                session_id=new_session.id,
                question_type=draft.question_type,
                question_text=draft.question_text,
                order_index=index,
            )
        )

    db.commit()

    loaded_session = load_user_session(db, new_session.id, current_user.id)
    if loaded_session is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load rerolled interview session",
        )
    return to_session_response(loaded_session)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
        .first()
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )
    db.delete(session)
    db.commit()


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .all()
    )
    for session in sessions:
        db.delete(session)
    db.commit()
