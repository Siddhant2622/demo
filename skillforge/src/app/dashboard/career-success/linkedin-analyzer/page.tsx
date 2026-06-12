"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  Link as LinkIcon, 
  Upload, 
  Search, 
  BarChart, 
  Star,
  Users,
  Eye,
  Wand2,
  Edit3
} from "lucide-react";

export default function LinkedinAnalyzer() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      setResults({
        score: 92,
        metrics: {
          branding: 95,
          completeness: 88,
          visibility: 90,
          networking: 85
        },
        suggestions: [
          {
            section: "Headline",
            current: "Software Engineer",
            suggested: "Full Stack Developer | React | Node.js | AI Enthusiast | Building Scalable Digital Solutions"
          },
          {
            section: "About",
            current: "I am a developer.",
            suggested: "Passionate Full Stack Engineer with 3+ years of experience architecting scalable web applications. Recognized for optimizing database performance by 40% and leading cross-functional agile teams..."
          }
        ]
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
          <Globe className="w-8 h-8 text-sky-500" />
          LinkedIn Profile Analyzer
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Get a comprehensive score for your LinkedIn profile. Discover actionable AI insights to improve your professional branding and increase your visibility to top recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Input & Metrics Summary */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Analyze Profile</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button className="w-full py-3 border border-dashed border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                <Upload className="w-4 h-4" />
                Upload Profile PDF Export
              </button>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!url && false)} // Just mock logic for UI
                className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-70 mt-4"
              >
                {isAnalyzing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {isAnalyzing ? "Scanning Profile..." : "Analyze Now"}
              </button>
            </div>
          </div>

          {results && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-sky-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="w-32 h-32" />
              </div>
              <div className="relative z-10 text-center py-6">
                <div className="text-sm font-medium text-sky-100 uppercase tracking-widest mb-2">Overall LinkedIn Score</div>
                <div className="text-6xl font-bold flex items-baseline justify-center gap-1">
                  {results.score}
                  <span className="text-2xl text-sky-200">/100</span>
                </div>
                <div className="mt-4 inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
                  Top 5% of Profiles
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Side: Detailed Breakdown & Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          {!results ? (
            <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-12 shadow-lg h-full flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px]">
              <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mb-6">
                <BarChart className="w-10 h-10 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Enter your profile to start</h3>
              <p className="max-w-md">Our AI will scan your headline, about section, experience, and skills to generate a comprehensive improvement plan.</p>
            </div>
          ) : (
            <>
              {/* Detailed Metrics */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Branding", val: results.metrics.branding, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { label: "Completeness", val: results.metrics.completeness, icon: Edit3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Visibility", val: results.metrics.visibility, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Networking", val: results.metrics.networking, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((m, i) => (
                  <div key={i} className="bg-card/50 border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${m.bg} ${m.color}`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{m.val}%</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">{m.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* AI Suggestions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-sky-500" />
                    AI Improvement Suggestions
                  </h3>
                  <button className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-bold hover:bg-sky-200 transition-colors">
                    Apply All to Profile
                  </button>
                </div>

                <div className="space-y-6">
                  {results.suggestions.map((sug: any, i: number) => (
                    <div key={i} className="bg-background/50 rounded-2xl p-5 border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold uppercase tracking-wider text-sm text-muted-foreground">{sug.section} Optimization</h4>
                        <button className="text-sky-600 text-sm font-semibold hover:text-sky-700">Copy Suggestion</button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-md mb-2 inline-block">Current</span>
                          <p className="text-sm text-muted-foreground line-clamp-2">{sug.current}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md mb-2 inline-block">AI Suggested</span>
                          <p className="text-sm font-medium text-foreground">{sug.suggested}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
