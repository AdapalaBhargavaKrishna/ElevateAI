// app/user/interview/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Play, RotateCcw, History, Settings, Users, Brain, Target, ListChecks, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PageHeader = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <Link href="/user/interview/history">
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    View History
                </Button>
            </Link>
        </div>
    );
};

interface Mode {
    id: string;
    label: string;
    desc: string;
    icon: React.ReactNode;
}

const modes: Mode[] = [
    { id: "technical", label: "Technical", desc: "DSA, System Design, Coding", icon: <Brain className="h-5 w-5" /> },
    { id: "behavioral", label: "Behavioral", desc: "STAR method, Leadership", icon: <Users className="h-5 w-5" /> },
    { id: "hr", label: "HR Round", desc: "Culture fit, Salary negotiation", icon: <Target className="h-5 w-5" /> },
];

const roles = [
    { value: "frontend", label: "Frontend Developer" },
    { value: "backend", label: "Backend Developer" },
    { value: "fullstack", label: "Full-Stack Engineer" },
    { value: "devops", label: "DevOps Specialist" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "mobile", label: "Mobile Developer" },
    { value: "qa", label: "QA Engineer" },
    { value: "product", label: "Product Manager" },
];

const levels = [
    { value: "junior", label: "Junior (0-2 years)", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
    { value: "mid", label: "Mid-Level (2-5 years)", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { value: "senior", label: "Senior (5-8 years)", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { value: "lead", label: "Lead/Architect (8+ years)", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
];

const difficulties = [
    { value: "easy", label: "Easy", desc: "Fundamental concepts and basic questions" },
    { value: "medium", label: "Medium", desc: "Industry standard interview questions" },
    { value: "hard", label: "Hard", desc: "Complex problems and edge cases" },
];

const questionCounts = [3, 5, 7, 10];

export default function InterviewCoachPage() {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<string>("technical");
    const [showConfigModal, setShowConfigModal] = useState(false);
    
    // Configuration state
    const [config, setConfig] = useState({
        role: "backend",
        level: "mid",
        difficulty: "medium",
        questionCount: 5
    });

    const handleStartInterview = () => {
        setShowConfigModal(true);
    };

    const handleConfirmStart = () => {
        // Get the display label for role
        const selectedRoleLabel = roles.find(r => r.value === config.role)?.label || "Backend Developer";
        
        // Map level to backend expected values (junior, mid, senior)
        let levelValue = config.level;
        if (config.level === 'junior') levelValue = 'junior';
        else if (config.level === 'mid') levelValue = 'mid';
        else if (config.level === 'senior') levelValue = 'senior';
        else if (config.level === 'lead') levelValue = 'senior'; // Map lead to senior for backend
        
        // Use Next.js router for client-side navigation
        router.push(
            `/user/interview/session?mode=${selectedMode}&role=${encodeURIComponent(selectedRoleLabel)}&level=${levelValue}&difficulty=${config.difficulty}&questionCount=${config.questionCount}`
        );
        
        // Close modal
        setShowConfigModal(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <PageHeader
                    title="AI Interview Coach"
                    description="Practice with our AI-powered mock interviewer"
                />

                {/* Interview Modes */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Interview Type</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {modes.map((mode, index) => (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedMode(mode.id)}
                                className={`bg-card border border-border rounded-xl p-4 text-left transition-all hover:shadow-md ${
                                    selectedMode === mode.id
                                        ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                                        : "hover:border-primary/30"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        selectedMode === mode.id ? "bg-primary/20" : "bg-muted"
                                    }`}>
                                        {mode.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{mode.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Start Interview Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-primary/5 via-primary/0 to-transparent border border-border rounded-xl p-8"
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4 bg-primary/20">
                            <Mic className="h-8 w-8 text-primary" />
                        </div>

                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            Ready to Practice?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                            Get personalized interview practice with AI feedback. 
                            Choose your preferences and start your mock interview.
                        </p>

                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            size="lg"
                            onClick={handleStartInterview}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Start Interview
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Configuration Modal */}
            <AnimatePresence>
                {showConfigModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowConfigModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold text-foreground">Interview Configuration</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfigModal(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Role Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Job Role
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {roles.map((role) => (
                                            <button
                                                key={role.value}
                                                onClick={() => setConfig({ ...config, role: role.value })}
                                                className={`p-3 rounded-lg border text-left transition-all ${
                                                    config.role === role.value
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <p className="text-sm font-medium text-foreground">{role.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Level Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-muted-foreground" />
                                        Experience Level
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {levels.map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() => setConfig({ ...config, level: level.value })}
                                                className={`p-3 rounded-lg border transition-all ${
                                                    config.level === level.value
                                                        ? "border-primary ring-1 ring-primary"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <p className={`text-sm font-medium ${level.color}`}>
                                                    {level.label.split('(')[0].trim()}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {level.label.match(/\((.*?)\)/)?.[1]}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                    {/* Warning for lead level mapping */}
                                    {config.level === 'lead' && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                            Note: Lead level will be evaluated at Senior level standard
                                        </p>
                                    )}
                                </div>

                                {/* Difficulty Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {difficulties.map((diff) => (
                                            <button
                                                key={diff.value}
                                                onClick={() => setConfig({ ...config, difficulty: diff.value })}
                                                className={`p-3 rounded-lg border transition-all ${
                                                    config.difficulty === diff.value
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <p className="font-medium text-foreground">{diff.label}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{diff.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                                        Number of Questions
                                    </label>
                                    <div className="flex gap-3">
                                        {questionCounts.map((count) => (
                                            <button
                                                key={count}
                                                onClick={() => setConfig({ ...config, questionCount: count })}
                                                className={`flex-1 py-3 rounded-lg border text-center transition-all ${
                                                    config.questionCount === count
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <span className="text-lg font-semibold text-foreground">{count}</span>
                                                <span className="text-xs text-muted-foreground block">questions</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                    <p className="text-sm font-medium text-foreground mb-2">Interview Summary</p>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-muted-foreground">
                                            <span className="text-foreground">Type:</span> {modes.find(m => m.id === selectedMode)?.label}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="text-foreground">Role:</span> {roles.find(r => r.value === config.role)?.label}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="text-foreground">Level:</span> {levels.find(l => l.value === config.level)?.label}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="text-foreground">Difficulty:</span> {difficulties.find(d => d.value === config.difficulty)?.label}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="text-foreground">Questions:</span> {config.questionCount} questions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowConfigModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={handleConfirmStart}
                                >
                                    <Play className="h-4 w-4 mr-2" />
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