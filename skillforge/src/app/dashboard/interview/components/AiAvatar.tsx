"use client";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface AiAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AiAvatar({
  isSpeaking,
  isListening,
  isThinking,
  size = "lg",
}: AiAvatarProps) {
  const sizeMap = { sm: 120, md: 200, lg: 280 };
  const s = sizeMap[size];
  const iconSize = s * 0.28;

  const state = isSpeaking
    ? "speaking"
    : isThinking
    ? "thinking"
    : isListening
    ? "listening"
    : "idle";

  const stateConfig = {
    speaking: {
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      pulseColor: "rgba(16, 185, 129, 0.3)",
      label: "Speaking",
      labelColor: "text-emerald-400",
    },
    thinking: {
      gradient: "from-violet-400 via-purple-500 to-indigo-500",
      pulseColor: "rgba(139, 92, 246, 0.3)",
      label: "Analyzing...",
      labelColor: "text-violet-400",
    },
    listening: {
      gradient: "from-blue-400 via-cyan-500 to-teal-400",
      pulseColor: "rgba(59, 130, 246, 0.3)",
      label: "Listening",
      labelColor: "text-blue-400",
    },
    idle: {
      gradient: "from-slate-400 via-slate-500 to-slate-600",
      pulseColor: "rgba(100, 116, 139, 0.2)",
      label: "Ready",
      labelColor: "text-slate-400",
    },
  };

  const cfg = stateConfig[state];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: s + 60, height: s + 60 }}
    >
      {/* Outer pulse rings */}
      {(isSpeaking || isListening) && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: s + 50,
              height: s + 50,
              backgroundColor: cfg.pulseColor,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: s + 30,
              height: s + 30,
              backgroundColor: cfg.pulseColor,
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </>
      )}

      {/* Thinking spinner ring */}
      {isThinking && (
        <motion.div
          className={`absolute rounded-full border-2 border-transparent border-t-violet-400 border-r-purple-400`}
          style={{ width: s + 20, height: s + 20 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      )}

      {/* Waveform bars for speaking */}
      {isSpeaking && (
        <div className="absolute flex items-end gap-[2px]" style={{ bottom: -8 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-emerald-400/60"
              style={{ width: 2.5 }}
              animate={{
                height: [4, 8 + Math.random() * 20, 4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.4 + Math.random() * 0.4,
                delay: i * 0.04,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Main avatar orb */}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br ${cfg.gradient} p-[3px] shadow-2xl`}
        style={{ width: s, height: s }}
        animate={isSpeaking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={
          isSpeaking
            ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        <div className="w-full h-full rounded-full bg-[#0a0f1a] flex flex-col items-center justify-center gap-2 overflow-hidden border border-white/5">
          {/* System Icon */}
          <motion.div
            animate={
              isThinking
                ? { rotate: [0, 10, -10, 0] }
                : isSpeaking
                ? { y: [0, -3, 0] }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: isThinking ? 1 : 0.6,
              ease: "easeInOut",
            }}
          >
            <Bot
              style={{ width: iconSize, height: iconSize }}
              className="text-white/80"
              strokeWidth={1.2}
            />
          </motion.div>

          {/* State label */}
          <span
            className={`text-[10px] font-semibold tracking-[0.2em] uppercase ${cfg.labelColor}`}
          >
            {cfg.label}
          </span>
        </div>
      </motion.div>

      {/* Name plate */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-white/70 tracking-wider">
            System INTERVIEWER
          </span>
        </div>
      </div>
    </div>
  );
}
