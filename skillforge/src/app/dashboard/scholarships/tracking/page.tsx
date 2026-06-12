"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, ArrowLeft, Download, Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_STAGES = [
  "Application Submitted",
  "Documents Verified",
  "Under Review",
  "Interview Round",
  "Final Selection"
];

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/scholarships/tracking?id=${id}`)
        .then(res => res.json())
        .then(data => {
          setApplication(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading tracker...</div>;
  
  if (!application) return (
    <div className="p-8 text-center space-y-4">
      <h2 className="text-xl">Application Not Found</h2>
      <Button onClick={() => router.push("/dashboard/scholarships")}>Return to Scholarships</Button>
    </div>
  );

  const currentStageIndex = STATUS_STAGES.indexOf(application.status) !== -1 
    ? STATUS_STAGES.indexOf(application.status) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/scholarships")} className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Application Tracker</h1>
            <p className="text-muted-foreground text-sm">Application ID: {application.id.toUpperCase()}</p>
          </div>
        </div>
        <Button variant="outline" className="glass border-primary/20">
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-border md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl mb-1">{application.scholarship?.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" /> {application.scholarship?.provider}
                </CardDescription>
              </div>
              <Badge className="bg-primary text-white hover:bg-primary">
                {application.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-green-400 text-lg">Application Submitted Successfully</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your application was received on {new Date(application.submitted_at).toLocaleDateString()}. We will notify you via email when the status changes.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-lg border-b border-border pb-2">Status Timeline</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-secondary before:to-transparent">
                {STATUS_STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  
                  return (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${
                        isCompleted ? 'bg-primary border-primary text-white' : 
                        isCurrent ? 'bg-background border-primary text-primary' : 
                        'bg-background border-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : 
                         isCurrent ? <Clock className="w-4 h-4 animate-pulse" /> : 
                         <span className="text-xs">{index + 1}</span>}
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-accent/30 border border-border">
                        <div className={`font-semibold mb-1 ${isCurrent ? 'text-primary' : ''}`}>{stage}</div>
                        <div className="text-xs text-muted-foreground">
                          {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Applicant</div>
              <div className="font-medium">{JSON.parse(application.application_data || '{}').fullName}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">University</div>
              <div className="font-medium">{JSON.parse(application.application_data || '{}').college}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Submitted On</div>
              <div className="font-medium">{new Date(application.submitted_at).toLocaleDateString()}</div>
            </div>
            <div className="pt-4 border-t border-border space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs h-8">
                <FileText className="w-3 h-3 mr-2" /> View Submitted Form
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-8">
                <FileText className="w-3 h-3 mr-2" /> View Essay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
