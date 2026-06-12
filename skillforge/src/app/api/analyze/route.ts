import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const targetRole = formData.get("targetRole") as string || "Software Engineer";
    const targetCompany = formData.get("targetCompany") as string || "Tech Company";
    const expectedSalary = formData.get("expectedSalary") as string || "";
    const resumeTextForm = formData.get("resumeText") as string | null;

    // Read the file content
    let resumeText = resumeTextForm || "";
    let fileBase64 = "";
    let fileMimeType = "";

    if (resumeFile) {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileBase64 = buffer.toString("base64");
      fileMimeType = resumeFile.type || "application/pdf";

      // Also try to read as text for non-PDF files
      if (!resumeFile.name.endsWith(".pdf")) {
        try {
          resumeText = await resumeFile.text();
        } catch {
          resumeText = "";
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found. Using fallback demo data.");
      return NextResponse.json({
        employabilityScore: 84,
        placementProbability: 87.4,
        expectedSalaryRange: expectedSalary || "14-18 LPA",
        skills: [
          { subject: "React/Next.js", score: 85 },
          { subject: "System Design", score: 65 },
          { subject: "Algorithms", score: 70 },
          { subject: "Databases", score: 80 },
          { subject: "Cloud/AWS", score: 50 },
          { subject: "TypeScript", score: 90 },
        ],
        missingSkills: ["Advanced System Architecture", "Cloud Deployment (AWS/GCP)", "Kubernetes"],
        dailyPlan: [
          "Complete 1 LeetCode Medium on Graphs",
          "Read chapter 3 of Designing Data-Intensive Applications",
          "Review TypeScript advanced generics"
        ],
        weeklyMilestones: [
          "Build a full-stack microservice",
          "Complete AWS certification mock exam"
        ],
        monthlyTargets: [
          "Earn AWS Developer Associate Certification",
          "Contribute to 2 open source React projects"
        ],
        extractedResumeText: "Demo resume text - no API key provided."
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const promptText = `
You are an expert AI Career Coach and Tech Recruiter.
Analyze the following candidate's resume against their target role of "${targetRole}" at "${targetCompany}" with an expected salary of "${expectedSalary}".

${resumeText ? `Resume Text:\n"""\n${resumeText}\n"""` : "The resume is attached as a file. Please extract all text from it first."}

Output the result strictly as a JSON object with the following schema, and do not include markdown blocks like \`\`\`json:
{
  "employabilityScore": number (0-100),
  "placementProbability": number (0-100),
  "expectedSalaryRange": "string (e.g., 14-18 LPA)",
  "skills": [
    { "subject": "Skill Name", "score": number (0-100) }
  ] (Provide exactly 6 core skills relevant to the role),
  "missingSkills": ["string", "string", "string"] (Top 3 missing skills),
  "dailyPlan": ["string", "string", "string"],
  "weeklyMilestones": ["string", "string"],
  "monthlyTargets": ["string", "string"],
  "extractedResumeText": "The full plain text you extracted from the resume",
  "personalInfo": {
    "firstName": "string (empty if not found)",
    "lastName": "string (empty if not found)",
    "phone": "string (empty if not found)",
    "location": "string (empty if not found)",
    "linkedin": "string (empty if not found)",
    "github": "string (empty if not found)",
    "portfolio": "string (empty if not found)"
  },
  "education": {
    "university": "string (empty if not found)",
    "degree": "string (empty if not found)",
    "graduationYear": "string (empty if not found)",
    "cgpa": "string (empty if not found)"
  }
}
`;

    let result;

    try {
      if (fileBase64 && resumeFile?.name.endsWith(".pdf")) {
        result = await model.generateContent([
          promptText,
          { inlineData: { mimeType: fileMimeType, data: fileBase64 } }
        ]);
      } else {
        result = await model.generateContent(promptText);
      }
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes("503") || err.message?.includes("overloaded") || err.message?.includes("high demand")) {
        console.warn("gemini-2.5-flash overloaded, falling back to gemini-1.5-flash");
        try {
          const fallbackModel = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          if (fileBase64 && resumeFile?.name.endsWith(".pdf")) {
            result = await fallbackModel.generateContent([
              promptText,
              { inlineData: { mimeType: fileMimeType, data: fileBase64 } }
            ]);
          } else {
            result = await fallbackModel.generateContent(promptText);
          }
        } catch (fallbackErr: any) {
          console.warn("gemini-1.5-flash overloaded, falling back to gemini-1.5-pro-latest");
          try {
            const proModel = genAI.getGenerativeModel({ 
              model: "gemini-1.5-pro-latest",
              generationConfig: { responseMimeType: "application/json" }
            });
            if (fileBase64 && resumeFile?.name.endsWith(".pdf")) {
              result = await proModel.generateContent([
                promptText,
                { inlineData: { mimeType: fileMimeType, data: fileBase64 } }
              ]);
            } else {
              result = await proModel.generateContent(promptText);
            }
          } catch (finalErr: any) {
             console.warn("All Gemini models failed. Falling back to Groq...");
             const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
               method: "POST",
               headers: {
                 "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                 "Content-Type": "application/json"
               },
               body: JSON.stringify({
                 model: "llama-3.3-70b-versatile",
                 messages: [{ role: "user", content: promptText + "\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. No other text." }],
                 response_format: { type: "json_object" }
               })
             });
             
             if (!groqRes.ok) {
               throw new Error("503 Overloaded: All AI models (Gemini & Groq) are currently experiencing high demand. Please wait a minute and try again.");
             }
             
             const groqData = await groqRes.json();
             const groqText = groqData.choices[0].message.content.trim();
             const cleanText = groqText.replace(/```json/gi, "").replace(/```/g, "").trim();
             return NextResponse.json(JSON.parse(cleanText));
          }
        }
      } else {
        throw err;
      }
    }

    const text = result.response.text().trim();

    // Clean up potential markdown blocks from Gemini response
    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    const msg = error?.message || "";
    return NextResponse.json(
      { error: msg.includes("503") || msg.includes("overloaded") ? "Google's Gemini AI is currently experiencing exceptionally high demand and is overloaded. Please wait a minute and try again." : "Failed to analyze resume. Please check your API key and try again." },
      { status: 500 }
    );
  }
}
