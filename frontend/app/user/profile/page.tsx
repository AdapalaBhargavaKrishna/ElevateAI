'use client';

import React, { useState, createContext, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Github, Linkedin, Mail, MapPin, ExternalLink, Star, Code, Award,
    Share2, Upload, FileText, Zap, TrendingUp,
    Eye, Plus, Camera, Briefcase, GraduationCap,
    Sparkles, CheckCircle2, Twitter, Figma,
    Database, Cloud, Braces, Server, Palette, PenTool,
    Calendar, Medal, Trophy, BookOpen,
    CheckCircle, Users
} from "lucide-react";

/* ───── Custom Progress Component ───── */
const Progress = ({ value, className = "" }: { value: number; className?: string }) => {
    return (
        <div className={`w-full bg-muted/30 rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
};

/* ───── Custom Badge Component ───── */
const Badge = ({ children, variant = "default", className = "" }: {
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

/* ───── Tabs Context ───── */
interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('useTabsContext must be used within a TabsProvider');
    }
    return context;
};

/* ───── Custom Tabs Components ───── */
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

const TabsList = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`inline-flex p-1 bg-muted/30 rounded-lg backdrop-blur-sm ${className}`}>
            {children}
        </div>
    );
};

const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
    const { activeTab } = useTabsContext();
    if (activeTab !== value) return null;
    return <div className="mt-6">{children}</div>;
};

/* ───── Types ───── */

interface CodingProfile {
    name: string;
    icon: any;
    url: string;
    username: string;
    stats: string;
    bgColor: string;
    iconColor?: string;
}

interface Skill {
    name: string;
    level: number;
    source: string;
    category: "frontend" | "backend" | "devops" | "design";
}

interface Project {
    name: string;
    desc: string;
    stack: string[];
    stars: number;
    image: string;
    link: string;
    featured: boolean;
}

interface Certification {
    name: string;
    issuer: string;
    year: string;
    icon: any;
    expiry?: string;
}

interface Achievement {
    title: string;
    icon: any;
    desc: string;
    date: string;
    color: string;
}

interface Resume {
    name: string;
    version: string;
    updated: string;
    score: number;
    downloads: number;
}

const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

/* ───── Mock Data ───── */

const userInfo = {
    name: "Bhargava Krishna",
    initials: "BK",
    title: "Senior Full-Stack Developer",
    experience: "7+ years",
    location: "Bangalore, India",
    availability: "Open to opportunities",
    email: "bhargava.krishna@email.com",
    phone: "+91 98765 43210",
    bio: "Passionate full-stack developer with 7+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture.",
    currentGoal: "Tech Lead position focusing on system architecture and team leadership"
};

const codingProfiles: CodingProfile[] = [
    {
        name: "GitHub",
        icon: Github,
        url: "#",
        username: "@bhargavak",
        stats: "2.4k contributions",
        bgColor: "bg-gray-800 dark:bg-gray-700",
        iconColor: "text-white"
    },
    {
        name: "LinkedIn",
        icon: Linkedin,
        url: "#",
        username: "bhargava-krishna",
        stats: "850+ connections",
        bgColor: "bg-[#0A66C2]",
        iconColor: "text-white"
    },
    {
        name: "LeetCode",
        icon: Code,
        url: "#",
        username: "@bhargava_k",
        stats: "450 problems solved",
        bgColor: "bg-[#FFA116]",
        iconColor: "text-white"
    },
    {
        name: "Twitter",
        icon: Twitter,
        url: "#",
        username: "@bhargava_dev",
        stats: "3.2k followers",
        bgColor: "bg-[#1DA1F2]",
        iconColor: "text-white"
    },
    {
        name: "Medium",
        icon: BookOpen,
        url: "#",
        username: "@bhargava",
        stats: "25 articles",
        bgColor: "bg-gray-800 dark:bg-gray-700",
        iconColor: "text-white"
    },
    {
        name: "Figma",
        icon: Figma,
        url: "#",
        username: "bhargava.k",
        stats: "12 public files",
        bgColor: "bg-[#F24E1E]",
        iconColor: "text-white"
    },
];

const skills: Skill[] = [
    { name: "React/Next.js", level: 95, source: "Expert", category: "frontend" },
    { name: "TypeScript", level: 92, source: "Expert", category: "frontend" },
    { name: "Node.js", level: 88, source: "Advanced", category: "backend" },
    { name: "Python", level: 82, source: "Advanced", category: "backend" },
    { name: "System Design", level: 85, source: "Advanced", category: "backend" },
    { name: "PostgreSQL", level: 80, source: "Advanced", category: "backend" },
    { name: "Docker/K8s", level: 75, source: "Intermediate", category: "devops" },
    { name: "AWS", level: 78, source: "Certified", category: "devops" },
    { name: "GraphQL", level: 82, source: "Advanced", category: "backend" },
    { name: "MongoDB", level: 70, source: "Intermediate", category: "backend" },
    { name: "Tailwind CSS", level: 90, source: "Expert", category: "frontend" },
    { name: "Figma", level: 65, source: "Intermediate", category: "design" },
];

const projects: Project[] = [
    { name: "E-Commerce Platform", desc: "Full-stack marketplace with Stripe payments, real-time inventory, and admin dashboard.", stack: ["React", "Node.js", "Stripe", "PostgreSQL", "Redis", "AWS"], stars: 248, image: "🛒", link: "#", featured: true },
    { name: "AI Chat Application", desc: "Real-time AI-powered chat with streaming responses and context memory.", stack: ["Next.js", "OpenAI", "Redis", "WebSocket", "Tailwind", "Pinecone"], stars: 324, image: "🤖", link: "#", featured: true },
    { name: "Task Management Tool", desc: "Kanban-style project management with team collaboration and analytics.", stack: ["Vue.js", "Firebase", "Tailwind", "D3.js", "Vuex"], stars: 136, image: "📋", link: "#", featured: false },
    { name: "DevOps Pipeline", desc: "CI/CD pipeline automation with Docker, Kubernetes, and GitHub Actions.", stack: ["Docker", "K8s", "GitHub Actions", "Terraform", "Helm"], stars: 189, image: "⚙️", link: "#", featured: true },
    { name: "Analytics Dashboard", desc: "Real-time analytics dashboard for monitoring application performance.", stack: ["React", "D3.js", "Express", "WebSocket", "Redis"], stars: 92, image: "📊", link: "#", featured: false },
    { name: "Mobile Wallet App", desc: "Digital wallet application with biometric authentication.", stack: ["React Native", "Node.js", "MongoDB", "JWT", "Redux"], stars: 156, image: "📱", link: "#", featured: false },
];

const certifications: Certification[] = [
    { name: "AWS Solutions Architect", issuer: "Amazon Web Services", year: "2024", icon: Cloud, expiry: "2027" },
    { name: "Google Cloud Developer", issuer: "Google", year: "2024", icon: Cloud, expiry: "2027" },
    { name: "Meta Full-Stack Developer", issuer: "Meta", year: "2023", icon: Code },
    { name: "MongoDB Certified Developer", issuer: "MongoDB", year: "2023", icon: Database },
    { name: "Kubernetes Administrator", issuer: "CNCF", year: "2024", icon: Server, expiry: "2026" },
    { name: "Terraform Associate", issuer: "HashiCorp", year: "2023", icon: Cloud },
];

const achievements: Achievement[] = [
    { title: "Top 1% Interview Score", icon: Trophy, desc: "Scored in the top 1% across all technical interviews", date: "2024", color: "bg-yellow-500" },
    { title: "100-Day Streak", icon: Medal, desc: "Practiced coding for 100 days consistently", date: "2024", color: "bg-orange-500" },
    { title: "Resume Expert", icon: Award, desc: "Achieved 98 ATS score - Top 5% of users", date: "2024", color: "bg-green-500" },
    { title: "1000 Problems Solved", icon: Code, desc: "Completed 1000+ coding challenges across platforms", date: "2023", color: "bg-blue-500" },
    { title: "Open Source Maintainer", icon: Github, desc: "Maintains 5 popular open source projects", date: "2024", color: "bg-purple-500" },
    { title: "Technical Author", icon: PenTool, desc: "Published 25+ technical articles (50k+ reads)", date: "2024", color: "bg-pink-500" },
    { title: "Community Leader", icon: UsersIcon, desc: "Organizes Bangalore React Meetup (500+ members)", date: "2023", color: "bg-indigo-500" },
    { title: "Hackathon Winner", icon: Star, desc: "Winner of 3 national-level hackathons", date: "2023", color: "bg-amber-500" },
];

const resumes: Resume[] = [
    { name: "Full-Stack Developer", version: "v4.2", updated: "Feb 15, 2026", score: 98, downloads: 45 },
    { name: "Frontend Specialist", version: "v3.1", updated: "Jan 20, 2026", score: 94, downloads: 32 },
    { name: "Backend Engineer", version: "v2", updated: "Dec 8, 2025", score: 89, downloads: 28 },
    { name: "DevOps Engineer", version: "v1.2", updated: "Nov 12, 2025", score: 86, downloads: 19 },
];

const profileStrength = {
    overall: 92,
    sections: [
        { name: "Profile Information", score: 98 },
        { name: "Technical Skills", score: 94 },
        { name: "Projects", score: 96 },
        { name: "Resume Quality", score: 98 },
        { name: "Certifications", score: 88 },
        { name: "Social Presence", score: 85 },
    ],
};

const experienceYears = [
    { year: "2026", value: 95 },
    { year: "2025", value: 88 },
    { year: "2024", value: 82 },
    { year: "2023", value: 75 },
    { year: "2022", value: 68 },
];

const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

/* ───── Animations ───── */

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
};

/* ───── Component ───── */

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");

    const handleUploadClick = () => {
        window.location.href = '/user/resume';
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Developer Profile</h1>
                        <p className="text-muted-foreground mt-1">Manage your professional presence</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" /> Preview
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" /> Share Profile
                        </Button>
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-start gap-8">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                    <span className="text-3xl font-semibold text-primary">{userInfo.initials}</span>
                                </div>
                                <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 border-2 border-background shadow-lg">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">{userInfo.name}</h2>
                                        <p className="text-lg text-muted-foreground mt-1">{userInfo.title}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 text-primary" /> {userInfo.location}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Briefcase className="h-4 w-4 text-primary" /> {userInfo.experience}
                                            </span>
                                            <Badge variant="success" className="text-sm px-3 py-1">
                                                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> {userInfo.availability}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Score Card */}
                                    <div className="flex items-center gap-3 bg-primary/5 px-4 py-3 rounded-xl">
                                        <div className="relative h-14 w-14">
                                            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    fill="none"
                                                    stroke="hsl(var(--muted))"
                                                    strokeWidth="4"
                                                    strokeOpacity="0.3"
                                                />
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    fill="none"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth="4"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(profileStrength.overall / 100) * 125.6} 125.6`}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                                                {profileStrength.overall}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-foreground">Profile Score</p>
                                            <p className="text-xs text-primary">↑ 5% this month</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted-foreground mt-4 max-w-3xl">
                                    {userInfo.bio}
                                </p>

                                {/* Quick Links */}
                                <div className="flex flex-wrap gap-2 mt-5">
                                    {codingProfiles.slice(0, 4).map((profile) => (
                                        <a key={profile.name} href={profile.url} target="_blank" rel="noopener noreferrer">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 gap-2 text-xs"
                                            >
                                                <profile.icon className="h-3.5 w-3.5" />
                                                {profile.name}
                                            </Button>
                                        </a>
                                    ))}
                                    <Button variant="outline" size="sm" className="h-8 px-3 gap-2 text-xs">
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <TabsProvider value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-center">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="resumes">Resumes</TabsTrigger>
                            <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview">
                        <div className="space-y-8">
                            {/* Skills & Profile Strength */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Skills Section */}
                                <motion.div
                                    variants={fadeUp}
                                    initial="initial"
                                    animate="animate"
                                    className="lg:col-span-2 bg-card border border-border rounded-2xl p-8"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-foreground">Skills & Expertise</h3>
                                        <Badge variant="success" className="px-3 py-1">
                                            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Verified
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {["frontend", "backend", "devops", "design"].map((category) => (
                                            <div key={category} className="space-y-4">
                                                <h4 className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                                                    {category === "frontend" && <Braces className="h-4 w-4 text-blue-500" />}
                                                    {category === "backend" && <Server className="h-4 w-4 text-green-500" />}
                                                    {category === "devops" && <Cloud className="h-4 w-4 text-purple-500" />}
                                                    {category === "design" && <Palette className="h-4 w-4 text-pink-500" />}
                                                    {category}
                                                </h4>
                                                <div className="space-y-3">
                                                    {skills.filter(s => s.category === category).map((skill) => (
                                                        <div key={skill.name} className="space-y-1">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="font-medium text-foreground">{skill.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="text-[10px] px-2">
                                                                        {skill.source}
                                                                    </Badge>
                                                                    <span className="text-muted-foreground w-8 text-right">{skill.level}%</span>
                                                                </div>
                                                            </div>
                                                            <Progress value={skill.level} className="h-1.5" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Profile Strength */}
                                <motion.div
                                    variants={fadeUp}
                                    initial="initial"
                                    animate="animate"
                                    className="bg-card border border-border rounded-2xl p-8"
                                >
                                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-6">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Profile Strength
                                    </h3>

                                    <div className="space-y-5">
                                        {profileStrength.sections.map((section) => (
                                            <div key={section.name} className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{section.name}</span>
                                                    <span className="text-foreground font-semibold">{section.score}%</span>
                                                </div>
                                                <Progress value={section.score} className="h-1.5" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-5 bg-primary/5 rounded-xl">
                                        <p className="text-sm text-muted-foreground flex items-start gap-3">
                                            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span>Complete 2 more projects to reach 95% profile strength and unlock the "Elite Developer" badge</span>
                                        </p>
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="text-sm font-medium text-foreground mb-4">Experience Growth</h4>
                                        <div className="flex items-end h-24 gap-2">
                                            {experienceYears.map((year) => (
                                                <div key={year.year} className="flex-1 flex flex-col items-center gap-2">
                                                    <div
                                                        className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                                                        style={{ height: `${year.value}%` }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">{year.year}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Coding Profiles */}
                            <motion.div
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                className="bg-card border border-border rounded-2xl p-8"
                            >
                                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-6">
                                    <Code className="h-5 w-5 text-primary" />
                                    Coding Profiles
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {codingProfiles.map((profile) => (
                                        <motion.a
                                            key={profile.name}
                                            href={profile.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -2 }}
                                            className="group block"
                                        >
                                            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${profile.bgColor} flex items-center justify-center shadow-sm`}>
                                                        <profile.icon className={`h-6 w-6 ${profile.iconColor || 'text-white'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-foreground">{profile.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{profile.username}</p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    {profile.stats}
                                                </p>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </TabsContent>

                    <TabsContent value="projects">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-foreground">Featured Projects</h3>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Project
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.filter(p => p.featured).map((project) => (
                                    <motion.div
                                        key={project.name}
                                        whileHover={{ y: -2 }}
                                        className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="text-4xl">{project.image}</span>
                                            <Badge variant="success" className="text-xs">Featured</Badge>
                                        </div>
                                        <h4 className="text-lg font-semibold text-foreground mb-2">{project.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.desc}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.stack.slice(0, 4).map((tech) => (
                                                <span key={tech} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-medium text-foreground">{project.stars}</span>
                                            </div>
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-sm">
                                                View Project <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="resumes">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-foreground">Resume Versions</h3>
                                <Button size="sm" className="gap-2" onClick={handleUploadClick}>
                                    <Upload className="h-4 w-4" /> Upload New
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {resumes.map((resume) => (
                                    <motion.div
                                        key={resume.name}
                                        whileHover={{ x: 2 }}
                                        className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-all"
                                    >
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-base font-medium text-foreground">{resume.name}</h4>
                                                <Badge variant="outline" className="text-[10px] px-1.5">
                                                    {resume.version}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" /> {resume.updated}
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <DownloadIcon className="h-3.5 w-3.5" /> {resume.downloads} downloads
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-center px-4">
                                            <p className="text-xl font-bold text-primary">{resume.score}</p>
                                            <p className="text-xs text-muted-foreground">ATS Score</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" className="h-9 w-9">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-9 w-9">
                                                <DownloadIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-6">
                                    <Award className="h-5 w-5 text-primary" />
                                    Achievements & Badges
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {achievements.map((achievement) => {
                                        const Icon = achievement.icon;
                                        return (
                                            <motion.div
                                                key={achievement.title}
                                                whileHover={{ y: -2 }}
                                                className="group bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all"
                                            >
                                                <div className={`h-10 w-10 rounded-lg ${achievement.color} flex items-center justify-center mb-3`}>
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-sm font-semibold text-foreground mb-1">{achievement.title}</h4>
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{achievement.desc}</p>
                                                <p className="text-xs text-primary">{achievement.date}</p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-6">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    Certifications
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certifications.map((cert) => {
                                        const Icon = cert.icon;
                                        return (
                                            <motion.div
                                                key={cert.name}
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-all"
                                            >
                                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-base font-medium text-foreground">{cert.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                            {cert.year}
                                                        </span>
                                                        {cert.expiry && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Expires {cert.expiry}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant="success" className="text-xs px-2 py-1">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                </Badge>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </TabsProvider>
            </div>
        </div>
    );
}