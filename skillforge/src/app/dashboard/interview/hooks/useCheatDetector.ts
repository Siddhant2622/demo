"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export type ViolationType = "tab_switch" | "copy_paste" | "fullscreen_exit" | "alt_tab" | "right_click";

export interface CheatMetrics {
  warnings: number;
  maxWarnings: number;
  isViolation: boolean;
  violations: { type: ViolationType; timestamp: number; message: string }[];
  lastWarningMessage: string;
}

const WARNING_MESSAGES: Record<ViolationType, string[]> = {
  tab_switch: [
    "Tab switch detected. Please stay focused on the interview.",
    "Second tab switch detected. This is a serious violation.",
    "Multiple tab switches detected. Interview will be terminated.",
  ],
  copy_paste: [
    "Copy/paste detected. Please answer in your own words.",
    "Repeated copy/paste detected. This is flagged.",
    "Copy/paste violation limit reached.",
  ],
  fullscreen_exit: [
    "You exited fullscreen. Please return immediately.",
    "Repeated fullscreen exit. This is a serious violation.",
    "Fullscreen violations exceeded. Interview will end.",
  ],
  alt_tab: [
    "Window switch detected. Please stay in the interview.",
    "Repeated window switching detected.",
    "Multiple window switches. Interview integrity compromised.",
  ],
  right_click: [
    "Right-click is disabled during the interview.",
    "Repeated right-click attempts detected.",
    "Right-click violations exceeded.",
  ],
};

export function useCheatDetector(active: boolean) {
  const [metrics, setMetrics] = useState<CheatMetrics>({
    warnings: 0,
    maxWarnings: 3,
    isViolation: false,
    violations: [],
    lastWarningMessage: "",
  });

  const warningsRef = useRef(0);
  const violationsRef = useRef<CheatMetrics["violations"]>([]);
  // Grace period — ignore events for 3 seconds after activation
  // (entering fullscreen triggers visibilitychange & blur events)
  const activatedAtRef = useRef(0);

  const addViolation = useCallback((type: ViolationType) => {
    // Skip if within grace period
    if (Date.now() - activatedAtRef.current < 3000) return;

    warningsRef.current = Math.min(warningsRef.current + 1, 3);
    const msgIndex = Math.min(warningsRef.current - 1, 2);
    const message = WARNING_MESSAGES[type][msgIndex];

    violationsRef.current.push({ type, timestamp: Date.now(), message });

    setMetrics({
      warnings: warningsRef.current,
      maxWarnings: 3,
      isViolation: warningsRef.current >= 3,
      violations: [...violationsRef.current],
      lastWarningMessage: message,
    });
  }, []);

  useEffect(() => {
    if (!active) return;

    // Set activation timestamp — gives 3s grace period
    activatedAtRef.current = Date.now();

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) {
        addViolation("tab_switch");
      }
    };

    // Copy paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_paste");
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_paste");
    };

    // Window blur (Alt+Tab) — only trigger if NOT just entering fullscreen
    const handleBlur = () => {
      if (!document.hidden && Date.now() - activatedAtRef.current > 3000) {
        addViolation("alt_tab");
      }
    };

    // Right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("right_click");
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+Tab, Ctrl+W
      if (e.ctrlKey && ["c", "v", "Tab", "w", "t"].includes(e.key)) {
        e.preventDefault();
        addViolation("copy_paste");
      }
      // Block F12 (dev tools)
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, addViolation]);

  const resetCheatDetector = useCallback(() => {
    warningsRef.current = 0;
    violationsRef.current = [];
    setMetrics({
      warnings: 0,
      maxWarnings: 3,
      isViolation: false,
      violations: [],
      lastWarningMessage: "",
    });
  }, []);

  return { metrics, resetCheatDetector };
}
