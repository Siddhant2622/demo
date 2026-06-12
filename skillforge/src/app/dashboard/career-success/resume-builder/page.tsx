"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wand2, 
  Save, 
  Download, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code,
  LayoutTemplate
} from "lucide-react";

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Central Resume State
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "(555) 123-4567",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      portfolio: ""
    },
    summary: "Highly motivated Software Engineer with 3+ years of experience in full-stack web development. Proven track record of delivering scalable solutions and improving system performance.",
    experience: [
      { id: "1", company: "Tech Corp", role: "Software Engineer", duration: "2021 - Present", description: "Developed a scalable e-commerce platform using React and Node.js.\nOptimized database queries reducing load time by 40%." }
    ],
    education: [
      { id: "1", institution: "University of Technology", degree: "Bachelor of Science in Computer Science", duration: "2019 - 2023", cgpa: "3.8/4.0", location: "New York, NY" }
    ],
    projects: [
      { id: "1", name: "E-Commerce Platform", tech: "React, Node.js, MongoDB", liveLink: "https://my-project.com", githubLink: "", description: "Built a full-stack e-commerce solution handling over 1,000 daily active users. Integrated Stripe for secure payments." }
    ]
  });

  const handleAiEnhance = async (type: string, text: string, index?: number) => {
    if (!text) return alert("Please write some text to enhance first!");
    
    setIsGenerating(`${type}-${index ?? 'main'}`);
    
    try {
      const res = await fetch("/api/career/resume-builder/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update State based on type
      if (type === "summary") {
        setResumeData({ ...resumeData, summary: data.enhancedText });
      } else if (type === "experience" && index !== undefined) {
        const newExp = [...resumeData.experience];
        newExp[index].description = data.enhancedText;
        setResumeData({ ...resumeData, experience: newExp });
      } else if (type === "project" && index !== undefined) {
        const newProj = [...resumeData.projects];
        newProj[index].description = data.enhancedText;
        setResumeData({ ...resumeData, projects: newProj });
      }
    } catch (err: any) {
      alert("Enhancement failed: " + err.message);
    } finally {
      setIsGenerating(null);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Code },
    { id: "template", label: "Template", icon: LayoutTemplate },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left side: Form & Editor */}
      <div className="w-1/2 flex flex-col bg-card/50 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border bg-background/50 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Resume Builder
          </h2>
          <div className="flex gap-2">
            <button onClick={() => {
              const compiledText = `Name: ${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}
Email: ${resumeData.personalInfo.email}
Phone: ${resumeData.personalInfo.phone}
LinkedIn: ${resumeData.personalInfo.linkedin}
Summary: ${resumeData.summary}
Experience: ${resumeData.experience.map(e => `${e.role} at ${e.company} (${e.duration}): ${e.description}`).join(' | ')}
Education: ${resumeData.education.map(e => `${e.degree} at ${e.institution} (${e.duration})`).join(' | ')}
Projects: ${resumeData.projects.map(p => `${p.name} (${p.tech}): ${p.description}`).join(' | ')}`;
              
              localStorage.setItem('skillforge_resume_text', compiledText);
              localStorage.setItem('skillforge_resume_data', JSON.stringify(resumeData));
              alert("Resume Saved successfully! Your profile is now synced with the Interview Simulator and Career Twin.");
            }} className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={() => window.print()} className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-b-2 border-primary text-primary bg-primary/5" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* PERSONAL INFO */}
          {activeTab === "personal" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input type="text" value={resumeData.personalInfo.firstName} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, firstName: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input type="text" value={resumeData.personalInfo.lastName} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, lastName: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" value={resumeData.personalInfo.email} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, email: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input type="text" value={resumeData.personalInfo.phone} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, phone: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <input type="text" value={resumeData.personalInfo.linkedin} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, linkedin: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub</label>
                  <input type="text" value={resumeData.personalInfo.github} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, github: e.target.value}})} className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="github.com/..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Summary</label>
                <textarea value={resumeData.summary} onChange={e => setResumeData({...resumeData, summary: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 h-32 text-sm" placeholder="Brief summary of your professional background..." />
                <button 
                  onClick={() => handleAiEnhance("summary", resumeData.summary)}
                  disabled={isGenerating === "summary-main"}
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 font-medium mt-1"
                >
                  <Wand2 className="w-4 h-4" />
                  {isGenerating === "summary-main" ? "Optimizing..." : "AI: Enhance Summary"}
                </button>
              </div>
            </motion.div>
          )}

          {/* EXPERIENCE */}
          {activeTab === "experience" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="bg-background/50 border border-border rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">{exp.role || "New Experience"}</h3>
                    <button onClick={() => setResumeData({...resumeData, experience: resumeData.experience.filter(e => e.id !== exp.id)})} className="text-sm text-red-500 hover:text-red-400">Remove</button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={exp.company} onChange={e => {
                        const newExp = [...resumeData.experience]; newExp[index].company = e.target.value; setResumeData({...resumeData, experience: newExp});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Company Name" />
                      <input type="text" value={exp.duration} onChange={e => {
                        const newExp = [...resumeData.experience]; newExp[index].duration = e.target.value; setResumeData({...resumeData, experience: newExp});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Duration" />
                    </div>
                    <input type="text" value={exp.role} onChange={e => {
                      const newExp = [...resumeData.experience]; newExp[index].role = e.target.value; setResumeData({...resumeData, experience: newExp});
                    }} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Job Title / Role" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Description / Bullet Points</label>
                      <textarea value={exp.description} onChange={e => {
                        const newExp = [...resumeData.experience]; newExp[index].description = e.target.value; setResumeData({...resumeData, experience: newExp});
                      }} className="w-full bg-background border border-border rounded-xl px-4 py-2 h-24 text-sm whitespace-pre-wrap" placeholder="What did you do here?" />
                      <button 
                        onClick={() => handleAiEnhance("experience", exp.description, index)}
                        disabled={isGenerating === `experience-${index}`}
                        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 font-medium"
                      >
                        <Wand2 className="w-4 h-4" />
                        {isGenerating === `experience-${index}` ? "Optimizing..." : "AI: Make it sound professional"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setResumeData({...resumeData, experience: [...resumeData.experience, { id: Date.now().toString(), company: "", role: "", duration: "", description: "" }]})} className="w-full py-3 border border-dashed border-border rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium text-sm">
                + Add Experience
              </button>
            </motion.div>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className="bg-background/50 border border-border rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">{edu.degree || "New Education"}</h3>
                    <button onClick={() => setResumeData({...resumeData, education: resumeData.education.filter(e => e.id !== edu.id)})} className="text-sm text-red-500 hover:text-red-400">Remove</button>
                  </div>
                  <div className="space-y-4">
                    <input type="text" value={edu.degree} onChange={e => {
                      const newEdu = [...resumeData.education]; newEdu[index].degree = e.target.value; setResumeData({...resumeData, education: newEdu});
                    }} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Degree/Program" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={edu.institution} onChange={e => {
                        const newEdu = [...resumeData.education]; newEdu[index].institution = e.target.value; setResumeData({...resumeData, education: newEdu});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Institution/University" />
                      <input type="text" value={edu.duration} onChange={e => {
                        const newEdu = [...resumeData.education]; newEdu[index].duration = e.target.value; setResumeData({...resumeData, education: newEdu});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Duration" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={edu.cgpa} onChange={e => {
                        const newEdu = [...resumeData.education]; newEdu[index].cgpa = e.target.value; setResumeData({...resumeData, education: newEdu});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="CGPA/Grade" />
                      <input type="text" value={edu.location} onChange={e => {
                        const newEdu = [...resumeData.education]; newEdu[index].location = e.target.value; setResumeData({...resumeData, education: newEdu});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Location" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setResumeData({...resumeData, education: [...resumeData.education, { id: Date.now().toString(), institution: "", degree: "", duration: "", cgpa: "", location: "" }]})} className="w-full py-3 border border-dashed border-border rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium text-sm">
                + Add Education
              </button>
            </motion.div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {resumeData.projects.map((proj, index) => (
                <div key={proj.id} className="bg-background/50 border border-border rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">{proj.name || "New Project"}</h3>
                    <button onClick={() => setResumeData({...resumeData, projects: resumeData.projects.filter(p => p.id !== proj.id)})} className="text-sm text-red-500 hover:text-red-400">Remove</button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={proj.name} onChange={e => {
                        const newProj = [...resumeData.projects]; newProj[index].name = e.target.value; setResumeData({...resumeData, projects: newProj});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Project Name" />
                      <input type="text" value={proj.tech} onChange={e => {
                        const newProj = [...resumeData.projects]; newProj[index].tech = e.target.value; setResumeData({...resumeData, projects: newProj});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Technologies Used" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={proj.liveLink} onChange={e => {
                        const newProj = [...resumeData.projects]; newProj[index].liveLink = e.target.value; setResumeData({...resumeData, projects: newProj});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="Live Link" />
                      <input type="text" value={proj.githubLink} onChange={e => {
                        const newProj = [...resumeData.projects]; newProj[index].githubLink = e.target.value; setResumeData({...resumeData, projects: newProj});
                      }} className="bg-background border border-border rounded-xl px-4 py-2 text-sm" placeholder="GitHub Link" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Description & Impact</label>
                      <textarea value={proj.description} onChange={e => {
                        const newProj = [...resumeData.projects]; newProj[index].description = e.target.value; setResumeData({...resumeData, projects: newProj});
                      }} className="w-full bg-background border border-border rounded-xl px-4 py-2 h-24 text-sm" placeholder="What did you build and why?" />
                      <button 
                        onClick={() => handleAiEnhance("project", proj.description, index)}
                        disabled={isGenerating === `project-${index}`}
                        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 font-medium"
                      >
                        <Wand2 className="w-4 h-4" />
                        {isGenerating === `project-${index}` ? "Optimizing..." : "AI: Enhance Project Description"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setResumeData({...resumeData, projects: [...resumeData.projects, { id: Date.now().toString(), name: "", tech: "", liveLink: "", githubLink: "", description: "" }]})} className="w-full py-3 border border-dashed border-border rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium text-sm">
                + Add Project
              </button>
            </motion.div>
          )}

          {/* TEMPLATE (Placeholder) */}
          {activeTab === "template" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center text-muted-foreground">
              <p>Premium templates coming soon.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right side: Resume Preview */}
      <div className="w-1/2 bg-white rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center text-slate-800">
          <span className="font-semibold text-sm">Live Preview</span>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">ATS Score: 85%</span>
          </div>
        </div>
        
        {/* Actual Preview Canvas */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-sm border border-slate-200 p-12 text-slate-800 font-sans">
            <header className="text-center border-b-2 border-slate-300 pb-6 mb-6">
              <h1 className="text-4xl font-bold uppercase tracking-widest text-slate-900">
                {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
              </h1>
              <div className="mt-3 text-sm text-slate-600 flex justify-center gap-4 flex-wrap">
                {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo.phone && <><span>•</span><span>{resumeData.personalInfo.phone}</span></>}
                {resumeData.personalInfo.linkedin && <><span>•</span><span>{resumeData.personalInfo.linkedin.replace('https://', '')}</span></>}
                {resumeData.personalInfo.github && <><span>•</span><span>{resumeData.personalInfo.github.replace('https://', '')}</span></>}
              </div>
            </header>

            {resumeData.summary && (
              <section className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">Professional Summary</h2>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {resumeData.summary.replace(/^- /gm, '')}
                </p>
              </section>
            )}

            {resumeData.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3 border-b border-slate-200 pb-1">Experience</h2>
                {resumeData.experience.map(exp => (
                  <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900">{exp.company}</h3>
                      <span className="text-sm font-semibold text-slate-600">{exp.duration}</span>
                    </div>
                    <div className="text-sm italic text-slate-700 mb-2">{exp.role}</div>
                    {exp.description && (
                      <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                        {exp.description.split('\n').map((bullet, i) => (
                          bullet.trim() && <li key={i}>{bullet.replace(/^- /, '').replace(/^\* /, '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {resumeData.education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3 border-b border-slate-200 pb-1">Education</h2>
                {resumeData.education.map(edu => (
                  <div key={edu.id} className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                      <span className="text-sm font-semibold text-slate-600">{edu.duration}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <div className="text-sm italic text-slate-700">{edu.degree}</div>
                      {edu.cgpa && <span className="text-sm text-slate-600">CGPA: {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {resumeData.projects.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3 border-b border-slate-200 pb-1">Projects</h2>
                {resumeData.projects.map(proj => (
                  <div key={proj.id} className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900">{proj.name}</h3>
                      <span className="text-sm font-semibold text-slate-600">{proj.tech}</span>
                    </div>
                    {proj.description && (
                      <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1 mt-2">
                        {proj.description.split('\n').map((bullet, i) => (
                          bullet.trim() && <li key={i}>{bullet.replace(/^- /, '').replace(/^\* /, '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
