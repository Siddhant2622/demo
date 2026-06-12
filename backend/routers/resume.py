"""
SkillMap System — Resume API Router
==================================
Endpoints for resume parsing and skill extraction.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.resume_parser import parse_resume_full, get_skill_depth_label

router = APIRouter(prefix="/api/resume", tags=["Resume"])


class ResumeTextRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Resume text content")


@router.post("/parse")
async def parse_resume(request: ResumeTextRequest):
    """
    Parse resume text and extract skills with depth scoring.

    The Resume DNA Engine analyzes context clues to determine
    skill proficiency: Aware → Beginner → Intermediate → Proficient → Expert
    """
    if len(request.text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Resume text too short. Please provide more content for accurate analysis."
        )

    result = parse_resume_full(request.text)

    if result["total_skills_found"] == 0:
        return {
            **result,
            "warning": "No skills detected. Try pasting the full resume text including skills section and project descriptions.",
        }

    return result


@router.post("/demo")
async def demo_resume_parse():
    """
    Parse a built-in demo resume for hackathon demonstrations.
    """
    demo_resume = """
    Arjun Sharma
    Email: arjun.sharma@lnct.ac.in | Phone: +91 98765 43210
    B.Tech Computer Science | LNCT Group of Colleges, Bhopal | CGPA: 8.7/10

    SKILLS
    Python, React.js, JavaScript, SQL, Machine Learning, Docker, Git, CSS/HTML, Node.js

    EXPERIENCE
    Software Engineering Intern — TechCorp India (Summer 2025)
    - Built 3 production React applications with Redux state management and comprehensive testing
    - Developed RESTful APIs using FastAPI, handling 500+ requests/second
    - Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 60%
    - Worked with PostgreSQL database design and query optimization

    PROJECTS
    SkillMap System — Full Stack Web Application
    - Architected a React microfrontend with 50+ reusable components
    - Built backend with FastAPI, integrating EasyOCR and spaCy NLP models
    - Deployed on AWS EC2 using Docker containers with auto-scaling
    - Led a team of 4 developers, mentoring 2 junior members

    Smart Agriculture IoT Dashboard
    - Created a real-time dashboard using React.js and D3.js for data visualization
    - Implemented machine learning model for crop prediction using scikit-learn
    - Built REST API with Node.js and MongoDB for sensor data management

    College Placement Portal
    - Developed a full-stack placement portal using React and Express.js
    - Integrated authentication using JWT tokens and role-based access control
    - Deployed using Docker on college servers

    CERTIFICATIONS
    - AWS Cloud Practitioner (2025)
    - Google Data Analytics Professional Certificate
    - HackerRank Python (Gold Badge)

    EDUCATION
    B.Tech Computer Science and Engineering
    LNCT Group of Colleges, Bhopal, MP
    2023 - 2027 (Expected)
    CGPA: 8.7 / 10.0
    """

    result = parse_resume_full(demo_resume)
    return result
