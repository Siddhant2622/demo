"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitBranch, Loader2, Search, ArrowRight } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { motion } from "framer-motion";

export default function GithubStep() {
  const router = useRouter();
  const { github, setGithubData, updateMergedData } = usePortfolioStore();
  const { user } = useAuth();
  const [username, setUsername] = useState(github?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !username) {
      fetch(`http://localhost:8000/api/extension/profile?user_id=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data?.personal_info?.github) {
            let url = data.personal_info.github;
            if (url.endsWith('/')) url = url.slice(0, -1);
            const parts = url.split('/');
            const name = parts[parts.length - 1];
            if (name) setUsername(name);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      // Fetch Profile
      const profileRes = await fetch(`https://api.github.com/users/${username}`);
      if (!profileRes.ok) {
        if (profileRes.status === 404) throw new Error("GitHub user not found");
        if (profileRes.status === 403) throw new Error("GitHub API rate limit exceeded");
        throw new Error("Failed to fetch GitHub profile");
      }
      const profile = await profileRes.json();

      // Fetch Repos
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
      if (!reposRes.ok) throw new Error("Failed to fetch repositories");
      const reposData = await reposRes.json();

      // Filter to non-forks and get top ones
      const repos = reposData.filter((r: any) => !r.fork).sort((a: any, b: any) => b.stargazers_count - a.stargazers_count);

      // Aggregate languages
      const languages: Record<string, number> = {};
      repos.forEach((repo: any) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      setGithubData({
        username,
        profile,
        repos: repos.slice(0, 10), // Store top 10 repos
        languages
      });
      
      // Pre-fill merged data
      updateMergedData('personalInfo', {
        firstName: profile.name?.split(' ')[0] || username,
        lastName: profile.name?.split(' ').slice(1).join(' ') || "",
        github: profile.html_url,
      });

      router.push("/dashboard/builder/linkedin");
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
          <GitBranch className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Connect your GitHub</h2>
        <p className="text-muted-foreground">
          We'll extract your top projects, languages, and contribution metrics to build your developer portfolio.
        </p>
      </div>

      <Card className="glass-card border-border overflow-hidden">
        <CardContent className="p-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="GitHub Username"
                className="pl-10 h-12 text-lg bg-secondary/50 border-border"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch(e as any)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleFetch} 
                disabled={loading || !username}
                className="h-12 px-6 text-md bg-primary hover:bg-primary/90 text-white"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Import"}
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6 text-md"
                onClick={() => router.push("/dashboard/builder/linkedin")}
              >
                Skip
              </Button>
            </div>
          </div>
          
          {error && <p className="text-red-500 mt-4 text-sm font-medium text-center">{error}</p>}
        </CardContent>
      </Card>

      {github && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          <Card className="glass-card border-border border-green-500/20 bg-green-500/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={github.profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">{github.profile.name || github.username}</h3>
                  <p className="text-muted-foreground">{github.repos.length} Repositories • {Object.keys(github.languages).length} Languages</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push("/dashboard/builder/linkedin")} 
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6"
              >
                Continue to LinkedIn <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
