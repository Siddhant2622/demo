"use client";
import { useState, useRef, useCallback } from "react";

export interface SpeechMetrics {
  wordsPerMinute: number;
  fillerCount: number;
  fillerBreakdown: Record<string, number>;
  totalWords: number;
  totalPauses: number;
  avgPauseDuration: number;
  fluencyScore: number;
  confidenceScore: number;
  clarityScore: number;
  speakingSpeed: "slow" | "normal" | "fast" | "very_fast";
  answerLengths: number[];
}

const FILLER_WORDS = [
  "umm",
  "um",
  "uh",
  "uhh",
  "like",
  "actually",
  "basically",
  "you know",
  "i mean",
  "sort of",
  "kind of",
  "right",
  "so",
  "well",
  "literally",
];

export function useSpeechAnalyzer() {
  const [metrics, setMetrics] = useState<SpeechMetrics>({
    wordsPerMinute: 0,
    fillerCount: 0,
    fillerBreakdown: {},
    totalWords: 0,
    totalPauses: 0,
    avgPauseDuration: 0,
    fluencyScore: 100,
    confidenceScore: 100,
    clarityScore: 100,
    speakingSpeed: "normal",
    answerLengths: [],
  });

  const startTimeRef = useRef<number>(Date.now());
  const totalWordsRef = useRef(0);
  const fillerCountRef = useRef(0);
  const fillerBreakdownRef = useRef<Record<string, number>>({});
  const pausesRef = useRef<number[]>([]);
  const lastSpeechEndRef = useRef<number>(Date.now());
  const answerLengthsRef = useRef<number[]>([]);

  const analyzeAnswer = useCallback((text: string) => {
    const now = Date.now();
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const wordCount = words.length;

    totalWordsRef.current += wordCount;
    answerLengthsRef.current.push(wordCount);

    // Detect fillers
    const lowerText = text.toLowerCase();
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        fillerCountRef.current += matches.length;
        fillerBreakdownRef.current[filler] =
          (fillerBreakdownRef.current[filler] || 0) + matches.length;
      }
    }

    // Calculate pause since last speech
    const pauseDuration = now - lastSpeechEndRef.current;
    if (pauseDuration > 2000 && pauseDuration < 30000) {
      pausesRef.current.push(pauseDuration);
    }
    lastSpeechEndRef.current = now;

    // Calculate WPM
    const elapsedMinutes = (now - startTimeRef.current) / 60000;
    const wpm =
      elapsedMinutes > 0.1
        ? Math.round(totalWordsRef.current / elapsedMinutes)
        : wordCount * 4; // Estimate for first few seconds

    // Speed classification
    const speed: SpeechMetrics["speakingSpeed"] =
      wpm < 100 ? "slow" : wpm < 150 ? "normal" : wpm < 200 ? "fast" : "very_fast";

    // Fluency score (penalize fillers and long pauses)
    const fillerPenalty = Math.min(
      40,
      (fillerCountRef.current / Math.max(1, totalWordsRef.current)) * 200
    );
    const pausePenalty = Math.min(
      20,
      pausesRef.current.filter((p) => p > 5000).length * 5
    );
    const fluencyScore = Math.max(0, Math.round(100 - fillerPenalty - pausePenalty));

    // Confidence score (based on answer length, speed consistency, fewer pauses)
    const avgLength =
      answerLengthsRef.current.reduce((a, b) => a + b, 0) /
      answerLengthsRef.current.length;
    const lengthBonus = Math.min(30, avgLength * 1.5);
    const speedPenalty = speed === "slow" ? 15 : speed === "very_fast" ? 10 : 0;
    const confidenceScore = Math.max(
      0,
      Math.min(100, Math.round(50 + lengthBonus - speedPenalty - pausePenalty))
    );

    // Clarity score (based on avg word length and structure)
    const avgWordLength =
      words.reduce((sum, w) => sum + w.length, 0) / Math.max(1, words.length);
    const clarityBase = avgWordLength > 3 && avgWordLength < 8 ? 80 : 60;
    const clarityScore = Math.min(100, Math.round(clarityBase + lengthBonus * 0.5));

    const avgPauseDuration =
      pausesRef.current.length > 0
        ? Math.round(
            pausesRef.current.reduce((a, b) => a + b, 0) /
              pausesRef.current.length /
              1000
          )
        : 0;

    setMetrics({
      wordsPerMinute: wpm,
      fillerCount: fillerCountRef.current,
      fillerBreakdown: { ...fillerBreakdownRef.current },
      totalWords: totalWordsRef.current,
      totalPauses: pausesRef.current.length,
      avgPauseDuration,
      fluencyScore,
      confidenceScore,
      clarityScore,
      speakingSpeed: speed,
      answerLengths: [...answerLengthsRef.current],
    });
  }, []);

  const resetAnalyzer = useCallback(() => {
    startTimeRef.current = Date.now();
    totalWordsRef.current = 0;
    fillerCountRef.current = 0;
    fillerBreakdownRef.current = {};
    pausesRef.current = [];
    lastSpeechEndRef.current = Date.now();
    answerLengthsRef.current = [];
    setMetrics({
      wordsPerMinute: 0,
      fillerCount: 0,
      fillerBreakdown: {},
      totalWords: 0,
      totalPauses: 0,
      avgPauseDuration: 0,
      fluencyScore: 100,
      confidenceScore: 100,
      clarityScore: 100,
      speakingSpeed: "normal",
      answerLengths: [],
    });
  }, []);

  return { metrics, analyzeAnswer, resetAnalyzer };
}
