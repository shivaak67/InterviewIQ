from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, interviews, job_descriptions, resumes

app = FastAPI(title="InterviewIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(job_descriptions.router)
app.include_router(interviews.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
