"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User } from "lucide-react";

export interface TranscriptMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  currentTranscript?: string;
  isAiSpeaking?: boolean;
  isAiThinking?: boolean;
}

export default function TranscriptPanel({
  messages,
  currentTranscript,
  isAiSpeaking,
  isAiThinking,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript, isAiThinking]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Live Transcript
        </h3>
        <span className="text-[10px] text-white/30">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  msg.role === "model"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {msg.role === "model" ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  msg.role === "model"
                    ? "bg-white/5 border border-white/10"
                    : "bg-blue-500/10 border border-blue-500/20"
                }`}
              >
                <p className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[9px] text-white/25 mt-1 block">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live transcribing indicator */}
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 flex-row-reverse"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] rounded-xl px-3 py-2 bg-blue-500/5 border border-blue-500/10 border-dashed">
              <p className="text-xs text-white/50 italic">{currentTranscript}...</p>
            </div>
          </motion.div>
        )}

        {/* System thinking indicator */}
        {isAiThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center mt-2"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/50"
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
