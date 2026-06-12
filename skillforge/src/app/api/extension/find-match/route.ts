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
    const body = await req.json();
    const { links, userId } = body;
    
    if (!links || links.length === 0) {
      return NextResponse.json({ success: false, error: "No links provided" }, { headers: corsHeaders });
    }

    // 1. Fetch user profile from python backend
    let profile = null;
    try {
      const profileRes = await fetch(`http://localhost:3000/api/extension/profile?user_id=${userId}`);
      if (profileRes.ok) {
        profile = await profileRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch profile", e);
    }
    
    // 2. Format skills
    const skills = profile?.skills_raw || "Entry level developer skills";
    
    // 3. Format links for prompt
    // Limit to top 50 links to avoid token limits
    const topLinks = links.slice(0, 50);
    const linksList = topLinks.map((l: any, i: number) => `[${i}] Text: ${l.text} | URL: ${l.url}`).join("\n");
    
    const prompt = `You are an AI job matcher.
User Skills: ${skills}

Here are the links found on the current webpage:
${linksList}

Analyze the text of these links. Find the single best link that represents a job application, internship, or career opportunity that matches the User Skills.
Return ONLY a valid JSON object with the best matching URL and a brief 1 sentence reason. 
Example:
{"url": "https://example.com/apply/123", "reason": "This Backend Engineer role perfectly matches your Python and Database skills."}

If absolutely none of the links look like a job or internship opportunity, return:
{"url": null, "reason": "No relevant job opportunities found on this page."}

Do NOT wrap the response in markdown blocks (no \`\`\`json). Return ONLY raw JSON text.`;

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
    
    // Clean up potential markdown formatting
    if (text.startsWith("```json")) {
        text = text.substring(7);
    }
    if (text.startsWith("```")) {
        text = text.substring(3);
    }
    if (text.endsWith("```")) {
        text = text.substring(0, text.length - 3);
    }
    text = text.trim();
    
    const parsed = JSON.parse(text);
    
    return NextResponse.json({ success: true, data: parsed }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Match error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
