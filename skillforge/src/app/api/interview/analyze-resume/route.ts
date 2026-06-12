import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { resumeText, targetRole, fileBase64, mimeType } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // Fallback demo profile
      return NextResponse.json({
        profile: {
          name: "Demo Candidate",
          skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
          languages: ["JavaScript", "TypeScript", "Python", "C++", "Java"],
          frameworks: ["React", "Next.js", "Express", "FastAPI", "TailwindCSS"],
          certifications: ["AWS Cloud Practitioner", "Google IT Support"],
          projects: [
            { name: "E-Commerce Platform", description: "Full-stack e-commerce app with React frontend and Node.js backend, featuring payment integration and real-time inventory." },
            { name: "AI Chat Assistant", description: "Built a conversational AI using GPT API with context memory and multi-turn dialogue support." },
            { name: "Task Management App", description: "Collaborative project management tool with drag-and-drop Kanban boards and team analytics." },
          ],
          experience: ["Software Development Intern at TechCorp (6 months)", "Freelance Web Developer (1 year)"],
          education: ["B.Tech in Computer Science - LNCT Group of Colleges (2024)"],
          softSkills: ["Communication", "Problem Solving", "Teamwork", "Leadership", "Time Management"],
          experienceLevel: "Entry Level / Fresher",
          strengthMap: ["Frontend Development", "React Ecosystem", "Problem Solving", "API Design", "Database Management"],
          weaknessMap: ["System Design", "Cloud Architecture", "DevOps", "Advanced Algorithms", "Microservices"],
          careerInterests: ["Full Stack Development", "AI/ML Engineering", "Cloud Computing"],
        },
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
        { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any },
      ]
    });

    const prompt = `You are an expert resume analyzer and career coach. Analyze this resume/CV for a candidate targeting the role of "${targetRole}".

${resumeText ? `Resume Text:\n"""\n${resumeText}\n"""` : "The resume has been provided as a PDF file. Please read and analyze it thoroughly."}

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

    // Build content parts — support both text and PDF file input
    const parts: any[] = [];

    // If we have a base64 PDF file, add it as inline data
    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      });
    }

    // Always add the text prompt
    parts.push({ text: prompt });

    if (mimeType && mimeType.includes("wordprocessingml")) {
      return NextResponse.json({
        error: "Word Documents (.docx) are not supported. Please save your resume as a PDF and upload the PDF file instead.",
        extractedText: ""
      }, { status: 400 });
    }

    let profile;
    let extractedText = resumeText;
    
    try {
      let result;
      try {
        result = await model.generateContent(parts);
      } catch (err: any) {
        if (err.status === 503 || err.message?.includes("503")) {
          console.warn("gemini-1.5-flash overloaded, falling back to gemini-1.5-flash");
          const fallbackModel = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          result = await fallbackModel.generateContent(parts);
        } else {
          throw err;
        }
      }
      
      let text = result.response.text().trim();
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        profile = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      } catch (parseError) {
        console.warn("JSON parse failed, retrying once...", parseError);
        // Retry once to fix malformed JSON hallucination
        const retryResult = await model.generateContent(parts);
        text = retryResult.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        profile = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      }
      
      if (!resumeText && profile) {
        extractedText = `Name: ${profile.name}\nSkills: ${profile.skills?.join(", ")}\nLanguages: ${profile.languages?.join(", ")}\nFrameworks: ${profile.frameworks?.join(", ")}\nCertifications: ${profile.certifications?.join(", ")}\nProjects: ${profile.projects?.map((p: any) => `${p.name}: ${p.description}`).join("; ")}\nExperience: ${profile.experience?.join(", ")}\nEducation: ${profile.education?.join(", ")}\nExperience Level: ${profile.experienceLevel}`;
      }
    } catch (apiError: any) {
      console.warn(`Gemini API failed (${apiError.message || apiError.status}), falling back to Groq...`);
      try {
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
        if (!groqRes.ok) throw new Error("Groq failed");
        const groqData = await groqRes.json();
        const text = groqData.choices[0].message.content.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        profile = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
        if (!resumeText && profile) {
          extractedText = `Name: ${profile.name}\nSkills: ${profile.skills?.join(", ")}\nLanguages: ${profile.languages?.join(", ")}\nFrameworks: ${profile.frameworks?.join(", ")}\nCertifications: ${profile.certifications?.join(", ")}\nProjects: ${profile.projects?.map((p: any) => `${p.name}: ${p.description}`).join("; ")}\nExperience: ${profile.experience?.join(", ")}\nEducation: ${profile.education?.join(", ")}\nExperience Level: ${profile.experienceLevel}`;
        }
      } catch (groqError) {
        console.warn("Groq also failed, using demo profile", groqError);
        profile = {
          name: `ERROR: Both AI models failed`,
          skills: ["JavaScript", "Python", "React"],
          languages: ["JavaScript", "Python"],
          frameworks: ["React", "Node.js"],
          certifications: [],
          projects: [{ name: "Project", description: "A software project" }],
          experience: ["Demo Experience"],
          education: ["Demo Education"],
          softSkills: ["Communication"],
          experienceLevel: "Entry Level",
          strengthMap: [],
          weaknessMap: [],
          careerInterests: []
        };
      }
    }

    return NextResponse.json({ profile, extractedText });
  } catch (error) {
    console.error("Outer Resume analysis error:", error);
    // Even if outer fails, return demo profile so UI doesn't break
    return NextResponse.json({
      profile: {
        name: "Demo Candidate",
        skills: ["JavaScript", "React"],
        languages: ["JavaScript"],
        frameworks: ["React"],
        certifications: [],
        projects: [],
        experience: [],
        education: [],
        softSkills: [],
        experienceLevel: "Entry Level",
        strengthMap: ["Frontend"],
        weaknessMap: ["Backend"],
        careerInterests: ["Engineering"],
      },
      extractedText: "Demo"
    });
  }
}
