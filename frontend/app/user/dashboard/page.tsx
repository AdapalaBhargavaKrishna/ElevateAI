'use client';

import React, { useState, useEffect } from 'react';
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
    Star,
    Activity,
    Award,
    BookOpen,
    BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { db, type User, type Stat, type QuickAction, type RecentActivity, type PerformanceData } from '../data/dashboard';

const iconMap: { [key: string]: any } = {
    Target: Target,
    Mic: Mic,
    FileText: FileText,
    Zap: Zap,
    Map: Map,
    CheckCircle2: CheckCircle2,
    Star: Star,
    Activity: Activity,
    Award: Award,
    BookOpen: BookOpen,
    BarChart3: BarChart3
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border-border shadow-lg">
                <CardContent className="p-3">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-sm text-primary">
                        Score: <span className="font-bold">{payload[0].value}</span>
                    </p>
                </CardContent>
            </Card>
        );
    }
    return null;
};

const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
            <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
    </div>
);

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stat[]>([]);
    const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const currentUserId = "user_1";

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const dashboardData = await db.getDashboardData(currentUserId);

                const transformedStats = dashboardData.stats.map(stat => {
                    if (stat.title === "Profile Strength") {
                        return { ...stat, title: "Elevate Score", iconName: "BarChart3" };
                    }
                    if (stat.title === "Skills Mastered") {
                        return { ...stat, title: "Roadmap Progress", iconName: "BookOpen" };
                    }
                    return stat;
                });

                setUser(dashboardData.user || null);
                setStats(transformedStats);
                setQuickActions(dashboardData.quickActions);
                setRecentActivities(dashboardData.recentActivities);
                setPerformanceData(dashboardData.performanceData);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUserId]);

    const elevateScore = stats.find(s => s.title === "Elevate Score")?.value || "0%";

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="text-destructive mb-4 text-4xl">⚠️</div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Dashboard</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">
                            Welcome back, {user?.name || "User"} 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Here's your career progress overview
                        </p>
                        {user?.careerGoal && (
                            <Badge variant="secondary" className="mt-2">
                                Goal: {user.careerGoal}
                            </Badge>
                        )}
                    </div>
                    <Button onClick={() => router.push('/user/interview')} size="lg">
                        <Mic className="h-4 w-4 mr-2" />
                        Start Interview
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => {
                        const IconComponent = iconMap[stat.iconName] || Target;
                        return (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <IconComponent className="h-5 w-5 text-primary" />
                                                </div>

                                                <div className="text-right">
                                                    <h3 className="text-xl font-bold text-foreground">{stat.value}</h3>
                                                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {quickActions.map((action, i) => {
                                    const IconComponent = iconMap[action.iconName] || Mic;
                                    return (
                                        <motion.button
                                            key={action.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                            onClick={() => router.push(action.path)}
                                            className="group text-left"
                                        >
                                            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/20">
                                                <CardContent className="p-5">
                                                    <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-3">
                                                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                                                    </div>
                                                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </CardContent>
                                            </Card>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-gray-900 dark:text-gray-100">Performance Trend</CardTitle>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your interview score progression</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Interview Scores</span>
                                                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {performanceData && performanceData.length > 0 ? (
                                            <div className="h-80 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={performanceData}
                                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid 
                                                            strokeDasharray="3 3" 
                                                            stroke="#E5E7EB" 
                                                            className="dark:stroke-gray-700"
                                                            vertical={false}
                                                        />
                                                        <XAxis 
                                                            dataKey="month" 
                                                            stroke="#9CA3AF" 
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <YAxis 
                                                            stroke="#9CA3AF" 
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickFormatter={(value: number) => `${value}`}
                                                            domain={[0, 100]}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="score"
                                                            stroke="#3B82F6"
                                                            strokeWidth={3}
                                                            fill="url(#scoreGradient)"
                                                            animationDuration={1000}
                                                            animationBegin={600}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-80 w-full flex items-center justify-center">
                                                <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
                                            </div>
                                        )}
                                        {performanceData && performanceData.length > 0 && (
                                            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    Monthly performance trend ({new Date().getFullYear()})
                                                </span>
                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                    ↑ {performanceData[performanceData.length - 1]?.score - performanceData[0]?.score}% overall growth
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
                        <Card>
                            <CardContent className="p-0 divide-y divide-border">
                                {recentActivities.map((item) => {
                                    const IconComponent = iconMap[item.iconName] || CheckCircle2;
                                    return (
                                        <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <IconComponent className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">{item.time}</span>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                                {item.score}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}