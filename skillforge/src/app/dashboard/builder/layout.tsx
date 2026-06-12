"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check, ChevronRight, GitBranch, FileText, User, Sparkles, LayoutTemplate, Download } from "lucide-react";
import { cn } from "@/lib/utils";

import { Briefcase } from "lucide-react";

const steps = [
  { id: "github", name: "GitHub", icon: GitBranch, path: "/dashboard/builder/github" },
  { id: "linkedin", name: "LinkedIn", icon: Briefcase, path: "/dashboard/builder/linkedin" },
  { id: "resume", name: "Resume", icon: FileText, path: "/dashboard/builder/resume" },
  { id: "details", name: "Details", icon: User, path: "/dashboard/builder/details" },
  { id: "enhance", name: "System Enhance", icon: Sparkles, path: "/dashboard/builder/enhance" },
  { id: "templates", name: "Templates", icon: LayoutTemplate, path: "/dashboard/builder/templates" },
  { id: "export", name: "Export", icon: Download, path: "/dashboard/builder/export" },
];

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const currentStepIndex = steps.findIndex(step => pathname.includes(step.id));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Progress Bar Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-md p-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              System Portfolio Builder
            </h1>
            <div className="text-xs text-muted-foreground flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Auto-saving
            </div>
          </div>
          
          <div className="mt-6">
            <nav aria-label="Progress">
              <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => {
                  const isCurrent = stepIdx === currentStepIndex || (currentStepIndex === -1 && stepIdx === 0);
                  const isCompleted = stepIdx < currentStepIndex;

                  return (
                    <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "", "relative")}>
                      {stepIdx !== steps.length - 1 && (
                        <div className="absolute top-4 left-0 -ml-px mt-0.5 w-full h-0.5 bg-border" aria-hidden="true">
                          <div 
                            className={cn("h-full transition-all duration-500 bg-primary", isCompleted ? "w-full" : "w-0")} 
                          />
                        </div>
                      )}
                      <Link href={step.path} className="relative flex items-center justify-center group">
                        <span className="h-9 flex items-center">
                          <span
                            className={cn(
                              "relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                              isCompleted ? "bg-primary text-primary-foreground" : 
                              isCurrent ? "border-2 border-primary bg-background text-primary" : 
                              "border-2 border-muted bg-background text-muted-foreground group-hover:border-muted-foreground"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5" aria-hidden="true" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </span>
                        </span>
                        <span className="ml-4 min-w-max flex flex-col">
                          <span className={cn(
                            "text-xs font-medium tracking-wide uppercase",
                            isCurrent ? "text-primary" : "text-muted-foreground"
                          )}>
                            {step.name}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
