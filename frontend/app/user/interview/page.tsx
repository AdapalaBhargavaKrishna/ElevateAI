'use client';

import React, { useState } from 'react';
import { motion } from "framer-motion";
import {
    Mic, MicOff, Play, RotateCcw, Clock, MessageSquare, AlertCircle, CheckCircle2, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PageHeader = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
        </div>
    );
};

interface Mode {
    id: string;
    label: string;
    desc: string;
}

interface PastInterview {
    role: string;
    mode: string;
    score: number;
    date: string;
    duration: string;
}

const modes: Mode[] = [
    { id: "technical", label: "Technical", desc: "DSA, System Design, Coding" },
    { id: "behavioral", label: "Behavioral", desc: "STAR method, Leadership" },
    { id: "hr", label: "HR Round", desc: "Culture fit, Salary negotiation" },
];

const pastInterviews: PastInterview[] = [
    { role: "Frontend Developer", mode: "Technical", score: 8.5, date: "Feb 15, 2026", duration: "25 min" },
    { role: "Full-Stack Engineer", mode: "Behavioral", score: 7.8, date: "Feb 12, 2026", duration: "18 min" },
    { role: "React Developer", mode: "HR", score: 9.0, date: "Feb 10, 2026", duration: "15 min" },
    { role: "Backend Engineer", mode: "Technical", score: 8.2, date: "Feb 8, 2026", duration: "22 min" },
    { role: "DevOps Specialist", mode: "Behavioral", score: 8.7, date: "Feb 5, 2026", duration: "20 min" },
];

export default function InterviewCoachPage() {
    const [selectedMode, setSelectedMode] = useState<string>("technical");
    const [isActive, setIsActive] = useState<boolean>(false);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <PageHeader
                    title="AI Interview Coach"
                    description="Practice with our AI-powered mock interviewer"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {modes.map((mode, index) => (
                        <motion.button
                            key={mode.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedMode(mode.id)}
                            className={`bg-card border border-border rounded-xl p-4 text-left transition-all hover:shadow-md ${selectedMode === mode.id
                                ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                                : "hover:border-primary/30"
                                }`}
                        >
                            <p className="font-semibold text-foreground">{mode.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
                        </motion.button>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-xl p-6"
                >
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${isActive ? "bg-primary animate-pulse" : "bg-muted"
                            }`}>
                            {isActive ? (
                                <Volume2 className="h-8 w-8 text-primary-foreground" />
                            ) : (
                                <Mic className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {isActive ? "Interview in Progress..." : "Ready to Start"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                            {isActive
                                ? "Speak clearly and take your time. The AI is evaluating your responses."
                                : `Start a ${selectedMode} mock interview. The AI will ask relevant questions and provide real-time feedback.`}
                        </p>

                        <div className="flex gap-3">
                            <Button
                                className={isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                                size="lg"
                                onClick={() => setIsActive(!isActive)}
                            >
                                {isActive ? <MicOff className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {isActive ? "End Interview" : "Start Interview"}
                            </Button>
                            {!isActive && (
                                <Button variant="outline" size="lg">
                                    <RotateCcw className="h-4 w-4 mr-2" /> Practice Questions
                                </Button>
                            )}
                        </div>
                    </div>

                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="border-t border-border mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Clock className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="text-sm font-semibold text-foreground">02:34</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Questions</p>
                                    <p className="text-sm font-semibold text-foreground">3 / 5</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Filler Words</p>
                                    <p className="text-sm font-semibold text-foreground">2</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <h2 className="text-sm font-semibold text-foreground">Interview History</h2>
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Role</th>
                                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Mode</th>
                                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Score</th>
                                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Duration</th>
                                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastInterviews.map((item, i) => (
                                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-3 text-sm font-medium text-foreground">{item.role}</td>
                                            <td className="p-3">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.mode === "Technical" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                                    item.mode === "Behavioral" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                                                        "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                                    }`}>
                                                    {item.mode}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                    {item.score}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">{item.duration}</td>
                                            <td className="p-3 text-sm text-muted-foreground">{item.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}