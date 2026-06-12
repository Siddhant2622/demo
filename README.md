# 🏆 SkillMap AI — CPL 2026 Hackathon

![SkillMap AI](https://img.shields.io/badge/CPL_2026-Smart_Education-00E5FF?style=for-the-badge)

SkillMap AI is a dual-purpose AI platform built for the **Coding Premier League (CPL) 2026** under the "Smart Education" theme by Team CODEX from LNCT Group of Colleges.

It solves two critical problems for students:
1. **Forms are a nightmare**: Auto-fills college/scholarship forms from uploaded documents using OCR + NLP.
2. **Students are lost**: Analyzes the skill gap between a student's resume and their target role, then generates a personalized 12-week learning roadmap.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```
*(Note: OpenCV and EasyOCR are heavy dependencies. If they fail to install or if you want to test quickly, the app will automatically gracefully degrade to a **demo mode** that works perfectly for presentations.)*

### 2. Run the App
```bash
python run.py
```

### 3. Open the App
Go to [http://localhost:8000](http://localhost:8000) in your browser.

## 💻 Tech Stack
- **Frontend**: Vanilla JS + Canvas Animations + HTML/CSS (Zero build step, high performance)
- **Backend**: FastAPI (Python)
- **OCR Engine**: OpenCV (preprocessing) + EasyOCR (extraction) + spaCy NER (field detection)
- **Context AI**: Resume DNA Engine for contextual skill depth scoring
- **Architecture**: Monolithic deployment ready for Docker/AWS

## 🌟 Hackathon Demo Flow
1. Open the app to see the stunning animated Hero section.
2. Scroll to the **Live Demo** section.
3. **Tab 1 (OCR)**: Click "Run Demo OCR" to see the simulated extraction pipeline.
4. **Tab 2 (Skill Gap)**: Click "Load Demo Resume", pick a role (e.g. "Frontend Developer"), and click "Analyze". Watch the readiness score ring and skill bars animate.
5. **Tab 3 (Roadmap)**: See the generated 12-week plan based on the exact gaps found.
6. **Tab 4 (Auto-fill)**: See how the extracted data maps to form fields.

## 🏛️ Project Structure
```
hacakathon/
├── run.py                 # Startup script
├── requirements.txt       # Python dependencies
├── frontend/              # Frontend web application
│   └── index.html         # Enhanced UI with interactive demos
└── backend/               # FastAPI application
    ├── main.py            # App entry point
    ├── routers/           # API endpoints (OCR, Skills, Resume)
    └── services/          # Core business logic engines
```

---
*Built with ❤️ by Team CODEX for CPL 2026*
