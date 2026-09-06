from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

QuestionType = Literal[
    "technical",
    "behavioral",
    "project_specific",
    "system_design",
    "follow_up",
]


class InterviewGenerateRequest(BaseModel):
    resume_id: int
    job_description_id: int
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    interview_type: Literal["mixed", "technical", "behavioral", "project_specific", "system_design"] = "mixed"


class GeneratedQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    question_type: str
    question_text: str
    order_index: int
    draft_text: str = ""
    bookmarked: bool = False


class InterviewSessionSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    resume_id: int
    job_description_id: int
    status: str
    difficulty: str = "intermediate"
    interview_type: str = "mixed"
    created_at: datetime
    question_count: int = 0
    answer_count: int = 0
    practiced_count: int = 0
    attempt_count: int = 0
    resume_filename: str = ""
    job_description_preview: str = ""


class InterviewSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    resume_id: int
    job_description_id: int
    status: str
    difficulty: str = "intermediate"
    interview_type: str = "mixed"
    created_at: datetime
    question_count: int = 0
    answer_count: int = 0
    practiced_count: int = 0
    attempt_count: int = 0
    resume_filename: str = ""
    job_description_preview: str = ""
    questions: list[GeneratedQuestionResponse] = Field(default_factory=list)
