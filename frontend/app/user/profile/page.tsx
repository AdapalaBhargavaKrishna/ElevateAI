'use client';

import React, { useState, createContext, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Globe, Github, Linkedin, Mail, MapPin, ExternalLink, Star, Code, Award,
    Share2, Upload, FileText, Zap, Target, TrendingUp,
    Shield, Eye, Plus, Camera, Briefcase, GraduationCap,
    Sparkles, CheckCircle2, GitBranch, Twitter, Figma,
    Database, Cloud, Braces, Server, Palette, PenTool,
    Calendar, Medal, Trophy, BookOpen, Brain,
    Award as AwardIcon, CheckCircle, Users, Github as GithubIcon,
    Linkedin as LinkedinIcon, Twitter as TwitterIcon
} from "lucide-react";

/* ───── Custom Progress Component ───── */
const Progress = ({ value, className = "" }: { value: number; className?: string }) => {
    return (
        <div className={`w-full bg-muted/30 rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
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
        <span className={`inline-flex items-center px-2 py-0 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
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
    color: string;
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
    { name: "GitHub", icon: Github, url: "#", username: "@bhargavak", stats: "2.4k contributions", color: "from-gray-700 to-gray-900" },
    { name: "LinkedIn", icon: Linkedin, url: "#", username: "bhargava-krishna", stats: "850+ connections", color: "from-blue-600 to-blue-700" },
    { name: "LeetCode", icon: Code, url: "#", username: "@bhargava_k", stats: "450 problems solved", color: "from-yellow-600 to-yellow-700" },
    { name: "Twitter", icon: Twitter, url: "#", username: "@bhargava_dev", stats: "3.2k followers", color: "from-sky-500 to-sky-600" },
    { name: "Medium", icon: BookOpen, url: "#", username: "@bhargava", stats: "25 articles", color: "from-gray-800 to-gray-900" },
    { name: "Figma", icon: Figma, url: "#", username: "bhargava.k", stats: "12 public files", color: "from-purple-600 to-pink-600" },
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
    { title: "Top 1% Interview Score", icon: Trophy, desc: "Scored in the top 1% across all technical interviews", date: "2024", color: "from-yellow-400 to-yellow-600" },
    { title: "100-Day Streak", icon: Medal, desc: "Practiced coding for 100 days consistently", date: "2024", color: "from-orange-400 to-red-500" },
    { title: "Resume Expert", icon: Award, desc: "Achieved 98 ATS score - Top 5% of users", date: "2024", color: "from-green-400 to-emerald-500" },
    { title: "1000 Problems Solved", icon: Code, desc: "Completed 1000+ coding challenges across platforms", date: "2023", color: "from-blue-400 to-blue-600" },
    { title: "Open Source Maintainer", icon: Github, desc: "Maintains 5 popular open source projects", date: "2024", color: "from-purple-400 to-purple-600" },
    { title: "Technical Author", icon: PenTool, desc: "Published 25+ technical articles (50k+ reads)", date: "2024", color: "from-pink-400 to-pink-600" },
    { title: "Community Leader", icon: UsersIcon, desc: "Organizes Bangalore React Meetup (500+ members)", date: "2023", color: "from-indigo-400 to-indigo-600" },
    { title: "Hackathon Winner", icon: Star, desc: "Winner of 3 national-level hackathons", date: "2023", color: "from-amber-400 to-amber-600" },
];

const resumes: Resume[] = [
    { name: "Full-Stack Developer Resume", version: "v4.2", updated: "Feb 15, 2026", score: 98, downloads: 45 },
    { name: "Frontend Specialist Resume", version: "v3.1", updated: "Jan 20, 2026", score: 94, downloads: 32 },
    { name: "Backend Engineer Resume", version: "v2", updated: "Dec 8, 2025", score: 89, downloads: 28 },
    { name: "DevOps Engineer Resume", version: "v1.2", updated: "Nov 12, 2025", score: 86, downloads: 19 },
];

const profileStrength = {
    overall: 92,
    sections: [
        { name: "Profile Information", score: 98, max: 100 },
        { name: "Technical Skills", score: 94, max: 100 },
        { name: "Projects", score: 96, max: 100 },
        { name: "Resume Quality", score: 98, max: 100 },
        { name: "Certifications", score: 88, max: 100 },
        { name: "Social Presence", score: 85, max: 100 },
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
    transition: { duration: 0, ease: "easeOut" }
};

/* ───── Component ───── */

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");

    const handleUploadClick = () => {
        window.location.href = '/user/resume';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Developer Profile</h1>
                        <p className="text-sm text-muted-foreground mt-0">Showcase your skills and professional journey</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" /> Preview
                        </Button>
                        <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90">
                            <Share2 className="h-3 w-3" /> Share
                        </Button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                >
                    <div className="p-5">
                        <div className="flex items-start gap-5">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                                    <span className="text-xl font-semibold text-primary-foreground">{userInfo.initials}</span>
                                </div>
                                <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 border-2 border-background">
                                    <Camera className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-foreground">{userInfo.name}</h2>
                                        <p className="text-sm text-muted-foreground">{userInfo.title}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3 text-primary" /> {userInfo.location}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Briefcase className="h-3 w-3 text-primary" /> {userInfo.experience}
                                            </span>
                                            <Badge variant="success" className="text-xs">
                                                <Sparkles className="h-3 w-3 mr-1" /> {userInfo.availability}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg">
                                        <div className="relative h-12 w-12">
                                            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
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
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
                                                {profileStrength.overall}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-medium text-foreground">Elevate Score</p>
                                            <p className="text-[10px] text-primary">↑ 5% this month</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                    {userInfo.bio}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {codingProfiles.slice(0, 4).map((profile) => (
                                        <a key={profile.name} href={profile.url} target="_blank" rel="noopener noreferrer">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 gap-2 text-xs"
                                            >
                                                <profile.icon className="h-3 w-3" />
                                                {profile.name}
                                            </Button>
                                        </a>
                                    ))}
                                    <Button variant="outline" size="sm" className="h-7 px-2 gap-2 text-xs">
                                        <Mail className="h-3 w-3" /> Email
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

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
                        <div className="space-y-8 mb-10">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <motion.div
                                    variants={fadeUp}
                                    initial="initial"
                                    animate="animate"
                                    className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Zap className="h-4 w-4 text-primary" />
                                            </div>
                                            Skills & Expertise
                                        </h3>
                                        <Badge variant="success" className="px-3 py-1">
                                            <Sparkles className="h-3 w-3 mr-1" /> AI Verified
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {["frontend", "backend", "devops", "design"].map((category) => (
                                            <div key={category} className="space-y-3">
                                                <h4 className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                                                    {category === "frontend" && <Braces className="h-4 w-4 text-blue-500" />}
                                                    {category === "backend" && <Server className="h-4 w-4 text-green-500" />}
                                                    {category === "devops" && <Cloud className="h-4 w-4 text-purple-500" />}
                                                    {category === "design" && <Palette className="h-4 w-4 text-pink-500" />}
                                                    {category}
                                                </h4>
                                                {skills.filter(s => s.category === category).map((skill) => (
                                                    <motion.div key={skill.name} variants={fadeUp} className="space-y-1">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="font-medium text-foreground">{skill.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[10px] px-2">
                                                                    {skill.source}
                                                                </Badge>
                                                                <span className="text-muted-foreground w-8 text-right">{skill.level}%</span>
                                                            </div>
                                                        </div>
                                                        <Progress value={skill.level} className="h-2" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.div
                                        variants={fadeUp}
                                        initial="initial"
                                        animate="animate"
                                        className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                                    >
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <TrendingUp className="h-4 w-4 text-primary" />
                                            </div>
                                            Profile Strength
                                        </h3>
                                        <div className="space-y-4">
                                            {profileStrength.sections.map((section) => (
                                                <div key={section.name} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{section.name}</span>
                                                        <span className="text-foreground font-semibold">{section.score}%</span>
                                                    </div>
                                                    <Progress value={section.score} className="h-2" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl">
                                            <p className="text-xs text-muted-foreground flex items-start gap-2">
                                                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                                                <span>Complete 2 more projects to reach 95% profile strength and unlock the "Elite Developer" badge</span>
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-foreground mb-3">Experience Growth</h4>
                                            <div className="flex items-end h-20 gap-2">
                                                {experienceYears.map((year) => (
                                                    <div key={year.year} className="flex-1 flex flex-col items-center gap-1">
                                                        <div
                                                            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg"
                                                            style={{ height: `${year.value}%` }}
                                                        />
                                                        <span className="text-[10px] text-muted-foreground">{year.year}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                            >
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Code className="h-4 w-4 text-primary" />
                                    </div>
                                    Coding Profiles
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {codingProfiles.map((profile) => (
                                        <motion.a
                                            key={profile.name}
                                            href={profile.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -4 }}
                                            className="group block"
                                        >
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-lg`}>
                                                        <profile.icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-foreground">{profile.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{profile.username}</p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full" />
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
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                        <Briefcase className="h-3 w-3 text-primary" />
                                    </div>
                                    Featured Projects
                                </h3>
                                <Button size="sm" className="gap-1">
                                    <Plus className="h-3 w-3" /> Add Project
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.filter(p => p.featured).map((project) => (
                                    <motion.div
                                        key={project.name}
                                        whileHover={{ y: -2 }}
                                        className="group bg-card border border-primary/20 rounded-xl p-4 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-3xl">{project.image}</span>
                                            <Badge variant="success" className="text-xs">Featured</Badge>
                                        </div>
                                        <h4 className="text-base font-semibold text-foreground mb-1">{project.name}</h4>
                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.desc}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {project.stack.slice(0, 4).map((tech) => (
                                                <span key={tech} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs font-medium text-foreground">{project.stars}</span>
                                            </div>
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs">
                                                View <ExternalLink className="h-3 w-3" />
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
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-3 w-3 text-primary" />
                                    </div>
                                    Resume Versions
                                </h3>
                                <Button
                                    size="sm"
                                    className="gap-1"
                                    onClick={handleUploadClick}
                                >
                                    <Upload className="h-3 w-3" /> Upload New
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {resumes.map((resume) => (
                                    <motion.div
                                        key={resume.name}
                                        whileHover={{ x: 2 }}
                                        className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all"
                                    >
                                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-medium text-foreground">{resume.name}</h4>
                                                <Badge variant="outline" className="text-[9px] px-1">
                                                    {resume.version}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {resume.updated}
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <DownloadIcon className="h-3 w-3" /> {resume.downloads}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-center px-3">
                                            <p className="text-md font-bold text-primary">{resume.score}</p>
                                            <p className="text-sm text-muted-foreground">ATS Score</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <DownloadIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Award className="h-3 w-3 text-primary" />
                                </div>
                                Achievements & Badges
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {achievements.map((achievement) => {
                                    const Icon = achievement.icon;
                                    return (
                                        <motion.div
                                            key={achievement.title}
                                            whileHover={{ y: -2 }}
                                            className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
                                        >
                                            <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-3`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <h4 className="text-sm font-medium text-foreground mb-1">{achievement.title}</h4>
                                            <p className="text-xs text-muted-foreground mb-2">{achievement.desc}</p>
                                            <p className="text-[10px] text-primary">{achievement.date}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mt-6">
                                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="h-3 w-3 text-primary" />
                                </div>
                                Certifications
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                                {certifications.map((cert) => {
                                    const Icon = cert.icon;
                                    return (
                                        <motion.div
                                            key={cert.name}
                                            whileHover={{ scale: 1.02 }}
                                            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all"
                                        >
                                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-foreground">{cert.name}</h4>
                                                <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                        {cert.year}
                                                    </span>
                                                    {cert.expiry && (
                                                        <span className="text-sm text-muted-foreground">
                                                            Expires {cert.expiry}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="success" className="text-[9px] px-2">
                                                <CheckCircle className="h-2 w-2 mr-1" /> Verified
                                            </Badge>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>
                </TabsProvider>
            </div>
        </div>
    );
}