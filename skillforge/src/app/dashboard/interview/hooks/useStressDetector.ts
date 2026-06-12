"use client";
import { useState, useEffect, useRef } from "react";

export type StressLevel = "calm" | "mild" | "moderate" | "high";

export interface StressMetrics {
  level: StressLevel;
  score: number; // 0-100, higher = more stressed
  pitchVariability: number;
  voiceStability: number;
  history: number[];
}

export function useStressDetector(stream: MediaStream | null, active: boolean) {
  const [metrics, setMetrics] = useState<StressMetrics>({
    level: "calm",
    score: 10,
    pitchVariability: 0,
    voiceStability: 95,
    history: [],
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const pitchHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    if (!stream || !active) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Float32Array(analyser.fftSize);
      let frameCount = 0;

      const analyze = () => {
        if (!analyserRef.current) return;
        frameCount++;

        // Only analyze every 10th frame for performance
        if (frameCount % 10 === 0) {
          analyserRef.current.getFloatTimeDomainData(dataArray);

          // Auto-correlation pitch detection
          const pitch = detectPitch(dataArray, ctx.sampleRate);

          if (pitch > 50 && pitch < 500) {
            pitchHistoryRef.current.push(pitch);
            if (pitchHistoryRef.current.length > 100) {
              pitchHistoryRef.current.shift();
            }
          }

          if (pitchHistoryRef.current.length > 10) {
            const pitches = pitchHistoryRef.current;
            const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
            const variance =
              pitches.reduce((a, b) => a + (b - mean) ** 2, 0) / pitches.length;
            const stdDev = Math.sqrt(variance);

            // Pitch variability as percentage of mean
            const variability = Math.round((stdDev / mean) * 100);

            // Calculate stress score
            const stressFromPitch = Math.min(50, variability * 2);
            const stressFromInstability = Math.min(
              30,
              pitches.length > 20
                ? Math.abs(pitches[pitches.length - 1] - pitches[pitches.length - 2]) *
                  0.5
                : 0
            );
            const rawStress = stressFromPitch + stressFromInstability;
            const score = Math.max(5, Math.min(95, Math.round(rawStress)));

            const level: StressLevel =
              score < 25
                ? "calm"
                : score < 50
                ? "mild"
                : score < 75
                ? "moderate"
                : "high";

            const voiceStability = Math.max(0, 100 - variability * 3);

            setMetrics((prev) => ({
              level,
              score,
              pitchVariability: variability,
              voiceStability: Math.round(voiceStability),
              history: [...prev.history.slice(-59), score],
            }));
          }
        }

        rafRef.current = requestAnimationFrame(analyze);
      };

      rafRef.current = requestAnimationFrame(analyze);
    } catch (err) {
      console.error("Stress detector init failed:", err);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, [stream, active]);

  return metrics;
}

function detectPitch(buffer: Float32Array, sampleRate: number): number {
  // Simple auto-correlation pitch detection
  const SIZE = buffer.length;
  let bestOffset = -1;
  let bestCorrelation = 0;
  let foundGoodCorrelation = false;
  const correlations = new Float32Array(SIZE);

  // Find the RMS of the signal
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.01) return 0; // Not enough signal

  for (let offset = 50; offset < SIZE / 2; offset++) {
    let correlation = 0;
    for (let i = 0; i < SIZE / 2; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / (SIZE / 2);
    correlations[offset] = correlation;

    if (correlation > 0.9) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      break;
    }
  }

  if (bestCorrelation > 0.01 && bestOffset > 0) {
    return sampleRate / bestOffset;
  }
  return 0;
}
