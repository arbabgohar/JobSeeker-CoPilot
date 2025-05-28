from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from resume_matcher import analyze_resume_match
from cover_letter_generator import generate_cover_letter

app = FastAPI(title="JobSeeker Copilot API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobApplication(BaseModel):
    job_description: str
    resume: str

class MatchResponse(BaseModel):
    match_score: float
    missing_keywords: List[str]

# Sample jobs for testing
SAMPLE_JOBS = [
    {
        "id": 1,
        "title": "Senior Python Developer",
        "company": "TechCorp",
        "description": "We are looking for a Senior Python Developer with 5+ years of experience in web development, FastAPI, and cloud technologies."
    },
    {
        "id": 2,
        "title": "Full Stack Engineer",
        "company": "StartupX",
        "description": "Full Stack Engineer needed with expertise in React, Node.js, and AWS. Must have experience with CI/CD pipelines."
    }
]

@app.post("/analyze-job", response_model=MatchResponse)
async def analyze_job(job_app: JobApplication):
    try:
        match_score, missing_keywords = analyze_resume_match(
            job_app.job_description,
            job_app.resume
        )
        return MatchResponse(
            match_score=match_score,
            missing_keywords=missing_keywords
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-cover-letter")
async def create_cover_letter(job_app: JobApplication):
    try:
        cover_letter = generate_cover_letter(
            job_app.job_description,
            job_app.resume
        )
        return {"cover_letter": cover_letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs")
async def get_jobs():
    return SAMPLE_JOBS

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 