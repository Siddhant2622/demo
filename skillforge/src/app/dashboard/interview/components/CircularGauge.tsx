"use client";
import { motion } from "framer-motion";

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: "auto" | "blue" | "purple" | "emerald";
}

export default function CircularGauge({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  colorScheme = "auto",
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / maxValue, 1);
  const offset = circumference * (1 - pct);

  const getColor = () => {
    if (colorScheme !== "auto") {
      const map = {
        blue: { stroke: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
        purple: { stroke: "#a855f7", bg: "rgba(168,85,247,0.1)" },
        emerald: { stroke: "#10b981", bg: "rgba(16,185,129,0.1)" },
      };
      return map[colorScheme];
    }
    if (pct >= 0.7) return { stroke: "#10b981", bg: "rgba(16,185,129,0.1)" };
    if (pct >= 0.4) return { stroke: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
    return { stroke: "#ef4444", bg: "rgba(239,68,68,0.1)" };
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border opacity-30"
          />
          {/* Animated progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-lg font-bold"
            style={{ color: color.stroke }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {Math.round(value)}
          </motion.span>
          {sublabel && (
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
              {sublabel}
            </span>
          )}
        </div>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none"
          style={{ backgroundColor: color.stroke }}
        />
      </div>
      {label && (
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center leading-tight mt-1">
          {label}
        </span>
      )}
    </div>
  );
}
