"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Code, Globe, Rocket, Loader2 } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { generateTemplate } from "@/lib/templates";
import { motion } from "framer-motion";
import JSZip from "jszip";

export default function ExportStep() {
  const router = useRouter();
  const { mergedData, github, theme, reset } = usePortfolioStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const fullData = {
        ...mergedData,
        projects: mergedData.projects?.length > 0 ? mergedData.projects : (github?.repos || [])
      };

      const htmlContent = generateTemplate(theme.template, fullData, theme);
      const jsonContent = JSON.stringify(fullData, null, 2);

      const zip = new JSZip();
      zip.file("index.html", htmlContent);
      zip.file("portfolio.json", jsonContent);
      
      const blob = await zip.generateAsync({ type: "blob" });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${mergedData.personalInfo.firstName || 'my'}_portfolio.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate ZIP");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-12 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight">Portfolio Exported!</h2>
        <p className="text-xl text-muted-foreground">
          Your stunning new developer portfolio is downloaded and ready to deploy.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card className="glass-card border-border">
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
              <Globe className="w-8 h-8 text-blue-500" />
              <h3 className="font-semibold">Deploy to GitHub Pages</h3>
              <p className="text-sm text-muted-foreground">Push the extracted files to a new GitHub repository to host it for free.</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
              <Rocket className="w-8 h-8 text-purple-500" />
              <h3 className="font-semibold">Deploy to Vercel/Netlify</h3>
              <p className="text-sm text-muted-foreground">Drag and drop the extracted folder directly into Vercel or Netlify Drop.</p>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 flex justify-center gap-4">
          <Button onClick={() => { setSuccess(false); router.push("/dashboard"); }} variant="outline" className="h-12 px-8">
            Back to Dashboard
          </Button>
          <Button onClick={() => { reset(); router.push("/dashboard/builder/github"); }} className="h-12 px-8 bg-primary">
            Build Another Portfolio
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-8 space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Export & Deploy</h2>
        <p className="text-muted-foreground">
          Your portfolio is completely ready. Download the source files instantly.
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-secondary rounded-2xl border border-border flex items-center justify-center shadow-inner relative">
              <Code className="w-12 h-12 text-primary" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                HTML/CSS
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold">Ready to ship!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You will receive a ZIP file containing a perfectly optimized <code className="bg-secondary px-1 py-0.5 rounded text-primary">index.html</code> file with all inline styles, plus a <code className="bg-secondary px-1 py-0.5 rounded text-primary">portfolio.json</code> backup of your data.
          </p>

          <Button 
            onClick={handleDownload} 
            disabled={loading}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 text-white shadow-xl shadow-primary/25 rounded-xl mt-4 transition-transform hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Download className="w-6 h-6 mr-2" />}
            Download Portfolio Source
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
