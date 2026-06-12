"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  FileText, 
  AlignLeft, 
  Share2, 
  Wand2, 
  Copy, 
  Plus, 
  Trash2,
  ExternalLink
} from "lucide-react";

type Job = {
  id: string;
  company: string;
  role: string;
  url: string;
  status: string;
};

export default function CareerCopilot() {
  const [activeTab, setActiveTab] = useState("tracker");

  // Job Tracker State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState({ company: "", role: "", url: "", status: "Saved" });

  // Cover Letter State
  const [clResume, setClResume] = useState("");
  const [clJobDesc, setClJobDesc] = useState("");
  const [clOutput, setClOutput] = useState("");
  const [isGeneratingCl, setIsGeneratingCl] = useState(false);

  // JD Summarizer State
  const [jdInput, setJdInput] = useState("");
  const [jdOutput, setJdOutput] = useState("");
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);

  // LinkedIn Post State
  const [liTopic, setLiTopic] = useState("");
  const [liTone, setLiTone] = useState("Professional yet enthusiastic");
  const [liOutput, setLiOutput] = useState("");
  const [isGeneratingLi, setIsGeneratingLi] = useState(false);

  // Load jobs from local storage
  useEffect(() => {
    const saved = localStorage.getItem("copilot_jobs");
    if (saved) {
      try { setJobs(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save jobs to local storage
  const saveJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    localStorage.setItem("copilot_jobs", JSON.stringify(newJobs));
  };

  const addJob = () => {
    if (!newJob.company || !newJob.role) return;
    const j: Job = { ...newJob, id: Date.now().toString() };
    saveJobs([...jobs, j]);
    setNewJob({ company: "", role: "", url: "", status: "Saved" });
  };

  const removeJob = (id: string) => {
    saveJobs(jobs.filter(j => j.id !== id));
  };

  const generateCoverLetter = async () => {
    if (!clResume || !clJobDesc) return alert("Please provide both Resume and Job Description.");
    setIsGeneratingCl(true);
    setClOutput("");
    try {
      const res = await fetch("/api/career/copilot/cover-letter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: clResume, jobDescription: clJobDesc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClOutput(data.coverLetter);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingCl(false);
    }
  };

  const summarizeJD = async () => {
    if (!jdInput) return alert("Please paste a Job Description.");
    setIsGeneratingJd(true);
    setJdOutput("");
    try {
      const res = await fetch("/api/career/copilot/summarize-jd", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jdInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJdOutput(data.summary);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingJd(false);
    }
  };

  const generateLinkedInPost = async () => {
    if (!liTopic) return alert("Please provide a topic or achievement.");
    setIsGeneratingLi(true);
    setLiOutput("");
    try {
      const res = await fetch("/api/career/copilot/linkedin-post", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: liTopic, tone: liTone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLiOutput(data.post);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingLi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const tabs = [
    { id: "tracker", label: "Job Tracker", icon: Briefcase },
    { id: "cover-letter", label: "Cover Letter", icon: FileText },
    { id: "summarize-jd", label: "JD Summarizer", icon: AlignLeft },
    { id: "linkedin", label: "LinkedIn Post", icon: Share2 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-primary" />
          Career Copilot Suite
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          A unified collection of AI tools to organize your job search, instantly write cover letters, summarize complex job descriptions, and build your personal brand on LinkedIn.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-border bg-background/50 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-b-2 border-primary text-primary bg-primary/5" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          
          {/* JOB TRACKER */}
          {activeTab === "tracker" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Job Applications</h2>
                <div className="text-sm text-muted-foreground">{jobs.length} total saved</div>
              </div>
              
              {/* Add New Job Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-background/50 p-4 rounded-2xl border border-border">
                <input type="text" placeholder="Company Name" className="bg-background border border-border rounded-xl px-4 py-2 text-sm" value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} />
                <input type="text" placeholder="Role Title" className="bg-background border border-border rounded-xl px-4 py-2 text-sm" value={newJob.role} onChange={(e) => setNewJob({...newJob, role: e.target.value})} />
                <input type="text" placeholder="Job URL (optional)" className="bg-background border border-border rounded-xl px-4 py-2 text-sm" value={newJob.url} onChange={(e) => setNewJob({...newJob, url: e.target.value})} />
                <select className="bg-background border border-border rounded-xl px-4 py-2 text-sm" value={newJob.status} onChange={(e) => setNewJob({...newJob, status: e.target.value})}>
                  <option>Saved</option><option>Applied</option><option>Interviewing</option><option>Offer</option><option>Rejected</option>
                </select>
                <button onClick={addJob} className="bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors py-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Jobs List */}
              <div className="space-y-3 mt-6">
                {jobs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12 italic border border-dashed border-border rounded-2xl">No jobs tracked yet. Add one above!</p>
                ) : (
                  jobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-bold text-lg">{job.company}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-3">
                          {job.role}
                          {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Link</a>}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          job.status === 'Applied' ? 'bg-blue-500/10 text-blue-500' :
                          job.status === 'Interviewing' ? 'bg-amber-500/10 text-amber-500' :
                          job.status === 'Offer' ? 'bg-emerald-500/10 text-emerald-500' :
                          job.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>
                          {job.status}
                        </span>
                        <button onClick={() => removeJob(job.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* COVER LETTER GENERATOR */}
          {activeTab === "cover-letter" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">1. Paste Your Resume</label>
                  <textarea value={clResume} onChange={(e)=>setClResume(e.target.value)} className="w-full h-40 bg-background border border-border rounded-xl p-4 text-sm resize-none" placeholder="Paste your resume text here..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">2. Paste Job Description</label>
                  <textarea value={clJobDesc} onChange={(e)=>setClJobDesc(e.target.value)} className="w-full h-40 bg-background border border-border rounded-xl p-4 text-sm resize-none" placeholder="Paste the target job description..."></textarea>
                </div>
                <button onClick={generateCoverLetter} disabled={isGeneratingCl} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isGeneratingCl ? <span className="animate-pulse">Writing Cover Letter...</span> : <><Wand2 className="w-5 h-5"/> Generate Magic Cover Letter</>}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-bold mb-2 text-emerald-500">AI Generated Cover Letter</label>
                <textarea readOnly value={clOutput} className="w-full h-[380px] bg-background/50 border border-emerald-500/30 rounded-xl p-4 text-sm resize-none focus:outline-none" placeholder="Your tailored cover letter will appear here..."></textarea>
                {clOutput && (
                  <button onClick={() => copyToClipboard(clOutput)} className="absolute bottom-4 right-4 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-lg flex items-center gap-2 text-sm font-bold">
                    <Copy className="w-4 h-4"/> Copy
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* JD SUMMARIZER */}
          {activeTab === "summarize-jd" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Paste Lengthy Job Description</label>
                  <textarea value={jdInput} onChange={(e)=>setJdInput(e.target.value)} className="w-full h-80 bg-background border border-border rounded-xl p-4 text-sm resize-none" placeholder="Paste that huge 3-page job description here..."></textarea>
                </div>
                <button onClick={summarizeJD} disabled={isGeneratingJd} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isGeneratingJd ? <span className="animate-pulse">Summarizing...</span> : <><Wand2 className="w-5 h-5"/> Summarize Instantly</>}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-bold mb-2 text-sky-500">TL;DR Summary</label>
                <div className="w-full h-[380px] overflow-y-auto bg-background/50 border border-sky-500/30 rounded-xl p-6 text-sm whitespace-pre-wrap font-sans">
                  {jdOutput || <span className="text-muted-foreground italic">The core responsibilities, required skills, and red flags will be listed here concisely.</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* LINKEDIN POST GENERATOR */}
          {activeTab === "linkedin" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">What do you want to post about?</label>
                  <textarea value={liTopic} onChange={(e)=>setLiTopic(e.target.value)} className="w-full h-40 bg-background border border-border rounded-xl p-4 text-sm resize-none" placeholder="e.g., I just finished a hackathon project building an AI career coach!"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Tone of Voice</label>
                  <select value={liTone} onChange={(e)=>setLiTone(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm">
                    <option>Professional yet enthusiastic</option>
                    <option>Highly technical and analytical</option>
                    <option>Inspirational and storytelling</option>
                    <option>Short and punchy</option>
                  </select>
                </div>
                <button onClick={generateLinkedInPost} disabled={isGeneratingLi} className="w-full py-4 bg-[#0a66c2] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004182] transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {isGeneratingLi ? <span className="animate-pulse">Ghostwriting Post...</span> : <><Share2 className="w-5 h-5"/> Draft LinkedIn Post</>}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-bold mb-2 text-[#0a66c2]">Viral LinkedIn Draft</label>
                <textarea readOnly value={liOutput} className="w-full h-[320px] bg-background/50 border border-[#0a66c2]/30 rounded-xl p-4 text-sm resize-none focus:outline-none" placeholder="Your highly engaging post draft will appear here..."></textarea>
                {liOutput && (
                  <button onClick={() => copyToClipboard(liOutput)} className="absolute bottom-4 right-4 p-2 bg-[#0a66c2] text-white rounded-lg hover:bg-[#004182] shadow-lg flex items-center gap-2 text-sm font-bold">
                    <Copy className="w-4 h-4"/> Copy
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
