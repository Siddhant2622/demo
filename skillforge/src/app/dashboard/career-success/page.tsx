"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle, 
  Globe, 
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Wand2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CareerSuccessDashboard() {
  const { user } = useAuth();
  
  // Mock data for the dashboard scores
  const [scores, setScores] = useState({
    resume: 90,
    ats: 87,
    linkedin: 82,
    overall: 86
  });

  const cards = [
    {
      title: "AI Resume Builder",
      description: "Create a professional, ATS-friendly resume with AI-powered content generation.",
      icon: FileText,
      href: "/dashboard/career-success/resume-builder",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-500",
      score: scores.resume
    },
    {
      title: "ATS Resume Checker",
      description: "Scan your resume against any job description to get an ATS compatibility score.",
      icon: CheckCircle,
      href: "/dashboard/career-success/ats-checker",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
      score: scores.ats
    },
    {
      title: "LinkedIn Analyzer",
      description: "Analyze and optimize your LinkedIn profile for maximum recruiter visibility.",
      icon: Globe,
      href: "/dashboard/career-success/linkedin-analyzer",
      color: "from-sky-500/20 to-blue-600/20",
      iconColor: "text-sky-500",
      score: scores.linkedin
    },
    {
      title: "Career Copilot Suite",
      description: "AI Cover Letter Generator, JD Summarizer, Job Tracker, and LinkedIn Post Ghostwriter.",
      icon: Wand2,
      href: "/dashboard/career-success/copilot",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      score: 100
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Career Success Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered tools to accelerate your career growth and land your dream job.
          </p>
        </div>
      </div>

      {/* Main Score Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="col-span-1 md:col-span-4 bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="w-48 h-48" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                  <circle 
                    cx="64" cy="64" r="60" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * scores.overall) / 100}
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{scores.overall}%</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-4 text-center">Overall Career Score</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">Excellent Standing</p>
            </div>

            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-background/40 rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><FileText className="w-5 h-5" /></div>
                  <h4 className="font-medium text-muted-foreground">Resume Strength</h4>
                </div>
                <div className="text-3xl font-bold">{scores.resume}%</div>
                <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scores.resume}%` }} />
                </div>
              </div>

              <div className="bg-background/40 rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle className="w-5 h-5" /></div>
                  <h4 className="font-medium text-muted-foreground">ATS Compatibility</h4>
                </div>
                <div className="text-3xl font-bold">{scores.ats}%</div>
                <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.ats}%` }} />
                </div>
              </div>

              <div className="bg-background/40 rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><Globe className="w-5 h-5" /></div>
                  <h4 className="font-medium text-muted-foreground">LinkedIn Strength</h4>
                </div>
                <div className="text-3xl font-bold">{scores.linkedin}%</div>
                <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${scores.linkedin}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <h2 className="text-2xl font-bold mt-12 mb-6">AI-Powered Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={card.href}>
              <div className="group relative bg-card/30 backdrop-blur-md border border-white/5 hover:border-primary/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden cursor-pointer h-full flex flex-col">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 bg-background/80 rounded-2xl ${card.iconColor} shadow-inner`}>
                    <card.icon className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{card.score}%</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Score</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                  {card.description}
                </p>

                <div className="mt-8 flex items-center text-sm font-semibold text-primary">
                  Launch Module
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI Career Coach Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 md:w-2/3">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Career Coach
          </h3>
          <p className="text-indigo-100 mb-6 leading-relaxed">
            Based on your overall score of {scores.overall}%, you should focus on improving your LinkedIn profile visibility and adding more action verbs to your resume. Let our AI guide you through the next steps.
          </p>
          <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            View Personalized Action Plan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
