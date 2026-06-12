"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Save, Loader2, Database } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    user_id: user?.uid || "",
    personal_info: {
      first_name: "",
      last_name: "",
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
      photo_url: ""
    },
    education: {
      university: "",
      degree: "",
      graduation_year: "",
      cgpa: ""
    },
    skills_raw: "",
    experience: "",
    current_ctc: "",
    expected_ctc: "",
    notice_period: "",
    experience_years: "",
    gender: ""
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({
            ...prev,
            ...data,
            personal_info: { ...prev.personal_info, ...(data.personal_info || {}) },
            education: { ...prev.education, ...(data.education || {}) }
          }));
        } else {
          // Preset email and name from Google if document doesn't exist yet
          setFormData(prev => ({
            ...prev,
            user_id: user.uid,
            personal_info: {
              ...prev.personal_info,
              first_name: user.displayName?.split(" ")[0] || "",
              last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
              email: user.email || ""
            }
          }));
        }
      } catch (err) {
        console.error("Firebase fetch failed:", err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleChange = (section: string, field: string, value: string) => {
    if (section === "root") {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev as any /* eslint-disable-line */)[section],
          [field]: value
        }
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    
    // Auto-generate full name
    const updatedData = { ...formData };
    updatedData.personal_info.full_name = `${updatedData.personal_info.first_name} ${updatedData.personal_info.last_name}`;
    
    try {
      await setDoc(doc(db, "users", user!.uid), updatedData, { merge: true });
      setMessage("Profile successfully saved to Firebase!");
    } catch (error) {
      console.error(error);
      setMessage("Error saving profile to Firebase.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground flex items-center">
            <Database className="w-4 h-4 mr-1 text-primary" />
            Connected to Firebase Firestore
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save to Firebase
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center mb-4"><User className="w-5 h-5 mr-2 text-primary" /> Personal Information</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden bg-secondary flex items-center justify-center">
                {formData.personal_info.photo_url ? (
                  <img src={formData.personal_info.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground cursor-pointer bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md border border-border transition-colors">
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleChange("personal_info", "photo_url", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
                <p className="text-xs text-muted-foreground">Recommended: Square image, max 1MB</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">First Name</label>
                <input type="text" value={formData.personal_info.first_name} onChange={(e) => handleChange("personal_info", "first_name", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                <input type="text" value={formData.personal_info.last_name} onChange={(e) => handleChange("personal_info", "last_name", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <input type="email" value={formData.personal_info.email} onChange={(e) => handleChange("personal_info", "email", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <input type="text" value={formData.personal_info.phone || ""} onChange={(e) => handleChange("personal_info", "phone", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <input type="text" value={formData.personal_info.location} onChange={(e) => handleChange("personal_info", "location", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">LinkedIn URL</label>
                <input type="text" value={formData.personal_info.linkedin} onChange={(e) => handleChange("personal_info", "linkedin", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">GitHub URL</label>
                <input type="text" value={formData.personal_info.github} onChange={(e) => handleChange("personal_info", "github", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Portfolio URL</label>
              <input type="text" value={formData.personal_info.portfolio || ""} onChange={(e) => handleChange("personal_info", "portfolio", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>


            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Gender</label>
                <select value={formData.gender || ""} onChange={(e) => handleChange("root", "gender", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-card border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Professional Profile</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Top Skills (Comma separated)</label>
                <textarea 
                  value={formData.skills_raw} 
                  onChange={(e) => handleChange("root", "skills_raw", e.target.value)} 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary min-h-[80px]" 
                  placeholder="Python, React, Machine Learning..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Short Bio / Experience Summary</label>
                <textarea 
                  value={formData.experience} 
                  onChange={(e) => handleChange("root", "experience", e.target.value)} 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary min-h-[80px]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Years of Experience</label>
                  <input type="number" value={formData.experience_years || ""} onChange={(e) => handleChange("root", "experience_years", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 2" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Notice Period (Days)</label>
                  <input type="number" value={formData.notice_period || ""} onChange={(e) => handleChange("root", "notice_period", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Current CTC (Annually)</label>
                  <input type="number" value={formData.current_ctc || ""} onChange={(e) => handleChange("root", "current_ctc", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 500000" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Expected CTC (Annually)</label>
                  <input type="number" value={formData.expected_ctc || ""} onChange={(e) => handleChange("root", "expected_ctc", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 1000000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Education</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">University</label>
                  <input type="text" value={formData.education.university} onChange={(e) => handleChange("education", "university", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Degree</label>
                  <input type="text" value={formData.education.degree} onChange={(e) => handleChange("education", "degree", e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
