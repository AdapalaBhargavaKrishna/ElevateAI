// app/user/interview/history/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, TrendingUp, Calendar, Clock, Award, BarChart3, 
    Brain, Target, Users, Loader2, AlertCircle, FileText 
} from "lucide-react";
import Link from "next/link";
import { interviewApi, SessionHistory } from '../../../lib/interview.api';

const PageHeader = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <Link href="/user/interview">
                <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Coach
                </Button>
            </Link>
        </div>
    );
};

export default function InterviewHistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await interviewApi.getHistory();
            setSessions(data.sessions);
        } catch (error: any) {
            console.error("Failed to fetch history:", error);
            setError(error.response?.data?.message || 'Failed to load interview history');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreDisplay = (score: number | null) => {
        if (score === null) return 'N/A';
        return (score * 10).toFixed(0);
    };

    const getVerdictFromScore = (score: number | null): string => {
        if (score === null) return 'In Progress';
        if (score >= 8) return 'Excellent';
        if (score >= 7) return 'Good';
        if (score >= 6) return 'Borderline';
        return 'Needs Improvement';
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-muted-foreground';
        if (score >= 8) return 'text-green-500';
        if (score >= 7) return 'text-blue-500';
        if (score >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getVerdictBadge = (verdict: string): string => {
        const styles: Record<string, string> = {
            'Excellent': "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
            'Good': "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            'Borderline': "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
            'Needs Improvement': "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            'In Progress': "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
        };
        return styles[verdict] || styles['In Progress'];
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            'technical': "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            'behavioral': "bg-green-500/10 text-green-600 dark:text-green-400",
            'hr': "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        };
        return styles[type] || styles['technical'];
    };

    const getDifficultyColor = (difficulty: string) => {
        switch(difficulty) {
            case 'easy': return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'hard': return 'bg-red-500/10 text-red-600 dark:text-red-400';
            default: return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
        }
    };

    const getLevelColor = (level: string) => {
        switch(level) {
            case 'junior': return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'senior': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
            case 'lead': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
            default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
        }
    };

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalInterviews = sessions.length;
    const averageScore = completedSessions.length > 0 
        ? (completedSessions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / completedSessions.length).toFixed(1)
        : '0';
    const bestScore = completedSessions.length > 0
        ? Math.max(...completedSessions.map(s => s.totalScore || 0))
        : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your interview history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load History</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => fetchHistory()} variant="outline">
                            Retry
                        </Button>
                        <Link href="/user/interview">
                            <Button>Return to Coach</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <PageHeader
                    title="Interview History"
                    description="Track your mock interview performance and progress over time"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Interviews</p>
                                    <p className="text-3xl font-bold text-foreground">{totalInterviews}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Score</p>
                                    <p className="text-3xl font-bold text-foreground">{averageScore}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardContent className="pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Best Score</p>
                                    <p className="text-3xl font-bold text-foreground">{getScoreDisplay(bestScore)}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Interview Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground mb-2">No interviews found</p>
                                <p className="text-sm text-muted-foreground mb-4">You haven't taken any interviews yet.</p>
                                <Link href="/user/interview">
                                    <Button>Start Your First Interview</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Role</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Level</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Difficulty</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Score</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Questions</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Verdict</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session, i) => {
                                            const verdict = getVerdictFromScore(session.totalScore);
                                            return (
                                                <motion.tr
                                                    key={session.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                                                    onClick={() => {
                                                        if (session.status === 'completed') {
                                                            router.push(`/user/interview/summary?session_id=${session.id}`);
                                                        }
                                                    }}
                                                >
                                                    <td className="p-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{session.role}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{session.mode}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeBadge(session.interviewType)}`}>
                                                            {session.interviewType}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(session.level)}`}>
                                                            {session.level}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(session.difficulty)}`}>
                                                            {session.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`font-semibold ${getScoreColor(session.totalScore)}`}>
                                                            {getScoreDisplay(session.totalScore)}/100
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-sm text-muted-foreground">
                                                        {session.questionCount}
                                                    </td>
                                                    <td className="p-3 text-sm text-muted-foreground">
                                                        {new Date(session.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge className={getVerdictBadge(verdict)}>
                                                            {verdict}
                                                        </Badge>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}