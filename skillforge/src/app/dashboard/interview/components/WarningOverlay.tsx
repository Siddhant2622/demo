"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, XCircle, ArrowLeft } from "lucide-react";

interface WarningOverlayProps {
  show: boolean;
  type: "noise" | "face" | "cheat" | "fullscreen";
  warningLevel: number; // 1, 2, or 3
  message: string;
  countdown?: number;
  onDismiss?: () => void;
  onReturn?: () => void;
}

const levelConfig = {
  1: {
    title: "Friendly Warning",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/5",
    iconColor: "text-amber-400",
    icon: AlertTriangle,
    accent: "amber",
  },
  2: {
    title: "Serious Warning",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/5",
    iconColor: "text-orange-400",
    icon: ShieldAlert,
    accent: "orange",
  },
  3: {
    title: "Final Warning — Interview at Risk",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/5",
    iconColor: "text-red-500",
    icon: XCircle,
    accent: "red",
  },
};

export default function WarningOverlay({
  show,
  type,
  warningLevel,
  message,
  countdown,
  onDismiss,
  onReturn,
}: WarningOverlayProps) {
  const level = Math.min(Math.max(warningLevel, 1), 3) as 1 | 2 | 3;
  const cfg = levelConfig[level];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        >
          {/* Pulsing red border for level 3 */}
          {level === 3 && (
            <motion.div
              className="absolute inset-0 border-4 border-red-500/50 pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}

          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className={`relative max-w-md w-full mx-4 rounded-2xl border ${cfg.borderColor} ${cfg.bgColor} backdrop-blur-xl p-8 shadow-2xl`}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                animate={level >= 2 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <Icon className={`w-12 h-12 ${cfg.iconColor}`} />
              </motion.div>
            </div>

            {/* Title */}
            <h2 className={`text-center text-lg font-bold ${cfg.iconColor} mb-2`}>
              {cfg.title}
            </h2>

            {/* Warning counter */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((w) => (
                <div
                  key={w}
                  className={`w-3 h-3 rounded-full transition-all ${
                    w <= level
                      ? w === 3
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : w === 2
                        ? "bg-orange-500"
                        : "bg-amber-500"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            {/* Message */}
            <p className="text-center text-white/70 text-sm leading-relaxed mb-6">
              {message}
            </p>

            {/* Countdown */}
            {countdown !== undefined && countdown > 0 && (
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  className="text-5xl font-bold text-red-500"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {countdown}
                </motion.div>
                <p className="text-xs text-white/40 mt-2">
                  seconds before termination
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {onReturn && (
                <button
                  onClick={onReturn}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white rounded-xl py-3 text-sm font-medium transition-all border border-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Fullscreen
                </button>
              )}
              {onDismiss && level < 3 && (
                <button
                  onClick={onDismiss}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white rounded-xl py-3 text-sm font-medium transition-all border border-white/10"
                >
                  I Understand
                </button>
              )}
            </div>

            {/* Violation type badge */}
            <div className="flex justify-center mt-4">
              <span className="text-[10px] uppercase tracking-wider text-white/30 bg-white/5 px-3 py-1 rounded-full">
                {type} violation • strike {level}/3
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
