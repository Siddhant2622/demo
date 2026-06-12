"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mic, Settings, Play, Square, Activity, AlertTriangle, User, BrainCircuit, Keyboard, MicOff, Send, UserCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Components
import SetupScreen, { CandidateProfile } from "./components/SetupScreen";
import LobbyScreen from "./components/LobbyScreen";
import AiAvatar from "./components/AiAvatar";
import TranscriptPanel, { TranscriptMessage } from "./components/TranscriptPanel";
import MonitorPanel from "./components/MonitorPanel";
import WarningOverlay from "./components/WarningOverlay";
import ScoreCard, { InterviewScorecard } from "./components/ScoreCard";

// Hooks
import { useNoiseDetector } from "./hooks/useNoiseDetector";
import { useEyeContact } from "./hooks/useEyeContact";
import { useFaceDetector } from "./hooks/useFaceDetector";
import { useSpeechAnalyzer } from "./hooks/useSpeechAnalyzer";
import { useCheatDetector } from "./hooks/useCheatDetector";
import { useStressDetector } from "./hooks/useStressDetector";

type InterviewPhase = "setup" | "lobby" | "interviewing" | "evaluating" | "results";

// Define SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function InterviewPage() {
  const { user } = useAuth();

  // ─── STATE ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState<InterviewPhase>("setup");
  const [isCheatingWarning, setIsCheatingWarning] = useState(false);
  const phaseRef = useRef<InterviewPhase>("setup");
  const [mounted, setMounted] = useState(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiSubtitle, setAiSubtitle] = useState("");

  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Monitoring States
  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);

  // Setup / Context States
  const [existingResumeText, setExistingResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);

  // Warning Overlay States
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState<"fullscreen" | "noise" | "face" | "cheat">("fullscreen");
  const [warningMessage, setWarningMessage] = useState("");
  const [warningLevel, setWarningLevel] = useState<number>(1);
  const [fsCountdown, setFsCountdown] = useState(10);

  // ─── REFS ───────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const messagesRef = useRef(messages);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const isSubmittingRef = useRef(false);
  const questionNumRef = useRef(questionNumber);
  const difficultyRef = useRef(difficulty);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Chat History specifically for the robust API logic
  const historyRef = useRef<{role: string, text: string}[]>([]);

  // Context refs
  const candidateProfileRef = useRef(candidateProfile);
  const existingResumeRef = useRef(existingResumeText);
  const targetRoleRef = useRef(targetRole);
  const elapsedTimeRef = useRef(elapsedTime);
  const isMutedRef = useRef(isMuted);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { candidateProfileRef.current = candidateProfile; }, [candidateProfile]);
  useEffect(() => { existingResumeRef.current = existingResumeText; }, [existingResumeText]);
  useEffect(() => { targetRoleRef.current = targetRole; }, [targetRole]);
  useEffect(() => { elapsedTimeRef.current = elapsedTime; }, [elapsedTime]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => { setMounted(true); }, []);

  // ─── INITIAL LOAD ───────────────────────────────────────────────
  useEffect(() => {
    const loadExistingData = async () => {
      let localResumeText = null;
      try {
        localResumeText = localStorage.getItem('skillforge_resume_text') || localStorage.getItem('resumeText') || localStorage.getItem('careerAnalysis') ? JSON.parse(localStorage.getItem('careerAnalysis') || '{}').extractedResumeText : null;
        if (localResumeText) setExistingResumeText(localResumeText);
      } catch (e) {}

      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const fbResume = (data as any).resumeText || (data as any).careerAnalysis?.extractedResumeText || (data as any).personal_info?.experience;
          if (!localResumeText && fbResume) {
            setExistingResumeText(fbResume);
          }
          if (data.targetRole) setTargetRole(data.targetRole);
        }

        // Also try to fetch from extension profile if still nothing
        if (!localResumeText && !existingResumeText) {
          try {
            const res = await fetch(`http://localhost:8000/api/extension/profile?user_id=${user.uid}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.experience && data.experience !== "Experience extracted from resume.") {
                setExistingResumeText(data.experience);
              }
            }
          } catch(e) {}
        }

      } catch (err) {
        console.error("Failed to load existing data:", err);
      }
    };
    loadExistingData();
  }, [user]);

  // ─── TIMER ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "interviewing") {
      const id = window.setInterval(() => setElapsedTime((p) => p + 1), 1000);
      timerRef.current = id as any;
      return () => clearInterval(id);
    }
  }, [phase]);

  // ─── PIP VIDEO BINDING ──────────────────────────────────────────
  useEffect(() => {
    if (phase === "interviewing" && pipVideoRef.current && streamRef.current) {
      pipVideoRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  // ─── HOOKS (Monitoring) ─────────────────────────────────────────
  const { metrics: noiseMetrics } = useNoiseDetector(stream, phase === "interviewing");
  const eyeContactMetrics = useEyeContact(pipVideoRef, phase === "interviewing");
  const faceMetrics = useFaceDetector(pipVideoRef, phase === "interviewing");
  const { metrics: speechMetrics, analyzeAnswer } = useSpeechAnalyzer();
  const stressMetrics = useStressDetector(stream, phase === "interviewing");

  // ─── ANTI-CHEAT HANDLERS ────────────────────────────────────────
  const triggerWarning = useCallback((type: "fullscreen" | "noise" | "face" | "cheat", msg: string, level: number) => {
    if (phaseRef.current !== "interviewing") return;
    setWarningType(type);
    setWarningMessage(msg);
    setWarningLevel(level);
    setShowWarning(true);

    if (type === "fullscreen") {
      setFsCountdown(10);
      if (countdownRef.current) clearInterval(countdownRef.current);
      const id = window.setInterval(() => {
        setFsCountdown(p => {
          if (p <= 1) {
            clearInterval(id);
            endInterview(true);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      countdownRef.current = id as any;
    }
  }, []);

  const { metrics: cheatMetrics } = useCheatDetector(phase === "interviewing");

  useEffect(() => {
    if (cheatMetrics.isViolation && cheatMetrics.violations.length > 0) {
      const latest = cheatMetrics.violations[cheatMetrics.violations.length - 1];
      triggerWarning("cheat", latest.message, 3);
    }
  }, [cheatMetrics.warnings, cheatMetrics.isViolation, triggerWarning]);

  useEffect(() => {
    if (phase !== "interviewing") return;
    const faceCount = faceMetrics.faceCount;
    if (faceCount > 1) triggerWarning("face", "Multiple faces detected in frame.", 3);
    else if (faceCount === 0) triggerWarning("face", "No face detected. Please stay in frame.", 1);
    else if (warningType === "face") setShowWarning(false);
  }, [phase, faceMetrics.faceCount, warningType, triggerWarning]);

  // ═══════════════════════════════════════════════════════════════
  //  PHASE TRANSITIONS
  // ═══════════════════════════════════════════════════════════════

  const handleSetupComplete = (profile: CandidateProfile) => {
    setCandidateProfile(profile);
    setExistingResumeText((profile as any).resumeText || existingResumeText);
    setTargetRole((profile as any).targetRole || targetRole);
    setPhase("lobby");
  };

  const handleStreamReady = useCallback((s: MediaStream) => {
    setStream(s);
    streamRef.current = s;
  }, []);

  const startInterview = async () => {
    // Aggressive Fullscreen Request just like the user's code
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      elem.requestFullscreen({ navigationUI: 'hide' }).catch((e: any) => console.log("Fullscreen ignored", e));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    setPhase("interviewing");
    setMessages([]);
    historyRef.current = [];
    setElapsedTime(0);
    setQuestionNumber(1);
    questionNumRef.current = 1;
    isSubmittingRef.current = false;
    
    const greeting = "Hello! I am your System Interviewer. We will begin with a few technical questions. Are you ready?";
    
    setTimeout(() => {
      setAiSubtitle(greeting);
      const aiMsg: TranscriptMessage = { role: "model", text: greeting, timestamp: Date.now() };
      setMessages([aiMsg]);
      speakText(greeting);
    }, 1000);
  };

  const endInterview = async (dueToCheating = false) => {
    setPhase("evaluating");
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    window.speechSynthesis.cancel();
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    try { await document.exitFullscreen(); } catch {}

    // Stop camera and mic tracks completely
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    // Generate Final Scorecard
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: messagesRef.current,
          targetRole: targetRoleRef.current,
          candidateProfile: candidateProfileRef.current,
          duration: elapsedTimeRef.current,
          monitoringData: {
            noise: noiseMetrics,
            eyeContact: eyeContactMetrics,
            speech: speechMetrics,
            stress: stressMetrics
          },
          cheatingFlagged: dueToCheating
        })
      });
      const data = await res.json();
      setScorecard(data.scorecard || data);
      setPhase("results");
    } catch (err) {
      console.error(err);
      alert("Failed to generate scorecard. Please try again.");
      setPhase("setup");
    }
  };

  const handleRestart = () => {
    setPhase("setup");
    setScorecard(null);
  };

  // ═══════════════════════════════════════════════════════════════
  //  SPEECH SYNTHESIS & RECOGNITION (ROBUST VERSION)
  // ═══════════════════════════════════════════════════════════════

  const speakText = async (text: string, isComplete: boolean = false) => {
    window.speechSynthesis.cancel(); 
    
    const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise(resolve => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
          return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        };
      });
    };

    const voices = await getVoices();
    const femaleVoice = voices.find(v => (v.name.includes("Female") || v.name.includes("Google UK English Female") || v.name.includes("Aria") || v.name.includes("Jenny") || v.name.includes("Zira") || v.name.includes("Samantha")) && v.lang.includes("en"));
    
    // Split text into sentences to avoid Chrome TTS cutoff bug
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentIndex = 0;

    const speakNextSentence = () => {
      if (phaseRef.current !== "interviewing") {
        window.speechSynthesis.cancel();
        setIsAiSpeaking(false);
        return;
      }

      if (currentIndex >= sentences.length) {
        setIsAiSpeaking(false);
        if (isComplete) {
          endInterview(false);
        } else {
          startListening();
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[currentIndex].trim());
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.08;

      if (currentIndex === 0) setIsAiSpeaking(true);

      utterance.onend = () => {
        currentIndex++;
        speakNextSentence();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  const startListening = useCallback(() => {
    if (isMutedRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      setShowTextInput(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening even if user pauses
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognitionRef.current = recognition;

    let currentSessionTranscript = '';
    let silenceTimer: NodeJS.Timeout;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalPart = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalPart += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      currentSessionTranscript += finalPart;
      const displayTranscript = currentSessionTranscript + interimTranscript;
      
      if (displayTranscript.trim()) {
        setCurrentTranscript(displayTranscript);
      }

      // If user stops talking for 3 seconds, auto-submit the answer
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        if (displayTranscript.trim() && !isAiSpeakingRef.current) {
          recognition.stop();
          submitAnswer(displayTranscript);
        }
      }, 3000);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech error:", e.error);
      if (e.error === "not-allowed" || e.error === "service-not-available") {
        setShowTextInput(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try { 
      recognition.start(); 
      setIsListening(true);
    } catch (e) {}
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  SUBMIT ANSWER (ROBUST API LOGIC)
  // ═══════════════════════════════════════════════════════════════

  const submitAnswer = async (answerText: string) => {
    if (!answerText.trim() || isAiSpeakingRef.current || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setCurrentTranscript("");
    setIsAiThinking(true);
    setAiSubtitle("Thinking...");
    
    // Add User Message to UI
    const userMsg: TranscriptMessage = { role: "user", text: answerText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    analyzeAnswer(answerText);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: historyRef.current, 
          answer: answerText, 
          role: targetRoleRef.current,
          resumeText: existingResumeRef.current,
          questionNumber: questionNumRef.current
        })
      });
      
      const data = await res.json();
      
      if (data.is_cheating_detected) {
        setIsCheatingWarning(true);
        endInterview(true);
        return;
      }
      
      // Update local history reference specifically for API context
      historyRef.current = [...historyRef.current, { role: "user", text: answerText }, { role: "model", text: data.reply }];
      
      // Update UI and states
      if (data.difficulty) setDifficulty(data.difficulty);
      
      const reply = data.reply || "Could you elaborate on that?";
      const aiMsg: TranscriptMessage = { role: "model", text: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setAiSubtitle(reply);
      
      questionNumRef.current += 1;
      setQuestionNumber(questionNumRef.current);

      setIsAiThinking(false);
      isSubmittingRef.current = false;
      
      // Stop recognition before System speaks
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
      
      if (phaseRef.current === "interviewing") {
        speakText(reply, !!data.isComplete);
      }
      
    } catch (error) {
      console.error("Failed to fetch response", error);
      const fallback = "Sorry, I had trouble understanding that. Could you repeat your answer?";
      setAiSubtitle(fallback);
      setIsAiThinking(false);
      isSubmittingRef.current = false;
      if (phaseRef.current === "interviewing") {
        speakText(fallback);
      }
    }
  };

  const handleManualSubmit = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (currentTranscript.trim()) submitAnswer(currentTranscript);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      submitAnswer(textInput);
      setTextInput("");
      setShowTextInput(false);
    }
  };

  const toggleMute = () => {
    const next = !isMuted; setIsMuted(next);
    if (next && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (next) setShowTextInput(true);
  };

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  if (phase === "setup") return <SetupScreen onComplete={handleSetupComplete} existingResumeText={existingResumeText} />;

  if (phase === "lobby") return <LobbyScreen onStart={startInterview} stream={stream} onStreamReady={handleStreamReady} />;

  if (phase === "evaluating") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mb-6" />
        <h2 className="text-xl font-bold text-foreground mb-2">Generating Your Scorecard</h2>
        <p className="text-muted-foreground text-sm">System is evaluating your performance across 11 dimensions...</p>
      </div>
    );
  }

  if (phase === "results" && scorecard) return <ScoreCard scorecard={scorecard} onRestart={handleRestart} />;

  // ─── FULLSCREEN INTERVIEW UI ────────────────────────────────────
  if (phase === "interviewing" && mounted) {
    const overlayContent = (
      <div className="fixed inset-0 z-[99999] bg-background flex overflow-hidden text-foreground">
        {/* Warning Overlay */}
        <WarningOverlay show={showWarning} type={warningType} warningLevel={warningLevel}
          message={warningMessage} countdown={warningType === "fullscreen" ? fsCountdown : undefined}
          onReturn={warningType === "fullscreen" ? async () => {
            try { await document.documentElement.requestFullscreen(); setShowWarning(false); if (countdownRef.current) clearInterval(countdownRef.current); } catch {}
          } : undefined}
          onDismiss={() => setShowWarning(false)} />

        {/* Cheating Modal */}
        <Dialog open={isCheatingWarning} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md border-red-500 bg-background/95 backdrop-blur-xl z-[200]">
            <DialogHeader>
              <DialogTitle className="text-red-500 flex items-center gap-2 text-xl">
                <AlertTriangle className="w-6 h-6" /> Interview Terminated
              </DialogTitle>
              <DialogDescription className="pt-2 text-base text-foreground/90">
                Unauthorized System Assistance Detected. Your responses strongly indicated the use of System-generated text or reading from a script.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="p-4 bg-red-500/10 rounded-full mb-4">
                <User className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-muted-foreground text-center text-sm">This incident has been recorded and the interview has been automatically ended.</p>
            </div>
            <Button onClick={() => setIsCheatingWarning(false)} className="w-full bg-secondary hover:bg-secondary/80 text-foreground">
              Acknowledge & Close
            </Button>
          </DialogContent>
        </Dialog>

        {/* Main Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Top Bar */}
          <div className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/30 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-foreground/80">SkillForge System Interview</span>
              <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground border border-border">{targetRole}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">Q#{questionNumber}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                difficulty === "Beginner" ? "text-green-400 border-green-500/30 bg-green-500/10" :
                difficulty === "Intermediate" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" :
                difficulty === "Advanced" ? "text-orange-400 border-orange-500/30 bg-orange-500/10" :
                "text-red-400 border-red-500/30 bg-red-500/10"
              }`}>{difficulty}</span>
            </div>
          </div>

          {/* Center: Avatar + Subtitles */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px]" />
            </div>

            <AiAvatar isSpeaking={isAiSpeaking} isListening={isListening} isThinking={isAiThinking} />

            {/* System Subtitle */}
            <AnimatePresence mode="wait">
              {aiSubtitle && (
                <motion.div key={aiSubtitle.slice(0, 30)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-12 max-w-3xl mx-4 px-8 py-5 bg-card/80 backdrop-blur-lg rounded-2xl border border-border text-center shadow-2xl">
                  <p className="text-lg text-foreground/90 font-medium leading-relaxed">{aiSubtitle}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Bar: Controls */}
          <div className="h-20 flex items-center justify-between px-8 border-t border-border bg-card/30 backdrop-blur-xl z-10">
            <Button variant="ghost" onClick={() => endInterview(false)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
              <Square className="w-4 h-4 mr-2" /> End Interview
            </Button>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={toggleMute}
                className={`rounded-full border-border ${isMuted ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={() => setShowTextInput(!showTextInput)}
                className={`rounded-full border-border ${showTextInput ? "bg-primary/20 text-primary border-primary/30" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                <Keyboard className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Live Transcript Overlay */}
          <AnimatePresence>
            {currentTranscript && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 z-20">
                <div className="bg-card/90 backdrop-blur-2xl border border-primary/30 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
                  <p className="text-foreground text-center text-lg leading-relaxed mb-4">{currentTranscript}</p>
                  <Button onClick={handleManualSubmit} disabled={isSubmittingRef.current} className="bg-primary hover:bg-primary/90 rounded-full h-9 px-6 text-sm shadow-[0_0_20px_-5px_var(--primary)] text-primary-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Submit Answer
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Text Input Fallback Overlay */}
          <AnimatePresence>
            {showTextInput && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
               className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 z-20">
                 <form onSubmit={handleTextSubmit} className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl flex items-center gap-2">
                   <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
                     placeholder="Type your answer here..."
                     className="flex-1 bg-transparent border-none text-foreground focus:ring-0 px-4 placeholder:text-muted-foreground text-sm"
                     autoFocus
                   />
                   <Button type="submit" disabled={isSubmittingRef.current || !textInput.trim()} size="icon" className="rounded-xl bg-primary hover:bg-primary/90 h-10 w-10">
                     <Send className="w-4 h-4" />
                   </Button>
                 </form>
               </motion.div>
            )}
          </AnimatePresence>

          {/* PIP Video (User) */}
          <div className="absolute bottom-24 right-8 w-60 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl z-20 bg-black/50">
            <video ref={pipVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-medium text-red-400 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
            </div>
            {eyeContactMetrics?.contactPercent === 0 && (
              <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <AlertTriangle className="w-6 h-6 text-red-400 mb-1" />
                <span className="text-[10px] font-medium text-red-100 bg-red-900/60 px-2 py-0.5 rounded">Face Not Detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Telemetry & Transcript */}
        <div className="w-80 flex flex-col border-l border-border bg-card/80 backdrop-blur-2xl z-10">
          <MonitorPanel 
            elapsedTime={elapsedTime} questionNumber={questionNumber} difficulty={difficulty}
            noise={noiseMetrics} eyeContact={eyeContactMetrics} speech={speechMetrics} stress={stressMetrics}
          />
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
            <TranscriptPanel messages={messages} currentTranscript={currentTranscript} isAiThinking={isAiThinking} />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>
    );
    
    return createPortal(overlayContent, document.body);
  }

  return null;
}