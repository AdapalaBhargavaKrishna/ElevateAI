// app/user/interview/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Play, History, Settings, Users, Brain, Target, ListChecks, X,
    Zap, GraduationCap, Code2, ChevronRight, Network, Heart, Cpu,
    Database, Cloud, Shield, Smartphone, BarChart2, Boxes, GitBranch, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryType = "technical" | "job_role" | "behavioural";

interface Domain { id: string; label: string; desc: string; icon: React.ReactNode; color: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const techDomains: Domain[] = [
    { id: "dsa",           label: "DSA",            desc: "Data Structures & Algorithms",              icon: <Code2 className="h-4 w-4" />,      color: "blue"   },
    { id: "system_design", label: "System Design",  desc: "Scalable architecture & trade-offs",        icon: <Network className="h-4 w-4" />,    color: "purple" },
    { id: "devops",        label: "DevOps",          desc: "CI/CD, Docker, Kubernetes, cloud ops",      icon: <Cloud className="h-4 w-4" />,      color: "sky"    },
    { id: "databases",     label: "Databases",       desc: "SQL, NoSQL, indexing, query optimisation",  icon: <Database className="h-4 w-4" />,   color: "amber"  },
    { id: "security",      label: "Security",        desc: "Auth, encryption, OWASP, threat models",    icon: <Shield className="h-4 w-4" />,     color: "red"    },
    { id: "mobile",        label: "Mobile Dev",      desc: "iOS, Android, React Native, Flutter",       icon: <Smartphone className="h-4 w-4" />, color: "green"  },
    { id: "ml_ai",         label: "ML / AI",         desc: "Machine learning, deep learning, LLMs",     icon: <Brain className="h-4 w-4" />,      color: "violet" },
    { id: "frontend",      label: "Frontend",        desc: "React, Next.js, CSS, performance, a11y",    icon: <Boxes className="h-4 w-4" />,      color: "pink"   },
    { id: "backend",       label: "Backend",         desc: "APIs, microservices, concurrency, caching", icon: <GitBranch className="h-4 w-4" />,  color: "teal"   },
    { id: "os_networking", label: "OS & Networks",   desc: "Processes, threads, TCP/IP, sockets",       icon: <Cpu className="h-4 w-4" />,        color: "orange" },
];

const jobRoles = [
    "Frontend Developer", "Backend Developer", "Full-Stack Engineer",
    "DevOps Engineer", "Data Scientist", "Mobile Developer",
    "QA Engineer", "Product Manager", "Software Architect",
    "ML Engineer", "Data Engineer", "Security Engineer",
];

const behaviouralTopics: Domain[] = [
    { id: "behavioral",  label: "Behavioural",  desc: "STAR method, teamwork, conflict resolution", icon: <Users className="h-4 w-4" />,     color: "green"  },
    { id: "hr",          label: "HR Round",      desc: "Culture fit, career goals, salary talk",     icon: <Heart className="h-4 w-4" />,     color: "rose"   },
    { id: "leadership",  label: "Leadership",    desc: "Decision-making, ownership, mentoring",      icon: <BarChart2 className="h-4 w-4" />, color: "amber"  },
    { id: "situational", label: "Situational",   desc: "Hypothetical scenarios & judgement calls",   icon: <Wrench className="h-4 w-4" />,    color: "blue"   },
];

const sessionModes = [
    { id: "interview", label: "Real Mode",     desc: "Strict — no hints, no guidance. Simulates an actual interview.", icon: <Zap className="h-5 w-5" /> },
    { id: "learning",  label: "Practice Mode", desc: "Hints available, supportive feedback. Great for learning.",      icon: <GraduationCap className="h-5 w-5" /> },
];

const levels = [
    { value: "junior", label: "Junior",    sub: "0–2 years", color: "text-green-600 dark:text-green-400"   },
    { value: "mid",    label: "Mid-Level", sub: "2–5 years", color: "text-blue-600 dark:text-blue-400"     },
    { value: "senior", label: "Senior",    sub: "5+ years",  color: "text-purple-600 dark:text-purple-400" },
];

const difficulties = [
    { value: "easy",   label: "Easy",   desc: "Fundamentals & concepts" },
    { value: "medium", label: "Medium", desc: "Industry-standard depth" },
    { value: "hard",   label: "Hard",   desc: "Complex edge cases"      },
];

const questionCounts = [1, 2, 3];

const categoryTabs: { id: CategoryType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "technical",   label: "Technical Skills", icon: <Code2 className="h-4 w-4" />,  desc: "Domain-specific deep dives — DSA, DevOps, System Design & more"       },
    { id: "job_role",    label: "Job Role Prep",    icon: <Users className="h-4 w-4" />,  desc: "Tailored mix of questions for your exact target role"                  },
    { id: "behavioural", label: "Behavioural / HR", icon: <Heart className="h-4 w-4" />,  desc: "Soft skills, STAR method, HR rounds, leadership scenarios"              },
];

// ─── Colour helpers ───────────────────────────────────────────────────────────

const colorMap: Record<string, { ring: string; bg: string; text: string }> = {
    blue:   { ring: "ring-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400"    },
    purple: { ring: "ring-purple-500", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400"},
    sky:    { ring: "ring-sky-500",    bg: "bg-sky-500/10",    text: "text-sky-600 dark:text-sky-400"      },
    amber:  { ring: "ring-amber-500",  bg: "bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400"  },
    red:    { ring: "ring-red-500",    bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400"      },
    green:  { ring: "ring-green-500",  bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400"  },
    violet: { ring: "ring-violet-500", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400"},
    pink:   { ring: "ring-pink-500",   bg: "bg-pink-500/10",   text: "text-pink-600 dark:text-pink-400"    },
    teal:   { ring: "ring-teal-500",   bg: "bg-teal-500/10",   text: "text-teal-600 dark:text-teal-400"    },
    orange: { ring: "ring-orange-500", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400"},
    rose:   { ring: "ring-rose-500",   bg: "bg-rose-500/10",   text: "text-rose-600 dark:text-rose-400"    },
};

const domainClasses = (color: string, selected: boolean) => {
    const c = colorMap[color] ?? colorMap.blue;
    return selected
        ? `ring-2 ${c.ring} ${c.bg} border-transparent shadow-lg`
        : "border-border hover:border-primary/30";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewCoachPage() {
    const router = useRouter();
    const [showModal, setShowModal]     = useState(false);
    const [categoryType, setCategoryType] = useState<CategoryType>("technical");
    const [selectedDomain, setSelectedDomain]     = useState("dsa");
    const [selectedJobRole, setSelectedJobRole]   = useState("Backend Developer");
    const [selectedBehavTopic, setSelectedBehavTopic] = useState("behavioral");
    const [sessionMode, setSessionMode] = useState("interview");
    const [config, setConfig] = useState({ level: "mid", difficulty: "medium", questionCount: 7 });

    const getInterviewMode = () => {
        if (categoryType === "technical")   return selectedDomain;
        if (categoryType === "job_role")    return "technical";
        return selectedBehavTopic;
    };

    const getEffectiveRole = () => categoryType === "job_role" ? selectedJobRole : "Software Engineer";

    const getSelectionLabel = () => {
        if (categoryType === "technical")   return techDomains.find(d => d.id === selectedDomain)?.label ?? selectedDomain;
        if (categoryType === "job_role")    return selectedJobRole;
        return behaviouralTopics.find(t => t.id === selectedBehavTopic)?.label ?? selectedBehavTopic;
    };

    const handleStart = () => {
        if (categoryType === "technical" && selectedDomain === "dsa") {
            router.push(
                `/user/playground` +
                `?source=interview` +
                `&track=dsa` +
                `&questionCount=${config.questionCount}` +
                `&level=${config.level}` +
                `&difficulty=${config.difficulty}` +
                `&sessionMode=${sessionMode}`
            );
            setShowModal(false);
            return;
        }

        router.push(
            `/user/interview/session` +
            `?mode=${getInterviewMode()}` +
            `&sessionMode=${sessionMode}` +
            `&role=${encodeURIComponent(getEffectiveRole())}` +
            `&level=${config.level}` +
            `&difficulty=${config.difficulty}` +
            `&questionCount=${config.questionCount}` +
            `&categoryType=${categoryType}`
        );
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Interview Coach</h1>
                        <p className="text-sm text-muted-foreground mt-1">Practice with our AI-powered mock interviewer</p>
                    </div>
                    <Link href="/user/interview/history">
                        <Button variant="outline" size="sm" className="gap-2">
                            <History className="h-4 w-4" /> View History
                        </Button>
                    </Link>
                </div>

                {/* Category Tabs */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Interview Category</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {categoryTabs.map((tab, i) => (
                            <motion.button
                                key={tab.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                onClick={() => setCategoryType(tab.id)}
                                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                                    categoryType === tab.id
                                        ? "ring-2 ring-primary bg-primary/10 border-transparent shadow-lg"
                                        : "border-border hover:border-primary/30 bg-card"
                                }`}
                            >
                                <div className={`inline-flex p-2 rounded-lg mb-3 ${categoryType === tab.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {tab.icon}
                                </div>
                                <p className="font-semibold text-foreground text-sm">{tab.label}</p>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tab.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Sub-selector */}
                <AnimatePresence mode="wait">
                    {categoryType === "technical" && (
                        <motion.div key="tech" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                            <h2 className="text-sm font-semibold text-foreground">Select Domain</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {techDomains.map((d, i) => {
                                    const sel = selectedDomain === d.id;
                                    const c = colorMap[d.color] ?? colorMap.blue;
                                    return (
                                        <motion.button
                                            key={d.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => setSelectedDomain(d.id)}
                                            className={`bg-card border rounded-xl p-3 text-left transition-all hover:shadow-md ${domainClasses(d.color, sel)}`}
                                        >
                                            <div className={`inline-flex p-1.5 rounded-lg mb-2 ${sel ? `${c.bg} ${c.text}` : "bg-muted text-muted-foreground"}`}>{d.icon}</div>
                                            <p className="font-semibold text-foreground text-xs">{d.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{d.desc}</p>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {categoryType === "job_role" && (
                        <motion.div key="role" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                            <h2 className="text-sm font-semibold text-foreground">Select Your Target Role</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {jobRoles.map((role, i) => (
                                    <motion.button
                                        key={role}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => setSelectedJobRole(role)}
                                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                                            selectedJobRole === role
                                                ? "ring-2 ring-primary bg-primary/10 border-transparent font-medium text-primary shadow-md"
                                                : "border-border hover:border-primary/40 bg-card text-muted-foreground"
                                        }`}
                                    >
                                        {role}
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                                Questions will be tailored as a complete interview loop for this role — combining technical, design, and role-specific topics.
                            </p>
                        </motion.div>
                    )}

                    {categoryType === "behavioural" && (
                        <motion.div key="behav" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                            <h2 className="text-sm font-semibold text-foreground">Select Topic</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {behaviouralTopics.map((t, i) => {
                                    const sel = selectedBehavTopic === t.id;
                                    const c = colorMap[t.color] ?? colorMap.blue;
                                    return (
                                        <motion.button
                                            key={t.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.07 }}
                                            onClick={() => setSelectedBehavTopic(t.id)}
                                            className={`bg-card border rounded-xl p-4 text-left transition-all hover:shadow-md ${domainClasses(t.color, sel)}`}
                                        >
                                            <div className={`inline-flex p-2 rounded-lg mb-3 ${sel ? `${c.bg} ${c.text}` : "bg-muted text-muted-foreground"}`}>{t.icon}</div>
                                            <p className="font-semibold text-foreground text-sm">{t.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Session Mode */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Session Mode</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sessionModes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSessionMode(m.id)}
                                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                                    sessionMode === m.id
                                        ? "ring-2 ring-primary border-transparent bg-primary/5 shadow-md"
                                        : "border-border hover:border-primary/30 bg-card"
                                }`}
                            >
                                <div className={`p-2 rounded-lg shrink-0 ${sessionMode === m.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {m.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{m.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                                </div>
                                {sessionMode === m.id && <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border border-border rounded-xl p-8"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4 bg-primary/15">
                            <Mic className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Practice?</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                            {sessionMode === "learning" ? "Practice Mode — hints and guidance enabled." : "Real Mode — strict simulation. No hints. Just like the real thing."}
                            {" "}Focus: <span className="font-medium text-foreground">{getSelectionLabel()}</span>
                        </p>
                        <Button size="lg" onClick={() => setShowModal(true)} className="gap-2">
                            <Play className="h-4 w-4" /> Configure & Start <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Configuration Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-card border border-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Settings className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Interview Configuration</h2>
                                        <p className="text-xs text-muted-foreground">{getSelectionLabel()} · {sessionMode === "learning" ? "Practice Mode" : "Real Mode"}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
                            </div>

                            <div className="p-6 space-y-7">
                                {/* Level */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-muted-foreground" /> Experience Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {levels.map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() => setConfig({ ...config, level: level.value })}
                                                className={`p-4 rounded-xl border text-center transition-all ${config.level === level.value ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                                            >
                                                <p className={`text-sm font-semibold ${level.color}`}>{level.label}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{level.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" /> Difficulty
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {difficulties.map((diff) => (
                                            <button
                                                key={diff.value}
                                                onClick={() => setConfig({ ...config, difficulty: diff.value })}
                                                className={`p-3 rounded-xl border text-center transition-all ${config.difficulty === diff.value ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}
                                            >
                                                <p className="font-semibold text-foreground text-sm">{diff.label}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{diff.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <ListChecks className="h-4 w-4 text-muted-foreground" /> Number of Questions
                                    </label>
                                    <div className="flex gap-3">
                                        {questionCounts.map((count) => (
                                            <button
                                                key={count}
                                                onClick={() => setConfig({ ...config, questionCount: count })}
                                                className={`flex-1 py-3 rounded-xl border text-center transition-all ${config.questionCount === count ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}
                                            >
                                                <span className="text-xl font-bold text-foreground">{count}</span>
                                                <span className="text-xs text-muted-foreground block mt-0.5">questions</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-muted/40 rounded-xl p-4 border border-border space-y-2">
                                    <p className="text-sm font-semibold text-foreground mb-3">Interview Summary</p>
                                    {[
                                        ["Category",   categoryTabs.find(t => t.id === categoryType)?.label ?? categoryType],
                                        ["Focus",      getSelectionLabel()],
                                        ["Mode",       sessionMode === "learning" ? "Practice (hints on)" : "Real (strict)"],
                                        ["Level",      levels.find(l => l.value === config.level)?.label ?? config.level],
                                        ["Difficulty", difficulties.find(d => d.value === config.difficulty)?.label ?? config.difficulty],
                                            ["Questions",  `${config.questionCount} coding question${config.questionCount > 1 ? "s" : ""}`],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{k}</span>
                                            <span className="text-foreground font-medium">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button className="flex-1 gap-2" onClick={handleStart}>
                                    <Play className="h-4 w-4" /> Start Interview
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}