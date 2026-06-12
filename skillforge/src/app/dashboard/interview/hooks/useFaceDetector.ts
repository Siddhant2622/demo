"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export interface FaceDetectionMetrics {
  faceCount: number;
  warnings: number;
  maxWarnings: number;
  isViolation: boolean;
  violations: { timestamp: number; faceCount: number }[];
}

export function useFaceDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean
) {
  const [metrics, setMetrics] = useState<FaceDetectionMetrics>({
    faceCount: 1,
    warnings: 0,
    maxWarnings: 3,
    isViolation: false,
    violations: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const warningsRef = useRef(0);
  const multiDetectCount = useRef(0);

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;

    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 160, 120);

      // Scan for skin-tone regions using HSL analysis
      const imageData = ctx.getImageData(0, 0, 160, 120);
      const skinMap = new Uint8Array(160 * 120);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        // Simple skin detection: R > 95, G > 40, B > 20, max-min > 15
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (
          r > 95 &&
          g > 40 &&
          b > 20 &&
          max - min > 15 &&
          Math.abs(r - g) > 15 &&
          r > g &&
          r > b
        ) {
          skinMap[i / 4] = 1;
        }
      }

      // Count connected skin regions using simple flood fill
      const visited = new Uint8Array(160 * 120);
      let regionCount = 0;

      for (let y = 0; y < 120; y += 8) {
        for (let x = 0; x < 160; x += 8) {
          const idx = y * 160 + x;
          if (skinMap[idx] && !visited[idx]) {
            const size = floodFill(skinMap, visited, x, y, 160, 120);
            if (size > 100) {
              // Minimum region size for a face
              regionCount++;
            }
          }
        }
      }

      const faceCount = Math.max(1, Math.min(regionCount, 5));

      if (faceCount > 1) {
        multiDetectCount.current++;
        if (multiDetectCount.current > 5) {
          // Sustained multi-face
          warningsRef.current = Math.min(warningsRef.current + 1, 3);
          multiDetectCount.current = 0;

          setMetrics((prev) => ({
            faceCount,
            warnings: warningsRef.current,
            maxWarnings: 3,
            isViolation: warningsRef.current >= 3,
            violations: [
              ...prev.violations,
              { timestamp: Date.now(), faceCount },
            ],
          }));
          return;
        }
      } else {
        multiDetectCount.current = Math.max(0, multiDetectCount.current - 1);
      }

      setMetrics((prev) => ({
        ...prev,
        faceCount,
      }));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [active, videoRef]);

  return metrics;
}

function floodFill(
  map: Uint8Array,
  visited: Uint8Array,
  startX: number,
  startY: number,
  w: number,
  h: number
): number {
  const stack = [[startX, startY]];
  let count = 0;

  while (stack.length > 0 && count < 2000) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx] || !map[idx]) continue;
    visited[idx] = 1;
    count++;
    stack.push([x + 4, y], [x - 4, y], [x, y + 4], [x, y - 4]);
  }
  return count;
}
