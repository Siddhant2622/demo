"""
SkillMap System — Extension API Router
==================================
Endpoints supporting the Chrome Extension:
1. Mock user profile retrieval (for Form Autofill).
2. Webpage text analysis (for Job Match Scoring and Recommendations).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from ..services.skill_analyzer import analyze_skill_gap, get_available_roles
from ..services.firebase_service import get_user_profile as fb_get_user_profile, update_user_profile as fb_update_user_profile

router = APIRouter(prefix="/api/extension", tags=["Extension"])


class PageAnalysisRequest(BaseModel):
    page_text: str = Field(..., description="Text content extracted from the webpage")
    page_url: Optional[str] = Field(None, description="URL of the webpage")


@router.get("/profile")
async def get_user_profile(user_id: str = "demo_user"):
    """
    Fetches the user profile from Firebase Firestore.
    Falls back to a mock profile if Firebase is not connected or the user is not found.
    """
    try:
        profile = fb_get_user_profile(user_id)
        if profile:
            return profile
    except Exception as e:
        print(f"Firebase fetch failed: {e}. Falling back to mock data.")
    
    # Fallback mock data
    return {
        "user_id": user_id,
        "personal_info": {
            "first_name": "Arjun",
            "last_name": "Sharma",
            "full_name": "Arjun Sharma",
            "email": "arjun.sharma@lnct.ac.in",
            "phone": "+91 9876543210",
            "location": "Bhopal, MP",
            "linkedin": "https://linkedin.com/in/arjun-sharma",
            "github": "https://github.com/arjunsharma",
            "portfolio": "https://arjunsharma.dev"
        },
        "education": {
            "university": "LNCT Group of Colleges",
            "degree": "B.Tech Computer Science",
            "graduation_year": "2027",
            "cgpa": "8.7"
        },
        "skills_raw": "Python, React.js, JavaScript, SQL, Machine Learning, Docker, Git, CSS/HTML, Node.js",
        "skills_analyzed": {
            "Python": 85,
            "React.js": 80,
            "JavaScript": 85,
            "SQL": 75,
            "Machine Learning": 65,
            "Docker": 70,
            "Git": 75,
            "CSS/HTML": 80,
            "Node.js": 75
        },
        "experience": "Software Engineering Intern at TechCorp India. Built React applications and RESTful APIs."
    }

@router.post("/profile")
async def save_user_profile(profile_data: dict, user_id: str = "demo_user"):
    """
    Saves the user profile data to Firebase Firestore.
    """
    try:
        # Automatically add the user_id inside the document if missing
        if "user_id" not in profile_data:
            profile_data["user_id"] = user_id
            
        fb_update_user_profile(user_id, profile_data)
        return {"status": "success", "message": "Profile saved to Firebase"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-job")
async def analyze_job_page(request: PageAnalysisRequest, user_id: str = "demo_user"):
    """
    Analyzes page text (like a job description) and calculates a match score
    against the user's profile.
    """
    text = request.page_text.lower()
    
    if len(text.strip()) < 50:
        return {"error": "Not enough text on page to analyze."}

    # Simple heuristic to find the most relevant role from our database
    roles = get_available_roles()
    best_role = "Software Developer" # default fallback
    max_matches = 0
    
    # Very basic term matching to guess the role based on the page text
    for role in roles:
        role_terms = role.lower().split()
        matches = sum(1 for term in role_terms if term in text)
        if matches > max_matches:
            max_matches = matches
            best_role = role

    # Fallback if no exact role matched
    if max_matches == 0:
        if "frontend" in text or "react" in text:
            best_role = "Frontend Developer"
        elif "backend" in text or "api" in text or "node" in text:
            best_role = "Backend Developer"
        elif "data" in text or "machine learning" in text:
            best_role = "Data Scientist"
        else:
            best_role = "Full Stack Developer"

    # Get the user's mock profile
    profile_response = await get_user_profile(user_id)
    user_skills = profile_response.get("skills_analyzed", {})

    # Run the skill gap analyzer
    analysis = analyze_skill_gap(user_skills, best_role)

    # If role wasn't found in DB, analyze_skill_gap returns an error dict
    if "error" in analysis:
         return {"error": f"Could not analyze against role: {best_role}"}

    return {
        "target_role": best_role,
        "readiness_score": analysis.get("readiness_score", 0),
        "priority_skills": analysis.get("priority_skills", []),
        "missing_skills": [s["skill"] for s in analysis.get("skill_analysis", []) if s["gap"] > 0][:3]
    }
