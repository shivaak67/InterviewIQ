from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import answers, auth, interviews, job_descriptions, resumes, recovery
from app.core.config import settings

app = FastAPI(title="Prep Pilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(recovery.router)
app.include_router(resumes.router)
app.include_router(job_descriptions.router)
app.include_router(interviews.router)
app.include_router(answers.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
