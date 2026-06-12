"""
SkillMap System — Skill Gap Analyzer Service
=========================================
Core engine that compares student skills against role requirements,
calculates readiness scores, and generates learning roadmaps.

Uses a curated database of 15+ roles with skill requirements,
so it works fully offline without any API key.
"""

from typing import Dict, List, Optional, Tuple
import random
import math


# ─── ROLE REQUIREMENTS DATABASE ─────────────────────────────────────────────
# Each role has skills with target proficiency (1-100) and weight (importance)
ROLE_DATABASE: Dict[str, Dict] = {
    "Frontend Developer": {
        "description": "Build user-facing web applications with modern frameworks",
        "skills": {
            "React.js": {"target": 85, "weight": 1.0, "category": "Framework"},
            "JavaScript": {"target": 90, "weight": 0.95, "category": "Language"},
            "TypeScript": {"target": 75, "weight": 0.85, "category": "Language"},
            "CSS/HTML": {"target": 85, "weight": 0.8, "category": "Core"},
            "Testing": {"target": 70, "weight": 0.7, "category": "Practice"},
            "Git": {"target": 75, "weight": 0.6, "category": "Tool"},
            "Performance": {"target": 70, "weight": 0.75, "category": "Practice"},
            "Accessibility": {"target": 65, "weight": 0.65, "category": "Practice"},
            "State Management": {"target": 75, "weight": 0.8, "category": "Concept"},
            "REST APIs": {"target": 70, "weight": 0.7, "category": "Concept"},
        },
        "trending_skills": ["Next.js", "Tailwind CSS", "React Server Components"],
    },
    "Backend Developer": {
        "description": "Design and build server-side applications and APIs",
        "skills": {
            "Python": {"target": 85, "weight": 1.0, "category": "Language"},
            "Node.js": {"target": 75, "weight": 0.8, "category": "Runtime"},
            "SQL": {"target": 85, "weight": 0.9, "category": "Database"},
            "REST APIs": {"target": 90, "weight": 0.95, "category": "Concept"},
            "Authentication": {"target": 75, "weight": 0.8, "category": "Security"},
            "Docker": {"target": 70, "weight": 0.75, "category": "DevOps"},
            "Testing": {"target": 75, "weight": 0.7, "category": "Practice"},
            "System Design": {"target": 70, "weight": 0.85, "category": "Concept"},
            "Databases": {"target": 80, "weight": 0.9, "category": "Infrastructure"},
            "Caching": {"target": 65, "weight": 0.65, "category": "Performance"},
        },
        "trending_skills": ["FastAPI", "GraphQL", "Microservices"],
    },
    "Full Stack Developer": {
        "description": "Build end-to-end web applications across the entire stack",
        "skills": {
            "React.js": {"target": 80, "weight": 0.9, "category": "Frontend"},
            "Node.js": {"target": 80, "weight": 0.9, "category": "Backend"},
            "SQL": {"target": 75, "weight": 0.85, "category": "Database"},
            "REST APIs": {"target": 85, "weight": 0.95, "category": "Concept"},
            "DevOps": {"target": 65, "weight": 0.7, "category": "Operations"},
            "Testing": {"target": 70, "weight": 0.7, "category": "Practice"},
            "UI/UX": {"target": 65, "weight": 0.6, "category": "Design"},
            "Security": {"target": 70, "weight": 0.75, "category": "Practice"},
            "Performance": {"target": 70, "weight": 0.7, "category": "Practice"},
            "System Design": {"target": 75, "weight": 0.85, "category": "Concept"},
        },
        "trending_skills": ["Next.js", "T3 Stack", "Serverless"],
    },
    "Data Scientist": {
        "description": "Extract insights from data using statistical and ML methods",
        "skills": {
            "Python": {"target": 90, "weight": 1.0, "category": "Language"},
            "ML/DL": {"target": 85, "weight": 0.95, "category": "Core"},
            "Statistics": {"target": 85, "weight": 0.9, "category": "Math"},
            "SQL": {"target": 80, "weight": 0.8, "category": "Data"},
            "Data Visualization": {"target": 80, "weight": 0.75, "category": "Communication"},
            "NLP": {"target": 65, "weight": 0.6, "category": "Specialization"},
            "Feature Engineering": {"target": 75, "weight": 0.8, "category": "Core"},
            "Cloud": {"target": 60, "weight": 0.55, "category": "Infrastructure"},
            "Big Data": {"target": 65, "weight": 0.6, "category": "Infrastructure"},
            "A/B Testing": {"target": 70, "weight": 0.7, "category": "Practice"},
        },
        "trending_skills": ["LLMs/RAG", "MLflow", "Feature Stores"],
    },
    "ML Engineer": {
        "description": "Build and deploy machine learning systems at scale",
        "skills": {
            "Python": {"target": 90, "weight": 1.0, "category": "Language"},
            "Deep Learning": {"target": 85, "weight": 0.95, "category": "Core"},
            "MLOps": {"target": 75, "weight": 0.85, "category": "Operations"},
            "Mathematics": {"target": 80, "weight": 0.8, "category": "Foundation"},
            "TensorFlow/PyTorch": {"target": 85, "weight": 0.9, "category": "Framework"},
            "Data Engineering": {"target": 70, "weight": 0.7, "category": "Data"},
            "APIs": {"target": 70, "weight": 0.65, "category": "Deployment"},
            "Cloud": {"target": 70, "weight": 0.7, "category": "Infrastructure"},
            "Model Optimization": {"target": 75, "weight": 0.8, "category": "Core"},
            "Research": {"target": 65, "weight": 0.6, "category": "Practice"},
        },
        "trending_skills": ["Transformers", "ONNX", "Edge ML"],
    },
    "DevOps Engineer": {
        "description": "Automate and manage infrastructure, CI/CD, and deployments",
        "skills": {
            "Docker": {"target": 90, "weight": 1.0, "category": "Containerization"},
            "Kubernetes": {"target": 80, "weight": 0.9, "category": "Orchestration"},
            "CI/CD": {"target": 85, "weight": 0.95, "category": "Automation"},
            "Linux": {"target": 85, "weight": 0.85, "category": "OS"},
            "Terraform": {"target": 75, "weight": 0.8, "category": "IaC"},
            "Monitoring": {"target": 75, "weight": 0.75, "category": "Observability"},
            "Networking": {"target": 70, "weight": 0.7, "category": "Infrastructure"},
            "Cloud (AWS/GCP)": {"target": 80, "weight": 0.85, "category": "Platform"},
            "Scripting": {"target": 80, "weight": 0.8, "category": "Automation"},
            "Security": {"target": 70, "weight": 0.7, "category": "Practice"},
        },
        "trending_skills": ["GitOps", "Service Mesh", "Platform Engineering"],
    },
    "Product Manager": {
        "description": "Define product strategy and drive execution across teams",
        "skills": {
            "Strategy": {"target": 85, "weight": 1.0, "category": "Core"},
            "Roadmapping": {"target": 80, "weight": 0.9, "category": "Planning"},
            "SQL": {"target": 65, "weight": 0.6, "category": "Data"},
            "UX Research": {"target": 75, "weight": 0.8, "category": "Research"},
            "Metrics & Analytics": {"target": 80, "weight": 0.85, "category": "Data"},
            "Stakeholder Mgmt": {"target": 85, "weight": 0.9, "category": "Communication"},
            "Agile/Scrum": {"target": 80, "weight": 0.8, "category": "Process"},
            "Technical Writing": {"target": 70, "weight": 0.65, "category": "Communication"},
            "Market Analysis": {"target": 75, "weight": 0.75, "category": "Research"},
            "User Interviews": {"target": 75, "weight": 0.8, "category": "Research"},
        },
        "trending_skills": ["System Product Strategy", "PLG", "Data-Driven PM"],
    },
    "UI/UX Designer": {
        "description": "Design intuitive and beautiful user experiences",
        "skills": {
            "Figma": {"target": 90, "weight": 1.0, "category": "Tool"},
            "User Research": {"target": 80, "weight": 0.9, "category": "Research"},
            "Prototyping": {"target": 85, "weight": 0.85, "category": "Design"},
            "Visual Design": {"target": 85, "weight": 0.9, "category": "Design"},
            "Interaction Design": {"target": 80, "weight": 0.85, "category": "Design"},
            "Design Systems": {"target": 75, "weight": 0.8, "category": "Systems"},
            "Accessibility": {"target": 70, "weight": 0.7, "category": "Practice"},
            "Typography": {"target": 75, "weight": 0.7, "category": "Visual"},
            "Color Theory": {"target": 70, "weight": 0.65, "category": "Visual"},
            "Usability Testing": {"target": 75, "weight": 0.8, "category": "Research"},
        },
        "trending_skills": ["System-Assisted Design", "Design Tokens", "Motion Design"],
    },
    "Mobile Developer": {
        "description": "Build native and cross-platform mobile applications",
        "skills": {
            "React Native/Flutter": {"target": 85, "weight": 1.0, "category": "Framework"},
            "iOS/Android": {"target": 75, "weight": 0.85, "category": "Platform"},
            "REST APIs": {"target": 80, "weight": 0.8, "category": "Integration"},
            "State Management": {"target": 80, "weight": 0.85, "category": "Architecture"},
            "Performance": {"target": 75, "weight": 0.75, "category": "Optimization"},
            "Testing": {"target": 70, "weight": 0.7, "category": "Practice"},
            "UI/UX": {"target": 75, "weight": 0.8, "category": "Design"},
            "Push Notifications": {"target": 65, "weight": 0.6, "category": "Feature"},
            "Offline Support": {"target": 70, "weight": 0.7, "category": "Architecture"},
            "App Store": {"target": 65, "weight": 0.6, "category": "Deployment"},
        },
        "trending_skills": ["Kotlin Multiplatform", "SwiftUI", "Expo"],
    },
    "Data Analyst": {
        "description": "Analyze data to support business decisions and reporting",
        "skills": {
            "Excel": {"target": 85, "weight": 0.8, "category": "Tool"},
            "SQL": {"target": 90, "weight": 1.0, "category": "Data"},
            "Python": {"target": 75, "weight": 0.85, "category": "Language"},
            "Data Visualization": {"target": 85, "weight": 0.9, "category": "Communication"},
            "Statistics": {"target": 75, "weight": 0.8, "category": "Math"},
            "Reporting": {"target": 80, "weight": 0.75, "category": "Communication"},
            "ETL": {"target": 70, "weight": 0.7, "category": "Data"},
            "Business Intelligence": {"target": 75, "weight": 0.8, "category": "Tools"},
            "Communication": {"target": 80, "weight": 0.85, "category": "Soft Skill"},
            "Domain Knowledge": {"target": 70, "weight": 0.7, "category": "Context"},
        },
        "trending_skills": ["dbt", "Looker", "Power BI"],
    },
    "Cybersecurity Analyst": {
        "description": "Protect systems and data from security threats",
        "skills": {
            "Network Security": {"target": 85, "weight": 1.0, "category": "Core"},
            "Penetration Testing": {"target": 80, "weight": 0.9, "category": "Offensive"},
            "SIEM Tools": {"target": 75, "weight": 0.8, "category": "Monitoring"},
            "Linux": {"target": 80, "weight": 0.85, "category": "OS"},
            "Python Scripting": {"target": 75, "weight": 0.75, "category": "Automation"},
            "Compliance": {"target": 70, "weight": 0.7, "category": "Governance"},
            "Incident Response": {"target": 80, "weight": 0.85, "category": "Operations"},
            "Cloud Security": {"target": 75, "weight": 0.8, "category": "Cloud"},
            "Cryptography": {"target": 70, "weight": 0.7, "category": "Core"},
            "Threat Intelligence": {"target": 70, "weight": 0.75, "category": "Analysis"},
        },
        "trending_skills": ["Zero Trust", "SOAR", "DevSecOps"],
    },
    "Cloud Architect": {
        "description": "Design and manage cloud infrastructure at scale",
        "skills": {
            "AWS/Azure/GCP": {"target": 90, "weight": 1.0, "category": "Platform"},
            "Infrastructure as Code": {"target": 85, "weight": 0.9, "category": "Automation"},
            "Networking": {"target": 80, "weight": 0.85, "category": "Infrastructure"},
            "Security": {"target": 80, "weight": 0.85, "category": "Practice"},
            "Containers": {"target": 80, "weight": 0.8, "category": "Compute"},
            "Serverless": {"target": 75, "weight": 0.75, "category": "Architecture"},
            "Cost Optimization": {"target": 75, "weight": 0.7, "category": "Business"},
            "Monitoring": {"target": 75, "weight": 0.75, "category": "Observability"},
            "Databases": {"target": 75, "weight": 0.8, "category": "Storage"},
            "Architecture Patterns": {"target": 80, "weight": 0.9, "category": "Design"},
        },
        "trending_skills": ["FinOps", "Multi-Cloud", "Edge Computing"],
    },
    "Blockchain Developer": {
        "description": "Build decentralized applications and smart contracts",
        "skills": {
            "Solidity": {"target": 85, "weight": 1.0, "category": "Language"},
            "Ethereum": {"target": 85, "weight": 0.95, "category": "Platform"},
            "Web3.js/Ethers": {"target": 80, "weight": 0.85, "category": "Library"},
            "Smart Contracts": {"target": 85, "weight": 0.95, "category": "Core"},
            "JavaScript": {"target": 75, "weight": 0.7, "category": "Language"},
            "Security Auditing": {"target": 80, "weight": 0.85, "category": "Security"},
            "DeFi Protocols": {"target": 70, "weight": 0.7, "category": "Domain"},
            "Testing (Hardhat)": {"target": 75, "weight": 0.75, "category": "Practice"},
            "Cryptography": {"target": 70, "weight": 0.7, "category": "Foundation"},
            "Gas Optimization": {"target": 70, "weight": 0.75, "category": "Performance"},
        },
        "trending_skills": ["ZK Proofs", "Layer 2", "Account Abstraction"],
    },
    "System/ML Research Engineer": {
        "description": "Push the boundaries of System through research and implementation",
        "skills": {
            "Python": {"target": 90, "weight": 0.9, "category": "Language"},
            "Deep Learning": {"target": 90, "weight": 1.0, "category": "Core"},
            "Mathematics": {"target": 90, "weight": 0.95, "category": "Foundation"},
            "Research Papers": {"target": 80, "weight": 0.85, "category": "Academic"},
            "PyTorch": {"target": 85, "weight": 0.9, "category": "Framework"},
            "NLP/CV": {"target": 80, "weight": 0.8, "category": "Specialization"},
            "Experiment Tracking": {"target": 70, "weight": 0.65, "category": "Practice"},
            "Distributed Training": {"target": 70, "weight": 0.7, "category": "Scale"},
            "Paper Writing": {"target": 75, "weight": 0.75, "category": "Communication"},
            "Statistics": {"target": 85, "weight": 0.9, "category": "Foundation"},
        },
        "trending_skills": ["LLM Fine-tuning", "Multimodal System", "Efficient Training"],
    },
}

# ─── LEARNING RESOURCES DATABASE ────────────────────────────────────────────
RESOURCE_DATABASE: Dict[str, List[Dict]] = {
    "React.js": [
        {"name": "React Official Docs", "type": "📖 Docs", "url": "react.dev", "hours": 20},
        {"name": "Full Stack Open (React)", "type": "🎓 Course", "url": "fullstackopen.com", "hours": 40},
        {"name": "Build a Portfolio Project", "type": "🚀 Project", "url": "project-based", "hours": 30},
    ],
    "JavaScript": [
        {"name": "JavaScript.info", "type": "📖 Docs", "url": "javascript.info", "hours": 30},
        {"name": "freeCodeCamp JS", "type": "🎓 Course", "url": "freecodecamp.org", "hours": 50},
        {"name": "30 Days of JS Challenge", "type": "🚀 Project", "url": "github.com", "hours": 30},
    ],
    "TypeScript": [
        {"name": "TypeScript Handbook", "type": "📖 Docs", "url": "typescriptlang.org", "hours": 15},
        {"name": "Total TypeScript (Beginner)", "type": "🎓 Course", "url": "totaltypescript.com", "hours": 20},
        {"name": "Convert JS Project to TS", "type": "🚀 Project", "url": "project-based", "hours": 15},
    ],
    "CSS/HTML": [
        {"name": "MDN Web Docs", "type": "📖 Docs", "url": "developer.mozilla.org", "hours": 15},
        {"name": "CSS Grid/Flexbox Course", "type": "🎓 Course", "url": "cssgrid.io", "hours": 10},
        {"name": "Build Responsive Layouts", "type": "🚀 Project", "url": "project-based", "hours": 20},
    ],
    "Python": [
        {"name": "Python Official Tutorial", "type": "📖 Docs", "url": "python.org", "hours": 20},
        {"name": "CS50P (Harvard)", "type": "🎓 Course", "url": "cs50.harvard.edu", "hours": 40},
        {"name": "Automate the Boring Stuff", "type": "📖 Book", "url": "automatetheboringstuff.com", "hours": 30},
    ],
    "SQL": [
        {"name": "SQLBolt Interactive", "type": "🎓 Course", "url": "sqlbolt.com", "hours": 10},
        {"name": "Mode Analytics SQL", "type": "📖 Tutorial", "url": "mode.com", "hours": 15},
        {"name": "LeetCode SQL Problems", "type": "🚀 Practice", "url": "leetcode.com", "hours": 20},
    ],
    "Docker": [
        {"name": "Docker Official Getting Started", "type": "📖 Docs", "url": "docs.docker.com", "hours": 10},
        {"name": "Docker Mastery (Udemy)", "type": "🎓 Course", "url": "udemy.com", "hours": 20},
        {"name": "Dockerize Your Own App", "type": "🚀 Project", "url": "project-based", "hours": 10},
    ],
    "Testing": [
        {"name": "Testing Library Docs", "type": "📖 Docs", "url": "testing-library.com", "hours": 10},
        {"name": "Kent C. Dodds Testing JS", "type": "🎓 Course", "url": "testingjavascript.com", "hours": 25},
        {"name": "Add Tests to Portfolio", "type": "🚀 Project", "url": "project-based", "hours": 15},
    ],
    "Git": [
        {"name": "Pro Git Book", "type": "📖 Book", "url": "git-scm.com", "hours": 8},
        {"name": "Learn Git Branching", "type": "🎓 Interactive", "url": "learngitbranching.js.org", "hours": 5},
    ],
    "ML/DL": [
        {"name": "Andrew Ng ML Course", "type": "🎓 Course", "url": "coursera.org", "hours": 60},
        {"name": "Fast.system Practical DL", "type": "🎓 Course", "url": "fast.system", "hours": 40},
        {"name": "Kaggle Competition", "type": "🚀 Project", "url": "kaggle.com", "hours": 30},
    ],
    "Deep Learning": [
        {"name": "Deep Learning Specialization", "type": "🎓 Course", "url": "coursera.org", "hours": 80},
        {"name": "PyTorch Tutorials", "type": "📖 Docs", "url": "pytorch.org", "hours": 20},
        {"name": "Build a Neural Network", "type": "🚀 Project", "url": "project-based", "hours": 25},
    ],
    "Statistics": [
        {"name": "Khan Academy Stats", "type": "🎓 Course", "url": "khanacademy.org", "hours": 20},
        {"name": "Think Stats (Book)", "type": "📖 Book", "url": "greenteapress.com", "hours": 15},
    ],
    "REST APIs": [
        {"name": "RESTful API Design Guide", "type": "📖 Docs", "url": "restfulapi.net", "hours": 8},
        {"name": "Build API with FastAPI", "type": "🚀 Project", "url": "fastapi.tiangolo.com", "hours": 20},
    ],
    "Node.js": [
        {"name": "Node.js Official Docs", "type": "📖 Docs", "url": "nodejs.org", "hours": 15},
        {"name": "The Odin Project (Node)", "type": "🎓 Course", "url": "theodinproject.com", "hours": 40},
    ],
    "Kubernetes": [
        {"name": "Kubernetes Official Docs", "type": "📖 Docs", "url": "kubernetes.io", "hours": 20},
        {"name": "KodeKloud CKA Course", "type": "🎓 Course", "url": "kodekloud.com", "hours": 40},
    ],
    "CI/CD": [
        {"name": "GitHub Actions Docs", "type": "📖 Docs", "url": "docs.github.com", "hours": 8},
        {"name": "Set up CI/CD Pipeline", "type": "🚀 Project", "url": "project-based", "hours": 15},
    ],
    "Performance": [
        {"name": "web.dev Performance", "type": "📖 Docs", "url": "web.dev", "hours": 10},
        {"name": "Lighthouse Auditing", "type": "🛠️ Tool", "url": "lighthouse", "hours": 8},
    ],
    "Accessibility": [
        {"name": "a11y Project", "type": "📖 Docs", "url": "a11yproject.com", "hours": 10},
        {"name": "freeCodeCamp Accessibility", "type": "🎓 Course", "url": "freecodecamp.org", "hours": 8},
    ],
    "State Management": [
        {"name": "Redux Toolkit Docs", "type": "📖 Docs", "url": "redux-toolkit.js.org", "hours": 12},
        {"name": "Zustand / Jotai Tutorial", "type": "🎓 Course", "url": "github.com", "hours": 6},
    ],
    "System Design": [
        {"name": "System Design Primer", "type": "📖 GitHub", "url": "github.com", "hours": 30},
        {"name": "Grokking System Design", "type": "🎓 Course", "url": "educative.io", "hours": 40},
    ],
    "Figma": [
        {"name": "Figma Official Tutorials", "type": "📖 Docs", "url": "figma.com", "hours": 15},
        {"name": "Design a Mobile App", "type": "🚀 Project", "url": "project-based", "hours": 20},
    ],
    "Data Visualization": [
        {"name": "D3.js Official Docs", "type": "📖 Docs", "url": "d3js.org", "hours": 20},
        {"name": "Matplotlib + Seaborn", "type": "🎓 Course", "url": "kaggle.com", "hours": 12},
    ],
}

# Default resource for skills not in the database
DEFAULT_RESOURCES = [
    {"name": "Official Documentation", "type": "📖 Docs", "url": "docs", "hours": 15},
    {"name": "Udemy/Coursera Course", "type": "🎓 Course", "url": "udemy.com", "hours": 20},
    {"name": "Build a Practice Project", "type": "🚀 Project", "url": "project-based", "hours": 15},
]


def get_available_roles() -> List[str]:
    """Return list of all available roles."""
    return sorted(ROLE_DATABASE.keys())


def get_role_requirements(role: str) -> Optional[Dict]:
    """Get the skill requirements for a specific role."""
    return ROLE_DATABASE.get(role)


def analyze_skill_gap(
    resume_skills: Dict[str, int],
    target_role: str,
) -> Dict:
    """
    Analyze the gap between a student's current skills and target role requirements.

    Args:
        resume_skills: Dict of {skill_name: proficiency_score (0-100)}
        target_role: Target job role name

    Returns:
        Complete skill gap analysis with readiness score, gaps, and recommendations.
    """
    role_data = ROLE_DATABASE.get(target_role)
    if not role_data:
        # Try fuzzy match
        for key in ROLE_DATABASE:
            if target_role.lower() in key.lower() or key.lower() in target_role.lower():
                role_data = ROLE_DATABASE[key]
                target_role = key
                break

    if not role_data:
        return {
            "error": f"Role '{target_role}' not found",
            "available_roles": get_available_roles(),
        }

    required_skills = role_data["skills"]
    skill_analysis = []
    total_weighted_score = 0
    total_weight = 0

    for skill_name, skill_info in required_skills.items():
        target = skill_info["target"]
        weight = skill_info["weight"]
        category = skill_info["category"]

        # Find matching skill in resume (fuzzy match)
        current = 0
        matched_name = None
        for rs_name, rs_score in resume_skills.items():
            if (
                rs_name.lower() == skill_name.lower()
                or rs_name.lower() in skill_name.lower()
                or skill_name.lower() in rs_name.lower()
            ):
                current = rs_score
                matched_name = rs_name
                break

        gap = max(0, target - current)
        gap_percentage = round((gap / target) * 100) if target > 0 else 0
        proficiency_ratio = min(current / target, 1.0) if target > 0 else 0

        # Determine priority based on gap and weight
        impact_score = gap * weight
        if gap_percentage >= 40:
            priority = "Critical"
        elif gap_percentage >= 20:
            priority = "High"
        elif gap_percentage >= 10:
            priority = "Medium"
        else:
            priority = "Low"

        # Get learning resources
        resources = RESOURCE_DATABASE.get(skill_name, DEFAULT_RESOURCES)

        skill_analysis.append({
            "skill": skill_name,
            "current": current,
            "required": target,
            "gap": gap,
            "gap_percentage": gap_percentage,
            "weight": weight,
            "category": category,
            "priority": priority,
            "impact_score": round(impact_score, 1),
            "matched_from_resume": matched_name,
            "resources": resources[:2],  # Top 2 resources per skill
        })

        # Weighted readiness calculation
        total_weighted_score += proficiency_ratio * weight
        total_weight += weight

    # Calculate readiness score
    readiness_score = round((total_weighted_score / total_weight) * 100) if total_weight > 0 else 0

    # Sort by impact (highest gap * weight first)
    skill_analysis.sort(key=lambda x: x["impact_score"], reverse=True)

    # Top priority skills
    priority_skills = [s for s in skill_analysis if s["gap"] > 0][:5]

    # Estimated time to close gaps
    total_hours = sum(
        sum(r["hours"] for r in s.get("resources", []))
        for s in priority_skills
    )

    return {
        "role": target_role,
        "description": role_data["description"],
        "readiness_score": readiness_score,
        "total_skills_analyzed": len(skill_analysis),
        "skills_met": len([s for s in skill_analysis if s["gap"] == 0]),
        "skills_gap": len([s for s in skill_analysis if s["gap"] > 0]),
        "skill_analysis": skill_analysis,
        "priority_skills": priority_skills,
        "trending_skills": role_data.get("trending_skills", []),
        "estimated_hours_to_ready": total_hours,
        "estimated_weeks": math.ceil(total_hours / 15),  # 15 hrs/week study
    }


def generate_roadmap(
    skill_analysis: Dict,
    weeks: int = 12,
) -> List[Dict]:
    """
    Generate a personalized week-by-week learning roadmap.

    Args:
        skill_analysis: Output from analyze_skill_gap()
        weeks: Total weeks for the roadmap (default 12)

    Returns:
        List of weekly milestones with resources and goals.
    """
    priority_skills = skill_analysis.get("priority_skills", [])
    if not priority_skills:
        return []

    # Distribute skills across weeks
    roadmap = []
    skills_per_block = max(1, len(priority_skills))
    weeks_per_skill = max(2, weeks // skills_per_block)

    week_counter = 1
    for i, skill_info in enumerate(priority_skills):
        start_week = week_counter
        end_week = min(week_counter + weeks_per_skill - 1, weeks)

        resources = skill_info.get("resources", DEFAULT_RESOURCES[:2])
        total_hours = sum(r["hours"] for r in resources)

        roadmap.append({
            "week_range": f"Week {start_week}–{end_week}",
            "skill": skill_info["skill"],
            "current_level": skill_info["current"],
            "target_level": skill_info["required"],
            "priority": skill_info["priority"],
            "resources": resources,
            "estimated_hours": total_hours,
            "milestone": f"Reach {min(skill_info['required'], skill_info['current'] + skill_info['gap'])}% proficiency in {skill_info['skill']}",
            "type": "📖" if i == 0 else "🎓" if i == 1 else "🚀" if i == 2 else "🛠️" if i == 3 else "🎯",
        })

        week_counter = end_week + 1
        if week_counter > weeks:
            break

    # Add final milestone
    if week_counter <= weeks:
        roadmap.append({
            "week_range": f"Week {week_counter}–{weeks}",
            "skill": "Portfolio & Interview Prep",
            "current_level": 0,
            "target_level": 100,
            "priority": "Launch",
            "resources": [
                {"name": "Build Portfolio Project", "type": "🚀 Project", "url": "project-based", "hours": 30},
                {"name": "SkillMap System Mock Interviewer", "type": "🎯 Interview", "url": "skillmap.system", "hours": 10},
            ],
            "estimated_hours": 40,
            "milestone": "Complete portfolio project and pass mock interviews",
            "type": "🎯",
        })

    return roadmap
