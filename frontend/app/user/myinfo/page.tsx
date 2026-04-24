'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Briefcase, GraduationCap, Code, Award, FolderOpen, Globe,
    Plus, Trash2, Github, Linkedin, ExternalLink, Calendar, MapPin,
    Save, Pencil, CheckCircle2, Clock, AlertCircle,
    X, Sparkles
} from "lucide-react";
import { api } from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from 'react-hot-toast';

interface Experience {
    id: string; company: string; role: string; from: string; to: string; location: string; description: string; current: boolean;
}
interface Education {
    id: string; institution: string; degree: string; field: string; from: string; to: string; grade: string;
}
interface Project {
    id: string; name: string; description: string; techStack: string; liveUrl: string; repoUrl: string;
}
interface Certification {
    id: string; name: string; issuer: string; year: string; credentialUrl: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const skillSuggestions = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
    "Go", "Rust", "SQL", "MongoDB", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Git", "GraphQL", "REST API", "Redis", "TailwindCSS", "Figma",
];

const emptyPersonal = {
    fullName: "", email: "", phone: "", location: "", bio: "",
    careerGoal: "", yearsOfExp: "", currentRole: "",
    website: "", github: "", linkedin: "", leetcode: "",
};

const SkeletonLine = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
);

const SkeletonCircle = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded-full ${className}`} />
);

const SkeletonCard = () => (
    <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <SkeletonCircle className="h-9 w-9" />
                    <div className="space-y-2">
                        <SkeletonLine className="h-4 w-32" />
                        <SkeletonLine className="h-3 w-24" />
                        <SkeletonLine className="h-3 w-40" />
                    </div>
                </div>
                <SkeletonLine className="h-7 w-16" />
            </div>
            <SkeletonLine className="h-16 w-full" />
        </CardContent>
    </Card>
);

const ProfileSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <SkeletonLine className="h-8 w-32 mb-2" />
                <SkeletonLine className="h-4 w-64" />
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
                <SkeletonLine className="h-9 w-16 rounded-md" />
                <SkeletonLine className="h-9 w-20 rounded-md" />
            </div>
        </div>
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <SkeletonCircle className="h-12 w-12 sm:h-10 sm:w-10" />
                    <div className="flex-1 sm:w-40">
                        <SkeletonLine className="h-4 w-28 mb-2" />
                        <SkeletonLine className="h-1.5 w-full rounded-full" />
                    </div>
                </div>
                <SkeletonLine className="h-4 w-48 sm:ml-auto" />
            </CardContent>
        </Card>
        <div className="space-y-5">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-muted rounded-lg">
                {[...Array(6)].map((_, i) => (
                    <SkeletonLine key={i} className="h-9 rounded-md" />
                ))}
            </div>
            <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    </div>
);

export default function MyInfoPage() {
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
    const [lastSaved, setLastSaved] = useState<Date>(new Date());
    const [showSaveReminder, setShowSaveReminder] = useState(false);

    const [personal, setPersonal] = useState(emptyPersonal);
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);

    const [originalState, setOriginalState] = useState({
        personal: emptyPersonal,
        skills: [] as string[],
        experiences: [] as Experience[],
        education: [] as Education[],
        projects: [] as Project[],
        certifications: [] as Certification[],
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            setLoading(true);
            try {
                const { data: meData } = await api.get('/auth/me');
                const fullName = meData.user.fullName || "";
                const email = meData.user.email || "";

                const { data } = await api.get('/user-info');
                const u = data.userInfo;

                const loadedPersonal = {
                    fullName,
                    email,
                    phone: u?.phone || "",
                    location: u?.location || "",
                    bio: u?.bio || "",
                    careerGoal: u?.careerGoal || "",
                    currentRole: u?.currentRole || "",
                    yearsOfExp: u?.yearsOfExp || "",
                    website: u?.website || "",
                    github: u?.github || "",
                    linkedin: u?.linkedin || "",
                    leetcode: u?.leetcode || "",
                };
                const loadedSkills = u?.skills?.map((s: any) => s.name) ?? [];
                const loadedExperiences = u?.experiences?.map((e: any) => ({ ...e, id: uid() })) ?? [];
                const loadedEducation = u?.education?.map((e: any) => ({ ...e, id: uid() })) ?? [];
                const loadedProjects = u?.projects?.map((p: any) => ({ ...p, id: uid() })) ?? [];
                const loadedCerts = u?.certifications?.map((c: any) => ({ ...c, id: uid() })) ?? [];

                setPersonal(loadedPersonal);
                setSkills(loadedSkills);
                setExperiences(loadedExperiences);
                setEducation(loadedEducation);
                setProjects(loadedProjects);
                setCertifications(loadedCerts);

                setOriginalState({
                    personal: loadedPersonal,
                    skills: loadedSkills,
                    experiences: JSON.parse(JSON.stringify(loadedExperiences)),
                    education: JSON.parse(JSON.stringify(loadedEducation)),
                    projects: JSON.parse(JSON.stringify(loadedProjects)),
                    certifications: JSON.parse(JSON.stringify(loadedCerts)),
                });
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error("Failed to load your profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        const hasChanges =
            JSON.stringify(personal) !== JSON.stringify(originalState.personal) ||
            JSON.stringify(skills) !== JSON.stringify(originalState.skills) ||
            JSON.stringify(experiences) !== JSON.stringify(originalState.experiences) ||
            JSON.stringify(education) !== JSON.stringify(originalState.education) ||
            JSON.stringify(projects) !== JSON.stringify(originalState.projects) ||
            JSON.stringify(certifications) !== JSON.stringify(originalState.certifications);

        setSaveStatus(hasChanges ? "unsaved" : "saved");

        if (hasChanges) {
            const timer = setTimeout(() => setShowSaveReminder(true), 3000);
            return () => clearTimeout(timer);
        } else {
            setShowSaveReminder(false);
        }
    }, [personal, skills, experiences, education, projects, certifications, originalState]);

    const handleSave = async () => {
        setSaveStatus("saving");
        try {
            await api.post('/user-info/save', {
                phone: personal.phone,
                location: personal.location,
                bio: personal.bio,
                careerGoal: personal.careerGoal,
                currentRole: personal.currentRole,
                yearsOfExp: personal.yearsOfExp,
                website: personal.website,
                github: personal.github,
                linkedin: personal.linkedin,
                leetcode: personal.leetcode,
                skills,
                experiences: experiences.map(({ id, ...rest }) => rest),
                education: education.map(({ id, ...rest }) => rest),
                projects: projects.map(({ id, ...rest }) => rest),
                certifications: certifications.map(({ id, ...rest }) => rest),
            });

            setOriginalState({
                personal: { ...personal },
                skills: [...skills],
                experiences: JSON.parse(JSON.stringify(experiences)),
                education: JSON.parse(JSON.stringify(education)),
                projects: JSON.parse(JSON.stringify(projects)),
                certifications: JSON.parse(JSON.stringify(certifications)),
            });

            setSaveStatus("saved");
            setLastSaved(new Date());
            setShowSaveReminder(false);
            toast.success("Profile saved successfully.");
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus("unsaved");
            toast.error("Failed to save profile. Please try again.");
        }
    };

    const handleUndo = () => {
        setPersonal({ ...originalState.personal });
        setSkills([...originalState.skills]);
        setExperiences(JSON.parse(JSON.stringify(originalState.experiences)));
        setEducation(JSON.parse(JSON.stringify(originalState.education)));
        setProjects(JSON.parse(JSON.stringify(originalState.projects)));
        setCertifications(JSON.parse(JSON.stringify(originalState.certifications)));
        setSaveStatus("saved");
        setShowSaveReminder(false);
        toast.success("Changes reverted.");
    };

    const addSkill = (s: string) => {
        const trimmed = s.trim();
        if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
        setSkillInput("");
    };
    const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

    const addExperience = () =>
        setExperiences([{ id: uid(), company: "", role: "", from: "", to: "", location: "", description: "", current: false }, ...experiences]);
    const removeExperience = (id: string) => setExperiences(experiences.filter((e) => e.id !== id));
    const updateExp = (id: string, field: keyof Experience, value: string | boolean) =>
        setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

    const addEducation = () =>
        setEducation([{ id: uid(), institution: "", degree: "", field: "", from: "", to: "", grade: "" }, ...education]);
    const removeEducation = (id: string) => setEducation(education.filter((e) => e.id !== id));
    const updateEdu = (id: string, field: keyof Education, value: string) =>
        setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

    const addProject = () =>
        setProjects([{ id: uid(), name: "", description: "", techStack: "", liveUrl: "", repoUrl: "" }, ...projects]);
    const removeProject = (id: string) => setProjects(projects.filter((p) => p.id !== id));
    const updateProj = (id: string, field: keyof Project, value: string) =>
        setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

    const addCert = () =>
        setCertifications([{ id: uid(), name: "", issuer: "", year: "", credentialUrl: "" }, ...certifications]);
    const removeCert = (id: string) => setCertifications(certifications.filter((c) => c.id !== id));
    const updateCert = (id: string, field: keyof Certification, value: string) =>
        setCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

    const completionItems = [
        personal.fullName, personal.email, personal.location, personal.bio,
        personal.careerGoal, personal.currentRole, personal.github, personal.linkedin,
        skills.length >= 5 ? "yes" : "",
        experiences.length > 0 && experiences[0].company ? "yes" : "",
        education.length > 0 && education[0].institution ? "yes" : "",
        projects.length > 0 && projects[0].name ? "yes" : "",
        certifications.length > 0 && certifications[0].name ? "yes" : "",
    ];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            My Info
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Your career profile powering AI insights</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={handleUndo} disabled={saveStatus === "saved"} className="transition-all">
                                    Undo
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Revert all unsaved changes</p></TooltipContent>
                        </Tooltip>
                        <Button size="sm" onClick={handleSave} disabled={saveStatus === "saved" || saveStatus === "saving"} className="transition-all hover:scale-105 active:scale-95 shadow-lg">
                            {saveStatus === "saving" ? <>Saving...</> : <><Save className="h-4 w-4 mr-1.5" />Save Profile</>}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showSaveReminder && saveStatus === "unsaved" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm backdrop-blur-md"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">You have unsaved changes</p>
                                    <p className="text-xs text-muted-foreground">Don't forget to save your progress</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
                                <Button size="sm" onClick={handleSave}>Save Now</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-end gap-2 text-xs">
                    {saveStatus === "saved" ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> All changes saved
                            <span className="text-muted-foreground hidden sm:inline"> · {lastSaved.toLocaleTimeString()}</span>
                        </span>
                    ) : saveStatus === "unsaved" ? (
                        <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Unsaved changes
                        </span>
                    ) : (
                        <span className="text-primary flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 animate-spin" /> Saving...
                        </span>
                    )}
                </div>

                <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-inner">
                                <span className="text-sm font-bold text-primary-foreground">{completion}%</span>
                            </div>
                            <div className="flex-1 sm:w-64">
                                <p className="text-sm font-medium text-foreground">Profile Completion</p>
                                <div className="h-2 rounded-full bg-muted overflow-hidden mt-1.5 border border-border/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completion}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        {completion < 100 && (
                            <p className="text-xs text-muted-foreground sm:ml-auto">
                                {completion >= 80 ? "Almost there! 🎯" : "Complete for better AI insights"}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold tracking-tight">Basic Information</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Full Name</Label>
                                            <Input value={personal.fullName} disabled className="opacity-60 cursor-not-allowed bg-muted" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Email</Label>
                                            <Input value={personal.email} disabled className="opacity-60 cursor-not-allowed bg-muted" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Phone</Label>
                                            <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className="bg-background/50 focus:bg-background transition-colors" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Location</Label>
                                            <Input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} className="bg-background/50 focus:bg-background transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">Bio</Label>
                                        <Textarea value={personal.bio} onChange={(e) => setPersonal({ ...personal, bio: e.target.value })} className="min-h-[100px] bg-background/50 focus:bg-background transition-colors resize-none" placeholder="A short blurb about you..." />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Current Role</Label>
                                            <Input value={personal.currentRole} onChange={(e) => setPersonal({ ...personal, currentRole: e.target.value })} className="bg-background/50 focus:bg-background transition-colors" placeholder="Software Engineer" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Years of Experience</Label>
                                            <Select value={personal.yearsOfExp} onValueChange={(v) => setPersonal({ ...personal, yearsOfExp: v })}>
                                                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {["0-1", "1-2", "2-4", "4-6", "6-10", "10+"].map((y) => (
                                                        <SelectItem key={y} value={y}>{y} years</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Career Goal</Label>
                                            <Input value={personal.careerGoal} onChange={(e) => setPersonal({ ...personal, careerGoal: e.target.value })} className="bg-background/50 focus:bg-background transition-colors" placeholder="Full Stack Developer" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Globe className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold tracking-tight">Online Profiles</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: "Website", key: "website" as const, icon: Globe, placeholder: "https://yoursite.com" },
                                        { label: "GitHub", key: "github" as const, icon: Github, placeholder: "https://github.com/username" },
                                        { label: "LinkedIn", key: "linkedin" as const, icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
                                        { label: "LeetCode", key: "leetcode" as const, icon: Code, placeholder: "https://leetcode.com/..." },
                                    ].map((link) => (
                                        <div key={link.key} className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">{link.label}</Label>
                                            <div className="relative group/input">
                                                <link.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                                <Input
                                                    placeholder={link.placeholder}
                                                    value={personal[link.key]}
                                                    onChange={(e) => setPersonal({ ...personal, [link.key]: e.target.value })}
                                                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Code className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold tracking-tight">Your Skills</h3>
                                    </div>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">{skills.length}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((s) => (
                                        <Badge
                                            key={s}
                                            variant="secondary"
                                            className="text-sm py-1.5 px-3 gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all"
                                            onClick={() => removeSkill(s)}
                                        >
                                            {s}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a new skill..."
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                                        className="flex-1 bg-background/50 focus:bg-background transition-colors"
                                    />
                                    <Button variant="secondary" onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()} className="px-6">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {skills.length < 15 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-3 font-medium">Suggested Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {skillSuggestions.filter((s) => !skills.includes(s)).slice(0, 10).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => addSkill(s)}
                                                    className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                                                >
                                                    + {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold tracking-tight">Experience</h3>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addExperience} className="h-8 hover:bg-primary hover:text-primary-foreground">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {experiences.map((exp) => (
                                            <motion.div key={exp.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-background/50 rounded-xl p-4 border border-border/50 group/item">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeExperience(exp.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Company</Label><Input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} placeholder="Google" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Role</Label><Input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} placeholder="Software Engineer" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Start Date</Label><Input type="month" value={exp.from} onChange={(e) => updateExp(exp.id, "from", e.target.value)} className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">End Date</Label><Input type="month" value={exp.to} onChange={(e) => updateExp(exp.id, "to", e.target.value)} disabled={exp.current} className="bg-background focus:bg-background disabled:opacity-50" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Location</Label><Input value={exp.location} onChange={(e) => updateExp(exp.id, "location", e.target.value)} placeholder="San Francisco, CA" className="bg-background focus:bg-background" /></div>
                                                    <div className="flex items-end pb-2">
                                                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-foreground/80 hover:text-foreground">
                                                            <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="rounded border-border accent-primary h-4 w-4" />
                                                            Currently working here
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="mt-4 space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                                    <Textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} className="min-h-[80px] bg-background focus:bg-background resize-none" placeholder="What did you achieve here?" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {experiences.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border-2 border-dashed border-border/50 rounded-xl">No experience added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold tracking-tight">Education</h3>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addEducation} className="h-8 hover:bg-primary hover:text-primary-foreground">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {education.map((edu) => (
                                            <motion.div key={edu.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-background/50 rounded-xl p-4 border border-border/50 group/item">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeEducation(edu.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Institution</Label><Input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} placeholder="Stanford University" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs text-muted-foreground">Degree</Label>
                                                        <Select value={edu.degree} onValueChange={(v) => updateEdu(edu.id, "degree", v)}>
                                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select degree" /></SelectTrigger>
                                                            <SelectContent>
                                                                {["High School", "Associate", "Bachelor's", "Master's", "Ph.D.", "Bootcamp"].map((d) => (
                                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Field of Study</Label><Input value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} placeholder="Computer Science" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Grade / GPA</Label><Input value={edu.grade} onChange={(e) => updateEdu(edu.id, "grade", e.target.value)} placeholder="3.8/4.0" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Start Year</Label><Input type="number" value={edu.from} onChange={(e) => updateEdu(edu.id, "from", e.target.value)} placeholder="2018" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">End Year</Label><Input type="number" value={edu.to} onChange={(e) => updateEdu(edu.id, "to", e.target.value)} placeholder="2022" className="bg-background focus:bg-background" /></div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {education.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border-2 border-dashed border-border/50 rounded-xl">No education added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FolderOpen className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold tracking-tight">Projects</h3>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addProject} className="h-8 hover:bg-primary hover:text-primary-foreground">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {projects.map((proj) => (
                                            <motion.div key={proj.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-background/50 rounded-xl p-4 border border-border/50 group/item">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeProject(proj.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Project Name</Label><Input value={proj.name} onChange={(e) => updateProj(proj.id, "name", e.target.value)} placeholder="E-commerce App" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Tech Stack</Label><Input value={proj.techStack} onChange={(e) => updateProj(proj.id, "techStack", e.target.value)} placeholder="React, Node.js, MongoDB" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Live URL</Label><Input value={proj.liveUrl} onChange={(e) => updateProj(proj.id, "liveUrl", e.target.value)} placeholder="https://myapp.com" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Repo URL</Label><Input value={proj.repoUrl} onChange={(e) => updateProj(proj.id, "repoUrl", e.target.value)} placeholder="https://github.com/..." className="bg-background focus:bg-background" /></div>
                                                </div>
                                                <div className="mt-4 space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                                    <Textarea value={proj.description} onChange={(e) => updateProj(proj.id, "description", e.target.value)} className="min-h-[80px] bg-background focus:bg-background resize-none" placeholder="What does this project do?" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {projects.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border-2 border-dashed border-border/50 rounded-xl">No projects added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Award className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold tracking-tight">Certifications</h3>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addCert} className="h-8 hover:bg-primary hover:text-primary-foreground">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {certifications.map((cert) => (
                                            <motion.div key={cert.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-background/50 rounded-xl p-4 border border-border/50 group/item">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeCert(cert.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Certification Name</Label><Input value={cert.name} onChange={(e) => updateCert(cert.id, "name", e.target.value)} placeholder="AWS Solutions Architect" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Issuer</Label><Input value={cert.issuer} onChange={(e) => updateCert(cert.id, "issuer", e.target.value)} placeholder="Amazon Web Services" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Year</Label><Input type="number" value={cert.year} onChange={(e) => updateCert(cert.id, "year", e.target.value)} placeholder="2023" className="bg-background focus:bg-background" /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Credential URL</Label><Input value={cert.credentialUrl} onChange={(e) => updateCert(cert.id, "credentialUrl", e.target.value)} placeholder="https://..." className="bg-background focus:bg-background" /></div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {certifications.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border-2 border-dashed border-border/50 rounded-xl">No certifications added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}