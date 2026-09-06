from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParsedJobData(BaseModel):
    title: str = Field(default="", max_length=160)
    required_skills: list[str] = Field(default_factory=list, max_length=100)
    preferred_skills: list[str] = Field(default_factory=list, max_length=100)
    skills: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class JobDescriptionCreate(BaseModel):
    raw_text: str = Field(min_length=50, max_length=20000)
    title: str = Field(default="", max_length=160)


class JobDescriptionUpdate(BaseModel):
    title: str = Field(max_length=160)
    technologies: list[str] = Field(max_length=100)
    required_skills: list[str] = Field(max_length=100)
    preferred_skills: list[str] = Field(max_length=100)


class JobDescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    raw_text: str
    parsed_json: ParsedJobData | None
    created_at: datetime
