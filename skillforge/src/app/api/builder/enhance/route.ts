import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mergedData } = body;

    if (!mergedData) {
      return NextResponse.json({ error: "Missing mergedData" }, { status: 400 });
    }

    const promptText = `You are an expert tech recruiter and personal branding coach.
Based on the following user data (skills, experience, and projects), generate a compelling professional headline and a short professional bio.

User Data:
${JSON.stringify({
  personalInfo: mergedData.personalInfo,
  skills: mergedData.skills,
  experience: mergedData.experience,
  projects: mergedData.projects,
  education: mergedData.education
})}

Return ONLY a valid JSON object matching this exact structure:
{
  "headline": "A punchy, 5-8 word headline (e.g. 'Full-Stack Developer | Building Scalable Web Apps')",
  "bio": "A professional, engaging 3-4 sentence summary of their expertise, background, and passion."
}
Do not wrap in markdown blocks.`;

    let resultText = "";

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(promptText);
      resultText = result.response.text().trim();
    } catch (err: any) {
      console.warn(`Gemini API overloaded/failed (${err.message || err.status}), falling back to Groq...`);
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptText }],
          response_format: { type: "json_object" }
        })
      });
      
      if (!groqRes.ok) {
        throw new Error("429 Quota Exceeded: Both Gemini and Groq APIs are unavailable.");
      }
      
      const groqData = await groqRes.json();
      resultText = groqData.choices[0].message.content.trim();
    }

    const cleanText = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Enhance error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
