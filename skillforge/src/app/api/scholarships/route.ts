import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { role = "Student", resumeText = "" } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found. Using fallback scholarship data.");
      // Fallback Data for Demo safety
      return NextResponse.json([
        {
          title: "Google Women Techmakers",
          amount: "$10,000",
          deadline: "Oct 15, 2026",
          match: 94,
          status: "ready",
          tags: ["Women in Tech", "Computer Science"]
        },
        {
          title: "Microsoft Tuition Scholarship",
          amount: "Full Tuition",
          deadline: "Nov 01, 2026",
          match: 88,
          status: "missing_docs",
          tags: ["Merit Based", "STEM"]
        },
        {
          title: "LNCT Merit Award",
          amount: "₹50,000",
          deadline: "Sep 30, 2026",
          match: 99,
          status: "applied",
          tags: ["University Specific", "Academic Excellence"]
        }
      ]);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
You are an expert Educational Consultant and Scholarship Finder.
Based on the following candidate's target role ("${role}") and their resume summary, search your knowledge base and identify 3-4 real-world scholarships, grants, or tuition assistance programs that they have a high probability of winning.

Resume/Profile Context:
"""
${resumeText || "A motivated university student looking to build a career in technology."}
"""

Output the result strictly as a JSON array of objects. Do not include markdown blocks like \`\`\`json.
Each object must have exactly this schema:
{
  "title": "string (Name of the scholarship)",
  "amount": "string (e.g. '$5,000' or 'Full Tuition' or '₹1,00,000')",
  "deadline": "string (A realistic upcoming date, e.g. 'Oct 15, 2026')",
  "match": number (A realistic probability score between 70 and 99),
  "status": "string (Must be exactly one of: 'ready', 'missing_docs', or 'applied')",
  "tags": ["string", "string"] (Max 2 short relevant tags)
}
`;

    let resultText = "";
    try {
      const result = await model.generateContent(prompt);
      resultText = result.response.text().trim();
    } catch (err: any) {
      console.warn(`Gemini Scholarship Error (${err.message || err.status}), falling back to Groq...`);
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
    let data;
    try {
      data = JSON.parse(cleanText);
      // Ensure it's an array for scholarships
      if (!Array.isArray(data) && data.scholarships) {
        data = data.scholarships;
      } else if (!Array.isArray(data)) {
        data = [data]; // Fallback if single object
      }
    } catch (e) {
      console.error("JSON parse error:", cleanText);
      throw e;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scholarship API Error:", error);
    return NextResponse.json({ error: "Failed to find scholarships" }, { status: 500 });
  }
}
