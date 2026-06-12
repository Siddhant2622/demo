"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { motion } from "framer-motion";

export default function EnhanceStep() {
  const router = useRouter();
  const { mergedData, updateMergedData } = usePortfolioStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [headline, setHeadline] = useState(mergedData.personalInfo.headline || "");
  const [bio, setBio] = useState(mergedData.personalInfo.bio || "");

  const handleEnhance = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/builder/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mergedData }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate System enhancements");
      }

      const data = await res.json();
      setHeadline(data.headline);
      setBio(data.bio);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    updateMergedData('personalInfo', { ...mergedData.personalInfo, headline, bio });
    router.push("/dashboard/builder/templates");
  };

  // Auto-generate on first load if missing
  useEffect(() => {
    if (!headline && !bio && !loading) {
      handleEnhance();
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-8 space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">System Enhancement</h2>
        <p className="text-muted-foreground">
          Let System craft a recruiter-friendly headline and a professional bio based on your combined GitHub, Resume, and LinkedIn data.
        </p>
      </div>

      <Card className="glass-card border-border overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Generated Content</h3>
            <Button variant="outline" size="sm" onClick={handleEnhance} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Regenerate
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Professional Headline</label>
            <Input 
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="E.g. Full-Stack Developer | React & Node.js"
              className="bg-secondary/50 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Professional Bio</label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your professional summary..."
              className="bg-secondary/50 h-32"
            />
          </div>
          
          {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} className="h-12 px-8 text-md bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          Select Template <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}
