const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ]
  });

  const targetRole = "Data Analyst";
  const resumeText = `SUMMARY
	Results-driven Data Analyst skilled in SQL, Power BI, Advanced Excel, and Python. Experienced in data wrangling, dashboard development, and analytical reporting. Committed to delivering accurate insights that support business decisions.

EXPERIENCE
Data Analyst (Training & Project Experience) | Jan 2024 - Present                                             
Cybrom Technology Pvt. Ltd., Bhopal
	Applied Python, SQL, Power BI, and Advanced Excel to analyze datasets and create visual dashboards during hands-on training and project work.
	Finished multiple data analysis projects involving data cleaning, statistical analysis, and reporting to generate actionable insights.
	Built interactive dashboards and analytical reports to identify trends and support data-driven decision-making.

TECHNICAL SKILLS
	Programming & Querying: Python (Pandas, NumPy), SQL (Joins, Subqueries)
	BI & Visualization: Power BI, Tableau, Data Visualization, Dashboard Development
	Data Analysis & Reporting: Advanced Excel (Pivot Tables, VLOOKUP), ETL Pipeline, Data Wrangling & Cleaning, Statistical Analysis, KPI & Trend Analysis, Reporting & Insights`;

  const prompt = `You are an expert resume analyzer and career coach. Analyze this resume/CV for a candidate targeting the role of "${targetRole}".

Resume Text:\n"""\n${resumeText}\n"""

Extract and return a JSON object with exactly this structure (no markdown, no code fences, just pure JSON):
{
  "name": "candidate full name",
  "skills": ["skill1", "skill2", ...],
  "languages": ["programming language1", ...],
  "frameworks": ["framework1", ...],
  "certifications": ["cert1", ...],
  "projects": [{"name": "project name", "description": "brief description"}, ...],
  "experience": ["experience item 1", ...],
  "education": ["education item 1", ...],
  "softSkills": ["soft skill 1", ...],
  "experienceLevel": "Entry Level / Intermediate / Senior / Expert",
  "strengthMap": ["strength1", "strength2", ...],
  "weaknessMap": ["weakness1 relative to ${targetRole}", ...],
  "careerInterests": ["interest1", ...]
}

Rules:
- Extract ONLY what's actually in the resume, do not fabricate
- For weaknessMap, identify gaps relative to the target role "${targetRole}"
- strengthMap should highlight the candidate's strongest areas
- Keep arrays concise (5-10 items max each)
- If information is missing, use reasonable defaults based on context`;

  try {
    const result = await model.generateContent(prompt);
    console.log("SUCCESS:");
    console.log(result.response.text());
  } catch (err) {
    console.log("ERROR:");
    console.error(err);
  }
}

test();
