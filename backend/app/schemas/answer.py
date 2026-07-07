from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SuggestedAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    answer_text: str
    star_situation: str | None = None
    star_task: str | None = None
    star_action: str | None = None
    star_result: str | None = None
    created_at: datetime
