from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParsedJobData(BaseModel):
    skills: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class JobDescriptionCreate(BaseModel):
    raw_text: str = Field(min_length=50, max_length=20000)


class JobDescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    raw_text: str
    parsed_json: ParsedJobData | None
    created_at: datetime
