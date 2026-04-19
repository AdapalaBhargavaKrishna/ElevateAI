// app/user/interview/summary/page.tsx
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { interviewApi, SessionSummaryResponse } from '../../../lib/interview.api';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Award, TrendingUp, Lightbulb, RotateCcw, Home,
    Brain, MessageSquare, User, Bot, Clock, Target, Star, AlertCircle,
    CheckCircle2, FileText, BarChart3
} from "lucide-react";
import Link from "next/link";

function InterviewSummaryPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [summaryData, setSummaryData] = useState<SessionSummaryResponse | null>(null);
    const [isLoading, setIsLoading]     = useState(true);
    const [error, setError]             = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) { router.push('/user/interview'); return; }
        fetchSummaryData();
    }, [sessionId]);

    const fetchSummaryData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await interviewApi.getSummary(sessionId!);
            setSummaryData(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load interview summary');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-500';
        if (score >= 6) return 'text-blue-500';
        if (score >= 4) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (pct: number) => {
        if (pct >= 80) return 'bg-green-500';
        if (pct >= 60) return 'bg-yellow-500';
        if (pct >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getVerdictColor = (verdict: string): string => {
        if (verdict.includes('Excellent') || verdict.includes('Strong Hire'))
            return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
        if (verdict.includes('Good') || verdict.includes('Hire'))
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        if (verdict.includes('Borderline'))
            return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
        if (verdict.includes('No Hire'))
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Analysing your interview performance…</p>
                </div>
            </div>
        );
    }

    if (error || !summaryData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load Summary</h2>
                    <p className="text-muted-foreground mb-4">{error || 'Interview summary not found'}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                        <Link href="/user/interview"><Button>Return to Coach</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    const scorePercentage = Math.round(summaryData.finalScore * 10);
    const scoreColor      = getScoreColor(summaryData.finalScore);
    const verdictColor    = getVerdictColor(summaryData.verdict);
    const circumference   = 2 * Math.PI * 56;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Interview Summary</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {summaryData.interviewType.charAt(0).toUpperCase() + summaryData.interviewType.slice(1)} interview
                            for {summaryData.role} ({summaryData.level} level) completed
                        </p>
                    </div>
                    <Link href="/user/interview">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Home className="h-4 w-4" /> Back to Coach
                        </Button>
                    </Link>
                </div>

                {/* Overall Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border rounded-xl p-6"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="relative h-32 w-32 mb-4">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-4xl font-bold ${scoreColor}`}>{scorePercentage}</span>
                            </div>
                            <svg className="h-32 w-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted-foreground/20 stroke-current" />
                                <circle
                                    cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
                                    className="text-primary stroke-current"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference * (1 - scorePercentage / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">Overall Performance Score</h2>
                        <p className="text-sm text-muted-foreground mt-1">Based on {summaryData.questionsAnswered} answered questions</p>
                        <Badge className={`mt-3 px-4 py-1 text-sm ${verdictColor}`}>{summaryData.verdict}</Badge>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Questions", value: `${summaryData.questionsAnswered}/${summaryData.totalQuestions}`, icon: <FileText className="h-5 w-5 text-primary" /> },
                        { label: "Role Level", value: summaryData.level, icon: <Target className="h-5 w-5 text-primary" />, capitalize: true },
                        { label: "Difficulty", value: summaryData.difficulty, icon: <BarChart3 className="h-5 w-5 text-primary" />, capitalize: true },
                        { label: "Completed", value: new Date(summaryData.completedAt).toLocaleDateString(), icon: <Clock className="h-5 w-5 text-primary" /> },
                    ].map((stat, i) => (
                        <Card key={i} className="bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className={`text-2xl font-bold text-foreground ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">{stat.icon}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Per-question score bars */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" /> Question Scores
                    </h3>
                    <div className="space-y-3">
                        {summaryData.questions.map((q, i) => {
                            const pct = Math.round((q.overallScore ?? 0) * 20);
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground line-clamp-1 flex-1 mr-4">Q{i + 1}: {q.questionText}</span>
                                        <span className="text-foreground font-medium shrink-0">{pct}/100</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: 0.2 + i * 0.08 }}
                                            className={`h-full ${getScoreBgColor(pct)} rounded-full`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card border border-border rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <h3 className="font-semibold text-foreground">Key Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                            {summaryData.strengths.split('\n').filter(Boolean).map((s, i) => (
                                <li key={i} className="flex gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card border border-border rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            <h3 className="font-semibold text-foreground">Areas to Improve</h3>
                        </div>
                        <ul className="space-y-3">
                            {summaryData.weaknesses.split('\n').filter(Boolean).map((w, i) => (
                                <li key={i} className="flex gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{w}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Overall Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Overall Summary</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{summaryData.overallSummary}</p>
                </motion.div>

                {/* Detailed Q&A */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                >
                    <div className="border-b border-border p-5 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Detailed Q&A Review</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Review each question, your answer, and AI feedback</p>
                    </div>
                    <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                        {summaryData.questions.map((q, idx) => (
                            <div key={idx} className="p-5 space-y-4 hover:bg-muted/10 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-medium text-primary">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <Badge variant="outline" className="text-xs">{q.category}</Badge>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500" />
                                                <span className="text-xs text-muted-foreground">{q.overallScore?.toFixed(1) || 'N/A'}/5</span>
                                            </div>
                                        </div>
                                        <p className="font-medium text-foreground">{q.questionText}</p>
                                    </div>
                                </div>
                                <div className="ml-9 space-y-3">
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-xs font-medium text-muted-foreground">Your Answer</span>
                                        </div>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{q.userAnswer}</p>
                                    </div>
                                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-xs font-medium text-primary">AI Feedback</span>
                                        </div>
                                        <div className="space-y-2">
                                            {q.strengths && (
                                                <div>
                                                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">✓ Strengths:</p>
                                                    <p className="text-sm text-muted-foreground">{q.strengths}</p>
                                                </div>
                                            )}
                                            {q.weaknesses && (
                                                <div>
                                                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">⚠ Areas for Improvement:</p>
                                                    <p className="text-sm text-muted-foreground">{q.weaknesses}</p>
                                                </div>
                                            )}
                                            {q.improvementSuggestions && (
                                                <div className="mt-2 pt-2 border-t border-primary/20">
                                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">💡 How to Improve:</p>
                                                    <p className="text-sm text-muted-foreground">{q.improvementSuggestions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Actions — no download button */}
                <div className="flex justify-center gap-4 pt-4 pb-8">
                    <Link href="/user/interview">
                        <Button variant="outline" size="lg" className="gap-2">
                            <RotateCcw className="h-4 w-4" /> New Interview
                        </Button>
                    </Link>
                    <Link href="/user/interview/history">
                        <Button variant="default" size="lg" className="gap-2">
                            <Award className="h-4 w-4" /> View All History
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function InterviewSummaryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <InterviewSummaryPageContent />
        </Suspense>
    );
}