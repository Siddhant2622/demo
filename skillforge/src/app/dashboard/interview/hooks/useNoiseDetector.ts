"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export type NoiseLevel = "silent" | "low" | "moderate" | "high" | "critical";

export interface NoiseMetrics {
  level: NoiseLevel;
  decibels: number;
  warnings: number;
  maxWarnings: number;
  isViolation: boolean;
  history: number[];
}

const NOISE_THRESHOLDS = {
  silent: 10,
  low: 25,
  moderate: 45,
  high: 65,
  critical: 80,
};

export function useNoiseDetector(stream: MediaStream | null, active: boolean) {
  const [metrics, setMetrics] = useState<NoiseMetrics>({
    level: "silent",
    decibels: 0,
    warnings: 0,
    maxWarnings: 3,
    isViolation: false,
    history: [],
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const warningsRef = useRef(0);
  const sustainedHighRef = useRef(0);

  const classifyNoise = useCallback((db: number): NoiseLevel => {
    if (db >= NOISE_THRESHOLDS.critical) return "critical";
    if (db >= NOISE_THRESHOLDS.high) return "high";
    if (db >= NOISE_THRESHOLDS.moderate) return "moderate";
    if (db >= NOISE_THRESHOLDS.low) return "low";
    return "silent";
  }, []);

  useEffect(() => {
    if (!stream || !active) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const db = Math.round((rms / 255) * 100);
        const level = classifyNoise(db);

        // Track sustained high noise
        if (level === "high" || level === "critical") {
          sustainedHighRef.current++;
          if (sustainedHighRef.current > 60) {
            // ~2 seconds of sustained high noise
            warningsRef.current = Math.min(warningsRef.current + 1, 3);
            sustainedHighRef.current = 0;
          }
        } else {
          sustainedHighRef.current = Math.max(0, sustainedHighRef.current - 2);
        }

        setMetrics((prev) => ({
          level,
          decibels: db,
          warnings: warningsRef.current,
          maxWarnings: 3,
          isViolation: warningsRef.current >= 3,
          history: [...prev.history.slice(-59), db],
        }));

        rafRef.current = requestAnimationFrame(analyze);
      };

      rafRef.current = requestAnimationFrame(analyze);
    } catch (err) {
      console.error("Noise detector init failed:", err);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, [stream, active, classifyNoise]);

  const resetWarnings = useCallback(() => {
    warningsRef.current = 0;
    setMetrics((prev) => ({ ...prev, warnings: 0, isViolation: false }));
  }, []);

  return { metrics, resetWarnings };
}
