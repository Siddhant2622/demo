"""
SkillMap System — Skills API Router
==================================
Endpoints for skill gap analysis and roadmap generation.
"""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.skill_analyzer import (
    analyze_skill_gap,
    generate_roadmap,
    get_available_roles,
    get_role_requirements,
)

router = APIRouter(prefix="/api/skills", tags=["Skills"])


class SkillInput(BaseModel):
    name: str
    score: int = Field(ge=0, le=100)


class AnalyzeRequest(BaseModel):
    skills: List[SkillInput] = Field(..., description="List of skills with proficiency scores")
    target_role: str = Field(..., description="Target job role name")


class RoadmapRequest(BaseModel):
    skills: List[SkillInput]
    target_role: str
    weeks: int = Field(default=12, ge=4, le=52)


@router.get("/roles")
async def list_roles():
    """Get all available target roles."""
    roles = get_available_roles()
    return {
        "total": len(roles),
        "roles": roles,
    }


@router.get("/roles/{role_name}")
async def get_role(role_name: str):
    """Get skill requirements for a specific role."""
    data = get_role_requirements(role_name)
    if not data:
        # Try fuzzy match
        for key in get_available_roles():
            if role_name.lower() in key.lower():
                data = get_role_requirements(key)
                role_name = key
                break

    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Role '{role_name}' not found. Use /api/skills/roles for available roles."
        )

    return {
        "role": role_name,
        **data,
    }


@router.post("/analyze")
async def analyze_skills(request: AnalyzeRequest):
    """
    Analyze skill gap between student's current skills and target role.

    Returns readiness score, gap analysis per skill, priority recommendations.
    """
    # Convert input to dict format
    resume_skills = {s.name: s.score for s in request.skills}

    result = analyze_skill_gap(resume_skills, request.target_role)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.post("/roadmap")
async def generate_skill_roadmap(request: RoadmapRequest):
    """
    Generate a personalized learning roadmap based on skill gaps.

    Returns week-by-week milestones with resources and goals.
    """
    resume_skills = {s.name: s.score for s in request.skills}

    # First get the gap analysis
    analysis = analyze_skill_gap(resume_skills, request.target_role)

    if "error" in analysis:
        raise HTTPException(status_code=404, detail=analysis["error"])

    # Generate roadmap from analysis
    roadmap = generate_roadmap(analysis, weeks=request.weeks)

    return {
        "role": request.target_role,
        "readiness_score": analysis["readiness_score"],
        "total_weeks": request.weeks,
        "roadmap": roadmap,
    }
