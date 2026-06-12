"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Moon, Sun, Download, ArrowRight, Paintbrush, GitBranch, Loader2 } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { generateTemplate } from "@/lib/templates";
import { motion } from "framer-motion";

export default function TemplatesStep() {
  const router = useRouter();
  const { mergedData, github, theme, setTheme } = usePortfolioStore();
  const [htmlContent, setHtmlContent] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isInjecting, setIsInjecting] = useState(false);
  const [communityTemplates, setCommunityTemplates] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/search/repositories?q=topic:portfolio-website+topic:template&sort=stars&per_page=20")
      .then(res => res.json())
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          setCommunityTemplates(data.items);
          const topRepo = data.items[0];
          setRepoUrl(topRepo.html_url);
          if (topRepo.homepage) {
            setPreviewUrl(topRepo.homepage.startsWith('http') ? topRepo.homepage : `https://${topRepo.homepage}`);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Inject github repos into mergedData if not already there
  const fullData = {
    ...mergedData,
    projects: mergedData.projects?.length > 0 ? mergedData.projects : (github?.repos || [])
  };

  useEffect(() => {
    const html = generateTemplate(theme.template, fullData, theme);
    setHtmlContent(html);
  }, [theme, fullData]);

  const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  const handleGithubInject = async () => {
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      alert("Please enter a valid GitHub repository URL.");
      return;
    }
    setIsInjecting(true);
    try {
      const response = await fetch("http://localhost:8000/api/github-injector/clone-and-inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, user_data: fullData })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to process repository.");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fullData.personalInfo?.firstName?.toLowerCase() || 'portfolio'}-template.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)] pb-8"
    >
      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6 overflow-y-auto pr-2">
        <div className="text-left space-y-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <LayoutTemplate className="w-6 h-6 mr-2 text-primary" />
            Templates
          </h2>
          <p className="text-muted-foreground text-sm">
            Customize the look and feel of your final portfolio.
          </p>
        </div>

        <Card className="glass-card border-border">
          <CardContent className="p-5 space-y-6">
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Template</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={theme.template === 'minimal' ? 'default' : 'outline'}
                  onClick={() => { setTheme({ template: 'minimal' }); setPreviewUrl(null); }}
                  className="w-full"
                >
                  Minimal
                </Button>
                <Button 
                  variant={theme.template === 'modern' ? 'default' : 'outline'}
                  onClick={() => { setTheme({ template: 'modern' }); setPreviewUrl(null); }}
                  className="w-full"
                >
                  Modern
                </Button>
                <Button 
                  variant={theme.template === 'developer' ? 'default' : 'outline'}
                  onClick={() => { setTheme({ template: 'developer' }); setPreviewUrl(null); }}
                  className="w-full"
                >
                  Developer
                </Button>
                <Button 
                  variant={theme.template === 'creative' ? 'default' : 'outline'}
                  onClick={() => { setTheme({ template: 'creative' }); setPreviewUrl(null); }}
                  className="w-full"
                >
                  Creative
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Theme Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={!theme.darkMode ? 'default' : 'outline'}
                  onClick={() => setTheme({ darkMode: false })}
                  className="w-full"
                >
                  <Sun className="w-4 h-4 mr-2" /> Light
                </Button>
                <Button 
                  variant={theme.darkMode ? 'default' : 'outline'}
                  onClick={() => setTheme({ darkMode: true })}
                  className="w-full"
                >
                  <Moon className="w-4 h-4 mr-2" /> Dark
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center">
                <Paintbrush className="w-4 h-4 mr-2" /> Primary Color
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setTheme({ primaryColor: color })}
                    className={`w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 ${theme.primaryColor === color ? 'ring-2 ring-offset-2 ring-background ring-offset-foreground/20' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* GitHub Auto-Injector */}
        <Card className="glass-card border-border overflow-hidden">
          <div className="bg-primary/10 p-3 border-b border-primary/20 flex items-center">
            <GitBranch className="w-4 h-4 mr-2 text-primary" />
            <h3 className="text-sm font-semibold text-primary">Import from GitHub (Beta)</h3>
          </div>
          <CardContent className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste any GitHub portfolio repository. Our System will attempt to clone it, rewrite the code using your resume data, and give you a downloadable ZIP!
            </p>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="https://github.com/user/repo" 
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setPreviewUrl(null);
                }}
              />
              <Button 
                onClick={handleGithubInject} 
                disabled={isInjecting || !repoUrl}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                size="sm"
              >
                {isInjecting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Injecting System Data...</> : "Fetch & Inject Repo"}
              </Button>
            </div>

            {communityTemplates.length > 0 && (
              <div className="pt-4 mt-2 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Popular GitHub Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {communityTemplates.map((repo) => (
                    <div 
                      key={repo.id} 
                      className="text-xs p-2 rounded-md border border-border bg-background cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors flex flex-col justify-between group"
                      onClick={() => {
                        setRepoUrl(repo.html_url);
                        if (repo.homepage) {
                          setPreviewUrl(repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`);
                        } else {
                          setPreviewUrl(null);
                        }
                      }}
                      title={repo.description}
                    >
                      <span className="font-semibold truncate group-hover:text-primary">{repo.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">⭐ {repo.stargazers_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={() => router.push("/dashboard/builder/export")} 
          className="w-full h-12 text-md bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
        >
          Continue to Export <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>

      {/* Live Preview Pane */}
      <div className="flex-1 bg-black/5 rounded-2xl border border-border overflow-hidden relative shadow-inner">
        <div className="absolute top-0 left-0 right-0 bg-background border-b border-border p-3 flex items-center justify-center text-xs font-medium text-muted-foreground uppercase tracking-widest z-10">
          Live Preview
        </div>
        {previewUrl ? (
          <iframe 
            src={previewUrl} 
            title="Portfolio Preview"
            className="w-full h-full pt-10 border-none bg-white"
          />
        ) : (
          <iframe 
            srcDoc={htmlContent} 
            title="Portfolio Preview"
            className="w-full h-full pt-10 border-none bg-white"
          />
        )}
      </div>
    </motion.div>
  );
}
