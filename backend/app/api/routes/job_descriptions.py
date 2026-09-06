from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.job_description import JobDescription
from app.models.user import User
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobDescriptionUpdate,
    ParsedJobData,
)
from app.services.job_description_parser import parse_job_description

router = APIRouter(prefix="/job-descriptions", tags=["job-descriptions"])


def _to_response(job_description: JobDescription) -> JobDescriptionResponse:
    parsed: ParsedJobData | None = None
    if job_description.parsed_json is not None:
        parsed = ParsedJobData.model_validate(job_description.parsed_json)

    return JobDescriptionResponse(
        id=job_description.id,
        user_id=job_description.user_id,
        raw_text=job_description.raw_text,
        parsed_json=parsed,
        created_at=job_description.created_at,
    )


@router.post("/", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_job_description(
    job_in: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobDescriptionResponse:
    parsed = parse_job_description(job_in.raw_text)
    parsed.title = job_in.title.strip() or job_in.raw_text.strip().splitlines()[0][:100]
    job_description = JobDescription(
        user_id=current_user.id,
        raw_text=job_in.raw_text.strip(),
        parsed_json=parsed.model_dump(),
    )
    db.add(job_description)
    db.commit()
    db.refresh(job_description)
    return _to_response(job_description)


@router.get("/", response_model=list[JobDescriptionResponse])
def list_job_descriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[JobDescriptionResponse]:
    jobs = (
        db.query(JobDescription)
        .filter(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
        .all()
    )
    return [_to_response(job) for job in jobs]


@router.patch("/{job_description_id}", response_model=JobDescriptionResponse)
def update_job_description(job_description_id: int, payload: JobDescriptionUpdate,
                           current_user: User = Depends(get_current_user),
                           db: Session = Depends(get_db)) -> JobDescriptionResponse:
    job = db.query(JobDescription).filter(JobDescription.id == job_description_id,
                                          JobDescription.user_id == current_user.id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job description not found")
    parsed = parse_job_description(job.raw_text).model_dump()
    parsed.update(payload.model_dump())
    for key in ("technologies", "required_skills", "preferred_skills"):
        parsed[key] = list(dict.fromkeys(item.strip()[:100] for item in parsed[key] if item.strip()))
    job.parsed_json = parsed
    db.commit()
    db.refresh(job)
    return _to_response(job)


@router.delete("/{job_description_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_description(
    job_description_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    job_description = (
        db.query(JobDescription)
        .filter(
            JobDescription.id == job_description_id,
            JobDescription.user_id == current_user.id,
        )
        .first()
    )
    if job_description is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found",
        )

    db.delete(job_description)
    db.commit()
