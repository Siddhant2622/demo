"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, DollarSign, Building2, ExternalLink, CheckCircle2, ChevronRight, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ScholarshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<any>(null);

  useEffect(() => {
    // Load scholarship from local storage mock for now
    const stored = localStorage.getItem("current_scholarship");
    if (stored) {
      setScholarship(JSON.parse(stored));
    }
  }, [params.id]);

  if (!scholarship) {
    return <div className="p-8 text-center">Loading scholarship details...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Scholarships
      </Button>

      <Card className="glass-card border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">{scholarship.title}</CardTitle>
              <CardDescription className="flex items-center mt-2 text-base">
                <Building2 className="w-4 h-4 mr-2" /> {scholarship.provider || "Official Provider"}
              </CardDescription>
            </div>
            {scholarship.match && (
              <div className="flex flex-col items-end">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">
                  {scholarship.match}% Match
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-accent/50 p-4 rounded-xl border border-border">
              <div className="flex items-center text-muted-foreground mb-1 text-sm"><DollarSign className="w-4 h-4 mr-1"/> Amount</div>
              <div className="font-semibold text-lg text-green-400">{scholarship.amount}</div>
            </div>
            <div className="bg-accent/50 p-4 rounded-xl border border-border">
              <div className="flex items-center text-muted-foreground mb-1 text-sm"><Clock className="w-4 h-4 mr-1"/> Deadline</div>
              <div className="font-semibold text-lg text-red-400">{scholarship.deadline}</div>
            </div>
            <div className="bg-accent/50 p-4 rounded-xl border border-border md:col-span-2">
              <div className="flex items-center text-muted-foreground mb-1 text-sm"><FileText className="w-4 h-4 mr-1"/> Status</div>
              <div className="font-semibold text-lg text-blue-400 flex items-center">
                Accepting Applications
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3 border-b border-border pb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {scholarship.description || `The ${scholarship.title} is designed to support outstanding students pursuing careers in technology and related fields. This scholarship provides financial assistance, mentorship opportunities, and potential internship placements for successful candidates who demonstrate academic excellence and a passion for innovation.`}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 border-b border-border pb-2">Eligibility Criteria</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-3 text-primary shrink-0 mt-0.5" /> Currently enrolled as a full-time university student</li>
                <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-3 text-primary shrink-0 mt-0.5" /> Pursuing a degree in Computer Science, Engineering, or related STEM field</li>
                <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-3 text-primary shrink-0 mt-0.5" /> Minimum CGPA of 3.0 or equivalent</li>
                <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-3 text-primary shrink-0 mt-0.5" /> Demonstrated interest in technology and leadership</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 border-b border-border pb-2">Required Documents</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
                <li className="flex items-center p-3 bg-accent rounded-lg"><FileText className="w-4 h-4 mr-3" /> Updated Resume/CV</li>
                <li className="flex items-center p-3 bg-accent rounded-lg"><FileText className="w-4 h-4 mr-3" /> Academic Transcripts</li>
                <li className="flex items-center p-3 bg-accent rounded-lg"><FileText className="w-4 h-4 mr-3" /> Statement of Purpose (Essay)</li>
                <li className="flex items-center p-3 bg-accent rounded-lg"><FileText className="w-4 h-4 mr-3" /> Government ID Proof</li>
              </ul>
            </section>

            <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-primary mr-3 shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Fast-Track Application</h4>
                  <p className="text-muted-foreground mb-4">
                    Use our System-powered application portal to auto-fill your details, check your eligibility instantly, and get an System review on your scholarship essay before you submit.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-full transition-all"
                    onClick={() => router.push(`/dashboard/scholarships/${params.id}/apply`)}
                  >
                    Start Application <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
