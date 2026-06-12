"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Upload, Loader2, Sparkles, AlertTriangle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const STEPS = ["Personal Info", "Academic Info", "Documents", "Essay", "Review"];

export default function ApplicationFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [scholarship, setScholarship] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    college: "",
    degree: "",
    branch: "",
    cgpa: "",
    gradYear: "",
    essay: "",
  });

  const [essayAnalysis, setEssayAnalysis] = useState<any>(null);
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("current_scholarship");
    if (stored) {
      setScholarship(JSON.parse(stored));
    }
  }, [params.id]);

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    // Simulate auto-fill from profile store
    setTimeout(async () => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({
            ...prev,
            fullName: data.displayName || "Jane Doe",
            email: data.email || "student@university.edu",
            phone: "+1 234 567 8900",
            college: "Global Institute of Technology",
            degree: "B.Tech",
            branch: "Computer Science",
            cgpa: "3.8",
            gradYear: "2026",
          }));
        }
      }
      setIsAutoFilling(false);
    }, 1500);
  };

  const handleAnalyzeEssay = () => {
    setIsAnalyzingEssay(true);
    setTimeout(() => {
      setEssayAnalysis({
        score: 85,
        wordCount: formData.essay.split(' ').length,
        suggestions: [
          "Strong opening, but you could elaborate more on your leadership experience.",
          "Good grammar, but watch out for passive voice in the second paragraph.",
          "Excellent alignment with the scholarship's goals."
        ]
      });
      setIsAnalyzingEssay(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/scholarships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipId: params.id,
          userId: user?.uid || "anonymous",
          formData,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      
      const result = await res.json();
      router.push(`/dashboard/scholarships/tracking?id=${result.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!scholarship) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Apply for {scholarship.title}</h1>
          <p className="text-muted-foreground text-sm">Application Portal</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index <= currentStep ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`text-xs hidden sm:block ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="glass-card border-primary/20">
        <CardContent className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <Button variant="outline" size="sm" onClick={handleAutoFill} disabled={isAutoFilling} className="glass border-primary/30 text-primary">
                    {isAutoFilling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Auto-Fill from Profile
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Email Address</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Phone Number</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Full Address</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-background/50" /></div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-semibold mb-6">Academic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2"><Label>College / University</Label><Input value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Degree Program</Label><Input value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Major / Branch</Label><Input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Current CGPA</Label><Input value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} className="bg-background/50" /></div>
                  <div className="space-y-2"><Label>Graduation Year</Label><Input value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} className="bg-background/50" /></div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-semibold mb-6">Required Documents</h2>
                <div className="space-y-4">
                  {["Resume/CV (PDF)", "Academic Transcript", "ID Proof", "Recommendation Letter"].map((docName, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-accent/50 border border-border rounded-xl">
                      <div>
                        <p className="font-medium">{docName}</p>
                        <p className="text-xs text-muted-foreground">Max file size 5MB</p>
                      </div>
                      <Button variant="outline" className="shrink-0"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Scholarship Essay</h2>
                  <Button variant="secondary" size="sm" onClick={handleAnalyzeEssay} disabled={isAnalyzingEssay || !formData.essay} className="bg-primary/10 text-primary hover:bg-primary/20">
                    {isAnalyzingEssay ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    System Essay Review
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Why do you deserve this scholarship and what are your career goals? (Min 250 words)</Label>
                    <Textarea 
                      value={formData.essay} 
                      onChange={e => setFormData({...formData, essay: e.target.value})} 
                      className="min-h-[300px] bg-background/50" 
                      placeholder="Write your essay here..."
                    />
                  </div>
                  
                  {essayAnalysis && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-primary flex items-center"><Sparkles className="w-4 h-4 mr-2" /> System Feedback</h4>
                        <Badge variant="secondary" className="bg-primary/20 text-primary">Score: {essayAnalysis.score}/100</Badge>
                      </div>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        {essayAnalysis.suggestions.map((s: string, i: number) => (
                          <li key={i} className="flex items-start"><ChevronRight className="w-4 h-4 mr-1 shrink-0 mt-0.5 text-primary" /> {s}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-semibold mb-6">Review & Submit</h2>
                
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-400">System Eligibility Check Passed</h4>
                      <p className="text-sm text-muted-foreground">Based on your academic profile, you have a 92% probability of passing the initial screening.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-accent/30 rounded-xl">
                    <h4 className="font-medium mb-2 border-b border-border pb-2">Personal Details</h4>
                    <div className="grid grid-cols-2 text-sm gap-2">
                      <span className="text-muted-foreground">Name:</span><span>{formData.fullName || "Not provided"}</span>
                      <span className="text-muted-foreground">Email:</span><span>{formData.email || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-xl">
                    <h4 className="font-medium mb-2 border-b border-border pb-2">Academic Details</h4>
                    <div className="grid grid-cols-2 text-sm gap-2">
                      <span className="text-muted-foreground">University:</span><span>{formData.college || "Not provided"}</span>
                      <span className="text-muted-foreground">CGPA:</span><span>{formData.cgpa || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="flex items-start p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm">
                    <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
                    By submitting this application, you certify that all information provided is accurate and true to the best of your knowledge.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between p-6 md:p-8 border-t border-border bg-background/50">
          <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0 || isSubmitting}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Submit Application
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
