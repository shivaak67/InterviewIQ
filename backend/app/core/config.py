from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Go up from backend/app/core/ to project root (InterviewIQ/)
ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
    )

    database_url: str


settings = Settings()