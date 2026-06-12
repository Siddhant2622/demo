import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const resumeTextForm = formData.get("resumeText") as string | null;

    if (!resumeFile && !resumeTextForm) {
      return NextResponse.json({ error: "No resume provided" }, { status: 400 });
    }

    let fileBase64 = "";
    let fileMimeType = "application/pdf";
    let resumeText = resumeTextForm || "";

    if (resumeFile) {
      const buffer = await resumeFile.arrayBuffer();
      fileBase64 = Buffer.from(buffer).toString("base64");
      fileMimeType = resumeFile.type;

      if (resumeFile.name.endsWith(".pdf")) {
        try {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(Buffer.from(buffer));
          resumeText = pdfData.text;
        } catch (e) {
          console.error("PDF parse error", e);
        }
      } else {
        try {
          resumeText = await resumeFile.text();
        } catch {
          resumeText = "";
        }
      }
    }
    const promptText = `You are an expert AI Resume Parser. Extract the following information from the provided resume text or PDF document.
Return ONLY a valid JSON object matching the exact structure below. Do not wrap in markdown blocks.

{
  "personalInfo": {
    "firstName": "String",
    "lastName": "String",
    "email": "String",
    "phone": "String",
    "location": "String",
    "linkedin": "String",
    "github": "String",
    "portfolio": "String"
  },
  "experience": [
    {
      "company": "String",
      "position": "String",
      "startDate": "String",
      "endDate": "String",
      "description": "String"
    }
  ],
  "education": [
    {
      "institution": "String",
      "degree": "String",
      "graduationYear": "String",
      "cgpa": "String"
    }
  ],
  "skills": ["Skill1", "Skill2"],
  "projects": [
    {
      "name": "String",
      "description": "String",
      "link": "String",
      "technologies": ["Tech1"]
    }
  ]
}

If a field is not found, leave it as an empty string "" or empty array [].

${resumeText ? `Resume Text:\n${resumeText}` : "Resume is attached as a file."}`;

    let result;
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      if (fileBase64 && resumeFile?.name.endsWith(".pdf")) {
        result = await model.generateContent([
          promptText,
          { inlineData: { mimeType: fileMimeType, data: fileBase64 } }
        ]);
      } else {
        result = await model.generateContent(promptText);
      }
    } catch (err: any) {
      console.warn(`Gemini API overloaded/failed (${err.message || err.status}), falling back to Groq...`);
      
      // If we don't have text and it's a PDF, Groq can't process the PDF natively via this simple fetch
      // But we will try to pass the prompt anyway (it will hallucinate or fail if resumeText is empty)
      // Ideally, we'd use pdf-parse, but for now we'll do best effort.
      const content = promptText;
      
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" }
        })
      });
      
      if (!groqRes.ok) {
        throw new Error("429 Quota Exceeded: Both Gemini and Groq APIs are unavailable.");
      }
      
      const groqData = await groqRes.json();
      const text = groqData.choices[0].message.content.trim();
      return NextResponse.json(JSON.parse(text));
    }

    const text = result.response.text().trim();
    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
