'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Briefcase, GraduationCap, Code, Award, FolderOpen, Globe,
    Plus, Trash2, Github, Linkedin, ExternalLink, Calendar, MapPin,
    Save, Pencil, CheckCircle2, Clock, AlertCircle,
    X, Sparkles, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
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

export default function MyInfoPage() {
    const [activeTab, setActiveTab] = useState("personal");
    const [editMode, setEditMode] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
    const [lastSaved, setLastSaved] = useState<Date>(new Date());
    const [showSaveReminder, setShowSaveReminder] = useState(false);

    const [personal, setPersonal] = useState({
        fullName: "Bhargava Krishna",
        email: "bk.adapala@gmail.com",
        phone: "+91 93902 43210",
        location: "Bangalore, India",
        bio: "Passionate full-stack developer with a knack for building scalable web applications. Love open-source, coffee, and solving complex problems with elegant code.",
        careerGoal: "Senior Full-Stack Engineer",
        yearsOfExp: "2-4",
        currentRole: "Software Engineer",
        website: "https://bhargava1028.web.app",
        github: "https://github.com/AdapalaBhargavaKrishna",
        linkedin: "https://www.linkedin.com/in/bhargavakrishnaadapala/",
        leetcode: "https://leetcode.com/u/bhargava69/",
    });

    const [skills, setSkills] = useState<string[]>([
        "React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker",
        "AWS", "TailwindCSS", "GraphQL", "Git", "Next.js", "MongoDB",
    ]);
    const [skillInput, setSkillInput] = useState("");

    const [experiences, setExperiences] = useState<Experience[]>([
        {
            id: uid(), company: "TechNova Solutions", role: "Software Engineer",
            from: "2023-03", to: "", location: "Bangalore, India",
            description: "Building microservices architecture for a B2B SaaS platform. Led migration from monolith to event-driven architecture, improving response times by 40%.",
            current: true,
        },
        {
            id: uid(), company: "PixelCraft Studios", role: "Frontend Developer Intern",
            from: "2022-06", to: "2023-02", location: "Remote",
            description: "Developed interactive dashboards using React and D3.js. Shipped 3 major features used by 10K+ daily active users.",
            current: false,
        },
    ]);

    const [education, setEducation] = useState<Education[]>([
        {
            id: uid(), institution: "Indian Institute of Technology, Bombay",
            degree: "Bachelor's", field: "Computer Science & Engineering",
            from: "2019", to: "2023", grade: "8.7 / 10",
        },
    ]);

    const [projects, setProjects] = useState<Project[]>([
        {
            id: uid(), name: "DevConnect",
            description: "A developer networking platform with real-time chat, code sharing, and collaborative coding rooms.",
            techStack: "React, Node.js, Socket.io, PostgreSQL, Redis",
            liveUrl: "https://github.com/AdapalaBhargavaKrishna",
            repoUrl: "https://github.com/AdapalaBhargavaKrishna",
        },
        {
            id: uid(), name: "AI Resume Grader",
            description: "An AI-powered resume analysis tool that provides actionable feedback and ATS compatibility score.",
            techStack: "Python, FastAPI, OpenAI, React, TailwindCSS",
            liveUrl: "https://github.com/AdapalaBhargavaKrishna",
            repoUrl: "https://github.com/AdapalaBhargavaKrishna",
        },
    ]);

    const [certifications, setCertifications] = useState<Certification[]>([
        { id: uid(), name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", year: "2024", credentialUrl: "#" },
        { id: uid(), name: "Meta Front-End Developer", issuer: "Meta (Coursera)", year: "2023", credentialUrl: "#" },
    ]);

    const [originalState, setOriginalState] = useState({
        personal: { ...personal },
        skills: [...skills],
        experiences: JSON.parse(JSON.stringify(experiences)),
        education: JSON.parse(JSON.stringify(education)),
        projects: JSON.parse(JSON.stringify(projects)),
        certifications: JSON.parse(JSON.stringify(certifications)),
    });

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

    const handleSave = () => {
        setSaveStatus("saving");
        setTimeout(() => {
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
        }, 800);
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
        skills.length >= 5 ? "yes" : "", experiences.length > 0 && experiences[0].company ? "yes" : "",
        education.length > 0 && education[0].institution ? "yes" : "",
        projects.length > 0 && projects[0].name ? "yes" : "",
        certifications.length > 0 && certifications[0].name ? "yes" : "",
    ];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
        <motion.div {...fadeUp} className={`rounded-xl border bg-card p-5 space-y-4 ${className}`}>
            {children}
        </motion.div>
    );

    const SectionTitle = ({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) => (
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                {title}
            </h3>
            {count !== undefined && (
                <Badge variant="secondary" className="text-[10px]">{count}</Badge>
            )}
        </div>
    );

    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    );

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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUndo}
                                    disabled={saveStatus === "saved"}
                                >
                                    Undo
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Revert all unsaved changes</p>
                            </TooltipContent>
                        </Tooltip>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saveStatus === "saved" || saveStatus === "saving"}
                        >
                            {saveStatus === "saving" ? (
                                <>Saving...</>
                            ) : (
                                <><Save className="h-4 w-4 mr-1.5" /> Save</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Save Reminder */}
                <AnimatePresence>
                    {showSaveReminder && saveStatus === "unsaved" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
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
                                <Button variant="outline" size="sm" onClick={handleUndo}>
                                    Undo
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    Save Now
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Status */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-end gap-2 text-xs"
                >
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
                </motion.div>

                {/* Profile Completion */}
                <motion.div {...fadeUp} className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                </motion.div>

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
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="text-xs sm:text-sm gap-1.5"
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Personal Tab */}
                    <TabsContent value="personal" className="space-y-4">
                        <SectionCard>
                            <div className="flex items-center justify-between">
                                <SectionTitle icon={User} title="Basic Information" />
                                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setEditMode(editMode === "personal" ? null : "personal")}>
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{editMode === "personal" ? "Done" : "Edit"}</span>
                                </Button>
                            </div>

                            {editMode === "personal" ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Full Name">
                                            <Input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} />
                                        </Field>
                                        <Field label="Email">
                                            <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                                        </Field>
                                        <Field label="Phone">
                                            <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                                        </Field>
                                        <Field label="Location">
                                            <Input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} />
                                        </Field>
                                    </div>
                                    <Field label="Bio">
                                        <Textarea value={personal.bio} onChange={(e) => setPersonal({ ...personal, bio: e.target.value })} className="min-h-[80px]" />
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Field label="Current Role">
                                            <Input value={personal.currentRole} onChange={(e) => setPersonal({ ...personal, currentRole: e.target.value })} />
                                        </Field>
                                        <Field label="Years of Experience">
                                            <Select value={personal.yearsOfExp} onValueChange={(v) => setPersonal({ ...personal, yearsOfExp: v })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["0-1", "1-2", "2-4", "4-6", "6-10", "10+"].map((y) => (
                                                        <SelectItem key={y} value={y}>{y} years</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Career Goal">
                                            <Input value={personal.careerGoal} onChange={(e) => setPersonal({ ...personal, careerGoal: e.target.value })} />
                                        </Field>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                            <span className="text-xl font-bold text-primary-foreground">
                                                {personal.fullName.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-lg font-semibold text-foreground">{personal.fullName}</h4>
                                            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {personal.currentRole}</span>
                                                <span className="hidden sm:inline">·</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {personal.location}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">{personal.yearsOfExp} years experience</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{personal.bio}</p>
                                    <Badge variant="outline" className="gap-1">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Goal: {personal.careerGoal}
                                    </Badge>
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard>
                            <div className="flex items-center justify-between">
                                <SectionTitle icon={Globe} title="Online Profiles" />
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
                                </div>
                            )}
                        </SectionCard>
                    </TabsContent>

                    {/* Skills Tab */}
                    <TabsContent value="skills">
                        <SectionCard>
                            <SectionTitle icon={Code} title="Your Skills" count={skills.length} />
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
                        </SectionCard>
                    </TabsContent>

                    {/* Experience Tab */}
                    <TabsContent value="experience">
                        <div className="space-y-3">
                            {experiences.map((exp) => (
                                <SectionCard key={exp.id}>
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
                                                    {exp.location && (
                                                        <>
                                                            <span className="mx-0.5">·</span>
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{exp.location}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {exp.current && <Badge className="text-[9px] px-1.5 bg-primary/10 text-primary">Current</Badge>}
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(editMode === `exp-${exp.id}` ? null : `exp-${exp.id}`)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            {experiences.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeExperience(exp.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {editMode === `exp-${exp.id}` ? (
                                        <div className="space-y-3 pt-3 border-t">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Field label="Company"><Input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} /></Field>
                                                <Field label="Role"><Input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} /></Field>
                                                <Field label="Start"><Input type="month" value={exp.from} onChange={(e) => updateExp(exp.id, "from", e.target.value)} /></Field>
                                                <Field label="End"><Input type="month" value={exp.to} onChange={(e) => updateExp(exp.id, "to", e.target.value)} disabled={exp.current} /></Field>
                                                <Field label="Location"><Input value={exp.location} onChange={(e) => updateExp(exp.id, "location", e.target.value)} /></Field>
                                                <div className="flex items-end pb-1">
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="rounded border-border" />
                                                        Currently here
                                                    </label>
                                                </div>
                                            </div>
                                            <Field label="Description">
                                                <Textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} />
                                            </Field>
                                        </div>
                                    ) : (
                                        exp.description && <p className="text-sm text-muted-foreground leading-relaxed pl-12">{exp.description}</p>
                                    )}
                                </SectionCard>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addExperience}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Experience
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Education Tab */}
                    <TabsContent value="education">
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <SectionCard key={edu.id}>
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
                                                    {edu.grade && (
                                                        <>
                                                            <span className="mx-0.5">·</span>
                                                            <span className="truncate">GPA: {edu.grade}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(editMode === `edu-${edu.id}` ? null : `edu-${edu.id}`)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            {education.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeEducation(edu.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {editMode === `edu-${edu.id}` && (
                                        <div className="space-y-3 pt-3 border-t">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Field label="Institution"><Input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} /></Field>
                                                <Field label="Degree">
                                                    <Select value={edu.degree} onValueChange={(v) => updateEdu(edu.id, "degree", v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select degree" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {["High School", "Associate", "Bachelor's", "Master's", "Ph.D.", "Bootcamp"].map((d) => (
                                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                                <Field label="Field of Study"><Input value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} /></Field>
                                                <Field label="Grade / GPA"><Input value={edu.grade} onChange={(e) => updateEdu(edu.id, "grade", e.target.value)} /></Field>
                                                <Field label="Start Year"><Input type="number" value={edu.from} onChange={(e) => updateEdu(edu.id, "from", e.target.value)} /></Field>
                                                <Field label="End Year"><Input type="number" value={edu.to} onChange={(e) => updateEdu(edu.id, "to", e.target.value)} /></Field>
                                            </div>
                                        </div>
                                    )}
                                </SectionCard>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addEducation}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Education
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Projects Tab */}
                    <TabsContent value="projects">
                        <div className="space-y-3">
                            {projects.map((proj) => (
                                <SectionCard key={proj.id}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <FolderOpen className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-foreground truncate">{proj.name || "Untitled Project"}</h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(proj.techStack || "").split(",").slice(0, 3).map((t) => (
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
                                            {projects.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeProject(proj.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {editMode !== `proj-${proj.id}` && proj.description && (
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-12">{proj.description}</p>
                                    )}

                                    {editMode === `proj-${proj.id}` && (
                                        <div className="space-y-3 pt-3 border-t">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Field label="Project Name"><Input value={proj.name} onChange={(e) => updateProj(proj.id, "name", e.target.value)} /></Field>
                                                <Field label="Tech Stack"><Input value={proj.techStack} onChange={(e) => updateProj(proj.id, "techStack", e.target.value)} placeholder="React, Node.js, etc." /></Field>
                                                <Field label="Live URL"><Input value={proj.liveUrl} onChange={(e) => updateProj(proj.id, "liveUrl", e.target.value)} /></Field>
                                                <Field label="Repo URL"><Input value={proj.repoUrl} onChange={(e) => updateProj(proj.id, "repoUrl", e.target.value)} /></Field>
                                            </div>
                                            <Field label="Description">
                                                <Textarea value={proj.description} onChange={(e) => updateProj(proj.id, "description", e.target.value)} />
                                            </Field>
                                        </div>
                                    )}
                                </SectionCard>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addProject}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Project
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Certifications Tab */}
                    <TabsContent value="certifications">
                        <div className="space-y-3">
                            {certifications.map((cert) => (
                                <SectionCard key={cert.id}>
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
                                            {certifications.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeCert(cert.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {editMode === `cert-${cert.id}` && (
                                        <div className="space-y-3 pt-3 border-t">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Field label="Name"><Input value={cert.name} onChange={(e) => updateCert(cert.id, "name", e.target.value)} /></Field>
                                                <Field label="Issuer"><Input value={cert.issuer} onChange={(e) => updateCert(cert.id, "issuer", e.target.value)} /></Field>
                                                <Field label="Year"><Input type="number" value={cert.year} onChange={(e) => updateCert(cert.id, "year", e.target.value)} /></Field>
                                                <Field label="Credential URL"><Input value={cert.credentialUrl} onChange={(e) => updateCert(cert.id, "credentialUrl", e.target.value)} /></Field>
                                            </div>
                                        </div>
                                    )}
                                </SectionCard>
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