"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export interface EyeContactMetrics {
  contactPercent: number;
  focusLevel: "excellent" | "good" | "average" | "needs_improvement";
  lookingAwayCount: number;
  isLookingAtScreen: boolean;
  sessionHistory: boolean[];
}

export function useEyeContact(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean
) {
  const [metrics, setMetrics] = useState<EyeContactMetrics>({
    contactPercent: 100,
    focusLevel: "excellent",
    lookingAwayCount: 0,
    isLookingAtScreen: true,
    sessionHistory: [],
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const totalSamples = useRef(0);
  const contactSamples = useRef(0);
  const lookAwayCount = useRef(0);
  const wasLooking = useRef(true);

  const getFocusLevel = useCallback(
    (pct: number): EyeContactMetrics["focusLevel"] => {
      if (pct >= 80) return "excellent";
      if (pct >= 60) return "good";
      if (pct >= 40) return "average";
      return "needs_improvement";
    },
    []
  );

  useEffect(() => {
    if (!active || !videoRef.current) return;

    // Create offscreen canvas for analysis
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    canvasRef.current = canvas;

    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 160, 120);

      // Analyze center region vs edges to estimate face centering
      const centerData = ctx.getImageData(40, 20, 80, 80);
      const topData = ctx.getImageData(40, 0, 80, 20);
      const bottomData = ctx.getImageData(40, 100, 80, 20);

      const avgBrightness = (data: ImageData) => {
        let sum = 0;
        for (let i = 0; i < data.data.length; i += 4) {
          sum += (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
        }
        return sum / (data.data.length / 4);
      };

      const centerBright = avgBrightness(centerData);
      const topBright = avgBrightness(topData);
      const bottomBright = avgBrightness(bottomData);

      // Face is centered if center is brighter (skin) and there's significant pixel variance
      const centerVariance = getVariance(centerData);
      const hasFace = centerVariance > 500 && centerBright > 40;
      const isCentered =
        hasFace && centerBright > topBright * 0.7 && centerBright > 30;

      totalSamples.current++;
      if (isCentered) {
        contactSamples.current++;
        if (!wasLooking.current) {
          wasLooking.current = true;
        }
      } else {
        if (wasLooking.current) {
          lookAwayCount.current++;
          wasLooking.current = false;
        }
      }

      const pct =
        totalSamples.current > 0
          ? Math.round((contactSamples.current / totalSamples.current) * 100)
          : 100;

      setMetrics((prev) => ({
        contactPercent: pct,
        focusLevel: getFocusLevel(pct),
        lookingAwayCount: lookAwayCount.current,
        isLookingAtScreen: isCentered,
        sessionHistory: [...prev.sessionHistory.slice(-119), isCentered],
      }));
    }, 500);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [active, videoRef, getFocusLevel]);

  return metrics;
}

function getVariance(data: ImageData): number {
  let sum = 0;
  let sumSq = 0;
  const count = data.data.length / 4;
  for (let i = 0; i < data.data.length; i += 4) {
    const gray = (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
    sum += gray;
    sumSq += gray * gray;
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}
