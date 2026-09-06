from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    upload_dir: str = "uploads/resumes"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    frontend_url: str = "https://www.prep-pilot.com"
    email_from: str = ""
    resend_api_key: str | None = None
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()  # type: ignore[call-arg]
