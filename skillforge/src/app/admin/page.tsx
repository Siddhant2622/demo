"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Briefcase, GraduationCap, ArrowUpRight, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Link from "next/link";

const placementData = [
  { dept: "CSE", placed: 85, total: 120 },
  { dept: "IT", placed: 65, total: 90 },
  { dept: "ECE", placed: 45, total: 80 },
  { dept: "ME", placed: 30, total: 60 },
  { dept: "CE", placed: 20, total: 50 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Topbar */}
      <header className="h-16 border-b border-white/5 bg-card/50 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight">SkillForge <span className="text-muted-foreground font-normal">University Admin</span></span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Student View</Link>
          <div className="px-3 py-1.5 rounded bg-primary/20 text-primary border border-primary/20">LNCT Group</div>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Placement Analytics</h1>
              <p className="text-muted-foreground">Institution-wide insights driven by student Career Twins.</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none">
                <option>Batch 2026</option>
                <option>Batch 2025</option>
              </select>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><Users className="w-5 h-5" /></div>
                  <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10">+12%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Active Students</div>
                <div className="text-3xl font-bold">4,281</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400"><Briefcase className="w-5 h-5" /></div>
                  <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10">+5%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Avg. Placement Prob.</div>
                <div className="text-3xl font-bold">72.4%</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400"><GraduationCap className="w-5 h-5" /></div>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-500/20 bg-yellow-500/10">Stable</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Scholarships Claimed</div>
                <div className="text-3xl font-bold">$1.2M</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400"><ShieldAlert className="w-5 h-5" /></div>
                  <Badge variant="outline" className="text-red-400 border-red-500/20 bg-red-500/10">Action Req.</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">At-Risk Students</div>
                <div className="text-3xl font-bold">342</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-white/5 lg:col-span-2">
              <CardHeader>
                <CardTitle>Department Placement Readiness</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="dept" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="placed" name="Placement Ready" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total Students" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-card border-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Skill Deficits Detected</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-red-400">System Design</span>
                      <span className="text-muted-foreground">62% failure rate</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[62%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-yellow-400">AWS / Cloud</span>
                      <span className="text-muted-foreground">45% failure rate</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full w-[45%]" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button className="text-sm text-primary hover:underline flex items-center">
                      Generate Intervention Plan <ArrowUpRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">B2B ROI Insight</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Using SkillForge System, LNCT Group has increased predicted placements by 14% this semester, potentially increasing admission rates next year.
                  </p>
                  <button className="w-full py-2 bg-primary/20 text-primary font-medium rounded-md text-sm border border-primary/20 hover:bg-primary/30 transition-colors">
                    Export Full Report
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
