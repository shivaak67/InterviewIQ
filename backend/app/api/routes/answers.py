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

# Each endpoint resolves the question through its owning user's session.
from app.models.practice_attempt import PracticeAttempt
from app.schemas.practice import PracticeSubmission, PracticeDraft, PracticeAttemptResponse
from app.services.practice_feedback import evaluate_attempt


@router.get('/{question_id}/attempts', response_model=list[PracticeAttemptResponse])
def list_attempts(question_id: int, current_user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    question = _get_user_question(question_id, current_user.id, db)
    return question.attempts


@router.patch('/{question_id}/practice', response_model=PracticeDraft)
def save_practice_draft(question_id: int, payload: PracticeDraft,
                        current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = _get_user_question(question_id, current_user.id, db)
    if payload.follow_up_from is not None and not any(a.id == payload.follow_up_from for a in question.attempts):
        raise HTTPException(status_code=404, detail="Previous attempt not found")
    question.draft_text = payload.draft_text
    question.draft_follow_up_from = payload.follow_up_from
    question.bookmarked = payload.bookmarked
    db.commit()
    return payload


@router.post('/{question_id}/attempts', response_model=PracticeAttemptResponse, status_code=201)
def submit_attempt(question_id: int, payload: PracticeSubmission,
                   current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = _get_user_question(question_id, current_user.id, db)
    prompt = question.question_text
    if payload.follow_up_from is not None:
        parent = next((a for a in question.attempts if a.id == payload.follow_up_from), None)
        if parent is None:
            raise HTTPException(status_code=404, detail='Previous attempt not found')
        prompt = parent.feedback_json['follow_up']
    previous = next((a for a in reversed(question.attempts) if a.prompt_text == prompt), None)
    try:
        feedback = evaluate_attempt(prompt, payload.answer_text, question.question_type,
                                    question.session.resume.extracted_text or '',
                                    previous.answer_text if previous else None)
    except Exception as exc:
        raise HTTPException(status_code=502, detail='Feedback could not be generated. Your draft is still available; please retry.') from exc
    attempt = PracticeAttempt(question=question, answer_text=payload.answer_text,
                               prompt_text=prompt, feedback_json=feedback.model_dump())
    db.add(attempt)
    question.draft_text = payload.answer_text
    question.draft_follow_up_from = payload.follow_up_from
    db.commit()
    db.refresh(attempt)
    return attempt
