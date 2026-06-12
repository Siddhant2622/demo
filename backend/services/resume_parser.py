"""
SkillMap System — Resume DNA Engine
=================================
Parses resume text to extract skills with DEPTH scoring.
Goes beyond keyword matching to understand proficiency level
from context clues in the resume text.

Scoring Rubric:
  1-20:  Mentioned / Aware (e.g., "familiar with React")
  21-40: Beginner (e.g., "learned React in coursework")
  41-60: Intermediate (e.g., "built 2 projects with React")
  61-80: Proficient (e.g., "built production React apps with Redux, testing")
  81-100: Expert (e.g., "architected React microfrontend, mentored team of 5")
"""

import re
from typing import Dict, List, Tuple


# ─── SKILL KEYWORDS DATABASE ────────────────────────────────────────────────
# Maps skill categories to their keyword variants
SKILL_KEYWORDS: Dict[str, List[str]] = {
    "Python": ["python", "django", "flask", "fastapi", "pandas", "numpy", "scipy", "jupyter"],
    "JavaScript": ["javascript", "js", "es6", "es2015", "vanilla js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "React.js": ["react", "reactjs", "react.js", "react native", "next.js", "nextjs", "gatsby"],
    "Node.js": ["node", "nodejs", "node.js", "express", "expressjs", "nestjs"],
    "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "mssql", "sql server"],
    "CSS/HTML": ["css", "html", "html5", "css3", "sass", "scss", "less", "tailwind", "bootstrap"],
    "Git": ["git", "github", "gitlab", "bitbucket", "version control"],
    "Docker": ["docker", "dockerfile", "docker-compose", "containerization"],
    "Kubernetes": ["kubernetes", "k8s", "kubectl", "helm"],
    "AWS/Azure/GCP": ["aws", "amazon web services", "azure", "gcp", "google cloud", "cloud computing"],
    "ML/DL": ["machine learning", "deep learning", "neural network", "system", "artificial intelligence"],
    "Deep Learning": ["deep learning", "neural network", "cnn", "rnn", "lstm", "transformer", "attention"],
    "TensorFlow/PyTorch": ["tensorflow", "pytorch", "keras", "tf", "torch"],
    "Data Visualization": ["matplotlib", "seaborn", "plotly", "d3", "d3.js", "tableau", "power bi", "visualization"],
    "NLP": ["nlp", "natural language", "text mining", "sentiment analysis", "bert", "gpt", "spacy", "nltk"],
    "Statistics": ["statistics", "statistical", "probability", "hypothesis testing", "regression", "bayesian"],
    "REST APIs": ["rest", "api", "restful", "graphql", "grpc", "websocket", "microservices"],
    "Testing": ["testing", "jest", "pytest", "unittest", "selenium", "cypress", "tdd", "bdd", "test-driven"],
    "CI/CD": ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci", "circleci", "continuous integration"],
    "Linux": ["linux", "ubuntu", "centos", "debian", "bash", "shell scripting", "unix"],
    "MongoDB": ["mongodb", "mongo", "nosql", "document database"],
    "Redis": ["redis", "caching", "in-memory"],
    "Terraform": ["terraform", "infrastructure as code", "iac", "cloudformation"],
    "Monitoring": ["monitoring", "prometheus", "grafana", "datadog", "new relic", "elk", "logging"],
    "Security": ["security", "authentication", "authorization", "oauth", "jwt", "encryption", "cybersecurity"],
    "Agile/Scrum": ["agile", "scrum", "kanban", "sprint", "jira", "project management"],
    "Figma": ["figma", "sketch", "adobe xd", "invision", "prototyping"],
    "System Design": ["system design", "architecture", "scalability", "distributed systems", "microservices"],
    "Performance": ["performance", "optimization", "lighthouse", "web vitals", "caching", "lazy loading"],
    "Accessibility": ["accessibility", "a11y", "wcag", "aria", "screen reader"],
    "State Management": ["redux", "zustand", "mobx", "context api", "state management", "vuex", "recoil"],
    "Solidity": ["solidity", "smart contract", "ethereum", "blockchain", "web3"],
    "React Native/Flutter": ["react native", "flutter", "dart", "mobile development", "cross-platform"],
    "Excel": ["excel", "spreadsheet", "pivot table", "vlookup", "google sheets"],
    "Communication": ["communication", "presentation", "public speaking", "technical writing"],
    "Research": ["research", "paper", "publication", "thesis", "literature review"],
    "Mathematics": ["mathematics", "linear algebra", "calculus", "optimization", "numerical methods"],
}

# ─── DEPTH INDICATOR PATTERNS ───────────────────────────────────────────────
# Patterns that indicate skill depth level

EXPERT_PATTERNS = [
    r"architect(?:ed|ing)",
    r"led\s+(?:a\s+)?team",
    r"mentor(?:ed|ing)",
    r"design(?:ed)?\s+(?:and\s+)?implement(?:ed)?",
    r"(?:10|[5-9])\+?\s+(?:years?|yrs?)",
    r"senior|lead|principal|staff",
    r"(?:50|100|200)\+\s+(?:component|module|service)",
    r"at\s+scale",
    r"production\s+(?:grade|ready|system|environment)",
    r"micro(?:service|frontend)s?\s+architecture",
    r"drove\s+(?:adoption|migration|initiative)",
    r"(?:reduced|improved|increased).*(?:\d{2,3}%|\d+x)",
    r"enterprise",
    r"open[\s-]?source\s+contribut",
]

PROFICIENT_PATTERNS = [
    r"built\s+(?:\d+\s+)?(?:production|real[\s-]world|commercial)",
    r"(?:3|4|5|multiple|several)\s+(?:project|app|application|system)",
    r"(?:2|3|4)\+?\s+(?:years?|yrs?)",
    r"full[\s-]?stack",
    r"end[\s-]?to[\s-]?end",
    r"deployed\s+(?:to|on|in)\s+(?:production|aws|cloud|server)",
    r"integrated\s+(?:with|into)\s+",
    r"optimiz(?:ed|ation)",
    r"implemented\s+(?:custom|complex|advanced)",
    r"testing\s+(?:suite|framework|pipeline)",
    r"restful?\s+api",
    r"database\s+(?:design|schema|migration)",
    r"ci[\s/]?cd\s+pipeline",
]

INTERMEDIATE_PATTERNS = [
    r"built\s+(?:a|an|the|one|1|2|two)\s+(?:project|app|website|tool)",
    r"(?:1|2|one|two)\s+(?:year|yr)",
    r"developed\s+",
    r"created\s+",
    r"worked\s+(?:on|with)\s+",
    r"contributed\s+to",
    r"college\s+project",
    r"hackathon",
    r"personal\s+project",
    r"portfolio",
    r"internship",
    r"intern\b",
]

BEGINNER_PATTERNS = [
    r"learn(?:ed|ing|t)",
    r"course(?:work)?",
    r"certification",
    r"basic\s+(?:knowledge|understanding)",
    r"familiar\s+(?:with)?",
    r"introduction\s+to",
    r"beginner",
    r"academic",
    r"tutorial",
    r"online\s+(?:course|class)",
    r"self[\s-]?(?:taught|learn)",
]

AWARE_PATTERNS = [
    r"exposure\s+to",
    r"aware\s+of",
    r"knowledge\s+of",
    r"understanding\s+of",
    r"interested\s+in",
    r"exploring",
]


def extract_skills_from_text(resume_text: str) -> Dict[str, int]:
    """
    Extract skills from resume text with depth scoring.

    Args:
        resume_text: Raw text content from a resume

    Returns:
        Dict of {skill_name: proficiency_score (0-100)}
    """
    text_lower = resume_text.lower()
    sentences = re.split(r'[.\n;!?]', resume_text)
    extracted_skills: Dict[str, int] = {}

    for skill_name, keywords in SKILL_KEYWORDS.items():
        # Check if any keyword variant is mentioned
        skill_found = False
        relevant_sentences: List[str] = []

        for keyword in keywords:
            if keyword.lower() in text_lower:
                skill_found = True
                # Collect sentences mentioning this skill
                for sentence in sentences:
                    if keyword.lower() in sentence.lower():
                        relevant_sentences.append(sentence.strip())

        if not skill_found:
            continue

        # Score the skill based on context depth
        score = _score_skill_depth(skill_name, relevant_sentences, text_lower)
        extracted_skills[skill_name] = score

    return extracted_skills


def _score_skill_depth(
    skill_name: str,
    relevant_sentences: List[str],
    full_text: str,
) -> int:
    """
    Score skill depth based on contextual patterns in resume text.

    Returns score 1-100 based on evidence of depth.
    """
    context = " ".join(relevant_sentences).lower()
    if not context:
        context = full_text

    # Check patterns from highest to lowest depth
    expert_matches = sum(1 for p in EXPERT_PATTERNS if re.search(p, context, re.IGNORECASE))
    proficient_matches = sum(1 for p in PROFICIENT_PATTERNS if re.search(p, context, re.IGNORECASE))
    intermediate_matches = sum(1 for p in INTERMEDIATE_PATTERNS if re.search(p, context, re.IGNORECASE))
    beginner_matches = sum(1 for p in BEGINNER_PATTERNS if re.search(p, context, re.IGNORECASE))
    aware_matches = sum(1 for p in AWARE_PATTERNS if re.search(p, context, re.IGNORECASE))

    # Calculate weighted score
    if expert_matches >= 2:
        base_score = 85
        bonus = min(expert_matches * 3, 15)
    elif expert_matches >= 1 or proficient_matches >= 3:
        base_score = 72
        bonus = min(proficient_matches * 2, 10)
    elif proficient_matches >= 1 or intermediate_matches >= 3:
        base_score = 58
        bonus = min(intermediate_matches * 2, 10)
    elif intermediate_matches >= 1:
        base_score = 45
        bonus = min(intermediate_matches * 3, 10)
    elif beginner_matches >= 1:
        base_score = 28
        bonus = min(beginner_matches * 3, 10)
    elif aware_matches >= 1:
        base_score = 15
        bonus = min(aware_matches * 3, 8)
    else:
        # Skill mentioned but no depth context — assume basic familiarity
        base_score = 30
        bonus = 0

    # Count mentions as a mild signal (more mentions = slightly higher)
    mention_count = len(relevant_sentences)
    mention_bonus = min(mention_count * 2, 8)

    # Check for quantifiable achievements (numbers boost confidence)
    has_numbers = bool(re.search(r'\d+\s*(?:project|app|user|client|component|year|month)', context))
    number_bonus = 5 if has_numbers else 0

    total = min(100, base_score + bonus + mention_bonus + number_bonus)
    return total


def get_skill_depth_label(score: int) -> str:
    """Convert numeric score to human-readable depth label."""
    if score >= 81:
        return "Expert"
    elif score >= 61:
        return "Proficient"
    elif score >= 41:
        return "Intermediate"
    elif score >= 21:
        return "Beginner"
    else:
        return "Aware"


def parse_resume_full(resume_text: str) -> Dict:
    """
    Full resume parsing pipeline: extract skills + metadata.

    Args:
        resume_text: Raw text content from a resume

    Returns:
        Complete parsed resume with skills, metadata, and summary.
    """
    skills = extract_skills_from_text(resume_text)

    # Extract contact info with regex
    email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.]+', resume_text)
    phone_match = re.search(r'(?:\+91[\s-]?)?[6-9]\d{9}', resume_text)
    name_match = re.search(r'^([A-Z][a-z]+ [A-Z][a-z]+)', resume_text, re.MULTILINE)

    # Build skill summary
    skill_summary = []
    for skill, score in sorted(skills.items(), key=lambda x: x[1], reverse=True):
        skill_summary.append({
            "skill": skill,
            "score": score,
            "depth": get_skill_depth_label(score),
        })

    return {
        "skills": skills,
        "skill_summary": skill_summary,
        "total_skills_found": len(skills),
        "top_skills": [s["skill"] for s in skill_summary[:5]],
        "contact": {
            "email": email_match.group() if email_match else None,
            "phone": phone_match.group() if phone_match else None,
            "name": name_match.group(1) if name_match else None,
        },
        "word_count": len(resume_text.split()),
    }
