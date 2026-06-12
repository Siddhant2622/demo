"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, CheckCircle2, ChevronRight, ScanText, ExternalLink, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ScholarshipsPage() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<any[] /* eslint-disable-line */>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleApply = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Application link not available.");
    }
  };

  useEffect(() => {
    const fetchScholarships = async () => {
      if (!user) return;
      try {
        let targetRole = "Software Engineer";
        let resumeText = "";

        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.targetRole) targetRole = data.targetRole;
          if (data.resumeText) resumeText = data.resumeText;
          else if (data.careerAnalysis?.extractedResumeText) resumeText = data.careerAnalysis.extractedResumeText;
        } else {
          targetRole = localStorage.getItem("targetRole") || "Software Engineer";
          const analysisData = localStorage.getItem("careerAnalysis");
          if (analysisData) {
            const parsed = JSON.parse(analysisData);
            resumeText = parsed.extractedResumeText || "";
          }
        }

        const res = await fetch("/api/scholarships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: targetRole, resumeText })
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setScholarships(data);
      } catch (error) {
        console.error("Error fetching scholarships:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Scholarship Finder</h1>
          <p className="text-muted-foreground">We matched you with $35,000+ in eligible scholarships based on your profile.</p>
        </div>
        <Button className="glass border-border"><Search className="w-4 h-4 mr-2" /> Find More</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle>Top Matches</CardTitle>
            <CardDescription>Scholarships where you have the highest probability of winning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <h3 className="font-semibold text-lg">Searching Global Databases...</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-2">
                  System is finding the best scholarships matching your career profile and extracted resume data.
                </p>
              </div>
            ) : scholarships.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-accent border border-border hover:bg-secondary transition-colors cursor-pointer gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    {s.match > 90 && <Badge variant="secondary" className="bg-primary/20 text-primary border-0 text-xs">High Match</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center text-green-400 font-medium"><GraduationCap className="w-4 h-4 mr-1" /> {s.amount}</div>
                    <div>Due: {s.deadline}</div>
                    <div>Match: {s.match}%</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.tags?.map((t: string, j: number) => (
                      <span key={j} className="text-xs px-2 py-1 bg-accent rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  {s.status === "ready" && (
                    <Button 
                      onClick={() => handleApply(s.url)}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full transition-all"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Apply Now
                    </Button>
                  )}
                  {s.status === "missing_docs" && (
                    <Button variant="outline" className="w-full sm:w-auto rounded-full glass border-border">
                      Upload Docs
                    </Button>
                  )}
                  {s.status === "applied" && (
                    <Button variant="secondary" disabled className="w-full sm:w-auto rounded-full bg-accent text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Applied
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card border-border bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ScanText className="w-5 h-5 mr-2 text-primary" /> Auto Form Filling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our OCR system has extracted 42 data points from your Aadhaar, Resume, and Marksheets.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Completeness</span>
                  <span className="text-primary font-medium">85%</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[85%]" />
                </div>
              </div>
              <Button variant="outline" className="w-full glass border-white/10 justify-between">
                Review Extracted Data <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Did you know?</h3>
              <p className="text-sm text-muted-foreground">
                Students who apply to at least 5 scholarships using SkillForge have a 72% success rate of receiving funds.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
