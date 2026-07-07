from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.generated_question import GeneratedQuestion
from app.models.interview_session import InterviewSession
from app.models.suggested_answer import SuggestedAnswer
from app.models.user import User
from app.schemas.answer import SuggestedAnswerResponse
from app.services.answer_generator import generate_suggested_answer

router = APIRouter(prefix="/answers", tags=["answers"])


def _get_user_question(
    question_id: int,
    user_id: int,
    db: Session,
) -> GeneratedQuestion:
    question = (
        db.query(GeneratedQuestion)
        .join(InterviewSession)
        .options(
            joinedload(GeneratedQuestion.session)
            .joinedload(InterviewSession.resume),
            joinedload(GeneratedQuestion.session)
            .joinedload(InterviewSession.job_description),
            joinedload(GeneratedQuestion.suggested_answer),
        )
        .filter(
            GeneratedQuestion.id == question_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )
    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )
    return question


@router.post(
    "/{question_id}/generate",
    response_model=SuggestedAnswerResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_answer(
    question_id: int,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SuggestedAnswer:
    question = _get_user_question(question_id, current_user.id, db)

    if question.suggested_answer is not None:
        response.status_code = status.HTTP_200_OK
        return question.suggested_answer

    resume = question.session.resume
    job_description = question.session.job_description
    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume has no extracted text",
        )

    try:
        draft = generate_suggested_answer(
            question_type=question.question_type,
            question_text=question.question_text,
            resume_text=resume.extracted_text,
            job_description_text=job_description.raw_text,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to generate suggested answer",
        ) from exc

    answer = SuggestedAnswer(
        question_id=question.id,
        answer_text=draft.answer_text,
        star_situation=draft.star_situation,
        star_task=draft.star_task,
        star_action=draft.star_action,
        star_result=draft.star_result,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


@router.get("/{question_id}", response_model=SuggestedAnswerResponse)
def get_answer(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SuggestedAnswer:
    question = _get_user_question(question_id, current_user.id, db)

    if question.suggested_answer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggested answer not found",
        )

    return question.suggested_answer
