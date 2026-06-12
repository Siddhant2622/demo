"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Briefcase, GraduationCap, Target, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any /* eslint-disable-line */>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists() && docSnap.data().careerAnalysis) {
          setAnalysis(docSnap.data().careerAnalysis);
        } else {
          const data = localStorage.getItem("careerAnalysis");
          if (data) setAnalysis(JSON.parse(data));
        }
      } catch (error) {
        console.error("Failed to fetch from Firebase", error);
        const data = localStorage.getItem("careerAnalysis");
        if (data) setAnalysis(JSON.parse(data));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">No Career Twin Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You haven&apos;t generated your System Career Twin yet. Upload your resume and let System analyze your profile.
        </p>
        <Button onClick={() => router.push("/dashboard/twin")} className="mt-4">
          Create System Career Twin
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here is your System System career prediction and progress.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employability Score</CardTitle>
            <Brain className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.employabilityScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Based on System Analysis
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Placement Probability</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.placementProbability}%</div>
            <p className="text-xs text-muted-foreground mt-1">High chance for top tech companies</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expected Package</CardTitle>
            <Briefcase className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.expectedSalaryRange}</div>
            <p className="text-xs text-muted-foreground mt-1">Market benchmark aligned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <Card className="glass-card border-border flex flex-col">
          <CardHeader>
            <CardTitle>System Skill Gap Analysis</CardTitle>
            <CardDescription>Your current proficiency vs. industry benchmark</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.skills}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Student" dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-3 flex items-center text-red-400">
                <AlertTriangle className="w-4 h-4 mr-2" /> Top Missing Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill: string, i: number) => (
                  <Badge key={i} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Learning Roadmap */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Gamified System Roadmap</CardTitle>
            <CardDescription>Your personalized path generated by System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gamification Streak */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-semibold text-primary">3 Day Streak!</div>
                  <div className="text-xs text-muted-foreground">Keep completing daily tasks.</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Level</div>
                <div className="font-bold">Apprentice</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b border-border pb-2">Daily Plan</h4>
              <div className="space-y-2">
                {analysis.dailyPlan.map((task: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border border-muted-foreground group-hover:border-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">{task}</div>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-semibold border-b border-border pb-2 pt-2">Weekly Milestones</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {analysis.weeklyMilestones.map((ms: string, i: number) => (
                  <li key={i}>{ms}</li>
                ))}
              </ul>

              <h4 className="text-sm font-semibold border-b border-border pb-2 pt-2">Monthly Targets</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {analysis.monthlyTargets.map((target: string, i: number) => (
                  <li key={i}>{target}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
