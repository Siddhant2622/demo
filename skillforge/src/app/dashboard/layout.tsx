"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  BarChart3, 
  BrainCircuit, 
  Briefcase, 
  GraduationCap, 
  LayoutDashboard, 
  LogOut, 
  Settings,
  User,
  Sparkles,
  Puzzle,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "System Career Twin", href: "/dashboard/twin", icon: User },
  { name: "Career Success Platform", href: "/dashboard/career-success", icon: Briefcase },
  { name: "Interview Simulator", href: "/dashboard/interview", icon: Briefcase },
  { name: "Scholarship Finder", href: "/dashboard/scholarships", icon: GraduationCap },
  { name: "Portfolio Builder", href: "/dashboard/builder", icon: Sparkles },
  { name: "Browser Extension", href: "/dashboard/extension", icon: Puzzle },
  { name: "Profile Settings", href: "/dashboard/profile", icon: Settings },
  { name: "Analytics", href: "/admin", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (!loading && !user) {
    return null;
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Sparkles className="w-5 h-5 text-primary mr-2" />
          <span className="font-bold tracking-tight">SkillForge</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-4 px-3 mt-4">Menu</div>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer">
            <LogOut className="w-4 h-4" />
            Sign Out
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-[280px] max-w-[80vw] bg-card border-r border-border shadow-2xl flex flex-col h-full animate-in slide-in-from-left-full duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-primary mr-2" />
                <span className="font-bold tracking-tight">SkillForge</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-4 px-3 mt-4">Menu</div>
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-border">
              <div onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sign Out
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-background/80 backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 rounded-md hover:bg-accent text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
              {sidebarLinks.find(l => l.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 shadow-sm flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Abstract Background for Dashboard */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
