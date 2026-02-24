'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Mic,
    FileText,
    Map,
    TrendingUp,
    Target,
    Zap,
    ArrowRight,
    Clock,
    CheckCircle2,
    Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const stats = [
    { title: "Profile Strength", value: "78%", change: "+5%", changeType: "positive" as const, icon: Target },
    { title: "Interviews Completed", value: "12", change: "+3 this week", changeType: "positive" as const, icon: Mic },
    { title: "Resume Score", value: "85/100", change: "+12", changeType: "positive" as const, icon: FileText },
    { title: "Skills Mastered", value: "24", change: "+4", changeType: "positive" as const, icon: Zap },
];

const quickActions = [
    { title: "Start Mock Interview", desc: "Practice with AI interviewer", icon: Mic, path: "/user/interview" },
    { title: "Analyze Resume", desc: "Get ATS compatibility score", icon: FileText, path: "/user/resume" },
    { title: "View Roadmap", desc: "Track your career progress", icon: Map, path: "/user/roadmap" },
];

const recentActivity = [
    { title: "Completed React Interview", time: "2 hours ago", score: "8.5/10", icon: CheckCircle2 },
    { title: "Resume updated — v3", time: "5 hours ago", score: "ATS: 85%", icon: FileText },
    { title: "Finished Node.js roadmap module", time: "1 day ago", score: "+200 XP", icon: Star },
    { title: "HR Round simulation", time: "2 days ago", score: "7.8/10", icon: Mic },
];

// Chart data
const chartData = [
    { month: 'Jan', score: 40 },
    { month: 'Feb', score: 55 },
    { month: 'Mar', score: 45 },
    { month: 'Apr', score: 60 },
    { month: 'May', score: 70 },
    { month: 'Jun', score: 65 },
    { month: 'Jul', score: 75 },
    { month: 'Aug', score: 80 },
    { month: 'Sep', score: 72 },
    { month: 'Oct', score: 85 },
    { month: 'Nov', score: 78 },
    { month: 'Dec', score: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-sm text-primary">
                    Score: <span className="font-bold">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Welcome back, Bhargava 👋</h1>
                        <p className="text-muted-foreground mt-1">Here's your career progress overview</p>
                    </div>
                    <Button onClick={() => router.push('/user/interview')}>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Interview
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <stat.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === 'positive'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {quickActions.map((action, i) => (
                                    <motion.button
                                        key={action.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        onClick={() => router.push(action.path)}
                                        className="group text-left"
                                    >
                                        <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-5 hover:shadow-lg transition-all cursor-pointer hover:border-primary/20">
                                            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-3">
                                                <action.icon className="h-6 w-6 text-primary-foreground" />
                                            </div>
                                            <h3 className="font-semibold text-foreground">{action.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-foreground">Performance Trend</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Interview Scores</span>
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                    </div>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={chartData}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="hsl(var(--border))"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="month"
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value: number) => `${value}`}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                                fill="url(#scoreGradient)"
                                                animationDuration={1000}
                                                animationBegin={600}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                                    <span>Monthly performance trend</span>
                                    <span className="text-primary font-medium">↑ 120% overall growth</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
                        <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm divide-y divide-border">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <item.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">{item.time}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-primary whitespace-nowrap bg-primary/10 px-2 py-1 rounded-full">
                                        {item.score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}