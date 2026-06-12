"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Puzzle, CheckCircle2, MonitorDown, Zap, BrainCircuit, Briefcase, Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ExtensionPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">SkillMap Automator Extension</h1>
        <p className="text-muted-foreground">Download the Chrome extension to magically auto-fill job applications and see live placement predictions on any website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Download Section */}
        <Card className="glass-card border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Puzzle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Install for Google Chrome</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Our extension is currently in Developer Preview. Download the package below and load it directly into your browser.
            </p>
            
            <a href="/skillmap-extension.zip" download>
              <Button size="lg" className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-base h-12">
                <Download className="w-5 h-5 mr-2" />
                Download Extension (.zip)
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        <Card className="glass-card border-border">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <MonitorDown className="w-5 h-5 mr-2 text-primary" />
              How to Install
            </h3>
            
            <div className="space-y-6 relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border -z-10" />

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center font-bold text-sm shrink-0 bg-background">1</div>
                <div>
                  <h4 className="font-semibold text-foreground">Extract the ZIP file</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Locate the downloaded <code className="bg-muted px-1.5 py-0.5 rounded text-xs">skillmap-extension.zip</code> and extract/unzip it to a folder on your computer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center font-bold text-sm shrink-0 bg-background">2</div>
                <div>
                  <h4 className="font-semibold text-foreground">Open Chrome Extensions</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    In your Google Chrome browser, navigate to <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center font-bold text-sm shrink-0 bg-background">3</div>
                <div>
                  <h4 className="font-semibold text-foreground">Load Unpacked</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Turn on <strong>Developer mode</strong> in the top right corner. Then click the <strong>Load unpacked</strong> button and select the extracted folder.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center font-bold text-sm shrink-0 bg-background">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">All Set!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    The extension is now installed. Pin it to your toolbar by clicking the puzzle icon 🧩 in Chrome.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secret Key Section */}
      {user && (
        <Card className="glass-card border-primary/30 bg-primary/5 mt-8">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <Key className="w-5 h-5 mr-2 text-primary" />
                Your Secret Pairing Key
              </h3>
              <p className="text-sm text-muted-foreground">
                Copy and paste this key into the Chrome Extension exactly once to link it to your Google Account.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-2 px-4 shadow-sm">
              <code className="text-primary font-mono font-bold tracking-wider">{user.uid}</code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <div className="pt-4">
        <h3 className="font-semibold mb-4 text-lg">What can the extension do?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <Zap className="w-6 h-6 text-yellow-500 mb-3" />
              <h4 className="font-medium mb-2">Magic Auto-Fill</h4>
              <p className="text-sm text-muted-foreground">Instantly fill job application forms using data from your Career Twin profile.</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <BrainCircuit className="w-6 h-6 text-blue-500 mb-3" />
              <h4 className="font-medium mb-2">Live Predictor</h4>
              <p className="text-sm text-muted-foreground">Analyze job descriptions on LinkedIn/Indeed to see your placement probability in real-time.</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <Briefcase className="w-6 h-6 text-green-500 mb-3" />
              <h4 className="font-medium mb-2">Gap Analysis</h4>
              <p className="text-sm text-muted-foreground">Highlights exact missing skills directly on the job posting so you know what to learn next.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
