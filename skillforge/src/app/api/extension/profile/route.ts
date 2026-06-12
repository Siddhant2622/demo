import { NextRequest, NextResponse } from "next/server";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id") || "demo_user";

  try {
    const db = getFirestore(app);
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Format it roughly how the extension expects
      return NextResponse.json({
        user_id: userId,
        personal_info: {
          first_name: data.personal_info?.first_name || data.displayName?.split(" ")[0] || "User",
          last_name: data.personal_info?.last_name || data.displayName?.split(" ").slice(1).join(" ") || "",
          full_name: data.personal_info?.full_name || data.displayName || "User",
          email: data.personal_info?.email || data.email || "",
          phone: data.personal_info?.phone || "",
          location: data.personal_info?.location || "",
          linkedin: data.personal_info?.linkedin || "",
          github: data.personal_info?.github || "",
          portfolio: data.personal_info?.portfolio || ""
        },
        skills_raw: data.careerAnalysis?.skills?.join(", ") || data.resumeText || "Python, React.js, JavaScript",
        skills_analyzed: data.careerAnalysis?.skills?.reduce((acc: any, skill: string) => {
          acc[skill] = 80;
          return acc;
        }, {}) || { "React.js": 80, "JavaScript": 85 },
        experience: "Software Engineer",
        education: data.education || {
          university: "",
          degree: "",
          graduation_year: "",
          cgpa: ""
        },
        current_ctc: data.current_ctc || "",
        expected_ctc: data.expected_ctc || "",
        notice_period: data.notice_period || "",
        experience_years: data.experience_years || "",
        gender: data.gender || ""
      }, { headers: corsHeaders });
    }
  } catch (error) {
    console.error("Firebase fetch failed, using mock data", error);
  }

  // Fallback mock data matching Python backend
  return NextResponse.json({
    user_id: userId,
    personal_info: {
        first_name: "Arjun",
        last_name: "Sharma",
        full_name: "Arjun Sharma",
        email: "arjun.sharma@lnct.ac.in",
        phone: "+91 9876543210",
        location: "Bhopal, MP",
        linkedin: "https://linkedin.com/in/arjun-sharma",
        github: "https://github.com/arjunsharma",
        portfolio: "https://arjunsharma.dev"
    },
    education: {
        university: "LNCT Group of Colleges",
        degree: "B.Tech Computer Science",
        graduation_year: "2027",
        cgpa: "8.7"
    },
    skills_raw: "Python, React.js, JavaScript, SQL, Machine Learning, Docker, Git, CSS/HTML, Node.js",
    skills_analyzed: {
        "Python": 85,
        "React.js": 80,
        "JavaScript": 85,
        "SQL": 75,
        "Machine Learning": 65,
        "Docker": 70,
        "Git": 75,
        "CSS/HTML": 80,
        "Node.js": 75
    },
    experience: "Software Engineer Intern at TechCorp India. Built React applications and RESTful APIs.",
    current_ctc: "0",
    expected_ctc: "1200000",
    notice_period: "0",
    experience_years: "0",
    gender: "Male"
  }, { headers: corsHeaders });
}
