import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id") || "demo_user";
    
    const body = await req.json();
    const { page_text, page_url } = body;
    
    if (!page_text || page_text.length < 50) {
      return NextResponse.json({ error: "Not enough text on page to analyze." }, { headers: corsHeaders });
    }

    // 1. Fetch user profile
    let profile = null;
    try {
      const profileRes = await fetch(`http://localhost:3000/api/extension/profile?user_id=${userId}`);
      if (profileRes.ok) {
        profile = await profileRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch profile", e);
    }

    const skills = profile?.skills_raw || "Python, React.js, JavaScript, SQL, Machine Learning";

    // 2. Ask Gemini to analyze the job
    const prompt = `You are an expert tech recruiter and AI career coach.
I am providing you with the text of a webpage that the user is currently viewing. It might be a job posting, an internship, or just a random page.

Webpage text:
${page_text.substring(0, 10000)}

User's current skills: ${skills}

1. Identify the target role (e.g. Frontend Developer, Data Scientist) based on the webpage text. If it's not a job page, guess the closest tech role it relates to.
2. Calculate a "readiness_score" from 0 to 100 on how well the user's skills match the requirements on the page.
3. Identify 1 to 3 "missing_skills" that the user does not have but are required or highly recommended on the page.
4. Identify priority_skills.

Return ONLY a valid JSON object matching this exact structure:
{
  "target_role": "Software Developer",
  "readiness_score": 75,
  "priority_skills": [{"skill": "SkillName", "importance": 8}],
  "missing_skills": ["Skill1", "Skill2"]
}
Do NOT wrap the response in markdown blocks.`;

    let text = "";
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      text = result.response.text().trim();
    } catch (err: any) {
        console.warn(`Gemini API error (${err.message || err.status}), falling back to Groq...`);
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Return ONLY a valid JSON object. No other text." }],
            response_format: { type: "json_object" }
          })
        });
        
        if (!groqRes.ok) {
          throw new Error("429 Quota Exceeded: Both Gemini and Groq APIs are currently unavailable.");
        }
        
        const groqData = await groqRes.json();
        text = groqData.choices[0].message.content.trim();
    }
    if (text.startsWith("```json")) text = text.substring(7);
    if (text.startsWith("```")) text = text.substring(3);
    if (text.endsWith("```")) text = text.substring(0, text.length - 3);
    text = text.trim();
    
    const parsed = JSON.parse(text);
    
    return NextResponse.json({ success: true, data: parsed }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Analyze job error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
