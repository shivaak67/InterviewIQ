from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class PracticeSubmission(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    answer_text: str = Field(min_length=20, max_length=12000)
    follow_up_from: int | None = None

class PracticeDraft(BaseModel):
    draft_text: str = Field(default='', max_length=12000)
    bookmarked: bool = False
    follow_up_from: int | None = None

class Feedback(BaseModel):
    relevance: int = Field(ge=1, le=5)
    specificity: int = Field(ge=1, le=5)
    structure: int = Field(ge=1, le=5)
    technical_depth: int = Field(ge=1, le=5)
    strengths: list[str] = Field(min_length=1, max_length=4)
    improvements: list[str] = Field(min_length=1, max_length=4)
    next_step: str = Field(min_length=1, max_length=1500)
    follow_up: str = Field(min_length=1, max_length=1000)

class PracticeAttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question_id: int
    answer_text: str
    prompt_text: str
    feedback_json: Feedback
    created_at: datetime
