import json

from openai import OpenAI
from pydantic import BaseModel

from app.core.config import settings

MAX_CONTEXT_CHARS = 6000
STAR_QUESTION_TYPES = {"behavioral", "project_specific"}


class SuggestedAnswerDraft(BaseModel):
    answer_text: str
    star_situation: str | None = None
    star_task: str | None = None
    star_action: str | None = None
    star_result: str | None = None


def _build_prompt(
    question_type: str,
    question_text: str,
    resume_text: str,
    job_description_text: str,
) -> str:
    resume_excerpt = resume_text[:MAX_CONTEXT_CHARS]
    job_excerpt = job_description_text[:MAX_CONTEXT_CHARS]
    use_star = question_type in STAR_QUESTION_TYPES

    star_instructions = ""
    json_shape = """{
  "answer_text": "...",
  "star_situation": null,
  "star_task": null,
  "star_action": null,
  "star_result": null
}"""

    if use_star:
        json_shape = """{
  "answer_text": "...",
  "star_situation": "...",
  "star_task": "...",
  "star_action": "...",
  "star_result": "..."
}"""
        star_instructions = """
- Structure the answer using the STAR method (Situation, Task, Action, Result)
- Fill in all star_* fields with concise, interview-ready content
- answer_text should be a polished full answer that weaves the STAR points together
"""

    return f"""You are an expert interview coach helping a candidate prepare answers personalized to their background.

Generate a strong suggested answer for this interview question.

Return JSON with this exact shape:
{json_shape}

Rules:
- Base the answer on the candidate's real resume experience when possible
- Align the answer with the target job description
- Keep the tone confident, specific, and conversational
- Do not invent employers, projects, or metrics not supported by the resume
- Question type: {question_type}
{star_instructions}
QUESTION:
{question_text}

RESUME:
{resume_excerpt}

JOB DESCRIPTION:
{job_excerpt}
"""


def generate_suggested_answer(
    question_type: str,
    question_text: str,
    resume_text: str,
    job_description_text: str,
) -> SuggestedAnswerDraft:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured")

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You generate personalized interview answers and respond with valid JSON only.",
            },
            {
                "role": "user",
                "content": _build_prompt(
                    question_type=question_type,
                    question_text=question_text,
                    resume_text=resume_text,
                    job_description_text=job_description_text,
                ),
            },
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response")

    payload = json.loads(content)
    draft = SuggestedAnswerDraft.model_validate(payload)
    if not draft.answer_text.strip():
        raise ValueError("OpenAI returned an empty answer")

    return draft
