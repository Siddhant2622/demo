"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutTemplate, Sparkles, Globe, Download, Copy, ExternalLink, Check } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState("Designing your site...");
  const [copied, setCopied] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any /* eslint-disable-line */>(null);

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    setLoadingText("Extracting resume context...");
    
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

      setTimeout(() => setLoadingText("Writing professional copy..."), 1500);
      setTimeout(() => setLoadingText("Designing layout..."), 3000);

      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole, resumeText })
      });
      
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPortfolioData(data);
      setIsGenerated(true);
    } catch (error) {
      console.error("Error generating portfolio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Portfolio Builder</h1>
        <p className="text-muted-foreground">Convert your resume and GitHub into a stunning personal website in one click.</p>
      </div>

      {!isGenerated ? (
        <Card className="glass-card border-border bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <LayoutTemplate className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to build your brand?</h2>
            <p className="text-muted-foreground max-w-lg mb-8">
              We&apos;ll extract your projects, skills, and experience from your Career Twin profile and generate a responsive, SEO-optimized portfolio website.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all">
              <Sparkles className="w-4 h-4 mr-2" /> 
              {isGenerating ? loadingText : "Generate Portfolio (One Click)"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Site Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center"><Globe className="w-5 h-5 mr-2 text-primary" /> Live Preview</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="glass h-8 text-xs"><Download className="w-3 h-3 mr-2" /> Export Code</Button>
                <Button variant="outline" size="sm" className="glass h-8 text-xs" onClick={copyLink}>
                  {copied ? <Check className="w-3 h-3 mr-2 text-green-500" /> : <Copy className="w-3 h-3 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>
            <div className="w-full aspect-[4/3] rounded-xl border border-border bg-card overflow-hidden relative shadow-2xl">
              {/* Mock Portfolio Website Frame */}
              <div className="w-full h-6 bg-secondary border-b border-border flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <div className="mx-auto text-[10px] text-muted-foreground flex items-center bg-card px-4 py-0.5 rounded-md border border-border">
                  {portfolioData?.username || "alex-dev.skillforge.app"}
                </div>
              </div>
              <div className="p-8 text-center flex flex-col items-center justify-center h-[calc(100%-24px)] bg-gradient-to-br from-slate-50 to-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 mb-4 shadow-lg">
                  <div className="w-full h-full bg-white rounded-full border border-border" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Hi, I&apos;m {portfolioData?.name || "Alex"}</h1>
                <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">{portfolioData?.tagline || "Full Stack Developer specializing in building exceptional digital experiences."}</p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-md">
                  {portfolioData?.skills?.map((skill: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-white border border-border text-muted-foreground rounded-md shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="px-4 py-1.5 rounded-full bg-white text-foreground text-xs border border-border hover:bg-secondary transition-colors cursor-pointer shadow-sm">View Projects</div>
                  <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors cursor-pointer shadow-md">Contact Me</div>
                </div>
              </div>
            </div>
          </div>

          {/* Site Controls */}
          <div className="space-y-6">
            <Card className="glass-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Customize</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 rounded bg-gradient-to-r from-gray-900 to-black border border-primary ring-1 ring-primary/50 cursor-pointer" />
                      <div className="h-8 rounded bg-gradient-to-r from-slate-50 to-gray-100 border border-white/10 cursor-pointer" />
                      <div className="h-8 rounded bg-gradient-to-r from-indigo-950 to-slate-900 border border-white/10 cursor-pointer" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Primary Color</label>
                    <div className="flex gap-2">
                      {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'].map((color, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full ${color} cursor-pointer border-2 ${i === 0 ? 'border-white' : 'border-transparent'}`} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Custom Domain</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="alex.dev" className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 text-sm outline-none focus:border-primary" />
                      <Button variant="secondary" className="bg-white/10">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-full text-primary mt-0.5">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-primary">Your site is live!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;ve deployed your site to our global edge network. Any changes you make to your Career Twin profile will automatically sync here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
