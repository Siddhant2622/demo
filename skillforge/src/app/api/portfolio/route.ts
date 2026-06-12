import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { role = "Software Engineer", resumeText = "" } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found. Using fallback portfolio data.");
      // Fallback Data for Demo safety
      return NextResponse.json({
        name: "Demo User",
        tagline: "Building the future with scalable AI systems and full-stack architecture.",
        bio: "I am a passionate developer focusing on cutting-edge web technologies. I love solving complex problems and turning ideas into reality.",
        skills: ["React", "TypeScript", "Node.js", "AWS"],
        username: "demo-dev.skillforge.app"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
You are an expert UX Designer and Copywriter for Developer Portfolios.
Analyze the following candidate's resume summary and their target role of "${role}". 
Extract their real name, write a punchy 1-sentence hero tagline, a short 2-sentence professional bio, and identify exactly 4 top skills. Finally, generate a professional URL slug (username).

Resume/Profile Context:
"""
${resumeText || "A motivated developer looking to build a tech career."}
"""

Output the result strictly as a JSON object. Do not include markdown blocks like \`\`\`json.
Ensure the schema strictly matches:
{
  "name": "string (Candidate's first name, or 'Developer' if not found)",
  "tagline": "string (A punchy, professional 1-sentence headline)",
  "bio": "string (A short 2-sentence 'About Me' blurb)",
  "skills": ["string", "string", "string", "string"] (Exactly 4 top skills),
  "username": "string (e.g., 'john-dev.skillforge.app')"
}
`;

    let resultText = "";
    try {
      const result = await model.generateContent(prompt);
      resultText = result.response.text().trim();
    } catch (err: any) {
      console.warn(`Gemini Portfolio Error (${err.message || err.status}), falling back to Groq...`);
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      if (!groqRes.ok) {
        throw new Error("Both Gemini and Groq failed.");
      }
      const groqData = await groqRes.json();
      resultText = groqData.choices[0].message.content.trim();
    }
    
    // Clean up potential markdown blocks from Gemini response
    const cleanText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Portfolio API Error:", error);
    return NextResponse.json({ error: "Failed to generate portfolio" }, { status: 500 });
  }
}
