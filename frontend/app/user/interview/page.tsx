// app/user/interview/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Play, History, Settings, Users, Brain, Target, ListChecks, X,
    Zap, GraduationCap, Server, Network, Code2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const interviewTypes = [
    {
        id: "technical",
        label: "Technical",
        desc: "DSA, coding concepts, tools & frameworks",
        icon: <Code2 className="h-5 w-5" />,
        color: "blue",
    },
    {
        id: "behavioral",
        label: "Behavioral",
        desc: "STAR method, leadership, team experiences",
        icon: <Users className="h-5 w-5" />,
        color: "green",
    },
    {
        id: "system_design",
        label: "System Design",
        desc: "Scalable architecture, trade-offs & design",
        icon: <Network className="h-5 w-5" />,
        color: "purple",
    },
    {
        id: "hr",
        label: "HR Round",
        desc: "Culture fit, career goals, salary discussion",
        icon: <Target className="h-5 w-5" />,
        color: "orange",
    },
];

const sessionModes = [
    {
        id: "interview",
        label: "Real Mode",
        desc: "Strict — no hints, no guidance. Simulates an actual interview.",
        icon: <Zap className="h-5 w-5" />,
    },
    {
        id: "learning",
        label: "Practice Mode",
        desc: "Hints available, supportive feedback. Great for learning.",
        icon: <GraduationCap className="h-5 w-5" />,
    },
];

const roles = [
    { value: "Frontend Developer", label: "Frontend Developer" },
    { value: "Backend Developer", label: "Backend Developer" },
    { value: "Full-Stack Engineer", label: "Full-Stack Engineer" },
    { value: "DevOps Engineer", label: "DevOps Engineer" },
    { value: "Data Scientist", label: "Data Scientist" },
    { value: "Mobile Developer", label: "Mobile Developer" },
    { value: "QA Engineer", label: "QA Engineer" },
    { value: "Product Manager", label: "Product Manager" },
    { value: "Software Architect", label: "Software Architect" },
    { value: "ML Engineer", label: "ML Engineer" },
];

// Roles that make sense for system design
const systemDesignRoles = [
    { value: "Software Architect", label: "Software Architect" },
    { value: "Backend Developer", label: "Backend Developer" },
    { value: "Full-Stack Engineer", label: "Full-Stack Engineer" },
    { value: "DevOps Engineer", label: "DevOps Engineer" },
    { value: "ML Engineer", label: "ML Engineer" },
    { value: "Data Scientist", label: "Data Scientist" },
];

const levels = [
    { value: "junior", label: "Junior", sub: "0–2 years", color: "text-green-600 dark:text-green-400" },
    { value: "mid",    label: "Mid-Level", sub: "2–5 years", color: "text-blue-600 dark:text-blue-400" },
    { value: "senior", label: "Senior", sub: "5+ years",  color: "text-purple-600 dark:text-purple-400" },
];

const difficulties = [
    { value: "easy",   label: "Easy",   desc: "Fundamentals & concepts" },
    { value: "medium", label: "Medium", desc: "Industry-standard depth" },
    { value: "hard",   label: "Hard",   desc: "Complex edge cases" },
];

const questionCounts = [3, 5, 7, 10];

// ─── Colour helpers ────────────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
    blue:   "ring-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green:  "ring-green-500 bg-green-500/10 text-green-600 dark:text-green-400",
    purple: "ring-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    orange: "ring-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewCoachPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const [selectedType, setSelectedType]   = useState("technical");
    const [sessionMode, setSessionMode]     = useState("interview");
    const [config, setConfig] = useState({
        role:          "Backend Developer",
        level:         "mid",
        difficulty:    "medium",
        questionCount: 7,
    });

    // When type changes to system_design, default to a relevant role
    const handleTypeChange = (typeId: string) => {
        setSelectedType(typeId);
        if (typeId === "system_design") {
            const current = systemDesignRoles.find(r => r.value === config.role);
            if (!current) setConfig(c => ({ ...c, role: "Backend Developer" }));
        }
    };

    const availableRoles = selectedType === "system_design" ? systemDesignRoles : roles;

    // If current role not in new list, reset
    const effectiveRole = availableRoles.find(r => r.value === config.role)
        ? config.role
        : availableRoles[0].value;

    const handleConfirmStart = () => {
        const levelValue = config.level === "lead" ? "senior" : config.level;
        router.push(
            `/user/interview/session` +
            `?mode=${selectedType}` +
            `&sessionMode=${sessionMode}` +
            `&role=${encodeURIComponent(effectiveRole)}` +
            `&level=${levelValue}` +
            `&difficulty=${config.difficulty}` +
            `&questionCount=${config.questionCount}`
        );
        setShowModal(false);
    };

    const selectedTypeData = interviewTypes.find(t => t.id === selectedType)!;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Interview Coach</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Practice with our AI-powered mock interviewer
                        </p>
                    </div>
                    <Link href="/user/interview/history">
                        <Button variant="outline" size="sm" className="gap-2">
                            <History className="h-4 w-4" /> View History
                        </Button>
                    </Link>
                </div>

                {/* Interview Type */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Interview Type</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {interviewTypes.map((type, i) => {
                            const isSelected = selectedType === type.id;
                            const colorClass = isSelected ? typeColors[type.color] : "";
                            return (
                                <motion.button
                                    key={type.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    onClick={() => handleTypeChange(type.id)}
                                    className={`bg-card border rounded-xl p-4 text-left transition-all hover:shadow-md ${
                                        isSelected
                                            ? `ring-2 ${colorClass} border-transparent shadow-lg`
                                            : "border-border hover:border-primary/30"
                                    }`}
                                >
                                    <div className={`inline-flex p-2 rounded-lg mb-3 ${
                                        isSelected ? colorClass : "bg-muted"
                                    }`}>
                                        {type.icon}
                                    </div>
                                    <p className="font-semibold text-foreground text-sm">{type.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{type.desc}</p>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

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
                                <div className={`p-2 rounded-lg shrink-0 ${
                                    sessionMode === m.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                }`}>
                                    {m.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{m.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                                </div>
                                {sessionMode === m.id && (
                                    <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                                )}
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
                            {sessionMode === "learning"
                                ? "Practice Mode — hints and guidance enabled. Take your time and learn."
                                : "Real Mode — strict simulation. No hints. Just like the real thing."}
                        </p>
                        <Button size="lg" onClick={() => setShowModal(true)} className="gap-2">
                            <Play className="h-4 w-4" />
                            Configure & Start
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* ── Configuration Modal ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Settings className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Interview Configuration</h2>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedTypeData.label} · {sessionMode === "learning" ? "Practice Mode" : "Real Mode"}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-6 space-y-7">

                                {/* Role */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" /> Job Role
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {availableRoles.map((role) => (
                                            <button
                                                key={role.value}
                                                onClick={() => setConfig({ ...config, role: role.value })}
                                                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                                                    effectiveRole === role.value
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary font-medium text-foreground"
                                                        : "border-border hover:border-primary/40 text-muted-foreground"
                                                }`}
                                            >
                                                {role.label}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedType === "system_design" && (
                                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                                            System Design interviews are shown for architecture-focused roles.
                                        </p>
                                    )}
                                </div>

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
                                                className={`p-4 rounded-xl border text-center transition-all ${
                                                    config.level === level.value
                                                        ? "border-primary ring-1 ring-primary bg-primary/5"
                                                        : "border-border hover:border-primary/40"
                                                }`}
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
                                                className={`p-3 rounded-xl border text-center transition-all ${
                                                    config.difficulty === diff.value
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                        : "border-border hover:border-primary/40"
                                                }`}
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
                                                className={`flex-1 py-3 rounded-xl border text-center transition-all ${
                                                    config.questionCount === count
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                        : "border-border hover:border-primary/40"
                                                }`}
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
                                        ["Type",       selectedTypeData.label],
                                        ["Mode",       sessionMode === "learning" ? "Practice (hints on)" : "Real (strict)"],
                                        ["Role",       effectiveRole],
                                        ["Level",      levels.find(l => l.value === config.level)?.label ?? config.level],
                                        ["Difficulty", difficulties.find(d => d.value === config.difficulty)?.label ?? config.difficulty],
                                        ["Questions",  `${config.questionCount} questions`],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{k}</span>
                                            <span className="text-foreground font-medium">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button className="flex-1 gap-2" onClick={handleConfirmStart}>
                                    <Play className="h-4 w-4" />
                                    Start Interview
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}