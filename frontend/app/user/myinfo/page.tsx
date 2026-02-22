'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Briefcase, GraduationCap, Code, Award, FolderOpen, Globe,
    Plus, Trash2, Github, Linkedin, ExternalLink, Calendar, MapPin,
    Save, Star, Upload, Pencil, CheckCircle2, Clock, AlertCircle,
    XCircle, Bell, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`flex h-9 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const TextArea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    return (
        <textarea
            className={`flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const Label = ({ children, className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
    return (
        <label className={`text-xs font-medium text-muted-foreground ${className}`} {...props}>
            {children}
        </label>
    );
};

const Badge = ({ children, variant = "default", className = "", ...props }: React.HTMLAttributes<HTMLSpanElement> & {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "outline" | "success" | "warning";
    className?: string;
}) => {
    const variants = {
        default: "bg-primary/10 text-primary border-0",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
        success: "bg-green-500/10 text-green-600 dark:text-green-400 border-0",
        warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-0"
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
            {children}
        </span>
    );
};

interface SelectItemProps {
    children: React.ReactNode;
    value: string;
    onSelect?: (value: string) => void;
}

const Select = ({ children, value, onValueChange }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value || "");

    const handleSelect = (val: string) => {
        setSelected(val);
        onValueChange?.(val);
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
                <span className={selected ? "text-foreground" : "text-muted-foreground"}>
                    {selected || "Select..."}
                </span>
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                    {React.Children.map(children, (child) => {
                        if (React.isValidElement<SelectItemProps>(child)) {
                            return React.cloneElement(child, { onSelect: handleSelect });
                        }
                        return child;
                    })}
                </div>
            )}
        </div>
    );
};

const SelectItem = ({ children, value, onSelect }: SelectItemProps) => {
    return (
        <button
            type="button"
            onClick={() => onSelect?.(value)}
            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
        >
            {children}
        </button>
    );
};

const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (value: string) => void;
} | undefined>(undefined);

const TabsProvider = ({ children, value, onValueChange }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
}) => {
    return (
        <TabsContext.Provider value={{ activeTab: value, setActiveTab: onValueChange }}>
            {children}
        </TabsContext.Provider>
    );
};

const useTabs = () => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("Tabs components must be used within TabsProvider");
    return context;
};

const Tabs = ({ value, onValueChange, children, className = "" }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <TabsProvider value={value} onValueChange={onValueChange}>
            <div className={className}>{children}</div>
        </TabsProvider>
    );
};

const TabsList = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`flex flex-wrap gap-1 p-1 bg-muted/30 rounded-lg ${className}`}>
            {children}
        </div>
    );
};

const TabsTrigger = ({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) => {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } ${className}`}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
    const { activeTab } = useTabs();
    if (activeTab !== value) return null;
    return <div className="mt-5">{children}</div>;
};

const PageHeader = ({ title, description, actions }: {
    title: string;
    description: string;
    actions?: React.ReactNode;
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            {actions && <div>{actions}</div>}
        </div>
    );
};

interface Experience {
    id: string; company: string; role: string; from: string; to: string; location: string; description: string; current: boolean;
}
interface Education {
    id: string; institution: string; degree: string; field: string; from: string; to: string; grade: string;
}
interface Project {
    id: string; name: string; description: string; techStack: string; liveUrl: string; repoUrl: string; image: string;
}
interface Certification {
    id: string; name: string; issuer: string; year: string; credentialUrl: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const fadeUp = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

const skillSuggestions = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
    "Go", "Rust", "SQL", "MongoDB", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Git", "GraphQL", "REST API", "Redis", "TailwindCSS", "Figma", "Machine Learning",
];

export default function MyInfoPage() {
    const [activeTab, setActiveTab] = useState("personal");
    const [editMode, setEditMode] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
    const [lastSaved, setLastSaved] = useState<Date>(new Date());
    const [showSaveReminder, setShowSaveReminder] = useState(false);

    const [personal, setPersonal] = useState({
        fullName: "Bhargava",
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
        codechef: "",
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
            description: "A developer networking platform with real-time chat, code sharing, and collaborative coding rooms. Built with WebSockets for instant messaging.",
            techStack: "React, Node.js, Socket.io, PostgreSQL, Redis",
            liveUrl: "https://github.com/AdapalaBhargavaKrishna",
            repoUrl: "https://github.com/AdapalaBhargavaKrishna",
            image: "",
        },
        {
            id: uid(), name: "AI Resume Grader",
            description: "An AI-powered resume analysis tool that provides actionable feedback, ATS compatibility score, and improvement suggestions using NLP.",
            techStack: "Python, FastAPI, OpenAI, React, TailwindCSS",
            liveUrl: "https://github.com/AdapalaBhargavaKrishna",
            repoUrl: "https://github.com/AdapalaBhargavaKrishna",
            image: "",
        },
    ]);

    const [certifications, setCertifications] = useState<Certification[]>([
        { id: uid(), name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", year: "2024", credentialUrl: "https://aws.amazon.com/verify/cert123" },
        { id: uid(), name: "Meta Front-End Developer", issuer: "Meta (Coursera)", year: "2023", credentialUrl: "https://coursera.org/verify/cert456" },
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
        setProjects([...projects, { id: uid(), name: "", description: "", techStack: "", liveUrl: "", repoUrl: "", image: "" }]);
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
        <motion.div {...fadeUp} className={`rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 space-y-4 ${className}`}>
            {children}
        </motion.div>
    );

    const SectionTitle = ({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) => (
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                {title}
            </h3>
            {count !== undefined && (
                <Badge variant="secondary" className="text-[10px] font-normal">{count}</Badge>
            )}
        </div>
    );

    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium">{label}</Label>
            {children}
        </div>
    );

    const LinkBadge = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
        href ? (
            <a href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground transition-colors">
                <Icon className="h-3 w-3 text-muted-foreground" />
                {label}
            </a>
        ) : null
    );

    return (
        <div className="max-w-3xl mx-auto space-y-5 pb-10">
            <PageHeader
                title="My Info"
                description="Your career profile powering AI insights"
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleUndo}
                            disabled={saveStatus === "saved"}
                        >
                            Undo
                        </Button>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
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
                }
            />

            <AnimatePresence>
                {showSaveReminder && saveStatus === "unsaved" && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-foreground">You have unsaved changes</p>
                                <p className="text-xs text-muted-foreground">Don't forget to save your progress</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleUndo}>
                                Undo
                            </Button>
                            <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90" onClick={handleSave}>
                                Save Now
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-end gap-2 text-xs"
            >
                {saveStatus === "saved" ? (
                    <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> All changes saved
                        {lastSaved && <span className="text-muted-foreground"> · {lastSaved.toLocaleTimeString()}</span>}
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

            <motion.div {...fadeUp} className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{completion}%</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">Profile Completion</p>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completion}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-primary"
                        />
                    </div>
                </div>
                {completion < 100 && (
                    <p className="text-[10px] text-muted-foreground hidden sm:block shrink-0">
                        {completion >= 80 ? "Almost there!" : "Complete for better AI insights"}
                    </p>
                )}
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50 p-0.5 rounded-lg w-full grid grid-cols-3 sm:grid-cols-6 h-auto gap-0.5">
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
                            className="rounded-md text-[11px] sm:text-xs data-[state=active]:shadow-sm flex items-center gap-1 py-2"
                        >
                            <tab.icon className="h-3 w-3 hidden sm:block" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="personal">
                    <div className="space-y-4">
                        <SectionCard>
                            <div className="flex items-center justify-between">
                                <SectionTitle icon={User} title="Basic Information" />
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditMode(editMode === "personal" ? null : "personal")}>
                                    <Pencil className="h-3 w-3" /> {editMode === "personal" ? "Done" : "Edit"}
                                </Button>
                            </div>

                            {editMode === "personal" ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Field label="Full Name">
                                            <Input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} className="bg-muted/30 h-9 text-sm" />
                                        </Field>
                                        <Field label="Email">
                                            <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} className="bg-muted/30 h-9 text-sm" />
                                        </Field>
                                        <Field label="Phone">
                                            <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className="bg-muted/30 h-9 text-sm" />
                                        </Field>
                                        <Field label="Location">
                                            <Input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} className="bg-muted/30 h-9 text-sm" />
                                        </Field>
                                    </div>
                                    <Field label="Bio">
                                        <TextArea value={personal.bio} onChange={(e) => setPersonal({ ...personal, bio: e.target.value })} className="bg-muted/30 min-h-[70px] text-sm" />
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Field label="Current Role">
                                            <Input value={personal.currentRole} onChange={(e) => setPersonal({ ...personal, currentRole: e.target.value })} className="bg-muted/30 h-9 text-sm" />
                                        </Field>
                                        <Field label="Years of Experience">
                                            <Select value={personal.yearsOfExp} onValueChange={(v) => setPersonal({ ...personal, yearsOfExp: v })}>
                                                {["0-1", "1-2", "2-4", "4-6", "6-10", "10+"].map((y) => (
                                                    <SelectItem key={y} value={y}>{y} years</SelectItem>
                                                ))}
                                            </Select>
                                        </Field>
                                        <Field label="Career Goal">
                                            <Input value={personal.careerGoal} onChange={(e) => setPersonal({ ...personal, careerGoal: e.target.value })} className="bg-muted/30 h-9 text-sm" />
                                        </Field>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                            <span className="text-lg font-bold text-primary-foreground">
                                                {personal.fullName.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-base font-semibold text-foreground">{personal.fullName}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Briefcase className="h-3 w-3" /> {personal.currentRole}
                                                <span className="mx-1">·</span>
                                                <MapPin className="h-3 w-3" /> {personal.location}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{personal.yearsOfExp} years experience</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{personal.bio}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-normal gap-1">
                                            <Star className="h-3 w-3 text-primary" /> Goal: {personal.careerGoal}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </SectionCard>

                        <SectionCard>
                            <div className="flex items-center justify-between">
                                <SectionTitle icon={Globe} title="Online Profiles" />
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditMode(editMode === "links" ? null : "links")}>
                                    <Pencil className="h-3 w-3" /> {editMode === "links" ? "Done" : "Edit"}
                                </Button>
                            </div>

                            {editMode === "links" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: "Website", key: "website" as const, icon: Globe, placeholder: "https://yoursite.com" },
                                        { label: "GitHub", key: "github" as const, icon: Github, placeholder: "https://github.com/username" },
                                        { label: "LinkedIn", key: "linkedin" as const, icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
                                        { label: "LeetCode", key: "leetcode" as const, icon: Code, placeholder: "https://leetcode.com/..." },
                                    ].map((link) => (
                                        <Field key={link.key} label={link.label}>
                                            <div className="relative">
                                                <link.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input
                                                    placeholder={link.placeholder}
                                                    value={personal[link.key]}
                                                    onChange={(e) => setPersonal({ ...personal, [link.key]: e.target.value })}
                                                    className="pl-9 bg-muted/30 h-9 text-sm"
                                                />
                                            </div>
                                        </Field>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <LinkBadge href={personal.website} icon={Globe} label="Portfolio" />
                                    <LinkBadge href={personal.github} icon={Github} label="GitHub" />
                                    <LinkBadge href={personal.linkedin} icon={Linkedin} label="LinkedIn" />
                                    <LinkBadge href={personal.leetcode} icon={Code} label="LeetCode" />
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </TabsContent>

                <TabsContent value="skills">
                    <SectionCard>
                        <SectionTitle icon={Code} title="Your Skills" count={skills.length} />
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map((s) => (
                                <Badge
                                    key={s}
                                    variant="secondary"
                                    className="text-[11px] py-1 px-2.5 gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group"
                                    onClick={() => removeSkill(s)}
                                >
                                    {s}
                                    <Trash2 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a skill..."
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                                className="bg-muted/30 h-9 text-sm"
                            />
                            <Button variant="outline" size="sm" onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()} className="h-9">
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground mb-1.5">Suggestions</p>
                            <div className="flex flex-wrap gap-1">
                                {skillSuggestions.filter((s) => !skills.includes(s)).slice(0, 10).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => addSkill(s)}
                                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border/60 bg-card hover:border-primary/40 hover:text-primary transition-colors"
                                    >
                                        + {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SectionCard>
                </TabsContent>

                <TabsContent value="experience">
                    <div className="space-y-3">
                        {experiences.map((exp) => (
                            <SectionCard key={exp.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">{exp.role || "Untitled Role"}</h4>
                                            <p className="text-xs text-muted-foreground">{exp.company || "Company"}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Calendar className="h-2.5 w-2.5" />
                                                {exp.from || "Start"} – {exp.current ? "Present" : exp.to || "End"}
                                                {exp.location && <><span className="mx-0.5">·</span><MapPin className="h-2.5 w-2.5" /> {exp.location}</>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {exp.current && <Badge className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">Current</Badge>}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditMode(editMode === `exp-${exp.id}` ? null : `exp-${exp.id}`)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        {experiences.length > 1 && (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeExperience(exp.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {editMode === `exp-${exp.id}` ? (
                                    <div className="space-y-3 pt-2 border-t border-border/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Field label="Company"><Input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Role"><Input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Start"><Input type="month" value={exp.from} onChange={(e) => updateExp(exp.id, "from", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="End"><Input type="month" value={exp.to} onChange={(e) => updateExp(exp.id, "to", e.target.value)} className="bg-muted/30 h-9 text-sm" disabled={exp.current} /></Field>
                                            <Field label="Location"><Input value={exp.location} onChange={(e) => updateExp(exp.id, "location", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <div className="flex items-end pb-1">
                                                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                                    <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="rounded border-border" />
                                                    Currently here
                                                </label>
                                            </div>
                                        </div>
                                        <Field label="Description">
                                            <TextArea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} className="bg-muted/30 min-h-[60px] text-sm" />
                                        </Field>
                                    </div>
                                ) : (
                                    exp.description && <p className="text-xs text-muted-foreground leading-relaxed pl-12">{exp.description}</p>
                                )}
                            </SectionCard>
                        ))}
                        <Button variant="outline" className="w-full h-10 border-dashed text-xs" onClick={addExperience}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Experience
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="education">
                    <div className="space-y-3">
                        {education.map((edu) => (
                            <SectionCard key={edu.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">{edu.degree} in {edu.field || "Field"}</h4>
                                            <p className="text-xs text-muted-foreground">{edu.institution || "Institution"}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Calendar className="h-2.5 w-2.5" /> {edu.from} – {edu.to}
                                                {edu.grade && <><span className="mx-0.5">·</span> GPA: {edu.grade}</>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditMode(editMode === `edu-${edu.id}` ? null : `edu-${edu.id}`)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        {education.length > 1 && (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeEducation(edu.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {editMode === `edu-${edu.id}` && (
                                    <div className="space-y-3 pt-2 border-t border-border/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Field label="Institution"><Input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Degree">
                                                <Select value={edu.degree} onValueChange={(v) => updateEdu(edu.id, "degree", v)}>
                                                    {["High School", "Associate", "Bachelor's", "Master's", "Ph.D.", "Bootcamp", "Self-taught"].map((d) => (
                                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                                    ))}
                                                </Select>
                                            </Field>
                                            <Field label="Field of Study"><Input value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Grade / GPA"><Input value={edu.grade} onChange={(e) => updateEdu(edu.id, "grade", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Start Year"><Input type="number" value={edu.from} onChange={(e) => updateEdu(edu.id, "from", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="End Year"><Input type="number" value={edu.to} onChange={(e) => updateEdu(edu.id, "to", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                        </div>
                                    </div>
                                )}
                            </SectionCard>
                        ))}
                        <Button variant="outline" className="w-full h-10 border-dashed text-xs" onClick={addEducation}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Education
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="projects">
                    <div className="space-y-3">
                        {projects.map((proj) => (
                            <SectionCard key={proj.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <FolderOpen className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-foreground">{proj.name || "Untitled Project"}</h4>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(proj.techStack || "").split(",").filter(Boolean).map((t) => (
                                                    <span key={t} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {proj.liveUrl && (
                                            <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ExternalLink className="h-3 w-3" /></Button>
                                            </a>
                                        )}
                                        {proj.repoUrl && (
                                            <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Github className="h-3 w-3" /></Button>
                                            </a>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditMode(editMode === `proj-${proj.id}` ? null : `proj-${proj.id}`)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        {projects.length > 1 && (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeProject(proj.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {editMode !== `proj-${proj.id}` && proj.description && (
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-12">{proj.description}</p>
                                )}

                                {editMode === `proj-${proj.id}` && (
                                    <div className="space-y-3 pt-2 border-t border-border/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Field label="Project Name"><Input value={proj.name} onChange={(e) => updateProj(proj.id, "name", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Tech Stack"><Input value={proj.techStack} onChange={(e) => updateProj(proj.id, "techStack", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Live URL"><Input value={proj.liveUrl} onChange={(e) => updateProj(proj.id, "liveUrl", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Repo URL"><Input value={proj.repoUrl} onChange={(e) => updateProj(proj.id, "repoUrl", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                        </div>
                                        <Field label="Description">
                                            <TextArea value={proj.description} onChange={(e) => updateProj(proj.id, "description", e.target.value)} className="bg-muted/30 min-h-[60px] text-sm" />
                                        </Field>
                                    </div>
                                )}
                            </SectionCard>
                        ))}
                        <Button variant="outline" className="w-full h-10 border-dashed text-xs" onClick={addProject}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Project
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="certifications">
                    <div className="space-y-3">
                        {certifications.map((cert) => (
                            <SectionCard key={cert.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Award className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">{cert.name || "Untitled Certification"}</h4>
                                            <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {cert.credentialUrl && (
                                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ExternalLink className="h-3 w-3" /></Button>
                                            </a>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditMode(editMode === `cert-${cert.id}` ? null : `cert-${cert.id}`)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        {certifications.length > 1 && (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeCert(cert.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {editMode === `cert-${cert.id}` && (
                                    <div className="space-y-3 pt-2 border-t border-border/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Field label="Name"><Input value={cert.name} onChange={(e) => updateCert(cert.id, "name", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Issuer"><Input value={cert.issuer} onChange={(e) => updateCert(cert.id, "issuer", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Year"><Input type="number" value={cert.year} onChange={(e) => updateCert(cert.id, "year", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                            <Field label="Credential URL"><Input value={cert.credentialUrl} onChange={(e) => updateCert(cert.id, "credentialUrl", e.target.value)} className="bg-muted/30 h-9 text-sm" /></Field>
                                        </div>
                                    </div>
                                )}
                            </SectionCard>
                        ))}
                        <Button variant="outline" className="w-full h-10 border-dashed text-xs" onClick={addCert}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Certification
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}