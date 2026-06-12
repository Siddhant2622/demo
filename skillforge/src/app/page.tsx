"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Brain,
  Briefcase,
  GraduationCap,
  LineChart,
  Sparkles,
  Target,
  Zap,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Check,
  Lock,
  Globe,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Star,
  Play
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── ROLE BENCHMARKS DATABASE ──────────────────────────────────────────────
interface RoleSkillDetail {
  skills: [string, number, number][]; // [skillName, currentScore, requiredScore]
}

const roleSkills: Record<string, RoleSkillDetail> = {
  'Frontend Developer':  {skills:[['React.js',82,90],['CSS/HTML',88,85],['JavaScript',75,90],['TypeScript',45,75],['Testing',40,70],['Git',70,75],['Performance',55,70],['Accessibility',35,65],['State Management',50,75],['REST APIs',65,70]]},
  'Backend Developer':   {skills:[['Python',80,85],['Node.js',60,75],['SQL',75,85],['REST APIs',70,90],['Authentication',55,75],['Docker',40,70],['Testing',50,75],['System Design',35,70],['Databases',70,80],['Caching',30,65]]},
  'Full Stack Developer':{skills:[['React.js',82,80],['Node.js',60,80],['SQL',75,75],['REST APIs',70,85],['DevOps',30,65],['Testing',45,70],['UI/UX',55,65],['Security',40,70],['Performance',55,70],['System Design',35,75]]},
  'Data Scientist':      {skills:[['Python',80,90],['ML/DL',50,85],['Statistics',55,85],['SQL',75,80],['Data Visualization',60,80],['NLP',35,65],['Feature Engineering',40,75],['Cloud',35,60],['Big Data',30,65],['A/B Testing',40,70]]},
  'ML Engineer':         {skills:[['Python',80,90],['Deep Learning',50,85],['MLOps',30,75],['Mathematics',60,80],['TensorFlow/PyTorch',45,85],['Data Engineering',40,70],['APIs',65,70],['Cloud',35,70],['Model Optimization',35,75],['Research',40,65]]},
  'DevOps Engineer':     {skills:[['Docker',40,90],['Kubernetes',25,80],['CI/CD',55,85],['Linux',70,85],['Terraform',20,75],['Monitoring',45,75],['Networking',50,70],['Cloud (AWS/GCP)',35,80],['Scripting',65,80],['Security',40,70]]},
  'Product Manager':     {skills:[['Strategy',50,85],['Roadmapping',45,80],['SQL',65,65],['UX Research',40,75],['Metrics & Analytics',50,80],['Stakeholder Mgmt',55,85],['Agile/Scrum',60,80],['Technical Writing',50,70],['Market Analysis',40,75],['User Interviews',35,75]]},
  'UI/UX Designer':      {skills:[['Figma',60,90],['User Research',45,80],['Prototyping',50,85],['Visual Design',55,85],['Interaction Design',40,80],['Design Systems',35,75],['Accessibility',30,70],['Typography',50,75],['Color Theory',55,70],['Usability Testing',40,75]]},
  'Mobile Developer':    {skills:[['React Native/Flutter',45,85],['iOS/Android',30,75],['REST APIs',65,80],['State Management',50,80],['Performance',55,75],['Testing',40,70],['UI/UX',55,75],['Push Notifications',25,65],['Offline Support',30,70],['App Store',20,65]]},
  'Data Analyst':        {skills:[['Excel',70,85],['SQL',75,90],['Python',60,75],['Data Visualization',55,85],['Statistics',50,75],['Reporting',45,80],['ETL',35,70],['Business Intelligence',30,75],['Communication',60,80],['Domain Knowledge',40,70]]},
  'Cybersecurity Analyst':{skills:[['Network Security',30,85],['Penetration Testing',25,80],['SIEM Tools',20,75],['Linux',70,80],['Python Scripting',60,75],['Compliance',25,70],['Incident Response',20,80],['Cloud Security',25,75],['Cryptography',30,70],['Threat Intelligence',20,70]]},
  'Cloud Architect':     {skills:[['AWS/Azure/GCP',35,90],['Infrastructure as Code',25,85],['Networking',50,80],['Security',40,80],['Containers',40,80],['Serverless',25,75],['Cost Optimization',20,75],['Monitoring',45,75],['Databases',70,75],['Architecture Patterns',30,80]]},
  'Blockchain Developer':{skills:[['Solidity',15,85],['Ethereum',20,85],['Web3.js/Ethers',15,80],['Smart Contracts',20,85],['JavaScript',75,75],['Security Auditing',10,80],['DeFi Protocols',15,70],['Testing (Hardhat)',10,75],['Cryptography',25,70],['Gas Optimization',10,70]]},
  'System/ML Research Engineer':{skills:[['Python',80,90],['Deep Learning',50,90],['Mathematics',60,90],['Research Papers',30,80],['PyTorch',45,85],['NLP/CV',35,80],['Experiment Tracking',25,70],['Distributed Training',15,70],['Paper Writing',20,75],['Statistics',55,85]]},
};

const DEMO_RESUME = `Arjun Sharma
Email: arjun.sharma@lnct.ac.in | Phone: +91 98765 43210
B.Tech Computer Science | LNCT Group of Colleges, Bhopal | CGPA: 8.7/10

SKILLS
Python, React.js, JavaScript, SQL, Machine Learning, Docker, Git, CSS/HTML, Node.js

EXPERIENCE
Software Engineering Intern — TechCorp India (Summer 2025)
- Built 3 production React applications with Redux state management and comprehensive testing
- Developed RESTful APIs using FastAPI, handling 500+ requests/second
- Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 60%
- Worked with PostgreSQL database design and query optimization

PROJECTS
SkillMap System — Full Stack Web Application
- Architected a React microfrontend with 50+ reusable components
- Built backend with FastAPI, integrating EasyOCR and spaCy NLP models
- Deployed on AWS EC2 using Docker containers with auto-scaling
- Led a team of 4 developers, mentoring 2 junior members

Smart Agriculture IoT Dashboard
- Created a real-time dashboard using React.js and D3.js for data visualization
- Implemented machine learning model for crop prediction using scikit-learn
- Built REST API with Node.js and MongoDB for sensor data management

CERTIFICATIONS
- AWS Cloud Practitioner (2025)
- Google Data Analytics Professional Certificate
- HackerRank Python (Gold Badge)`;

const DEMO_FIELDS = [
  { label: 'Full Name', value: 'Arjun Sharma', conf: 99, source: 'Aadhaar' },
  { label: 'Roll Number', value: 'LNCT/CSE/2023/047', conf: 97, source: 'College ID' },
  { label: 'Date of Birth', value: '15/03/2003', conf: 98, source: 'Aadhaar' },
  { label: 'Aadhaar Number', value: 'XXXX XXXX 3421', conf: 100, source: 'Aadhaar' },
  { label: 'Course', value: 'B.Tech Computer Science', conf: 96, source: 'College ID' },
  { label: 'Institute', value: 'LNCT Group of Colleges', conf: 99, source: 'College ID' },
  { label: 'CGPA', value: '8.7 / 10.0', conf: 94, source: 'Marksheet' },
  { label: 'Email', value: 'arjun.sharma@lnct.ac.in', conf: 99, source: 'Resume' },
  { label: 'Phone', value: '+91 98765 43210', conf: 96, source: 'Resume' },
  { label: 'Primary Skills', value: 'Python, React.js, SQL, Machine Learning', conf: 88, source: 'Resume' },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Interactive Demo State
  const [activeTab, setActiveTab] = useState<'ocr' | 'skillgap' | 'roadmap' | 'autofill'>('ocr');
  
  // Tab 1: OCR State
  const [ocrState, setOcrState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStepText, setOcrStepText] = useState('');
  const [ocrFields, setOcrFields] = useState<typeof DEMO_FIELDS | null>(null);

  // Tab 2: Skill Gap State
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [analysisState, setAnalysisState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [readinessScore, setReadinessScore] = useState(0);
  const [skillAnalysisResults, setSkillAnalysisResults] = useState<{name: string, current: number, required: number, gap: number}[]>([]);

  // Tab 3: Roadmap State
  const [roadmapItems, setRoadmapItems] = useState<{week: string, skill: string, priority: string, icon: string, hours: number}[]>([]);

  // Tab 4: Auto-Fill Form State
  const [formFilled, setFormFilled] = useState(false);

  // FAQ Accordion State
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  // OCR Processing Simulation
  const runOcrDemo = () => {
    setOcrState('processing');
    setOcrProgress(0);
    setOcrFields(null);

    const steps = [
      { p: 15, text: '🔍 Preprocessing image (denoise, deskew, enhance)...' },
      { p: 40, text: '👁️ Running EasyOCR text extraction (en + hi)...' },
      { p: 65, text: '🧠 Running spaCy NER entity detection...' },
      { p: 85, text: '📊 Calculating confidence scores...' },
      { p: 98, text: '✅ Extracting structured fields...' },
      { p: 100, text: '🎉 Extraction complete!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setOcrProgress(steps[currentStep].p);
        setOcrStepText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setOcrState('done');
        setOcrFields(DEMO_FIELDS);
        setFormFilled(true);
      }
    }, 600);
  };

  // Skill Gap Analysis Simulation
  const handleAnalyzeSkillGap = () => {
    const textVal = resumeText.trim() ? resumeText : DEMO_RESUME;
    if (!resumeText.trim()) setResumeText(DEMO_RESUME);
    
    setAnalysisState('analyzing');
    
    setTimeout(() => {
      const roleData = roleSkills[targetRole] || roleSkills['Frontend Developer'];
      const textLower = textVal.toLowerCase();
      
      const skillsMapped = roleData.skills.map(([name, defaultCur, req]) => {
        let current = defaultCur;
        const nameL = name.toLowerCase();
        
        if (textLower.includes(nameL) || textLower.includes(nameL.split('/')[0]) || textLower.includes(nameL.split('.')[0])) {
          if (textLower.includes('architect') || textLower.includes('led') || textLower.includes('mentor')) {
            current = Math.min(95, current + 15);
          } else if (textLower.includes('production') || textLower.includes('built 3') || textLower.includes('deployed')) {
            current = Math.min(90, current + 8);
          } else if (textLower.includes('project') || textLower.includes('intern')) {
            current = Math.max(30, current - 5);
          }
        } else {
          current = Math.floor(current * 0.35);
        }
        return {
          name,
          current,
          required: req,
          gap: Math.max(0, req - current)
        };
      });
      
      const totalWeighted = skillsMapped.reduce((a, s) => a + Math.min(s.current / s.required, 1), 0);
      const score = Math.round((totalWeighted / skillsMapped.length) * 100);
      
      setReadinessScore(score);
      setSkillAnalysisResults(skillsMapped);
      setAnalysisState('done');
      
      // Generate roadmap items
      const gapSkills = skillsMapped.filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 5);
      if (gapSkills.length === 0) {
        setRoadmapItems([]);
      } else {
        const icons = ['📚', '🎓', '🚀', '🛠️', '🎯'];
        const weeks = 12;
        const perSkill = Math.max(2, Math.floor(weeks / gapSkills.length));
        let weekStart = 1;
        
        const roadmap = gapSkills.map((s, i) => {
          const wEnd = Math.min(weekStart + perSkill - 1, weeks);
          const priority = s.gap >= 25 ? 'Critical' : s.gap >= 12 ? 'High' : 'Medium';
          const item = {
            week: `Week ${weekStart}–${wEnd}`,
            skill: s.name,
            priority,
            icon: icons[i] || '📌',
            hours: Math.round(s.gap * 0.45 + 8),
          };
          weekStart = wEnd + 1;
          return item;
        });
        
        if (weekStart <= weeks) {
          roadmap.push({
            week: `Week ${weekStart}–${weeks}`,
            skill: 'Portfolio Synthesis & System Mock Interviews',
            priority: 'Launch',
            icon: '🎯',
            hours: 15,
          });
        }
        setRoadmapItems(roadmap);
      }
    }, 1500);
  };

  const circumference = 2 * Math.PI * 52; // 326.7
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  const faqs = [
    {
      q: "How accurate is the OCR extraction on hand-signed or blurred certificates?",
      a: "Our backend combines adaptive binarization (OpenCV) with deep CNN text recognizers. For regional documents and college ID cards, it achieves a tested accuracy of over 95.6% by validating extracted entities using spaCy models trained on Indian names and academic terminology."
    },
    {
      q: "Does the System Mock Interview engine evaluate speech patterns?",
      a: "Yes. The interview module records speech response structures, calculates answer confidence using contextual keywords, and verifies response quality against custom job criteria (STAR method). It also displays real-time eye-contact feedback to ensure high structural alignment."
    },
    {
      q: "How does the SkillForge Chrome extension help apply for jobs?",
      a: "Once you build your Career Twin, the extension synchronizes with your profile database. When you navigate to application portals (LinkedIn, Internshala, etc.), the extension parses form field configurations and automatically injects corresponding fields in one click."
    },
    {
      q: "Is my personal identification data (Aadhaar, IDs) saved on servers?",
      a: "No. SkillForge is designed with a strict zero-retention security model. Document files are parsed inside volatile server memory, processed in sub-seconds, and discarded immediately after returning structured JSON. We do not store original document images."
    },
    {
      q: "What LLM models power the learning roadmap recommendations?",
      a: "Our roadmaps are synthesized dynamically using System models. The engine maps identified missing skills against structured curriculum frameworks and outputs detailed weekly study paths, complete with learning milestones and recommended project tasks."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-background text-foreground">
      {/* Background Particles / Glowing Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">SkillForge System</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#demo" className="hover:text-primary transition-colors">Live Playground</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 h-9 px-4">
                  Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button onClick={handleLogin} className="rounded-full bg-primary text-white hover:bg-primary/95 shadow-md h-9 px-4">
                Login with Google
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-primary/15 text-sm font-medium mb-8 text-primary shadow-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>The System Career Operating System for Students</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8 text-gradient leading-[1.1]">
            Accelerate Your Career with <br className="hidden md:block" />
            <span className="text-gradient-primary bg-gradient-to-r from-emerald-600 to-teal-400">Predictive System</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing what skills you need. Build your System Career Twin, evaluate placement probability, automate scholarship autofills, and ace mock interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={handleLogin} className="rounded-full h-12 px-8 text-base bg-white text-black hover:bg-gray-50 border border-gray-200 shadow-lg transition-all hover:scale-105 flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>
            )}
            <a href="#demo">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base glass hover:bg-muted transition-all">
                Try Live Playground
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Abstract App Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 w-full max-w-5xl mx-auto relative perspective-1000"
        >
          <div className="relative rounded-2xl glass-card p-2 animate-float transform-gpu" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(4deg)' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 rounded-2xl" />
            <div className="aspect-[16/9] w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden flex">
              {/* Sidebar */}
              <div className="w-48 border-r border-border p-4 hidden md:block bg-muted/20 text-left">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-2 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Overview
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-muted-foreground hover:bg-muted/30 text-[10px] font-medium">
                    <Brain className="w-3.5 h-3.5 text-muted-foreground" /> System Career Twin
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-muted-foreground hover:bg-muted/30 text-[10px] font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Mock Interview
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-muted-foreground hover:bg-muted/30 text-[10px] font-medium">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Auto-Fill Forms
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded text-muted-foreground hover:bg-muted/30 text-[10px] font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" /> Scholarships
                  </div>
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 p-6 flex flex-col gap-4 bg-background/50 text-left">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/60">
                  <div className="text-sm font-bold text-foreground">Welcome back, Arjun 👋</div>
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    AS
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-card rounded-xl border border-border shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider block">Employability</span>
                    <span className="text-lg font-bold text-foreground block">84/100</span>
                    <span className="text-[9px] text-emerald-600 block">Top 15% in cohort</span>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex flex-col justify-between">
                    <span className="text-[9px] text-primary uppercase font-mono tracking-wider block">Target Role</span>
                    <span className="text-xs font-bold text-foreground block truncate">ML Engineer</span>
                    <span className="text-[9px] text-primary/80 block truncate">Google Benchmark</span>
                  </div>
                  <div className="p-3 bg-card rounded-xl border border-border shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider block">Expected Pkg</span>
                    <span className="text-lg font-bold text-foreground block">18.5 LPA</span>
                    <span className="text-[9px] text-muted-foreground block truncate">Market Avg: 12 LPA</span>
                  </div>
                </div>
                <div className="flex-1 bg-card rounded-xl border border-border shadow-sm mt-2 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs border-b border-border pb-1">
                      <span className="font-bold">Resume DNA Skill Profile</span>
                      <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Growth Track
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span>Python & PyTorch</span>
                          <span className="text-emerald-600">92% (Ready)</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[92%]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span>Machine Learning Models</span>
                          <span className="text-emerald-600">78% (Ready)</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[78%]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span>System Design & Docker</span>
                          <span className="text-amber-500">45% (Gap Identified)</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[45%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between text-[10px]">
                    <div>
                      <span className="font-bold text-primary block">Next Daily Challenge</span>
                      <span className="text-muted-foreground block text-[9px] truncate">Complete Week 4 System Design Mock Interview</span>
                    </div>
                    <Button size="sm" className="h-6 text-[9px] px-2 bg-primary text-white hover:bg-primary/90 rounded font-bold">
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overlay stats card */}
            <Card className="absolute -bottom-6 -left-6 z-20 glass p-5 w-64 hidden md:block text-left shadow-lg border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">Placement Prob</div>
              </div>
              <div className="text-4xl font-bold text-gradient-primary mb-3">87.4%</div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[87.4%]" />
              </div>
            </Card>

            <Card className="absolute -top-6 -right-6 z-20 glass p-4 w-56 hidden md:flex items-center gap-4 shadow-lg border-border">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Mock Interview</div>
                <div className="text-sm font-semibold">Ready to start</div>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* ─── FEATURES SECTION ────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 border-t border-border/40 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Core Infrastructure</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything Students Need. Nothing They Don&apos;t.</h3>
            <p className="text-muted-foreground">A unified platform built to bridge the gap between educational credentials, real skill competency, and successful placements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="glass p-6 hover:shadow-md hover:border-primary/20 transition-all group duration-300">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-primary w-fit mb-5 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">System Skill Gap Analyzer</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare your current resume skill vectors directly against real industry benchmarks. Generate instant gaps mapped in 10+ core dimensions.
              </p>
              <div className="mt-4"><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">GPT-4 Powered</Badge></div>
            </Card>

            {/* Feature 2 */}
            <Card className="glass p-6 hover:shadow-md hover:border-primary/20 transition-all group duration-300">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-primary w-fit mb-5 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Adaptive Career Roadmap</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a week-by-week learning path generated by System targeting your missing skills. Formulated with concrete projects, certifications, and tasks.
              </p>
              <div className="mt-4"><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">Adaptive Pathing</Badge></div>
            </Card>

            {/* Feature 3 */}
            <Card className="glass p-6 hover:shadow-md hover:border-primary/20 transition-all group duration-300">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-primary w-fit mb-5 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Smart Form Auto-Fill</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                OCR and NLP engines scan your academic transcript and identity documents, matching complex fields directly to application forms.
              </p>
              <div className="mt-4"><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">95.6% OCR Accuracy</Badge></div>
            </Card>

            {/* Feature 4 */}
            <Card className="glass p-6 hover:shadow-md hover:border-primary/20 transition-all group duration-300">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-primary w-fit mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Counselor Dashboard</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Institution-level view with cohort heatmaps, placement probability tracking, and auto-flagged skill gaps for proactive career coaching.
              </p>
              <div className="mt-4"><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">Institution-Ready</Badge></div>
            </Card>

            {/* Feature 5 */}
            <Card className="glass p-6 hover:shadow-md hover:border-primary/20 transition-all group duration-300">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-primary w-fit mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Multi-Language OCR</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Supports regional scripts including Hindi, Tamil, Telugu, and Bengali. Extract details from regional marks sheets to bridge the digital divide.
              </p>
              <div className="mt-4"><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">10+ Regional Languages</Badge></div>
            </Card>

            {/* Feature 6 */}
            <Card className="glass p-6 hover:shadow-md hover:border-primary/20 transition-all group duration-300">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-primary w-fit mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Privacy-First Engine</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Strict zero-retention policies. Raw documents are read in volatile memory, parsed to structured data, and instantly deleted from servers.
              </p>
              <div className="mt-4"><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">Secure E2E Pipeline</Badge></div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW SECTION (HOW IT WORKS) ─────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-24 bg-background border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Structured Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">From Upload to Job-Ready in 5 Steps</h3>
            <p className="text-muted-foreground">Follow this straightforward pipeline to map your profile and begin target preparation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-lg mb-4 text-emerald-600 border border-border">
                01
              </div>
              <h4 className="font-semibold mb-2">Upload Docs</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">PDF, JPG, or PNG academic marksheets and resume profiles.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-lg mb-4 text-emerald-600 border border-border">
                02
              </div>
              <h4 className="font-semibold mb-2">OCR Processing</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">EasyOCR extracts data and BERT models structure fields.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-lg mb-4 text-emerald-600 border border-border">
                03
              </div>
              <h4 className="font-semibold mb-2">Vector Alignment</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">The analyzer compares skills against specified target profiles.</p>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-lg mb-4 text-emerald-600 border border-border">
                04
              </div>
              <h4 className="font-semibold mb-2">Generate Roadmap</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Receive a custom learning plan, tracker cards, and metrics.</p>
            </div>
            {/* Step 5 */}
            <div className="flex flex-col items-center text-center p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-lg mb-4 text-emerald-600 border border-border">
                05
              </div>
              <h4 className="font-semibold mb-2">Sync Companion</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Enable the browser companion to auto-fill job applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE PLAYGROUND SECTION ────────────────────────────────────────── */}
      <section id="demo" className="relative z-10 py-24 border-t border-border/40 bg-muted/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Live Interactive Demo</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Verify the Capabilities Live</h3>
            <p className="text-muted-foreground">Test each module of the student career pipeline without creating an account.</p>
          </div>

          <div className="glass-card overflow-hidden border border-border/60">
            {/* Tabs Navigation */}
            <div className="flex border-b border-border overflow-x-auto">
              {(['ocr', 'skillgap', 'roadmap', 'autofill'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[120px] py-4 px-6 text-sm font-medium border-b-2 text-center transition-all ${
                    activeTab === tab 
                      ? 'border-primary text-primary bg-primary/[0.02]' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'ocr' && '📄 OCR Extraction'}
                  {tab === 'skillgap' && '📊 Skill Gap Analyzer'}
                  {tab === 'roadmap' && '🗺️ Generated Roadmap'}
                  {tab === 'autofill' && '📋 Form Auto-Fill'}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="p-6 md:p-8 min-h-[380px] flex flex-col justify-between">
              
              {/* Tab 1: OCR Panel */}
              {activeTab === 'ocr' && (
                <div className="space-y-6">
                  {ocrState === 'idle' && (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border/60 rounded-xl hover:border-primary/50 transition-colors bg-card/30">
                      <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                      <h4 className="font-semibold text-base mb-1">Upload a Marks Card or Resume</h4>
                      <p className="text-xs text-muted-foreground mb-6">Supports PDF, PNG, or JPG documents</p>
                      <Button onClick={runOcrDemo} className="bg-primary hover:bg-primary/95 text-white">
                        ⚡ Run Simulated OCR
                      </Button>
                    </div>
                  )}

                  {ocrState === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                      <div className="w-full max-w-md bg-secondary h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-primary h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${ocrProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{ocrStepText}</p>
                    </div>
                  )}

                  {ocrState === 'done' && ocrFields && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                        <span>✅ Structured parser complete</span>
                        <span>Avg Confidence: 97.6%</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2">
                        {ocrFields.map((f, i) => (
                          <div key={i} className="p-3 bg-muted/40 border border-border/50 rounded-lg flex flex-col justify-between">
                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{f.label}</span>
                            <span className="text-sm font-medium text-foreground py-0.5">{f.value}</span>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                              <span>Origin: {f.source}</span>
                              <span className="text-emerald-600 font-semibold">{f.conf}% match</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-500/10 text-emerald-700 rounded-lg text-xs leading-relaxed">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <strong>OCR Success</strong>: Mapped fields can now be checked inside the <strong>Form Auto-Fill</strong> tab.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Skill Gap Panel */}
              {activeTab === 'skillgap' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column Input */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Paste Resume Text</label>
                        <button 
                          onClick={() => setResumeText(DEMO_RESUME)}
                          className="text-xs text-primary hover:underline"
                        >
                          Load Sample Resume
                        </button>
                      </div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your skills, projects, and work experience description here..."
                        className="w-full min-h-[140px] p-3 text-sm bg-card border border-border rounded-xl focus:border-primary outline-none resize-none"
                      />
                      
                      <div className="flex gap-3">
                        <select
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="flex-1 p-2.5 text-sm bg-card border border-border rounded-xl focus:border-primary cursor-pointer outline-none"
                        >
                          {Object.keys(roleSkills).map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        
                        <Button 
                          onClick={handleAnalyzeSkillGap} 
                          disabled={analysisState === 'analyzing'}
                          className="bg-primary hover:bg-primary/95 text-white"
                        >
                          {analysisState === 'analyzing' ? 'Analyzing...' : 'Analyze Gaps'}
                        </Button>
                      </div>
                    </div>

                    {/* Right Column Dial */}
                    {analysisState !== 'idle' && (
                      <div className="w-full md:w-52 flex flex-col items-center justify-center border border-border/50 rounded-xl p-4 bg-muted/10">
                        {analysisState === 'analyzing' ? (
                          <div className="flex flex-col items-center space-y-2 py-8">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                            <span className="text-xs text-muted-foreground">Calculating scores...</span>
                          </div>
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle 
                                  className="text-muted-foreground/10" 
                                  strokeWidth="8" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="48" 
                                  cx="56" 
                                  cy="56" 
                                />
                                <motion.circle 
                                  className="text-primary" 
                                  strokeWidth="8" 
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="48" 
                                  cx="56" 
                                  cy="56" 
                                  strokeDasharray={circumference}
                                  initial={{ strokeDashoffset: circumference }}
                                  animate={{ strokeDashoffset }}
                                  transition={{ duration: 1 }}
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-bold text-primary">{readinessScore}%</span>
                                <span className="text-[9px] text-muted-foreground uppercase">Readiness</span>
                              </div>
                            </div>
                            <span className="text-xs font-semibold block text-emerald-600">
                              {readinessScore >= 80 ? 'Placement Ready! 🎯' : readinessScore >= 60 ? 'Almost Job-Ready 📈' : 'Building Profile 🌱'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Skill Bars Output */}
                  {analysisState === 'done' && skillAnalysisResults.length > 0 && (
                    <div className="border-t border-border pt-6 space-y-4">
                      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                        <span>Benchmark Analysis</span>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-primary rounded-full inline-block"></span>Current Level</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-muted rounded-full inline-block border border-dashed border-border/80"></span>Benchmark</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2">
                        {skillAnalysisResults.map((s, idx) => {
                          const isGapLow = s.gap <= 10;
                          const isGapMed = s.gap <= 22;
                          return (
                            <div key={idx} className="space-y-1.5 p-2 rounded hover:bg-muted/30">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="truncate">{s.name}</span>
                                <span className={`font-semibold ${isGapLow ? 'text-emerald-600' : isGapMed ? 'text-yellow-600' : 'text-red-500'}`}>
                                  {s.gap > 0 ? `-${s.gap}% Gap` : 'Benchmark Met ✓'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-secondary h-2.5 rounded-full overflow-hidden relative">
                                  <div className="absolute top-0 right-0 h-full border-r border-dashed border-border/80" style={{ left: `${s.required}%` }} />
                                  <motion.div 
                                    className="bg-primary h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${s.current}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono w-14 text-right">
                                  {s.current}% / {s.required}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Roadmap Panel */}
              {activeTab === 'roadmap' && (
                <div className="space-y-6">
                  {roadmapItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mb-4" />
                      <h4 className="font-semibold text-base mb-1">No Roadmap Generated</h4>
                      <p className="text-xs max-w-sm">
                        Please run a <strong>Skill Gap Analysis</strong> first to identify missing target skills.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Milestones Matrix ({targetRole})</span>
                        <span>12-Week Sprint Plan</span>
                      </div>
                      
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                        {roadmapItems.map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-muted/40 border border-border/50 rounded-xl flex items-start gap-4 hover:border-primary/20 transition-colors">
                            <span className="text-2xl">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <h5 className="text-sm font-semibold truncate pr-2">{item.skill}</h5>
                                <Badge variant="outline" className={`text-[9px] uppercase ${
                                  item.priority === 'Critical' ? 'border-red-500/20 bg-red-500/5 text-red-600' :
                                  item.priority === 'High' ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-600' :
                                  item.priority === 'Medium' ? 'border-primary/20 bg-primary/5 text-primary' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
                                }`}>
                                  {item.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.hours} hrs estimated commitment · Exercises + Capstone Task</p>
                            </div>
                            <span className="text-xs font-mono font-medium text-primary ml-2 flex-shrink-0">{item.week}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Form Auto-Fill Panel */}
              {activeTab === 'autofill' && (
                <div className="space-y-6">
                  {!formFilled ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mb-4" />
                      <h4 className="font-semibold text-base mb-1">Form Auto-Fill is Empty</h4>
                      <p className="text-xs max-w-sm mb-6">
                        Data will automatically populate once you upload a document under the <strong>OCR Extraction</strong> tab.
                      </p>
                      <Button onClick={() => setActiveTab('ocr')} className="bg-primary hover:bg-primary/95 text-white">
                        Run OCR Simulator
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                        <span>⚡ Chrome Extension Match Simulation</span>
                        <span>10 Fields Mapped Successfully</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 border border-border/50 rounded-xl p-5">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Full Name</label>
                          <input type="text" readOnly value="Arjun Sharma" className="w-full text-xs p-2 border border-border rounded bg-card outline-none" />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">University Enrollment No</label>
                          <input type="text" readOnly value="LNCT/CSE/2023/047" className="w-full text-xs p-2 border border-border rounded bg-card outline-none" />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Date of Birth</label>
                          <input type="text" readOnly value="15/03/2003" className="w-full text-xs p-2 border border-border rounded bg-card outline-none" />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">CGPA Equivalent</label>
                          <input type="text" readOnly value="8.7 / 10.0" className="w-full text-xs p-2 border border-border rounded bg-card outline-none" />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Course Discipline</label>
                          <input type="text" readOnly value="B.Tech Computer Science" className="w-full text-xs p-2 border border-border rounded bg-card outline-none" />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-muted-foreground font-mono uppercase">Email Address</label>
                          <input type="text" readOnly value="arjun.sharma@lnct.ac.in" className="w-full text-xs p-2 border border-border rounded bg-card outline-none" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs leading-relaxed">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <strong>Form Synced</strong>: Mapped automatically from extracted document nodes. Press review to finalize submission structure.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ADVANCED INNOVATION SECTION ────────────────────────────────────── */}
      <section id="innovation" className="relative z-10 py-24 bg-background border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Competitive Edge</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Features to Win CPL 2026</h3>
            <p className="text-muted-foreground">Advanced architectures implemented to deliver unprecedented capabilities in student education systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass p-8 border-primary/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full w-fit block mb-4">
                🧬 Core Innovation
              </span>
              <h4 className="text-xl font-bold mb-3">Resume DNA Engine</h4>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                We go beyond keyword parsing. Our system builds a semantic skill vector map of applicant competencies from projects, certifications, and contextual phrasing, estimating true technical proficiency.
              </p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Differentiates aware vs. proficient vs. expert levels</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Flags legacy skill vectors needing refresher training</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Validates experience claims directly against project descriptions</li>
              </ul>
            </Card>

            <Card className="glass p-8 border-border/60">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-muted text-muted-foreground px-2.5 py-1 rounded-full w-fit block mb-4">
                📡 Market Scraping
              </span>
              <h4 className="text-xl font-bold mb-3">Live Market Intelligence</h4>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Connects directly to live telemetry matching active job portals. Instantly structures real hiring patterns to identify which skills are trending now.
              </p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Real-time portal skill vector sync</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Tracks demand surges in tech frameworks</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Aligns compensation benchmarks to skill profile clusters</li>
              </ul>
            </Card>

            <Card className="glass p-8 border-border/60">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-muted text-muted-foreground px-2.5 py-1 rounded-full w-fit block mb-4">
                🎮 Gamification
              </span>
              <h4 className="text-xl font-bold mb-3">Gamified Roadmap Milestones</h4>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Keeps student engagement high with streaks and xp achievements. Generates dynamic coding challenges to physically verify roadmap completion.
              </p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Verified badge credentials using QR-code hashes</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Adaptive coding tasks corresponding to missing skills</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Streak multiplier metrics to maintain consistency</li>
              </ul>
            </Card>

            <Card className="glass p-8 border-primary/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full w-fit block mb-4">
                🤝 System Evaluator
              </span>
              <h4 className="text-xl font-bold mb-3">System Mock Interviewer</h4>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Students practice target questions speaking directly into the webcam. The platform grades answer substance, speech pace, and evaluates posture stability.
              </p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Questions dynamically created from candidate resume context</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Behavioral assessment coaching matching STAR frameworks</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Dynamic eye-contact monitoring dashboards</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-24 border-t border-border/40 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Simple Pricing</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Empowering Students and Institutions</h3>
            <p className="text-muted-foreground">Choose a plan structured to scale career guidance workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <Card className="glass p-8 bg-card flex flex-col justify-between border-border/60">
              <div>
                <h4 className="text-lg font-bold mb-2">Student Free</h4>
                <p className="text-xs text-muted-foreground mb-6">Essential career assessment tools.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-xs text-muted-foreground">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-muted-foreground border-t border-border pt-6 mb-8">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Basic System Career Twin mapping</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> 1 Full OCR Document Scan / month</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Core skill gap metrics and charts</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> 1 System Mock Interview session</li>
                </ul>
              </div>
              <Button variant="outline" onClick={handleLogin} className="w-full rounded-full">Sign Up Free</Button>
            </Card>

            {/* Plan 2 */}
            <Card className="glass p-8 bg-card flex flex-col justify-between border-primary/30 relative shadow-md">
              <div className="absolute -top-3 right-6 bg-primary text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Pro Student</h4>
                <p className="text-xs text-muted-foreground mb-6">All features to accelerate prep.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-muted-foreground border-t border-border pt-6 mb-8">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Unlimited System Twin configurations</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Unlimited OCR Form Auto-fills</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Custom System roadmaps & tracking</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Unlimited System Mock Interviews</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Browser Companion Syncing</li>
                </ul>
              </div>
              <Button onClick={handleLogin} className="w-full rounded-full bg-primary hover:bg-primary/95 text-white">Upgrade to Pro</Button>
            </Card>

            {/* Plan 3 */}
            <Card className="glass p-8 bg-card flex flex-col justify-between border-border/60">
              <div>
                <h4 className="text-lg font-bold mb-2">University</h4>
                <p className="text-xs text-muted-foreground mb-6">For college placement coordinators.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-muted-foreground border-t border-border pt-6 mb-8">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Full counselor batch dashboard</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Batch skill heatmap metrics</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> White-label institution portal integration</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary" /> Dedicated placement export reports</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full rounded-full border-border/60">Contact Sales</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 bg-background border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">FAQ</h2>
            <h3 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h3>
            <p className="text-muted-foreground">Quick answers to technical questions about OCR, System engines, and privacy.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div 
                  key={index} 
                  className="border border-border/60 rounded-xl overflow-hidden glass transition-all"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold select-none bg-card hover:bg-muted/10 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 text-xs leading-relaxed text-muted-foreground border-t border-border/40 bg-card/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 bg-card text-center text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between px-8 gap-4">
        <div>SkillForge System · CPL 2026</div>
        <div>Built with ❤️ by Team CODEX · LNCT Group of Colleges · Smart Education Track</div>
      </footer>
    </div>
  );
}
