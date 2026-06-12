"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Mic,
  Monitor,
  Volume2,
  Shield,
  CheckCircle2,
  XCircle,
  Play,
  AlertTriangle,
} from "lucide-react";

interface LobbyScreenProps {
  onStart: () => void;
  stream: MediaStream | null;
  onStreamReady: (stream: MediaStream) => void;
}

export default function LobbyScreen({
  onStart,
  stream,
  onStreamReady,
}: LobbyScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    browser: false,
    fullscreen: true,
  });
  const [micLevel, setMicLevel] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animRef = useRef<number>(0);

  // Initialize media
  useEffect(() => {
    const initMedia = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: true,
        });
        onStreamReady(s);
        setChecks((prev) => ({ ...prev, camera: true, microphone: true }));

        // Check browser support
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        setChecks((prev) => ({
          ...prev,
          browser: !!SpeechRecognition && !!window.speechSynthesis,
        }));
      } catch (err) {
        console.error("Media init failed:", err);
        // Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          onStreamReady(audioStream);
          setChecks((prev) => ({ ...prev, microphone: true }));
        } catch {
          // Proceed anyway for demo
        }
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        setChecks((prev) => ({
          ...prev,
          browser: !!SpeechRecognition && !!window.speechSynthesis,
        }));
      }
    };
    initMedia();
  }, [onStreamReady]);

  // Bind video
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Monitor mic level
  useEffect(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        setMicLevel(Math.round((avg / 255) * 100));
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(animRef.current);
        if (ctx.state !== "closed") ctx.close();
      };
    } catch {
      // Audio context failed
    }
  }, [stream]);

  const allChecked = checks.camera && checks.microphone && checks.browser;

  useEffect(() => {
    if (countdown === 0) {
      onStart();
    }
  }, [countdown, onStart]);

  const handleStart = () => {
    setShowRules(false);
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Countdown Overlay */}
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-background/95 flex flex-col items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-8xl font-bold text-primary"
            >
              {countdown}
            </motion.div>
            <p className="text-muted-foreground mt-4 text-sm">
              Interview starting...
            </p>
          </motion.div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Interview Lobby
          </h1>
          <p className="text-muted-foreground text-sm">
            Let&apos;s make sure everything is ready before we begin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Preview */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="relative aspect-video bg-secondary">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {!checks.camera && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Camera initializing...
                    </p>
                  </div>
                </div>
              )}
              {/* Face detection overlay hint */}
              {checks.camera && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-48 border-2 border-dashed border-primary/30 rounded-[50%]" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-[10px] text-primary">
                      Position your face in the oval
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mic Level */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 mb-2">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Microphone Level
                </span>
              </div>
              <div className="flex gap-0.5 h-4">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      i < (micLevel / 100) * 30
                        ? i < 20
                          ? "bg-emerald-500"
                          : i < 25
                          ? "bg-amber-500"
                          : "bg-red-500"
                        : "bg-border"
                    }`}
                    animate={{
                      scaleY: i < (micLevel / 100) * 30 ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Speak to test your microphone
              </p>
            </div>
          </div>

          {/* System Checks */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Pre-Flight Checks
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Camera Access",
                    checked: checks.camera,
                    icon: Camera,
                  },
                  {
                    label: "Microphone Access",
                    checked: checks.microphone,
                    icon: Mic,
                  },
                  {
                    label: "Speech API Support",
                    checked: checks.browser,
                    icon: Monitor,
                  },
                  {
                    label: "Fullscreen Support",
                    checked: checks.fullscreen,
                    icon: Monitor,
                  },
                ].map(({ label, checked, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    {checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Interview Rules
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Interview will run in fullscreen mode
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Tab switching and copy-paste are monitored
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Camera and microphone must stay active
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  3 violations will terminate the interview
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Answer questions by speaking naturally
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={!allChecked && !checks.microphone}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Interview
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
