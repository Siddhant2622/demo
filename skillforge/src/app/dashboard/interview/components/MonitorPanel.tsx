"use client";
import { motion } from "framer-motion";
import { Eye, Volume2, Gauge, Timer, Brain, Activity, Zap, TrendingUp } from "lucide-react";
import CircularGauge from "./CircularGauge";
import type { NoiseMetrics } from "../hooks/useNoiseDetector";
import type { EyeContactMetrics } from "../hooks/useEyeContact";
import type { SpeechMetrics } from "../hooks/useSpeechAnalyzer";
import type { StressMetrics } from "../hooks/useStressDetector";

interface MonitorPanelProps {
  noise: NoiseMetrics;
  eyeContact: EyeContactMetrics;
  speech: SpeechMetrics;
  stress: StressMetrics;
  difficulty: string;
  questionNumber: number;
  elapsedTime: number;
}

export default function MonitorPanel({
  noise,
  eyeContact,
  speech,
  stress,
  difficulty,
  questionNumber,
  elapsedTime,
}: MonitorPanelProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const difficultyColors: Record<string, string> = {
    Beginner: "text-green-400 bg-green-500/10 border-green-500/30",
    Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    Expert: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const noiseBarColor =
    noise.level === "critical"
      ? "bg-red-500"
      : noise.level === "high"
      ? "bg-orange-500"
      : noise.level === "moderate"
      ? "bg-yellow-500"
      : "bg-emerald-500";

  return (
    <div className="h-full flex flex-col bg-[#080c14]/90 backdrop-blur-xl border-l border-white/5">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Live Monitoring
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400/70">ACTIVE</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Timer & Progress */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Timer className="w-3 h-3 text-white/30" />
              <span className="text-[9px] uppercase tracking-wider text-white/30">Duration</span>
            </div>
            <span className="text-lg font-mono font-bold text-white/80">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3 h-3 text-white/30" />
              <span className="text-[9px] uppercase tracking-wider text-white/30">Question</span>
            </div>
            <span className="text-lg font-mono font-bold text-white/80">#{questionNumber}</span>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="flex items-center justify-between bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Difficulty</span>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              difficultyColors[difficulty] || difficultyColors.Beginner
            }`}
          >
            {difficulty}
          </span>
        </div>

        {/* Gauges Row */}
        <div className="grid grid-cols-2 gap-4 place-items-center">
          <CircularGauge
            value={eyeContact.contactPercent}
            size={90}
            strokeWidth={6}
            label="Eye Contact"
            colorScheme="emerald"
          />
          <CircularGauge
            value={speech.confidenceScore}
            size={90}
            strokeWidth={6}
            label="Confidence"
            colorScheme="blue"
          />
        </div>

        {/* Noise Level */}
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Noise Level</span>
            </div>
            <span className="text-[10px] font-medium text-white/50 capitalize">{noise.level}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${noiseBarColor}`}
              animate={{ width: `${noise.decibels}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {noise.warnings > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3].map((w) => (
                <div
                  key={w}
                  className={`w-2 h-2 rounded-full ${
                    w <= noise.warnings ? "bg-red-500" : "bg-white/10"
                  }`}
                />
              ))}
              <span className="text-[9px] text-red-400/60 ml-1">
                {noise.warnings}/3 warnings
              </span>
            </div>
          )}
        </div>

        {/* Speaking Speed */}
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Speaking Speed
              </span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white/80 font-mono">
              {speech.wordsPerMinute}
            </span>
            <span className="text-[10px] text-white/30 mb-1">WPM</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full ${
                speech.speakingSpeed === "normal"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : speech.speakingSpeed === "slow"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-orange-500/10 text-orange-400"
              }`}
            >
              {speech.speakingSpeed}
            </span>
          </div>
        </div>

        {/* Filler Words */}
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Filler Words</span>
            </div>
            <span className="text-sm font-bold text-white/60">{speech.fillerCount}</span>
          </div>
          {Object.entries(speech.fillerBreakdown).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(speech.fillerBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([word, count]) => (
                  <span
                    key={word}
                    className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded"
                  >
                    &ldquo;{word}&rdquo; ×{count}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Stress Level */}
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Stress Level</span>
            </div>
            <span
              className={`text-[10px] font-medium capitalize ${
                stress.level === "calm"
                  ? "text-emerald-400"
                  : stress.level === "mild"
                  ? "text-blue-400"
                  : stress.level === "moderate"
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {stress.level}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                stress.level === "calm"
                  ? "bg-emerald-500"
                  : stress.level === "mild"
                  ? "bg-blue-500"
                  : stress.level === "moderate"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              animate={{ width: `${stress.score}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Eye Contact Details */}
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Focus Details</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-white/30 block">Focus Level</span>
              <span className="text-xs font-medium text-white/60 capitalize">
                {eyeContact.focusLevel.replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-white/30 block">Look-aways</span>
              <span className="text-xs font-medium text-white/60">
                {eyeContact.lookingAwayCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
