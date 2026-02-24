'use client';

import React from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Mic, FileText, Zap, Target, Calendar, Award, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface Stat {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative";
    icon: React.ElementType;
}

interface WeeklyData {
    day: string;
    interviews: number;
    score: number;
}

interface SkillGrowth {
    skill: string;
    before: number;
    after: number;
}

const stats: Stat[] = [
    { title: "Avg Interview Score", value: "8.1/10", change: "+0.6", changeType: "positive", icon: Mic },
    { title: "Resume Score", value: "85/100", change: "+12", changeType: "positive", icon: FileText },
    { title: "Skills Growth", value: "24", change: "+4 this month", changeType: "positive", icon: Zap },
    { title: "Roadmap Progress", value: "38%", change: "+8%", changeType: "positive", icon: Target },
];

const weeklyData: WeeklyData[] = [
    { day: "Mon", interviews: 2, score: 7.5 },
    { day: "Tue", interviews: 1, score: 8.0 },
    { day: "Wed", interviews: 3, score: 8.5 },
    { day: "Thu", interviews: 0, score: 0 },
    { day: "Fri", interviews: 2, score: 9.0 },
    { day: "Sat", interviews: 1, score: 7.8 },
    { day: "Sun", interviews: 0, score: 0 },
];

const skillGrowth: SkillGrowth[] = [
    { skill: "React", before: 70, after: 90 },
    { skill: "TypeScript", before: 60, after: 85 },
    { skill: "Node.js", before: 50, after: 78 },
    { skill: "System Design", before: 30, after: 60 },
    { skill: "SQL", before: 55, after: 75 },
    { skill: "Communication", before: 65, after: 82 },
    { skill: "Python", before: 45, after: 68 },
    { skill: "Docker", before: 25, after: 55 },
];

const monthlyData = [
    { month: "Jan", score: 6.5 },
    { month: "Feb", score: 7.0 },
    { month: "Mar", score: 7.2 },
    { month: "Apr", score: 7.8 },
    { month: "May", score: 7.5 },
    { month: "Jun", score: 8.0 },
    { month: "Jul", score: 8.2 },
    { month: "Aug", score: 7.8 },
    { month: "Sep", score: 8.5 },
    { month: "Oct", score: 8.1 },
    { month: "Nov", score: 8.8 },
    { month: "Dec", score: 9.0 },
];

const achievements = [
    { title: "10 Interviews Completed", date: "Feb 2026", icon: Mic },
    { title: "Resume Score 85+", date: "Jan 2026", icon: FileText },
    { title: "5 Skills Mastered", date: "Dec 2025", icon: Zap },
    { title: "50% Roadmap Complete", date: "Feb 2026", icon: Target },
];

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

export default function AnalyticsPage() {
    const totalInterviews = weeklyData.reduce((acc, day) => acc + day.interviews, 0);
    const avgWeeklyScore = weeklyData.filter(d => d.score > 0).reduce((acc, d) => acc + d.score, 0) /
        weeklyData.filter(d => d.score > 0).length;

    const StatCard = ({ stat, index }: { stat: Stat; index: number }) => {
        const Icon = stat.icon;
        return (
            <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
            >
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <Badge
                                variant={stat.changeType === "positive" ? "default" : "destructive"}
                                className="text-xs"
                            >
                                {stat.change}
                            </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{stat.value}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Performance Analytics</h1>
                            <p className="text-sm text-muted-foreground mt-1">Track your career growth and improvements</p>
                        </div>
                        <div className="flex gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span className="hidden sm:inline">Last 30 Days</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Change time period</p>
                                </TooltipContent>
                            </Tooltip>
                            <Button size="sm" className="gap-1.5">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Generate Report</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <StatCard key={stat.title} stat={stat} index={i} />
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Trend */}
                        <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Interview Score Trend
                                    </CardTitle>
                                    <CardDescription>Last 12 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48 flex items-end gap-1.5">
                                        {monthlyData.map((item, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${(item.score / 10) * 100}%` }}
                                                            transition={{ delay: 0.3 + i * 0.03, duration: 0.4 }}
                                                            className="w-full bg-primary rounded-t-md cursor-pointer hover:bg-primary/80"
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{item.month}: {item.score}/10</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {item.month}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex justify-between">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Average</p>
                                            <p className="text-sm font-semibold text-foreground">8.1</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Peak</p>
                                            <p className="text-sm font-semibold text-foreground">9.0</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Growth</p>
                                            <p className="text-sm font-semibold text-green-500">+38%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Weekly Activity */}
                        <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.25 }}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        This Week's Activity
                                    </CardTitle>
                                    <CardDescription>{totalInterviews} total interviews</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {weeklyData.map((d) => (
                                            <div key={d.day} className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-muted-foreground w-8">{d.day}</span>
                                                <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden relative group">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: d.interviews ? `${(d.score / 10) * 100}%` : "0%" }}
                                                        transition={{ delay: 0.4, duration: 0.4 }}
                                                        className={`h-full rounded-full ${d.score >= 8.5 ? 'bg-green-500' :
                                                            d.score >= 7 ? 'bg-primary' : 'bg-yellow-500'
                                                            }`}
                                                    />
                                                    {d.interviews > 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[8px] font-medium text-white">
                                                                {d.score}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground w-16 text-right">
                                                    {d.interviews > 0 ? `${d.interviews} int` : "—"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Weekly Average</span>
                                        <span className="font-semibold text-foreground">
                                            {avgWeeklyScore.toFixed(1)} / 10
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Skill Growth */}
                    <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    Skill Growth Over Time
                                </CardTitle>
                                <CardDescription>Last 6 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                                    {skillGrowth.map((s) => (
                                        <div key={s.skill} className="text-center space-y-2 group">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative h-16 w-16 mx-auto cursor-help">
                                                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
                                                            <circle
                                                                cx="40"
                                                                cy="40"
                                                                r="32"
                                                                fill="none"
                                                                stroke="hsl(var(--muted))"
                                                                strokeWidth="4"
                                                                strokeOpacity="0.3"
                                                            />
                                                            <motion.circle
                                                                cx="40"
                                                                cy="40"
                                                                r="32"
                                                                fill="none"
                                                                stroke="hsl(var(--primary))"
                                                                strokeWidth="4"
                                                                strokeLinecap="round"
                                                                initial={{ strokeDasharray: "0 201" }}
                                                                animate={{ strokeDasharray: `${s.after * 2.01} 201` }}
                                                                transition={{ delay: 0.4, duration: 0.6 }}
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                                                            {s.after}%
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{s.skill}: {s.before}% → {s.after}%</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <p className="text-xs font-medium text-foreground">{s.skill}</p>
                                            <Badge variant="default" className="text-[8px] px-1 py-0">
                                                +{((s.after - s.before) / s.before * 100).toFixed(0)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </TooltipProvider>
    );
}