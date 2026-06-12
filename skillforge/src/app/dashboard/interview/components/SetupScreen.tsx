"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Search,
  X,
} from "lucide-react";

const JOB_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Security Engineer",
  "Blockchain Developer",
  "System/ML Researcher",
  "System Administrator",
  "Database Administrator",
  "Technical Lead",
  "Engineering Manager",
  "Data Analyst",
  "Business Analyst",
  "Embedded Systems Engineer",
];

export interface CandidateProfile {
  name: string;
  skills: string[];
  languages: string[];
  frameworks: string[];
  certifications: string[];
  projects: { name: string; description: string }[];
  experience: string[];
  education: string[];
  softSkills: string[];
  experienceLevel: string;
  strengthMap: string[];
  weaknessMap: string[];
  careerInterests: string[];
}

interface SetupScreenProps {
  onComplete: (profile: CandidateProfile, role: string) => void;
  existingResumeText?: string;
}

export default function SetupScreen({
  onComplete,
  existingResumeText,
}: SetupScreenProps) {
  const [step, setStep] = useState<"role" | "upload" | "analyzing" | "preview">(
    "role"
  );
  const [selectedRole, setSelectedRole] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [resumeText, setResumeText] = useState(existingResumeText || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingResumeText && !resumeText) {
      setResumeText(existingResumeText);
    }
  }, [existingResumeText, resumeText]);

  const filteredRoles = JOB_ROLES.filter((role) =>
    role.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (existingResumeText) {
      analyzeResume(existingResumeText, undefined, undefined, role);
    } else {
      setStep("upload");
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("analyzing");
    setIsAnalyzing(true);

    try {
      // For text files, read as text directly
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        analyzeResume(text, undefined, undefined, selectedRole);
        return;
      }

      // For PDFs and other binary files, send as base64 to System
      const base64 = await fileToBase64(file);
      const mimeType = file.type || "application/pdf";

      // Send base64 to API — System can read PDFs natively
      analyzeResume("", base64, mimeType, selectedRole);
    } catch (err) {
      console.error("File upload failed:", err);
      setStep("upload");
      setIsAnalyzing(false);
    }
  };

  const handleUseExisting = () => {
    if (existingResumeText) {
      analyzeResume(existingResumeText, undefined, undefined, selectedRole);
    }
  };

  const analyzeResume = async (text: string, fileBase64?: string, mimeType?: string, roleToUse?: string) => {
    setStep("analyzing");
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/interview/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: text,
          targetRole: roleToUse || selectedRole,
          fileBase64,
          mimeType,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setIsAnalyzing(false);
        setStep("upload");
        return;
      }
      
      if (data.profile) {
        setProfile(data.profile);
        // Store extracted text for later use in interview
        if (data.extractedText) {
          setResumeText(data.extractedText);
        }
        setStep("preview");
      } else {
        throw new Error("No profile returned");
      }
    } catch (err) {
      console.error("Resume analysis failed:", err);
      // Fallback profile
      setProfile({
        name: "Candidate",
        skills: ["JavaScript", "Python", "React"],
        languages: ["JavaScript", "Python", "TypeScript"],
        frameworks: ["React", "Node.js", "Express"],
        certifications: [],
        projects: [{ name: "Portfolio Project", description: "A web application" }],
        experience: ["Software Development Intern"],
        education: ["B.Tech Computer Science"],
        softSkills: ["Communication", "Teamwork"],
        experienceLevel: "Entry Level",
        strengthMap: ["Web Development", "Problem Solving"],
        weaknessMap: ["System Design", "Cloud Technologies"],
        careerInterests: ["Full Stack Development"],
      });
      setStep("preview");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Step 1: Role Selection */}
      {step === "role" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"
            >
              <Briefcase className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Select Target Role
            </h1>
            <p className="text-muted-foreground text-sm">
              Choose the position you&apos;re preparing for. The System will tailor questions accordingly.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            />
            {roleSearch && (
              <button
                onClick={() => setRoleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredRoles.map((role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role)}
                className="flex items-center gap-2 px-4 py-3 bg-card hover:bg-accent border border-border rounded-xl text-sm font-medium text-foreground transition-all text-left group"
              >
                <span className="flex-1">{role}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Resume Upload */}
      {step === "upload" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Upload Your Documents
            </h1>
            <p className="text-muted-foreground text-sm">
              Role: <span className="text-primary font-medium">{selectedRole}</span>
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-accent/50 group mb-4"
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium text-foreground mb-1">
              Click to upload Resume, Certificates, or Portfolio
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, TXT supported • Max 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Use Existing */}
          {existingResumeText && (
            <button
              onClick={handleUseExisting}
              className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-sm font-medium text-primary transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Use Existing Career Twin Data
            </button>
          )}

          {/* Or enter manually */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Or paste your resume text
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume/CV content here..."
              rows={6}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
            />
            {resumeText && (
              <button
                onClick={() => analyzeResume(resumeText, undefined, undefined)}
                className="w-full mt-3 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-all"
              >
                Analyze Resume
              </button>
            )}
          </div>

          <button
            onClick={() => setStep("role")}
            className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to role selection
          </button>
        </motion.div>
      )}

      {/* Step 3: Analyzing */}
      {step === "analyzing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20"
          >
            <Loader2 className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Analyzing Your Profile
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            System System is extracting skills, projects, and building your candidate profile...
          </p>
          <div className="space-y-3 max-w-sm mx-auto">
            {[
              "Extracting Skills & Languages",
              "Analyzing Projects & Experience",
              "Building Strength/Weakness Map",
              "Generating Interview Strategy",
            ].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.5 }}
                className="flex items-center gap-3 text-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.5 + 0.3 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </motion.div>
                <span className="text-muted-foreground">{s}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 4: Profile Preview */}
      {step === "preview" && profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Candidate Profile Ready
            </h1>
            <p className="text-muted-foreground text-sm">
              The System has analyzed your profile for{" "}
              <span className="text-primary font-medium">{selectedRole}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Skills */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 bg-primary/10 text-primary text-[11px] rounded-md font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.strengthMap.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[11px] rounded-md font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3">
                Growth Areas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.weaknessMap.map((w) => (
                  <span
                    key={w}
                    className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[11px] rounded-md font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">
                Projects ({profile.projects.length})
              </h3>
              <div className="space-y-2">
                {profile.projects.slice(0, 3).map((p, i) => (
                  <div key={i}>
                    <span className="text-xs font-medium text-foreground">
                      {p.name}
                    </span>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Level Badge */}
          <div className="flex justify-center mb-6">
            <span className="px-4 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-sm font-medium">
              Experience Level: {profile.experienceLevel}
            </span>
          </div>

          {/* Proceed Button */}
          <button
            onClick={() => onComplete(profile, selectedRole)}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            Proceed to Interview Lobby
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
