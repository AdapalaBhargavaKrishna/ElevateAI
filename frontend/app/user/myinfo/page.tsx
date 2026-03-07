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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

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

const fadeUp = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

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

export default function MyInfoPage() {
    const [activeTab, setActiveTab] = useState("personal");
    const [editMode, setEditMode] = useState<string | null>(null);
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
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus("unsaved");
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
    };

    const addSkill = (s: string) => {
        const trimmed = s.trim();
        if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
        setSkillInput("");
    };
    const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

    const addExperience = () =>
        setExperiences([...experiences, { id: uid(), company: "", role: "", from: "", to: "", location: "", description: "", current: false }]);
    const removeExperience = (id: string) => setExperiences(experiences.filter((e) => e.id !== id));
    const updateExp = (id: string, field: keyof Experience, value: string | boolean) =>
        setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

    const addEducation = () =>
        setEducation([...education, { id: uid(), institution: "", degree: "", field: "", from: "", to: "", grade: "" }]);
    const removeEducation = (id: string) => setEducation(education.filter((e) => e.id !== id));
    const updateEdu = (id: string, field: keyof Education, value: string) =>
        setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

    const addProject = () =>
        setProjects([...projects, { id: uid(), name: "", description: "", techStack: "", liveUrl: "", repoUrl: "" }]);
    const removeProject = (id: string) => setProjects(projects.filter((p) => p.id !== id));
    const updateProj = (id: string, field: keyof Project, value: string) =>
        setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

    const addCert = () =>
        setCertifications([...certifications, { id: uid(), name: "", issuer: "", year: "", credentialUrl: "" }]);
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

    return (
        <TooltipProvider>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Info</h1>
                        <p className="text-sm text-muted-foreground mt-1">Your career profile powering AI insights</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={handleUndo} disabled={saveStatus === "saved"}>
                                    Undo
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Revert all unsaved changes</p></TooltipContent>
                        </Tooltip>
                        <Button size="sm" onClick={handleSave} disabled={saveStatus === "saved" || saveStatus === "saving"}>
                            {saveStatus === "saving" ? <>Saving...</> : <><Save className="h-4 w-4 mr-1.5" />Save</>}
                        </Button>
                    </div>
                </div>

                {/* Save Reminder */}
                <AnimatePresence>
                    {showSaveReminder && saveStatus === "unsaved" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
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

                {/* Save Status */}
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

                {/* Profile Completion */}
                <Card>
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-primary-foreground">{completion}%</span>
                            </div>
                            <div className="flex-1 sm:w-40">
                                <p className="text-sm font-medium text-foreground">Profile Completion</p>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completion}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full rounded-full bg-primary"
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

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
                    <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1">
                        {[
                            { value: "personal", label: "Personal", icon: User },
                            { value: "skills", label: "Skills", icon: Code },
                            { value: "experience", label: "Work", icon: Briefcase },
                            { value: "education", label: "Education", icon: GraduationCap },
                            { value: "projects", label: "Projects", icon: FolderOpen },
                            { value: "certifications", label: "Certs", icon: Award },
                        ].map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm gap-1.5">
                                <tab.icon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ── Personal Tab ── */}
                    <TabsContent value="personal" className="space-y-4">
                        {/* Basic Info */}
                        <Card>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                            <User className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        Basic Information
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setEditMode(editMode === "personal" ? null : "personal")}>
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">{editMode === "personal" ? "Done" : "Edit"}</span>
                                    </Button>
                                </div>

                                {editMode === "personal" ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Full Name</Label>
                                                <Input value={personal.fullName} disabled className="opacity-60 cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Email</Label>
                                                <Input value={personal.email} disabled className="opacity-60 cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Phone</Label>
                                                <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Location</Label>
                                                <Input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Bio</Label>
                                            <Textarea value={personal.bio} onChange={(e) => setPersonal({ ...personal, bio: e.target.value })} className="min-h-[80px]" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Current Role</Label>
                                                <Input value={personal.currentRole} onChange={(e) => setPersonal({ ...personal, currentRole: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Years of Experience</Label>
                                                <Select value={personal.yearsOfExp} onValueChange={(v) => setPersonal({ ...personal, yearsOfExp: v })}>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        {["0-1", "1-2", "2-4", "4-6", "6-10", "10+"].map((y) => (
                                                            <SelectItem key={y} value={y}>{y} years</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Career Goal</Label>
                                                <Input value={personal.careerGoal} onChange={(e) => setPersonal({ ...personal, careerGoal: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                                <span className="text-xl font-bold text-primary-foreground">
                                                    {personal.fullName ? personal.fullName.split(" ").map(n => n[0]).join("") : "?"}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-lg font-semibold text-foreground">{personal.fullName || "—"}</h4>
                                                <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                                                    {personal.currentRole && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{personal.currentRole}</span>}
                                                    {personal.location && <><span className="hidden sm:inline">·</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{personal.location}</span></>}
                                                </p>
                                                {personal.yearsOfExp && <p className="text-xs text-muted-foreground mt-1">{personal.yearsOfExp} years experience</p>}
                                            </div>
                                        </div>
                                        {personal.bio && <p className="text-sm text-muted-foreground leading-relaxed">{personal.bio}</p>}
                                        {personal.careerGoal && (
                                            <Badge variant="outline" className="gap-1">
                                                <Sparkles className="h-3.5 w-3.5 text-primary" /> Goal: {personal.careerGoal}
                                            </Badge>
                                        )}
                                        {!personal.currentRole && !personal.bio && !personal.careerGoal && (
                                            <p className="text-sm text-muted-foreground italic">Click Edit to fill in your profile.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Online Profiles */}
                        <Card>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Globe className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        Online Profiles
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setEditMode(editMode === "links" ? null : "links")}>
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">{editMode === "links" ? "Done" : "Edit"}</span>
                                    </Button>
                                </div>

                                {editMode === "links" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { label: "Website", key: "website" as const, icon: Globe, placeholder: "https://yoursite.com" },
                                            { label: "GitHub", key: "github" as const, icon: Github, placeholder: "https://github.com/username" },
                                            { label: "LinkedIn", key: "linkedin" as const, icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
                                            { label: "LeetCode", key: "leetcode" as const, icon: Code, placeholder: "https://leetcode.com/..." },
                                        ].map((link) => (
                                            <div key={link.key} className="space-y-1.5">
                                                <Label>{link.label}</Label>
                                                <div className="relative">
                                                    <link.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder={link.placeholder}
                                                        value={personal[link.key]}
                                                        onChange={(e) => setPersonal({ ...personal, [link.key]: e.target.value })}
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {personal.website && (
                                            <a href={personal.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                                                <Globe className="h-3.5 w-3.5" /> Website
                                            </a>
                                        )}
                                        {personal.github && (
                                            <a href={personal.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                                                <Github className="h-3.5 w-3.5" /> GitHub
                                            </a>
                                        )}
                                        {personal.linkedin && (
                                            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                                                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                            </a>
                                        )}
                                        {personal.leetcode && (
                                            <a href={personal.leetcode} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                                                <Code className="h-3.5 w-3.5" /> LeetCode
                                            </a>
                                        )}
                                        {!personal.website && !personal.github && !personal.linkedin && !personal.leetcode && (
                                            <p className="text-sm text-muted-foreground italic">Click Edit to add your links.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Skills Tab ── */}
                    <TabsContent value="skills">
                        <Card>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Code className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        Your Skills
                                    </h3>
                                    <Badge variant="secondary" className="text-[10px]">{skills.length}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skills.map((s) => (
                                        <Badge
                                            key={s}
                                            variant="secondary"
                                            className="text-xs py-1 px-2.5 gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group"
                                            onClick={() => removeSkill(s)}
                                        >
                                            {s}
                                            <X className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill..."
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                                        className="flex-1"
                                    />
                                    <Button variant="outline" size="sm" onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {skillSuggestions.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => addSkill(s)}
                                                className="text-xs px-2 py-1 rounded-full border bg-card hover:border-primary/40 hover:text-primary transition-colors"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Experience Tab ── */}
                    <TabsContent value="experience">
                        <div className="space-y-3">
                            {experiences.map((exp) => (
                                <Card key={exp.id}>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Briefcase className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">{exp.role || "Untitled Role"}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{exp.company || "Company"}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">{exp.from || "Start"} – {exp.current ? "Present" : exp.to || "End"}</span>
                                                        {exp.location && (<><span className="mx-0.5">·</span><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{exp.location}</span></>)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {exp.current && <Badge className="text-[9px] px-1.5 bg-primary/10 text-primary">Current</Badge>}
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(editMode === `exp-${exp.id}` ? null : `exp-${exp.id}`)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeExperience(exp.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editMode === `exp-${exp.id}` ? (
                                            <div className="space-y-3 pt-3 border-t">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Company</Label><Input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Role</Label><Input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Start</Label><Input type="month" value={exp.from} onChange={(e) => updateExp(exp.id, "from", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">End</Label><Input type="month" value={exp.to} onChange={(e) => updateExp(exp.id, "to", e.target.value)} disabled={exp.current} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Location</Label><Input value={exp.location} onChange={(e) => updateExp(exp.id, "location", e.target.value)} /></div>
                                                    <div className="flex items-end pb-1">
                                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="rounded border-border" />
                                                            Currently here
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Description</Label><Textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} /></div>
                                            </div>
                                        ) : (
                                            exp.description && <p className="text-sm text-muted-foreground leading-relaxed pl-12">{exp.description}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addExperience}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Experience
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ── Education Tab ── */}
                    <TabsContent value="education">
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <Card key={edu.id}>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <GraduationCap className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">{edu.degree} in {edu.field || "Field"}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{edu.institution || "Institution"}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">{edu.from} – {edu.to}</span>
                                                        {edu.grade && (<><span className="mx-0.5">·</span><span className="truncate">GPA: {edu.grade}</span></>)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(editMode === `edu-${edu.id}` ? null : `edu-${edu.id}`)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeEducation(edu.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editMode === `edu-${edu.id}` && (
                                            <div className="space-y-3 pt-3 border-t">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Institution</Label><Input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} /></div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs text-muted-foreground">Degree</Label>
                                                        <Select value={edu.degree} onValueChange={(v) => updateEdu(edu.id, "degree", v)}>
                                                            <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                                                            <SelectContent>
                                                                {["High School", "Associate", "Bachelor's", "Master's", "Ph.D.", "Bootcamp"].map((d) => (
                                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Field of Study</Label><Input value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Grade / GPA</Label><Input value={edu.grade} onChange={(e) => updateEdu(edu.id, "grade", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Start Year</Label><Input type="number" value={edu.from} onChange={(e) => updateEdu(edu.id, "from", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">End Year</Label><Input type="number" value={edu.to} onChange={(e) => updateEdu(edu.id, "to", e.target.value)} /></div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addEducation}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Education
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ── Projects Tab ── */}
                    <TabsContent value="projects">
                        <div className="space-y-3">
                            {projects.map((proj) => (
                                <Card key={proj.id}>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <FolderOpen className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">{proj.name || "Untitled Project"}</h4>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(proj.techStack || "").split(",").filter(Boolean).slice(0, 3).map((t) => (
                                                            <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.trim()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {proj.liveUrl && (
                                                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                                                    </a>
                                                )}
                                                {proj.repoUrl && (
                                                    <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><Github className="h-3.5 w-3.5" /></Button>
                                                    </a>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(editMode === `proj-${proj.id}` ? null : `proj-${proj.id}`)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeProject(proj.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editMode !== `proj-${proj.id}` && proj.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed pl-12">{proj.description}</p>
                                        )}

                                        {editMode === `proj-${proj.id}` && (
                                            <div className="space-y-3 pt-3 border-t">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Project Name</Label><Input value={proj.name} onChange={(e) => updateProj(proj.id, "name", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Tech Stack</Label><Input value={proj.techStack} onChange={(e) => updateProj(proj.id, "techStack", e.target.value)} placeholder="React, Node.js, etc." /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Live URL</Label><Input value={proj.liveUrl} onChange={(e) => updateProj(proj.id, "liveUrl", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Repo URL</Label><Input value={proj.repoUrl} onChange={(e) => updateProj(proj.id, "repoUrl", e.target.value)} /></div>
                                                </div>
                                                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Description</Label><Textarea value={proj.description} onChange={(e) => updateProj(proj.id, "description", e.target.value)} /></div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addProject}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Project
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ── Certifications Tab ── */}
                    <TabsContent value="certifications">
                        <div className="space-y-3">
                            {certifications.map((cert) => (
                                <Card key={cert.id}>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Award className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">{cert.name || "Untitled Certification"}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{cert.issuer} · {cert.year}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {cert.credentialUrl && (
                                                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                                                    </a>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(editMode === `cert-${cert.id}` ? null : `cert-${cert.id}`)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeCert(cert.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editMode === `cert-${cert.id}` && (
                                            <div className="space-y-3 pt-3 border-t">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Name</Label><Input value={cert.name} onChange={(e) => updateCert(cert.id, "name", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Issuer</Label><Input value={cert.issuer} onChange={(e) => updateCert(cert.id, "issuer", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Year</Label><Input type="number" value={cert.year} onChange={(e) => updateCert(cert.id, "year", e.target.value)} /></div>
                                                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Credential URL</Label><Input value={cert.credentialUrl} onChange={(e) => updateCert(cert.id, "credentialUrl", e.target.value)} /></div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addCert}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Certification
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
    );
}