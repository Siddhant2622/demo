"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Wand2,
  Download,
  Target
} from "lucide-react";

export default function AtsChecker() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please provide a job description.");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/career/ats/analyze", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze resume");
      }

      const data = await res.json();
      setResults(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!file || !results) return;
    setIsOptimizing(true);
    setOptimizedResume(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);
      formData.append("missingKeywords", results.missing.join(", "));

      const res = await fetch("/api/career/ats/optimize", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to optimize resume");
      }
      const data = await res.json();
      setOptimizedResume(data.optimizedResume);
      alert("Resume optimized successfully! Click the Download button to save it.");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during optimization.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownload = async () => {
    if (!optimizedResume) {
      alert("Please Auto-Optimize your resume first before downloading.");
      return;
    }
    
    // Import marked dynamically
    const { marked } = await import("marked");

    // Convert markdown to HTML
    const htmlContent = await marked(optimizedResume);
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Write the styled HTML content to the iframe
    iframe.contentDocument?.write(`
      <html>
        <head>
          <title>Optimized_Resume</title>
          <style>
            @page {
              margin: 0.5in;
              size: letter portrait;
            }
            body { 
              font-family: "Times New Roman", Times, serif; 
              line-height: 1.15; 
              color: #000; 
              max-width: 8.5in; 
              margin: 0 auto; 
              font-size: 11pt;
            }
            h1 { 
              font-size: 24pt; 
              text-align: center; 
              margin-top: 0; 
              margin-bottom: 4pt; 
              font-weight: bold;
              text-transform: uppercase;
            }
            /* Assume the first paragraph after h1 contains contact info */
            h1 + p {
              text-align: center;
              font-size: 10pt;
              margin-bottom: 12pt;
            }
            h2 { 
              font-size: 13pt; 
              border-bottom: 1px solid #000; 
              padding-bottom: 2pt; 
              margin-top: 12pt; 
              margin-bottom: 6pt; 
              text-transform: uppercase;
            }
            h3 { 
              font-size: 11pt; 
              margin-top: 6pt; 
              margin-bottom: 2pt; 
              font-weight: bold;
              display: flex;
              justify-content: space-between;
            }
            p { margin: 0 0 4pt 0; }
            ul { 
              margin: 0 0 8pt 0; 
              padding-left: 18pt; 
            }
            li { margin-bottom: 2pt; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    iframe.contentDocument?.close();
    
    // Trigger native print (Save as PDF)
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean up after the print dialog is closed
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
          <Target className="w-8 h-8 text-emerald-500" />
          ATS Resume Checker
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Upload your resume and paste the job description. Our AI will analyze your match rate, check for ATS compatibility, and identify missing keywords to help you pass the screening filters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              1. Upload Resume
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${file ? 'border-primary bg-primary/5' : 'border-border'} rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors cursor-pointer`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.docx" 
                className="hidden" 
              />
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="font-medium text-foreground mb-1">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF or DOCX (MAX. 5MB)"}
              </p>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              2. Job Description
            </h3>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-48 bg-background border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Paste the job description here to compare against your resume..."
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || !jobDescription.trim()}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Scan Resume
              </>
            )}
          </button>
        </div>

        {/* Right Side: Analysis Results */}
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col">
          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center h-[500px]">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Scan</h3>
              <p>Upload your resume and provide a job description to see your ATS compatibility score and recommendations.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Match Results</h3>
                  <p className="text-sm text-emerald-500 font-medium mt-1">Excellent Compatibility</p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                    <circle 
                      cx="48" cy="48" r="44" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={276}
                      strokeDashoffset={276 - (276 * results.score) / 100}
                      className="text-emerald-500 transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{results.score}</span>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.matched.map((kw: string) => (
                      <span key={kw} className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.missing.map((kw: string) => (
                      <span key={kw} className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Checks */}
              <div>
                <h4 className="font-semibold mb-4 border-b border-border pb-2">Section Analysis</h4>
                <div className="grid grid-cols-2 gap-3">
                  {results.sections.map((section: any) => (
                    <div key={section.name} className="flex items-center gap-2 text-sm">
                      {section.pass ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={section.pass ? "text-foreground" : "text-amber-600 font-medium"}>
                        {section.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex gap-4">
                <button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {isOptimizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Auto-Optimize Resume
                    </>
                  )}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!optimizedResume}
                  className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-center ${optimizedResume ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed'}`}
                  title={!optimizedResume ? "Optimize resume first" : "Download optimized resume"}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
