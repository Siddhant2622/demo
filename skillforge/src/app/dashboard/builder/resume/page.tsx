"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Loader2, ArrowRight } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { motion } from "framer-motion";

export default function ResumeStep() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setResumeData, resume } = usePortfolioStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/builder/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to process resume");
      }

      const parsedData = await res.json();
      setResumeData(parsedData);
      
      // Automatically navigate to details page upon success
      router.push("/dashboard/builder/details");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-8 space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          We'll automatically extract your work experience, education, skills, and projects to populate your portfolio.
        </p>
      </div>

      <Card className="glass-card border-border overflow-hidden">
        <CardContent className="p-8">
          <div 
            className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Click to Upload PDF</h3>
            <p className="text-sm text-muted-foreground mb-4">PDF formatting works best (max 5MB)</p>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {file && (
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {file.name}
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              onClick={handleProcess} 
              disabled={loading || !file}
              className="h-12 px-8 text-md bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> 
                  Extracting...
                </>
              ) : "Process Resume"}
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 text-md w-full sm:w-auto"
              onClick={() => router.push("/dashboard/builder/details")}
            >
              Skip
            </Button>
          </div>
          
          {error && <p className="text-red-500 mt-4 text-sm font-medium text-center">{error}</p>}
        </CardContent>
      </Card>

      {resume && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          <Card className="glass-card border-border border-green-500/20 bg-green-500/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Extraction Complete</h3>
                <p className="text-muted-foreground text-sm">
                  Found {resume.experience?.length || 0} jobs, {resume.education?.length || 0} degrees, and {resume.skills?.length || 0} skills.
                </p>
              </div>
              <Button 
                onClick={() => router.push("/dashboard/builder/details")} 
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6 shrink-0"
              >
                Review & Edit Details <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
