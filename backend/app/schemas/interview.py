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


class GeneratedQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    question_type: str
    question_text: str
    order_index: int


class InterviewSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    resume_id: int
    job_description_id: int
    status: str
    created_at: datetime
    questions: list[GeneratedQuestionResponse] = Field(default_factory=list)
