'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2, Circle, Lock, Sparkles, BookOpen, Code, Server, Brain, ArrowRight,
    Calendar, Award, Target, Clock, TrendingUp, Briefcase, GraduationCap, Layers,
    Zap, ChevronRight, Download, Share2, Globe, Database, Cloud, Smartphone,
    BarChart3, Users, Shield, Settings, Terminal, GitBranch, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PageHeader = ({ title, description, actions }: {
    title: string;
    description: string;
    actions?: React.ReactNode
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

interface RoadmapItem {
    text: string;
    done: boolean;
    resources?: string[];
    timeEstimate?: string;
}

interface RoadmapPhase {
    id: string;
    phase: string;
    title: string;
    icon: React.ElementType;
    status: "completed" | "in-progress" | "locked";
    items: RoadmapItem[];
    skills: string[];
    projects?: string[];
    resources?: string[];
}

interface Milestone {
    id: string;
    title: string;
    date: string;
    completed: boolean;
    description: string;
}

const roadmapPhases: RoadmapPhase[] = [
    {
        id: "phase1",
        phase: "Phase 1",
        title: "Frontend Foundation",
        icon: Code,
        status: "completed",
        skills: ["HTML/CSS", "JavaScript", "React", "TypeScript", "Testing"],
        projects: ["Portfolio Website", "E-commerce UI", "Dashboard App"],
        resources: ["Frontend Masters", "React Docs", "TypeScript Handbook"],
        items: [
            { text: "Modern HTML5 & CSS3 (Flexbox, Grid, Animations)", done: true, timeEstimate: "2 weeks" },
            { text: "JavaScript ES6+ Deep Dive (Closures, Promises, Async/Await)", done: true, timeEstimate: "3 weeks" },
            { text: "React Fundamentals (Hooks, Context, Custom Hooks)", done: true, timeEstimate: "4 weeks" },
            { text: "TypeScript Integration with React", done: true, timeEstimate: "2 weeks" },
            { text: "State Management (Redux Toolkit / Zustand)", done: true, timeEstimate: "2 weeks" },
            { text: "Testing (Jest, React Testing Library, Cypress)", done: true, timeEstimate: "2 weeks" },
            { text: "Performance Optimization (Lazy Loading, Memoization)", done: true, timeEstimate: "1 week" },
        ],
    },
    {
        id: "phase2",
        phase: "Phase 2",
        title: "Backend Engineering",
        icon: Server,
        status: "in-progress",
        skills: ["Node.js", "Express", "Databases", "APIs", "Authentication"],
        projects: ["REST API", "Blog Platform", "Auth System"],
        resources: ["Node.js Docs", "Express Guide", "MongoDB University"],
        items: [
            { text: "Node.js Runtime & NPM Ecosystem", done: true, timeEstimate: "2 weeks" },
            { text: "Express.js Framework & Middleware", done: true, timeEstimate: "2 weeks" },
            { text: "RESTful API Design Principles", done: true, timeEstimate: "1 week" },
            { text: "Database Design (PostgreSQL & MongoDB)", done: false, timeEstimate: "3 weeks" },
            { text: "Authentication (JWT, OAuth, Sessions)", done: false, timeEstimate: "2 weeks" },
            { text: "GraphQL (Apollo, TypeGraphQL)", done: false, timeEstimate: "2 weeks" },
            { text: "WebSockets & Real-time Communication", done: false, timeEstimate: "2 weeks" },
        ],
    },
    {
        id: "phase3",
        phase: "Phase 3",
        title: "DevOps & Cloud",
        icon: Cloud,
        status: "locked",
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Monitoring"],
        projects: ["CI/CD Pipeline", "Containerized App", "Cloud Deployment"],
        resources: ["Docker Docs", "AWS Training", "K8s Tutorials"],
        items: [
            { text: "Containerization with Docker", done: false, timeEstimate: "2 weeks" },
            { text: "Orchestration with Kubernetes", done: false, timeEstimate: "3 weeks" },
            { text: "Cloud Platforms (AWS/Azure/GCP)", done: false, timeEstimate: "4 weeks" },
            { text: "CI/CD Pipelines (GitHub Actions)", done: false, timeEstimate: "2 weeks" },
            { text: "Infrastructure as Code (Terraform)", done: false, timeEstimate: "2 weeks" },
            { text: "Monitoring & Observability", done: false, timeEstimate: "1 week" },
        ],
    },
    {
        id: "phase4",
        phase: "Phase 4",
        title: "System Design",
        icon: Brain,
        status: "locked",
        skills: ["Architecture", "Scalability", "Caching", "Microservices"],
        projects: ["System Design Doc", "High-traffic App Design"],
        resources: ["DDIA Book", "System Design Primer", "YouTube Courses"],
        items: [
            { text: "Distributed Systems Fundamentals", done: false, timeEstimate: "3 weeks" },
            { text: "Scalability Patterns & Load Balancing", done: false, timeEstimate: "2 weeks" },
            { text: "Caching Strategies (Redis, CDN)", done: false, timeEstimate: "2 weeks" },
            { text: "Database Scaling (Sharding, Replication)", done: false, timeEstimate: "2 weeks" },
            { text: "Microservices Architecture", done: false, timeEstimate: "3 weeks" },
            { text: "Message Queues (Kafka, RabbitMQ)", done: false, timeEstimate: "2 weeks" },
        ],
    },
    {
        id: "phase5",
        phase: "Phase 5",
        title: "Career Acceleration",
        icon: Briefcase,
        status: "locked",
        skills: ["Interview Prep", "Resume", "Networking", "Personal Brand"],
        projects: ["Portfolio", "Blog", "Open Source"],
        resources: ["Interview Prep Platforms", "Resume Guides", "LinkedIn Learning"],
        items: [
            { text: "Technical Interview Preparation", done: false, timeEstimate: "4 weeks" },
            { text: "Behavioral Interview Mastery", done: false, timeEstimate: "2 weeks" },
            { text: "Resume & LinkedIn Optimization", done: false, timeEstimate: "1 week" },
            { text: "Personal Brand Building", done: false, timeEstimate: "2 weeks" },
            { text: "Open Source Contributions", done: false, timeEstimate: "3 weeks" },
            { text: "Networking & Community Engagement", done: false, timeEstimate: "Ongoing" },
        ],
    },
];

const milestones: Milestone[] = [
    { id: "m1", title: "First Portfolio Launch", date: "Jan 2026", completed: true, description: "Built and deployed personal portfolio website" },
    { id: "m2", title: "First Client Project", date: "Mar 2026", completed: true, description: "Delivered full-stack application for client" },
    { id: "m3", title: "AWS Certification", date: "Jun 2026", completed: false, description: "AWS Solutions Architect Associate" },
    { id: "m4", title: "First Tech Job", date: "Sep 2026", completed: false, description: "Land first developer position" },
];

const learningStats = {
    totalHours: 248,
    completedTopics: 42,
    projectsBuilt: 8,
    currentStreak: 12
};

const statusColors = {
    completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    "in-progress": "bg-primary/10 text-primary border-primary/20",
    locked: "bg-muted text-muted-foreground border-border",
};

const statusIcons = {
    completed: CheckCircle2,
    "in-progress": Zap,
    locked: Lock,
};

export default function CareerRoadmapPage() {
    const [selectedPhase, setSelectedPhase] = useState<string>("phase2");
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (phaseId: string, itemIndex: number) => {
        const key = `${phaseId}-${itemIndex}`;
        setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const calculateProgress = () => {
        const total = roadmapPhases.reduce((acc, phase) => acc + phase.items.length, 0);
        const completed = roadmapPhases.reduce((acc, phase) =>
            acc + phase.items.filter(item => item.done).length, 0);
        return Math.round((completed / total) * 100);
    };

    const progress = calculateProgress();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                <PageHeader
                    title="Career Roadmap"
                    description="Your personalized path to becoming a Senior Full-Stack Developer"
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                <Download className="h-3.5 w-3.5" /> Export
                            </Button>
                            <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90">
                                <Sparkles className="h-3.5 w-3.5" /> Regenerate
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Progress", value: `${progress}%`, icon: Target, color: "bg-blue-400" },
                        { label: "Learning Hours", value: learningStats.totalHours, icon: Clock, color: "bg-green-400" },
                        { label: "Projects Built", value: learningStats.projectsBuilt, icon: Layers, color: "bg-purple-400" },
                        { label: "Day Streak", value: learningStats.currentStreak, icon: TrendingUp, color: "bg-orange-400" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card border border-border rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            Overall Progress
                        </h3>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {progress}% Complete
                        </span>
                    </div>

                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                        {roadmapPhases.map((phase) => {
                            const StatusIcon = statusIcons[phase.status];
                            return (
                                <button
                                    key={phase.id}
                                    onClick={() => setSelectedPhase(phase.id)}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors ${selectedPhase === phase.id
                                        ? 'border-primary bg-primary/5'
                                        : statusColors[phase.status]
                                        }`}
                                >
                                    <StatusIcon className="h-3 w-3" />
                                    <span>{phase.phase}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {roadmapPhases.map((phase, phaseIndex) => (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: phaseIndex * 0.1 }}
                                className={`bg-card border border-border rounded-xl overflow-hidden transition-all ${phase.status === "locked" ? "opacity-70" : ""
                                    } ${selectedPhase === phase.id ? 'ring-2 ring-primary shadow-lg' : ''}`}
                            >
                                <div
                                    className={`p-4 cursor-pointer transition-colors ${selectedPhase === phase.id ? 'bg-primary/5' : 'hover:bg-muted/30'
                                        }`}
                                    onClick={() => setSelectedPhase(phase.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-lg ${phase.status === "completed" ? 'bg-green-500/10' :
                                            phase.status === "in-progress" ? 'bg-primary/10' : 'bg-muted'
                                            } flex items-center justify-center`}>
                                            <phase.icon className={`h-5 w-5 ${phase.status === "completed" ? 'text-green-500' :
                                                phase.status === "in-progress" ? 'text-primary' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-muted-foreground">{phase.phase}</span>
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[phase.status]}`}>
                                                    {phase.status === "completed" && "Completed"}
                                                    {phase.status === "in-progress" && "In Progress"}
                                                    {phase.status === "locked" && "Locked"}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-foreground">{phase.title}</h3>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedPhase === phase.id ? 'rotate-90' : ''
                                            }`} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {selectedPhase === phase.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-border"
                                        >
                                            <div className="p-4 space-y-4">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills to Master</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {phase.skills.map((skill) => (
                                                            <span key={skill} className="text-xs px-2 py-1 bg-muted/50 rounded-full text-foreground">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-2">Learning Path</p>
                                                    <div className="space-y-2">
                                                        {phase.items.map((item, idx) => (
                                                            <div key={idx} className="border border-border rounded-lg p-3">
                                                                <div
                                                                    className="flex items-start gap-2 cursor-pointer"
                                                                    onClick={() => toggleItem(phase.id, idx)}
                                                                >
                                                                    {item.done ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                                    ) : (
                                                                        <Circle className={`h-4 w-4 shrink-0 mt-0.5 ${phase.status === "locked" ? 'text-muted-foreground' : 'text-primary'
                                                                            }`} />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <p className={`text-sm ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'
                                                                            }`}>
                                                                            {item.text}
                                                                        </p>
                                                                        {item.timeEstimate && (
                                                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                {item.timeEstimate}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {expandedItems[`${phase.id}-${idx}`] && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="mt-3 pt-3 border-t border-border"
                                                                        >
                                                                            <p className="text-xs font-medium text-muted-foreground mb-2">Resources</p>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {phase.resources?.map((resource) => (
                                                                                    <span key={resource} className="text-xs px-2 py-1 bg-primary/5 rounded-full text-primary">
                                                                                        {resource}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {phase.projects && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">Projects</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {phase.projects.map((project) => (
                                                                <span key={project} className="text-xs px-2 py-1 bg-primary/10 rounded-full text-primary">
                                                                    {project}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {phase.status === "in-progress" && (
                                                    <Button size="sm" className="w-full mt-2">
                                                        Continue Learning <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                                    </Button>
                                                )}
                                                {phase.status === "locked" && (
                                                    <Button variant="outline" size="sm" className="w-full mt-2" disabled>
                                                        <Lock className="h-3.5 w-3.5 mr-1.5" /> Complete Previous Phase
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-card border border-border rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                <Award className="h-4 w-4 text-primary" />
                                Milestones
                            </h3>
                            <div className="space-y-3">
                                {milestones.map((milestone) => (
                                    <div key={milestone.id} className="flex items-start gap-2">
                                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${milestone.completed ? 'bg-green-500/20' : 'bg-muted'
                                            }`}>
                                            {milestone.completed ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Circle className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                                            <p className="text-[10px] text-primary mt-1">{milestone.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Recommended Resources
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { name: "Frontend Masters", type: "Course Platform", icon: Code },
                                    { name: "System Design Interview", type: "Book", icon: Brain },
                                    { name: "AWS Certification Guide", type: "Course", icon: Cloud },
                                    { name: "LeetCode Premium", type: "Practice", icon: Terminal },
                                ].map((resource) => (
                                    <div key={resource.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                            <resource.icon className="h-3 w-3 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-foreground">{resource.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{resource.type}</p>
                                        </div>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-primary" />
                                Next Goal
                            </h3>
                            <p className="text-sm text-foreground">Complete Backend Phase</p>
                            <p className="text-xs text-muted-foreground mt-1">3 topics remaining</p>
                            <div className="h-1.5 bg-muted/30 rounded-full mt-3 overflow-hidden">
                                <div className="h-full w-3/5 bg-primary rounded-full" />
                            </div>
                            <p className="text-[10px] text-primary mt-2">Estimated completion: 4 weeks</p>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card border border-border rounded-xl p-4"
                >
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        Estimated Timeline
                    </h3>
                    <div className="flex items-center justify-between">
                        {[
                            { phase: "Phase 1", duration: "8 weeks", completed: true },
                            { phase: "Phase 2", duration: "10 weeks", completed: false },
                            { phase: "Phase 3", duration: "8 weeks", completed: false },
                            { phase: "Phase 4", duration: "10 weeks", completed: false },
                            { phase: "Phase 5", duration: "6 weeks", completed: false },
                        ].map((item, i) => (
                            <React.Fragment key={item.phase}>
                                <div className="text-center">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mx-auto mb-1 ${item.completed ? 'bg-green-500/20' : 'bg-muted'
                                        }`}>
                                        {item.completed ? (
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-medium text-foreground">{item.phase}</p>
                                    <p className="text-[8px] text-muted-foreground">{item.duration}</p>
                                </div>
                                {i < 4 && (
                                    <div className="flex-1 h-px bg-border mx-1" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}