"use client";
import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Star,
  BookOpen,
  Target,
  Download,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import CircularGauge from "./CircularGauge";
import { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export interface InterviewScorecard {
  overallScore: number;
  metrics: {
    speakingSkills: number;
    confidence: number;
    communication: number;
    fluency: number;
    eyeContact: number;
    technicalKnowledge: number;
    problemSolving: number;
    answerQuality: number;
    professionalism: number;
    projectKnowledge: number;
  };
  hiringRecommendation: "Strong Hire" | "Hire" | "Borderline" | "No Hire";
  strengths: string[];
  weaknesses: string[];
  pros: string[];
  cons: string[];
  improvements: string[];
  roadmap: {
    sevenDay: string[];
    thirtyDay: string[];
    ninetyDay: string[];
  };
  resources: { name: string; type: string; url?: string }[];
  interviewReadiness: number;
  hiringProbability: number;
  benchmarking: {
    fresherPercentile: number;
    top10Percent: boolean;
    top1Percent: boolean;
  };
  recruiterNotes: string;
}

interface ScoreCardProps {
  scorecard: InterviewScorecard;
  onRestart: () => void;
}

export default function ScoreCard({ scorecard, onRestart }: ScoreCardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "strengths" | "roadmap" | "recruiter">(
    "overview"
  );

  const hiringColors: Record<string, string> = {
    "Strong Hire": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Hire: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Borderline: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "No Hire": "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const radarData = Object.entries(scorecard.metrics).map(([key, value]) => ({
    subject: key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    score: value,
  }));

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "strengths" as const, label: "Analysis" },
    { id: "roadmap" as const, label: "Roadmap" },
    { id: "recruiter" as const, label: "Recruiter" },
  ];

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      {/* Hero Score */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-12 pb-8 px-8 text-center overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
            style={{
              background:
                scorecard.overallScore >= 70
                  ? "radial-gradient(circle, #10b981, transparent)"
                  : scorecard.overallScore >= 40
                  ? "radial-gradient(circle, #f59e0b, transparent)"
                  : "radial-gradient(circle, #ef4444, transparent)",
            }}
          />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative z-10 mb-6"
        >
          <CircularGauge
            value={scorecard.overallScore}
            size={180}
            strokeWidth={10}
            sublabel="/ 100"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-bold text-white/90 mb-2"
        >
          Interview Complete
        </motion.h1>

        {/* Hiring Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
            hiringColors[scorecard.hiringRecommendation]
          }`}
        >
          <Award className="w-4 h-4" />
          {scorecard.hiringRecommendation}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-3 text-sm text-white/40"
        >
          Hiring Probability: {scorecard.hiringProbability}% •
          Interview Readiness: {scorecard.interviewReadiness}/100
        </motion.p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-1 px-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-white border border-white/10"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(scorecard.metrics).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex flex-col items-center"
                >
                  <CircularGauge value={value} size={70} strokeWidth={5} />
                  <span className="text-[9px] text-white/40 uppercase tracking-wider mt-2 text-center leading-tight">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Radar Chart */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Performance Radar</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Benchmarking */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Industry Benchmarking
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white/80">
                    Top {100 - scorecard.benchmarking.fresherPercentile}%
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">Among Freshers</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      scorecard.benchmarking.top10Percent
                        ? "text-emerald-400"
                        : "text-white/30"
                    }`}
                  >
                    {scorecard.benchmarking.top10Percent ? "✓" : "✗"}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">Top 10%</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      scorecard.benchmarking.top1Percent
                        ? "text-violet-400"
                        : "text-white/30"
                    }`}
                  >
                    {scorecard.benchmarking.top1Percent ? "✓" : "✗"}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">Top 1%</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === "strengths" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Strengths
                </h3>
                <ul className="space-y-2">
                  {scorecard.strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 text-xs text-white/60"
                    >
                      <Star className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {scorecard.weaknesses.map((w, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 text-xs text-white/60"
                    >
                      <ChevronRight className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                      {w}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">Pros</h3>
                <ul className="space-y-1.5">
                  {scorecard.pros.map((p, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                      <span className="text-blue-400">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">Cons</h3>
                <ul className="space-y-1.5">
                  {scorecard.cons.map((c, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                      <span className="text-amber-400">−</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-violet-400 mb-3">
                Recommended Improvements
              </h3>
              <ul className="space-y-2">
                {scorecard.improvements.map((item, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                    <span className="bg-violet-500/10 text-violet-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === "roadmap" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {[
              { title: "7-Day Sprint", items: scorecard.roadmap.sevenDay, color: "emerald" },
              { title: "30-Day Plan", items: scorecard.roadmap.thirtyDay, color: "blue" },
              { title: "90-Day Mastery", items: scorecard.roadmap.ninetyDay, color: "violet" },
            ].map(({ title, items, color }) => (
              <div
                key={title}
                className="bg-white/[0.03] rounded-2xl border border-white/5 p-5"
              >
                <h3
                  className={`text-sm font-semibold mb-3 flex items-center gap-2 text-${color}-400`}
                >
                  <BookOpen className="w-4 h-4" />
                  {title}
                </h3>
                <ol className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-3">
                      <span
                        className={`bg-${color}-500/10 text-${color}-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5`}
                      >
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            {/* Resources */}
            {scorecard.resources.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Recommended Resources
                </h3>
                <div className="space-y-2">
                  {scorecard.resources.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/[0.02] rounded-lg p-3 border border-white/5"
                    >
                      <div>
                        <span className="text-xs text-white/60">{r.name}</span>
                        <span className="text-[10px] text-white/25 ml-2 uppercase">
                          {r.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* RECRUITER TAB */}
        {activeTab === "recruiter" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Recruiter Notes</h3>
              <p className="text-xs text-white/50 leading-relaxed whitespace-pre-line">
                {scorecard.recruiterNotes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 text-center">
                <div className="text-3xl font-bold text-emerald-400">
                  {scorecard.hiringProbability}%
                </div>
                <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">
                  Hiring Probability
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {scorecard.interviewReadiness}
                </div>
                <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">
                  Readiness Score
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white/70 transition-all"
          >
            Start New Interview
          </button>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(scorecard, null, 2);
              const blob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "interview-scorecard.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium text-emerald-400 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
