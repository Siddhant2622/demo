"""
SkillMap System — FastAPI Backend
===============================
Main application entry point.

Run with:
    uvicorn backend.main:app --reload --port 8000
Or:
    python run.py
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .routers import ocr, skills, resume, extension, github_injector

# ─── APP SETUP ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SkillMap System",
    description=(
        "System-Powered Skill Gap Analyzer & Career Roadmap Generator. "
        "Upload documents for OCR extraction, analyze skill gaps against target roles, "
        "and get personalized learning roadmaps."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ─────────────────────────────────────────────────────────────────
app.include_router(ocr.router)
app.include_router(skills.router)
app.include_router(resume.router)
app.include_router(extension.router)
app.include_router(github_injector.router)

# ─── STATIC FILES (Frontend) ────────────────────────────────────────────────
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ─── ROOT ENDPOINTS ─────────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Serve the frontend application."""
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {
        "name": "SkillMap System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "frontend": "Frontend not found. Place index.html in /frontend/ directory.",
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    # Check dependency status
    deps = {}
    try:
        import easyocr
        deps["easyocr"] = "installed"
    except ImportError:
        deps["easyocr"] = "not installed (demo mode)"

    try:
        import cv2
        deps["opencv"] = "installed"
    except ImportError:
        deps["opencv"] = "not installed (demo mode)"

    try:
        import spacy
        deps["spacy"] = "installed"
    except ImportError:
        deps["spacy"] = "not installed"

    return {
        "status": "healthy",
        "service": "SkillMap System",
        "version": "1.0.0",
        "team": "Team CODEX · LNCT Group of Colleges",
        "hackathon": "CPL 2026 · Smart Education",
        "dependencies": deps,
        "endpoints": {
            "ocr": "/api/ocr/process",
            "ocr_demo": "/api/ocr/demo",
            "skills_analyze": "/api/skills/analyze",
            "skills_roadmap": "/api/skills/roadmap",
            "skills_roles": "/api/skills/roles",
            "resume_parse": "/api/resume/parse",
            "resume_demo": "/api/resume/demo",
            "docs": "/docs",
        },
    }
