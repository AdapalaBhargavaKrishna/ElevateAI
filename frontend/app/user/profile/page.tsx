'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
    Github, Linkedin, Mail, MapPin, ExternalLink, Star, Code, Award,
    Share2, Upload, FileText, Zap, TrendingUp,
    Eye, Plus, Camera, Briefcase, GraduationCap,
    Sparkles, CheckCircle2, Twitter, Figma,
    Database, Cloud, Braces, Server, Palette,
    Calendar, Medal, Trophy, BookOpen,
    CheckCircle, Users, FolderOpen
} from "lucide-react";

/* ───── Types ───── */

interface CodingProfile {
    name: string;
    icon: any;
    url: string;
    username: string;
    stats: string;
}

interface Skill {
    name: string;
    level: number;
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
    { name: "GitHub", icon: Github, url: "#", username: "@bhargavak", stats: "2.4k contributions" },
    { name: "LinkedIn", icon: Linkedin, url: "#", username: "bhargava-krishna", stats: "850+ connections" },
    { name: "LeetCode", icon: Code, url: "#", username: "@bhargava_k", stats: "450 problems solved" },
    { name: "Twitter", icon: Twitter, url: "#", username: "@bhargava_dev", stats: "3.2k followers" },
    { name: "Medium", icon: BookOpen, url: "#", username: "@bhargava", stats: "25 articles" },
    { name: "Figma", icon: Figma, url: "#", username: "bhargava.k", stats: "12 public files" },
];

const skills: Skill[] = [
    { name: "React/Next.js", level: 95, category: "frontend" },
    { name: "TypeScript", level: 92, category: "frontend" },
    { name: "Node.js", level: 88, category: "backend" },
    { name: "Python", level: 82, category: "backend" },
    { name: "System Design", level: 85, category: "backend" },
    { name: "PostgreSQL", level: 80, category: "backend" },
    { name: "Docker/K8s", level: 75, category: "devops" },
    { name: "AWS", level: 78, category: "devops" },
    { name: "GraphQL", level: 82, category: "backend" },
    { name: "MongoDB", level: 70, category: "backend" },
    { name: "Tailwind CSS", level: 90, category: "frontend" },
    { name: "Figma", level: 65, category: "design" },
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
        { name: "Resumes", score: 98 },
    ],
};

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
    transition: { duration: 0.4 }
};

/* ───── Component ───── */

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");

    const handleUploadClick = () => {
        window.location.href = '/user/resume';
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Developer Profile</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your professional presence</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Preview</span>
                        </Button>
                        <Button size="sm" className="gap-1 sm:gap-2">
                            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Share Profile</span>
                        </Button>
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="overflow-hidden">
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                        <span className="text-2xl sm:text-3xl font-semibold text-primary">{userInfo.initials}</span>
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 border-2 border-background shadow-lg">
                                        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </button>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{userInfo.name}</h2>
                                            <p className="text-base sm:text-lg text-muted-foreground mt-1">{userInfo.title}</p>
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                                                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> {userInfo.location}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                                    <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> {userInfo.experience}
                                                </span>
                                                <Badge variant="secondary" className="text-xs px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <Sparkles className="h-3 w-3 mr-1" /> {userInfo.availability}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Score Card */}
                                        <div className="flex items-center gap-3 bg-primary/5 px-3 py-2 sm:px-4 sm:py-3 rounded-xl self-start">
                                            <div className="relative h-12 w-12 sm:h-14 sm:w-14">
                                                <svg className="h-12 w-12 sm:h-14 sm:w-14 -rotate-90" viewBox="0 0 48 48">
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
                                                <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-bold text-foreground">
                                                    {profileStrength.overall}
                                                </span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs sm:text-sm font-medium text-foreground">Profile Score</p>
                                                <p className="text-[10px] sm:text-xs text-primary">↑ 5% this month</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm sm:text-base text-muted-foreground mt-4 line-clamp-2 sm:line-clamp-3">
                                        {userInfo.bio}
                                    </p>

                                    {/* Quick Links */}
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        {codingProfiles.slice(0, 4).map((profile) => (
                                            <a key={profile.name} href={profile.url} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 sm:h-8 px-2 sm:px-3 gap-1.5 text-xs"
                                                >
                                                    <profile.icon className="h-3.5 w-3.5" />
                                                    {profile.name}
                                                </Button>
                                            </a>
                                        ))}
                                        <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 gap-1.5 text-xs">
                                            <Mail className="h-3.5 w-3.5" /> Email
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                        <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                        <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
                        <TabsTrigger value="certifications" className="text-xs sm:text-sm">Certifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Skills & Profile Strength */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Skills Section */}
                            <motion.div
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                className="lg:col-span-2"
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-foreground">Skills</h3>
                                            <Badge variant="outline" className="text-xs">
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
                                                    <div className="space-y-2">
                                                        {skills.filter(s => s.category === category).map((skill) => (
                                                            <div key={skill.name} className="flex items-center justify-between text-sm">
                                                                <span className="text-foreground">{skill.name}</span>
                                                                <span className="text-muted-foreground">{skill.level}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Profile Strength */}
                            <motion.div
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Profile Strength
                                        </h3>

                                        <div className="space-y-4">
                                            {profileStrength.sections.map((section) => (
                                                <div key={section.name} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{section.name}</span>
                                                        <span className="text-foreground font-medium">{section.score}%</span>
                                                    </div>
                                                    <Progress value={section.score} className="h-1.5" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                                            <p className="text-xs text-muted-foreground flex items-start gap-2">
                                                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                <span>Complete 2 more projects to reach 95% profile strength</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Coding Profiles */}
                        <motion.div
                            variants={fadeUp}
                            initial="initial"
                            animate="animate"
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
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
                                                <div className="p-4 rounded-lg border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <profile.icon className="h-5 w-5 text-foreground" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground">{profile.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{profile.username}</p>
                                                        </div>
                                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-green-500 rounded-full" />
                                                        {profile.stats}
                                                    </p>
                                                </div>
                                            </motion.a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="projects">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                    <h3 className="text-lg font-semibold text-foreground">Projects</h3>
                                    <Button size="sm" className="gap-2 w-full sm:w-auto">
                                        <Plus className="h-4 w-4" /> Add Project
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.filter(p => p.featured).map((project) => (
                                        <motion.div
                                            key={project.name}
                                            whileHover={{ y: -2 }}
                                            className="group border rounded-lg p-5 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-3xl">{project.image}</span>
                                                <Badge variant="secondary" className="text-xs">Featured</Badge>
                                            </div>
                                            <h4 className="text-base font-semibold text-foreground mb-2">{project.name}</h4>
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.desc}</p>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {project.stack.slice(0, 4).map((tech) => (
                                                    <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-medium">{project.stars}</span>
                                                </div>
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs">
                                                    View <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="certifications">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                    <h3 className="text-lg font-semibold text-foreground">Certifications</h3>
                                    <Button size="sm" className="gap-2 w-full sm:w-auto">
                                        <Plus className="h-4 w-4" /> Add Certification
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certifications.map((cert) => {
                                        const Icon = cert.icon;
                                        return (
                                            <motion.div
                                                key={cert.name}
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-sm transition-all"
                                            >
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-foreground">{cert.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                                    <div className="flex items-center gap-2 mt-2">
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
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Verified
                                                </Badge>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}