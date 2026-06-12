import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ── Dynamic demo responses based on profile + history ──────────────
function getDemoResponse(
  questionNumber: number,
  profile: any,
  role: string,
  history: any[],
  answer: string
) {
  const name = profile?.name || "there";
  const skills = profile?.skills || ["JavaScript", "React", "Node.js"];
  const projects = profile?.projects || [{ name: "your project", description: "a software project" }];
  const frameworks = profile?.frameworks || ["React", "Express"];
  const weaknesses = profile?.weaknessMap || ["System Design", "Algorithms"];
  const strengths = profile?.strengthMap || ["Web Development"];

  // Build question pool organized by category
  const questionPool: { text: string; category: string; difficulty: string }[] = [
    // Opening — acknowledge readiness
    {
      text: `Great, ${name}! Let's dive right in. I can see from your resume that you've worked with ${skills.slice(0, 3).join(", ")}. Tell me, what drew you to ${skills[0]} specifically, and how has your understanding of it evolved over time?`,
      category: "Behavioral",
      difficulty: "Beginner",
    },
    // Technical — based on their top skill
    {
      text: `That's a thoughtful perspective. Now let's get a bit technical. Can you explain the concept of ${skills[0] === "React" ? "the Virtual DOM and how React's reconciliation algorithm works" : skills[0] === "Python" ? "Python's GIL and how it affects multithreading" : skills[0] === "JavaScript" ? "the event loop in JavaScript and how asynchronous operations are handled" : `a core concept in ${skills[0]} that you find particularly interesting`}?`,
      category: "Technical",
      difficulty: "Intermediate",
    },
    // Project deep-dive
    {
      text: `Good explanation. Now, I'd like to hear about your project "${projects[0]?.name || "your most recent project"}." What was the most challenging technical problem you faced during development, and walk me through how you approached solving it.`,
      category: "Projects",
      difficulty: "Intermediate",
    },
    // Framework-specific
    {
      text: `Interesting approach. Since you've listed ${frameworks[0] || "React"} as one of your skills, can you tell me about ${frameworks[0] === "React" || frameworks[0] === "Next.js" ? "how you manage state in a complex application? Have you used any state management libraries, and what tradeoffs did you consider?" : `how you typically structure a ${frameworks[0]} application and what patterns you follow for maintainability?`}`,
      category: "Framework",
      difficulty: "Intermediate",
    },
    // DSA question
    {
      text: `Let's test your problem-solving skills. Imagine you have an array of integers and you need to find two numbers that add up to a specific target. How would you approach this problem, and can you think of a solution better than brute force?`,
      category: "DSA",
      difficulty: "Intermediate",
    },
    // System Design
    {
      text: `Nice thinking! Now let's shift gears to system design. If you were asked to design ${role.includes("Frontend") ? "a real-time collaborative document editor like Google Docs" : role.includes("Backend") ? "a URL shortener service that handles millions of requests per day" : "a scalable notification system for a social media platform"}, what would your high-level architecture look like?`,
      category: "System Design",
      difficulty: "Advanced",
    },
    // Weakness probe
    {
      text: `That's a solid approach. I noticed from your profile that ${weaknesses[0] || "system design"} might be an area for growth. Can you tell me about a time when you had to learn something completely new for a project? How did you go about it, and what was the outcome?`,
      category: "Behavioral",
      difficulty: "Intermediate",
    },
    // Wrap-up
    {
      text: `You've done really well throughout this interview, ${name}. Before we wrap up, is there anything about your experience or projects that you feel we haven't covered and you'd like to highlight? Also, do you have any questions about the ${role} position?`,
      category: "Wrap-up",
      difficulty: "Beginner",
    },
  ];

  // Determine which question to ask based on history
  const aiMessageCount = history.filter((m: any) => m.role === "model").length;
  const questionIdx = Math.min(aiMessageCount, questionPool.length - 1);
  const question = questionPool[questionIdx];

  const isComplete = questionIdx >= questionPool.length - 1;

  // Build a natural acknowledgment of the answer
  const answerLen = answer.split(" ").length;
  let ack = "";
  if (answerLen > 40) {
    ack = "That was a really thorough answer, I appreciate the detail. ";
  } else if (answerLen > 20) {
    ack = "Good answer. ";
  } else if (answerLen > 5) {
    ack = "I see. ";
  } else {
    ack = "Alright. ";
  }

  // For the first question, skip acknowledgment
  const reply = questionIdx === 0 ? question.text : ack + question.text;

  // Adaptive difficulty
  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  let diffIdx = levels.indexOf(question.difficulty);
  if (answerLen > 50 && diffIdx < 3) diffIdx++;
  if (answerLen < 10 && diffIdx > 0) diffIdx--;

  return {
    reply,
    score: Math.min(100, 50 + answerLen * 1.5 + questionIdx * 3),
    difficulty: levels[diffIdx],
    isComplete,
    questionCategory: question.category,
  };
}

export async function POST(req: Request) {
  try {
    const {
      history = [],
      answer = "",
      role = "Software Engineer",
      resumeText = "",
      candidateProfile = null,
      difficulty = "Intermediate",
      questionNumber = 1,
    } = await req.json();

    // Build profile context
    let profileContext = "";
    if (candidateProfile || resumeText) {
      profileContext = `
CANDIDATE PROFILE:
${candidateProfile ? `- Name: ${candidateProfile.name}
- Skills: ${candidateProfile.skills?.join(", ")}
- Languages: ${candidateProfile.languages?.join(", ")}
- Projects: ${candidateProfile.projects?.map((p: any) => `${p.name}`).join("; ")}
- Experience Level: ${candidateProfile.experienceLevel}` : ""}

RAW RESUME TEXT (Scan this carefully for specific languages like C++, JS, Python, and project details to ask about):
${resumeText || "Not provided."}
`;
    }

    const systemPrompt = `You are Sarah, a warm, highly conversational, and perceptive Technical Interviewer conducting an interview for the role of ${role}. You are speaking out loud using text-to-speech.

${profileContext}

CRITICAL SPEECH RULES:
1. Speak exactly how a real human interviewer speaks. DO NOT use lists, bullet points, or markdown formatting whatsoever.
2. Keep your responses to 2-3 short, highly conversational sentences. 
3. Always react naturally and warmly to the candidate's previous answer (e.g., "That's a great point," "I like how you approached that," "Interesting perspective.") before asking the next question.
4. Ask one deep technical question at a time. If their answer is superficial, probe deeper.
5. TAILOR QUESTIONS TO RESUME: You MUST scan the Raw Resume Text and Candidate Profile provided above. Specifically ask questions about the exact programming languages (e.g. C++, JavaScript, etc.), frameworks, and projects they mentioned in their resume! Make the interview highly personalized to their actual experience.
6. DETECT CHEATING: If the candidate's answer sounds like it was generated by an LLM (e.g., highly structured, bullet-point style spoken out loud, overly formal, starts with "Certainly, here is...", uses unnaturally complex vocabulary without hesitation), you must flag them for cheating.

You MUST output your response strictly as a JSON object with this exact schema (no markdown wrappers like \`\`\`json):
{
  "reply": "Your conversational, spoken-style response and the next question.",
  "score": number (0-100, evaluating their technical accuracy),
  "is_cheating_detected": boolean (true if their answer strongly resembles AI-generated text or reading from a script)
}`;

    // ── Try Gemini first ─────────────────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Build chat history — EXCLUDE the last user message (we'll send it via sendMessage)
        const chatHistory = history.slice(0, -1).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
          history: chatHistory,
          systemInstruction: {
            role: "system",
            parts: [{ text: systemPrompt }],
          },
        });

        // Send ONLY the latest answer
        let result;
        try {
          result = await chat.sendMessage(answer);
        } catch (err: any) {
          if (err.status === 503 || err.message?.includes("503")) {
            console.warn("gemini-2.5-flash overloaded, falling back to gemini-2.0-flash");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const fallbackChat = fallbackModel.startChat({
              history: chatHistory,
              systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
            });
            result = await fallbackChat.sendMessage(answer);
          } else {
            throw err;
          }
        }
        
        let text = result.response.text().trim();
        if (!text) throw new Error("Empty response from Gemini");

        let data;
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const cleanJson = jsonMatch ? jsonMatch[0] : text;
          data = JSON.parse(cleanJson);
        } catch (parseError) {
          console.warn("JSON parse failed, retrying once...");
          try {
            result = await chat.sendMessage(answer);
            text = result.response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            data = JSON.parse(cleanJson);
          } catch (retryError) {
            console.error("Failed to parse Gemini JSON output:", text);
            const wordCount = answer.split(" ").length;
            data = {
              reply: text,
              score: Math.min(100, 40 + wordCount * 2),
              is_cheating_detected: false
            };
          }
        }

        const isComplete =
          questionNumber >= 8 ||
          data.reply.toLowerCase().includes("conclude") ||
          data.reply.toLowerCase().includes("wrap up") ||
          data.reply.toLowerCase().includes("that concludes");

        const categories = ["Technical", "DSA", "Projects", "System Design", "Behavioral", "Framework"];
        
        return NextResponse.json({
          reply: data.reply,
          score: data.score,
          difficulty: difficulty,
          isComplete,
          questionCategory: categories[questionNumber % categories.length],
          is_cheating_detected: data.is_cheating_detected || false
        });
      } catch (geminiError: any) {
        console.warn(`Gemini failed (${geminiError.message || geminiError.status}), falling back to Groq...`);
        try {
          const groqHistory = history.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.text
          }));
          
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                ...groqHistory,
                { role: "user", content: answer }
              ],
              response_format: { type: "json_object" }
            })
          });

          if (!groqRes.ok) {
            throw new Error("Both Gemini and Groq failed.");
          }

          const groqData = await groqRes.json();
          let text = groqData.choices[0].message.content.trim();
          
          let data;
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            data = JSON.parse(cleanJson);
          } catch (parseError) {
            data = {
              reply: text,
              score: 75,
              is_cheating_detected: false
            };
          }

          const isComplete =
            questionNumber >= 8 ||
            data.reply.toLowerCase().includes("conclude") ||
            data.reply.toLowerCase().includes("wrap up") ||
            data.reply.toLowerCase().includes("that concludes");

          const categories = ["Technical", "DSA", "Projects", "System Design", "Behavioral", "Framework"];
          
          return NextResponse.json({
            reply: data.reply,
            score: data.score,
            difficulty: difficulty,
            isComplete,
            questionCategory: categories[questionNumber % categories.length],
            is_cheating_detected: data.is_cheating_detected || false
          });
        } catch (groqError) {
          console.error("Groq also failed, using demo mode:", groqError);
          // Fall through to demo mode below
        }
      }
    }

    // ── Demo fallback ─────────────────────────────────────────────
    const demo = getDemoResponse(questionNumber, candidateProfile, role, history, answer);
    return NextResponse.json({ ...demo, is_cheating_detected: false });

  } catch (error) {
    console.error("Interview route error:", error);
    // Emergency fallback
    return NextResponse.json({
      reply: "That's an interesting perspective. Let me ask you something different. Can you tell me about a project you're most proud of and the technical decisions you made during its development?",
      score: 65,
      difficulty: "Intermediate",
      isComplete: false,
      questionCategory: "Projects",
      is_cheating_detected: false
    });
  }
}
