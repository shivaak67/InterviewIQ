import json

from openai import OpenAI
from pydantic import BaseModel, Field

from app.core.config import settings

MAX_CONTEXT_CHARS = 6000


class GeneratedQuestionDraft(BaseModel):
    question_type: str
    question_text: str


class InterviewGenerationResult(BaseModel):
    questions: list[GeneratedQuestionDraft] = Field(default_factory=list)


def _build_prompt(resume_text: str, job_description_text: str) -> str:
    resume_excerpt = resume_text[:MAX_CONTEXT_CHARS]
    job_excerpt = job_description_text[:MAX_CONTEXT_CHARS]

    return f"""You are an expert technical interviewer. Generate personalized interview questions based on the candidate resume and target job description.

Return JSON with this exact shape:
{{
  "questions": [
    {{"question_type": "technical", "question_text": "..."}},
    {{"question_type": "behavioral", "question_text": "..."}},
    {{"question_type": "project_specific", "question_text": "..."}},
    {{"question_type": "system_design", "question_text": "..."}},
    {{"question_type": "follow_up", "question_text": "..."}}
  ]
}}

Rules:
- Generate 8 to 10 questions total
- Use only these question_type values: technical, behavioral, project_specific, system_design, follow_up
- Reference specific resume experience and job requirements by name when possible
- Make questions realistic for software engineering interviews
- Do not include answers

RESUME:
{resume_excerpt}

JOB DESCRIPTION:
{job_excerpt}
"""


def generate_interview_questions(
    resume_text: str,
    job_description_text: str,
) -> list[GeneratedQuestionDraft]:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured")

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You generate structured interview questions and respond with valid JSON only.",
            },
            {
                "role": "user",
                "content": _build_prompt(resume_text, job_description_text),
            },
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response")

    payload = json.loads(content)
    result = InterviewGenerationResult.model_validate(payload)
    if not result.questions:
        raise ValueError("OpenAI returned no interview questions")

    return result.questions
