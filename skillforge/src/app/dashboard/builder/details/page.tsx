"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, ArrowRight, Plus, Trash2, Camera } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { motion } from "framer-motion";

export default function DetailsStep() {
  const router = useRouter();
  const { mergedData, updateMergedData } = usePortfolioStore();

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: mergedData
  });

  const [photoPreview, setPhotoPreview] = useState(mergedData.personalInfo.profilePhoto || "");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience"
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education"
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: "projects"
  });

  useEffect(() => {
    reset({
      ...mergedData,
      skills: Array.isArray(mergedData.skills) ? mergedData.skills.join(', ') : mergedData.skills
    });
  }, [mergedData, reset]);

  const onSubmit = (data: any) => {
    // Process skills into array if it's a string
    if (typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    data.personalInfo.profilePhoto = photoPreview;

    updateMergedData('personalInfo', data.personalInfo);
    updateMergedData('experience', data.experience);
    updateMergedData('education', data.education);
    updateMergedData('projects', data.projects);
    updateMergedData('skills', data.skills);
    
    router.push("/dashboard/builder/enhance");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-4 space-y-8 pb-20"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Verify Details</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Review the data extracted from your GitHub and Resume. Add your details and verify your experience before System enhancement.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Personal Info */}
        <Card className="glass-card border-border">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-semibold">Personal Information</h3>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
              <div 
                className="w-32 h-32 rounded-full border-4 border-background shadow-md overflow-hidden bg-secondary/50 flex items-center justify-center cursor-pointer group relative flex-shrink-0"
                onClick={() => photoInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground opacity-50" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1 pt-4">
                <h4 className="font-medium text-lg">Profile Photo</h4>
                <p className="text-sm text-muted-foreground">Upload a professional headshot. If you imported from GitHub, your avatar is pre-loaded!</p>
                <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                  Upload Photo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input {...register("personalInfo.firstName")} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input {...register("personalInfo.lastName")} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input {...register("personalInfo.email")} type="email" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input {...register("personalInfo.phone")} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input {...register("personalInfo.location")} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-500 flex items-center"><User className="w-4 h-4 mr-1"/> LinkedIn URL</label>
                <Input {...register("personalInfo.linkedin")} placeholder="https://linkedin.com/in/username" className="bg-secondary/50 border-blue-500/30" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="glass-card border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Work Experience</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ company: "", position: "", startDate: "", endDate: "", description: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            
            <div className="space-y-6">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeExp(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2"><label className="text-sm font-medium">Company</label><Input {...register(`experience.${index}.company`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Position</label><Input {...register(`experience.${index}.position`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Start Date</label><Input {...register(`experience.${index}.startDate`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">End Date</label><Input {...register(`experience.${index}.endDate`)} className="bg-secondary/50" /></div>
                    <div className="col-span-full space-y-2"><label className="text-sm font-medium">Description</label><Textarea {...register(`experience.${index}.description`)} className="bg-secondary/50 h-24" /></div>
                  </div>
                </div>
              ))}
              {expFields.length === 0 && <p className="text-muted-foreground text-sm italic">No experience added.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="glass-card border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Education</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: "", degree: "", graduationYear: "", cgpa: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            
            <div className="space-y-6">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeEdu(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2"><label className="text-sm font-medium">Institution</label><Input {...register(`education.${index}.institution`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Degree</label><Input {...register(`education.${index}.degree`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Graduation Year</label><Input {...register(`education.${index}.graduationYear`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">CGPA / Grade</label><Input {...register(`education.${index}.cgpa`)} className="bg-secondary/50" /></div>
                  </div>
                </div>
              ))}
              {eduFields.length === 0 && <p className="text-muted-foreground text-sm italic">No education added.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="glass-card border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Projects</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendProj({ name: "", description: "", link: "", technologies: [] })}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            
            <div className="space-y-6">
              {projFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeProj(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2"><label className="text-sm font-medium">Project Name</label><Input {...register(`projects.${index}.name`)} className="bg-secondary/50" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Link / URL</label><Input {...register(`projects.${index}.link`)} className="bg-secondary/50" /></div>
                    <div className="col-span-full space-y-2"><label className="text-sm font-medium">Description</label><Textarea {...register(`projects.${index}.description`)} className="bg-secondary/50" /></div>
                  </div>
                </div>
              ))}
              {projFields.length === 0 && <p className="text-muted-foreground text-sm italic">No projects added.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="glass-card border-border">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xl font-semibold">Skills</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Comma separated</label>
              <Textarea 
                {...register("skills")} 
                placeholder="React, TypeScript, Node.js..."
                className="bg-secondary/50 min-h-[100px]" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="h-12 px-8 text-md bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
            Continue to System Enhance <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

      </form>
    </motion.div>
  );
}
