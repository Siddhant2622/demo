"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle2, User, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, arrayUnion } from "firebase/firestore";
import { uploadFileToSupabase } from "@/lib/supabase";

export default function MultiStepOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    targetCompany: "",
    targetRole: "",
    expectedSalary: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [marksheets, setMarksheets] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any /* eslint-disable-line */>(null);
  const [extractedProfile, setExtractedProfile] = useState<{ personalInfo: any, education: any } | null>(null);
  const [existingDocs, setExistingDocs] = useState<{
    resumeUrl: string | null;
    certificateUrls: string[];
    marksheetUrls: string[];
  }>({
    resumeUrl: null,
    certificateUrls: [],
    marksheetUrls: []
  });

  useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/extension/profile?user_id=${user.uid}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.experience && data.experience !== "Experience extracted from resume.") {
            setExistingProfile(data);
          }
        } catch (err) {
          console.log("Backend not running, skipping existing profile check.");
        }
      };
      
      const loadFirebaseData = async () => {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              targetRole: data.targetRole || prev.targetRole,
              targetCompany: data.targetCompany || prev.targetCompany,
              expectedSalary: data.expectedSalary || prev.expectedSalary
            }));
            setExistingDocs({
              resumeUrl: data.resumeUrl || null,
              certificateUrls: data.certificateUrls || [],
              marksheetUrls: data.marksheetUrls || []
            });
          }
        } catch (e) {
          console.error("Failed to fetch user doc", e);
        }
      };

      checkProfile();
      loadFirebaseData();
    }
  }, [user]);

  const nextStep = () => setStep((s) => Math.min(s + 5, 5)); // wait, Math.min(s + 1, 5)
  // Re-define it correctly:
  const doNextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (user) {
        // Upload immediately in background
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        uploadFileToSupabase('user-documents', `${user.uid}/resume/${safeName}`, selectedFile).then(url => {
          if (url) {
            setDoc(doc(db, "users", user.uid), { resumeUrl: url }, { merge: true });
          }
        });
      }
      setTimeout(() => setStep(s => Math.min(s + 1, 5)), 600);
    }
  };

  const handleAddCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newCert = e.target.files[0];
      setCertificates([...certificates, newCert]);
      if (user) {
        const safeName = newCert.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        uploadFileToSupabase('user-documents', `${user.uid}/certificates/${safeName}`, newCert).then(url => {
          if (url) {
            setDoc(doc(db, "users", user.uid), { certificateUrls: arrayUnion(url) }, { merge: true });
          }
        });
      }
    }
  };

  const handleAddMarksheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setMarksheets([...marksheets, ...filesArray]);
      if (user) {
        filesArray.forEach(sheet => {
          const safeName = sheet.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          uploadFileToSupabase('user-documents', `${user.uid}/marksheets/${safeName}`, sheet).then(url => {
            if (url) {
               setDoc(doc(db, "users", user.uid), { marksheetUrls: arrayUnion(url) }, { merge: true });
            }
          });
        });
      }
    }
  };

  const submitToGemini = async () => {
    setIsProcessing(true);
    try {
      const formDataObj = new FormData();
      if (file) {
        formDataObj.append("resume", file);
      } else if (existingProfile && existingProfile.experience) {
        formDataObj.append("resumeText", existingProfile.experience);
      }
      formDataObj.append("targetRole", formData.targetRole);
      formDataObj.append("targetCompany", formData.targetCompany);
      formDataObj.append("expectedSalary", formData.expectedSalary);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formDataObj
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Save to localStorage immediately as a fast backup
      localStorage.setItem("careerAnalysis", JSON.stringify(data));
      if (data.extractedResumeText) localStorage.setItem("resumeText", data.extractedResumeText);
      localStorage.setItem("targetRole", formData.targetRole);
      
      // Store cookies as requested by user
      document.cookie = `hasCareerAnalysis=true; path=/; max-age=31536000`;
      document.cookie = `resumeUploaded=${existingDocs.resumeUrl || file ? 'true' : 'false'}; path=/; max-age=31536000`;

      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid), {
            careerAnalysis: data,
            resumeText: data.extractedResumeText || "",
            targetRole: formData.targetRole,
            targetCompany: formData.targetCompany,
            expectedSalary: formData.expectedSalary
          }, { merge: true });
        } catch (fbErr) {
          console.error("Firebase setDoc failed:", fbErr);
        }
      }

      // Save the extracted skills and resume text to Firebase so the Chrome Extension can use it!
      if (user) {
        try {
          const skillsAnalyzed: Record<string, number> = {};
          const skillNames: string[] = [];
          
          if (data.skills && Array.isArray(data.skills)) {
            data.skills.forEach((s: any /* eslint-disable-line */) => {
              skillsAnalyzed[s.subject] = s.score;
              skillNames.push(s.subject);
            });
          }

          const profileData = {
            experience: data.extractedResumeText || "Experience extracted from resume.",
            skills_raw: skillNames.join(", ") || "",
            skills_analyzed: skillsAnalyzed,
            personal_info: {
               first_name: data.personalInfo?.firstName || "",
               last_name: data.personalInfo?.lastName || "",
               email: data.personalInfo?.email || "",
               phone: data.personalInfo?.phone || "",
               location: data.personalInfo?.location || "",
               linkedin: data.personalInfo?.linkedin || "",
               github: data.personalInfo?.github || "",
               portfolio: data.personalInfo?.portfolio || "",
            },
            education: data.education || {}
          };

          try {
            await fetch(`http://localhost:8000/api/extension/profile?user_id=${user.uid}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profileData)
            });
            console.log("Successfully synced extracted resume data to Firebase.");
          } catch (fetchErr) {
            console.log("Backend not running, skipping Firebase extension sync.");
          }
        } catch (fbError) {
          console.error("Failed to sync resume to Firebase", fbError);
        }
      }
      
      if (data.personalInfo || data.education) {
        setExtractedProfile({
          personalInfo: data.personalInfo || {},
          education: data.education || {}
        });
        setStep(6);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred while analyzing the resume.");
      setIsProcessing(false);
      setStep(4); // send back to the submit step so they can try again
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 px-4 md:px-0 space-y-8">
      <div className="flex flex-col gap-2 items-center text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create your System Career Twin</h1>
        <p className="text-muted-foreground">Follow these steps to generate your personalized roadmap.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-10 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step >= i ? "bg-primary text-white shadow-[0_0_15px_-3px_var(--primary)]" : "bg-card border border-border text-muted-foreground"}`
            }
          >
            {i}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-secondary text-muted-foreground mb-6">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload your Resume</h3>
                <p className="text-muted-foreground max-w-sm mb-8">We&apos;ll use System System to parse your skills and experience instantly.</p>
                
                {existingDocs.resumeUrl && (
                  <div className="mb-6 w-full max-w-sm bg-primary/5 border border-primary/20 rounded-xl p-4 text-left">
                    <h4 className="font-semibold text-sm mb-2 text-primary flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Uploaded Resume Found</h4>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => window.open(existingDocs.resumeUrl!, '_blank')} className="flex-1 bg-background">Preview</Button>
                      <Button variant="outline" size="sm" onClick={() => setExistingDocs({...existingDocs, resumeUrl: null})} className="flex-1 bg-background text-destructive hover:text-destructive">Replace</Button>
                    </div>
                    <Button variant="outline" onClick={() => setStep(2)} className="w-full text-sm h-9 bg-background shadow-sm hover:text-primary whitespace-normal h-auto py-2">Use Existing Resume & Skip Upload</Button>
                  </div>
                )}
                {!existingDocs.resumeUrl && existingProfile && (
                  <div className="mb-6 w-full max-w-sm bg-primary/5 border border-primary/20 rounded-xl p-4 text-left">
                    <h4 className="font-semibold text-sm mb-2 text-primary flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Saved Resume Data Found</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4 opacity-80">{existingProfile.experience}</p>
                    <Button variant="outline" onClick={() => setStep(2)} className="w-full text-sm h-9 bg-background shadow-sm hover:text-primary">Use Saved Profile & Skip Upload</Button>
                  </div>
                )}
                
                <div className="flex flex-col gap-4 items-center w-full max-w-xs">
                  {(existingProfile || existingDocs.resumeUrl) && (
                    <div className="flex items-center gap-2 w-full justify-center mb-2">
                      <div className="h-[1px] bg-border w-12"/> <span className="text-xs font-medium text-muted-foreground">OR UPLOAD NEW</span> <div className="h-[1px] bg-border w-12"/>
                    </div>
                  )}
                  <Label className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden">
                    {file ? (
                      <div className="flex flex-col items-center text-primary">
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-foreground">Click to upload Resume (PDF)</span>
                        <span className="text-xs text-muted-foreground mt-1">Required to generate your Career Twin</span>
                      </>
                    )}
                    <Input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                  </Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-secondary text-muted-foreground mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Certificates</h3>
                <p className="text-muted-foreground max-w-sm mb-8">Optional. Add AWS, Coursera, or NPTEL certificates one by one.</p>
                <div className="flex flex-col gap-3 items-center w-full max-w-xs">
                  {existingDocs.certificateUrls.map((url, i) => (
                    <div key={`existing-cert-${i}`} className="flex justify-between items-center w-full bg-secondary px-4 py-2 rounded border border-border">
                      <span className="truncate max-w-[140px] text-sm">Certificate {i + 1}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => window.open(url, '_blank')}>Preview</Button>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  ))}
                  {certificates.map((cert, i) => (
                    <div key={i} className="flex justify-between items-center w-full bg-secondary px-4 py-2 rounded border border-border">
                      <span className="truncate max-w-[200px] text-sm">{cert.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                  <Label className="cursor-pointer bg-secondary border border-border hover:bg-secondary px-4 py-3 rounded-lg w-full text-center text-sm font-medium transition-colors">
                    + Add Certificate
                    <Input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleAddCertificate} />
                  </Label>
                  <Button onClick={() => setStep(3)} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)] w-full mt-4">
                    Continue to Target Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-secondary text-muted-foreground mb-6">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload ID & Marksheets</h3>
                <p className="text-muted-foreground max-w-sm mb-8">Optional. Upload your Aadhaar, ID cards, and academic Marksheets. We will extract this via OCR for the 1-click Scholarship Auto-fill module.</p>
                <div className="flex flex-col gap-4 items-center w-full max-w-xs">
                  {existingDocs.marksheetUrls.map((url, i) => (
                    <div key={`existing-marksheet-${i}`} className="flex justify-between items-center w-full bg-secondary px-4 py-2 rounded border border-border">
                      <span className="truncate max-w-[140px] text-sm">Marksheet {i + 1}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => window.open(url, '_blank')}>Preview</Button>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  ))}
                  {marksheets.map((sheet, i) => (
                    <div key={i} className="flex justify-between items-center w-full bg-secondary px-4 py-2 rounded border border-border">
                      <span className="truncate max-w-[200px] text-sm">{sheet.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                  <Label className="cursor-pointer bg-secondary border border-border hover:bg-secondary px-4 py-3 rounded-lg w-full text-center text-sm font-medium transition-colors">
                    + Add Files
                    <Input type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleAddMarksheet} className="hidden" />
                  </Label>
                  <Button onClick={() => setStep(4)} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)] w-full mt-4">
                    Continue to Career Targets
                  </Button>
                  {marksheets.length === 0 && (
                    <Button onClick={() => setStep(4)} variant="outline" size="sm" className="glass border-border w-full mt-2">Skip</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card border-border">
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Career Targets</h3>
                  <p className="text-muted-foreground text-sm">Tell us what you&apos;re aiming for so System can tailor your roadmap.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Target Role</Label>
                    <Input 
                      id="role" 
                      placeholder="e.g. Full Stack Developer, Data Scientist" 
                      value={formData.targetRole}
                      onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Target Company</Label>
                    <Input 
                      id="company" 
                      placeholder="e.g. Google, Microsoft, Amazon" 
                      value={formData.targetCompany}
                      onChange={(e) => setFormData({...formData, targetCompany: e.target.value})}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Expected Salary</Label>
                    <Input 
                      id="salary" 
                      placeholder="e.g. 15 LPA, $120k" 
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
                  <Button onClick={() => setStep(s => Math.max(s - 1, 1))} variant="ghost" className="order-2 sm:order-1">Back</Button>
                  <Button 
                    onClick={() => {
                      setStep(5);
                      submitToGemini();
                    }} 
                    disabled={!formData.targetRole || !formData.targetCompany || (!file && !existingProfile)}
                    className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)]"
                  >
                    Generate Twin <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="p-4 rounded-full bg-primary/20 text-primary mb-6"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-2 text-gradient-primary">Analyzing Profile with System...</h3>
                <p className="text-muted-foreground max-w-md">
                  We are calculating your skill gaps, matching you against {formData.targetCompany} benchmarks, and generating your gamified daily roadmap.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {step === 6 && extractedProfile && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card border-border">
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Verify Extracted Profile</h3>
                  <p className="text-muted-foreground text-sm">We extracted these details from your resume. Review, edit, or skip.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={extractedProfile.personalInfo?.phone || ""}
                      onChange={(e) => setExtractedProfile({...extractedProfile, personalInfo: {...extractedProfile.personalInfo, phone: e.target.value}})}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      value={extractedProfile.personalInfo?.location || ""}
                      onChange={(e) => setExtractedProfile({...extractedProfile, personalInfo: {...extractedProfile.personalInfo, location: e.target.value}})}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input 
                      value={extractedProfile.personalInfo?.linkedin || ""}
                      onChange={(e) => setExtractedProfile({...extractedProfile, personalInfo: {...extractedProfile.personalInfo, linkedin: e.target.value}})}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input 
                      value={extractedProfile.personalInfo?.github || ""}
                      onChange={(e) => setExtractedProfile({...extractedProfile, personalInfo: {...extractedProfile.personalInfo, github: e.target.value}})}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Input 
                      value={extractedProfile.education?.university || ""}
                      onChange={(e) => setExtractedProfile({...extractedProfile, education: {...extractedProfile.education, university: e.target.value}})}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input 
                      value={extractedProfile.education?.degree || ""}
                      onChange={(e) => setExtractedProfile({...extractedProfile, education: {...extractedProfile.education, degree: e.target.value}})}
                      className="bg-secondary"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between pt-6 gap-3">
                  <Button onClick={() => router.push("/dashboard")} variant="outline" className="order-2 sm:order-1">Skip</Button>
                  <Button 
                    onClick={async () => {
                      if (user) {
                        try {
                          await setDoc(doc(db, "users", user.uid), {
                            personal_info: {
                              first_name: extractedProfile.personalInfo?.firstName || "",
                              last_name: extractedProfile.personalInfo?.lastName || "",
                              full_name: `${extractedProfile.personalInfo?.firstName || ""} ${extractedProfile.personalInfo?.lastName || ""}`.trim(),
                              phone: extractedProfile.personalInfo?.phone || "",
                              location: extractedProfile.personalInfo?.location || "",
                              linkedin: extractedProfile.personalInfo?.linkedin || "",
                              github: extractedProfile.personalInfo?.github || "",
                              portfolio: extractedProfile.personalInfo?.portfolio || ""
                            },
                            education: {
                              university: extractedProfile.education?.university || "",
                              degree: extractedProfile.education?.degree || "",
                              graduation_year: extractedProfile.education?.graduationYear || "",
                              cgpa: extractedProfile.education?.cgpa || ""
                            }
                          }, { merge: true });
                        } catch (err) {
                          console.error("Failed to save profile details", err);
                        }
                      }
                      router.push("/dashboard");
                    }} 
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
