// Mock Database - Simulates database operations
// In production, this would be replaced with actual API calls to your backend

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinDate: string;
    careerGoal?: string;
    currentRole?: string;
    yearsOfExp?: string;
    skills?: string[];
    location?: string;
    bio?: string;
}

export interface Stat {
    id: string;
    userId: string;
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    iconName: string;
}

export interface QuickAction {
    id: string;
    title: string;
    desc: string;
    iconName: string;
    path: string;
}

export interface RecentActivity {
    id: string;
    userId: string;
    title: string;
    time: string;
    score: string;
    iconName: string;
    timestamp: Date;
}

export interface PerformanceData {
    id: string;
    userId: string;
    month: string;
    score: number;
    year: number;
}

export interface InterviewSession {
    id: string;
    userId: string;
    type: string;
    score: number;
    duration: number;
    completedAt: Date;
}

// Mock Database Collections
const users: User[] = [
    {
        id: "user_1",
        name: "Bhargava",
        email: "bhargava@example.com",
        avatar: "/avatars/bhargava.jpg",
        joinDate: "2024-01-15",
        careerGoal: "Full-Stack Developer",
        currentRole: "Software Engineer",
        yearsOfExp: "2-4",
        skills: ["React", "Node.js", "TypeScript", "Python"],
        location: "Hyderabad, India",
        bio: "Passionate full-stack developer focused on building scalable applications"
    }
];

const stats: Stat[] = [
    { id: "stat_1", userId: "user_1", title: "Profile Strength", value: "78%", change: "+5%", changeType: "positive", iconName: "Target" },
    { id: "stat_2", userId: "user_1", title: "Interviews Completed", value: "12", change: "+3 this week", changeType: "positive", iconName: "Mic" },
    { id: "stat_3", userId: "user_1", title: "Resume Score", value: "85/100", change: "+12", changeType: "positive", iconName: "FileText" },
    { id: "stat_4", userId: "user_1", title: "Skills Mastered", value: "24", change: "+4", changeType: "positive", iconName: "Zap" },
];

const quickActions: QuickAction[] = [
    { id: "action_1", title: "Start Mock Interview", desc: "Practice with AI interviewer", iconName: "Mic", path: "/user/interview" },
    { id: "action_2", title: "Analyze Resume", desc: "Get ATS compatibility score", iconName: "FileText", path: "/user/resume" },
    { id: "action_3", title: "View Roadmap", desc: "Track your career progress", iconName: "Map", path: "/user/roadmap" },
];

const recentActivities: RecentActivity[] = [
    { 
        id: "activity_1", 
        userId: "user_1", 
        title: "Completed React Interview", 
        time: "2 hours ago", 
        score: "8.5/10", 
        iconName: "CheckCircle2",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    { 
        id: "activity_2", 
        userId: "user_1", 
        title: "Resume updated — v3", 
        time: "5 hours ago", 
        score: "ATS: 85%", 
        iconName: "FileText",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    { 
        id: "activity_3", 
        userId: "user_1", 
        title: "Finished Node.js roadmap module", 
        time: "1 day ago", 
        score: "+200 XP", 
        iconName: "Star",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    { 
        id: "activity_4", 
        userId: "user_1", 
        title: "HR Round simulation", 
        time: "2 days ago", 
        score: "7.8/10", 
        iconName: "Mic",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
];

const performanceData: PerformanceData[] = [
    { id: "perf_1", userId: "user_1", month: "Jan", score: 40, year: 2025 },
    { id: "perf_2", userId: "user_1", month: "Feb", score: 55, year: 2025 },
    { id: "perf_3", userId: "user_1", month: "Mar", score: 45, year: 2025 },
    { id: "perf_4", userId: "user_1", month: "Apr", score: 60, year: 2025 },
    { id: "perf_5", userId: "user_1", month: "May", score: 70, year: 2025 },
    { id: "perf_6", userId: "user_1", month: "Jun", score: 65, year: 2025 },
    { id: "perf_7", userId: "user_1", month: "Jul", score: 75, year: 2025 },
    { id: "perf_8", userId: "user_1", month: "Aug", score: 80, year: 2025 },
    { id: "perf_9", userId: "user_1", month: "Sep", score: 72, year: 2025 },
    { id: "perf_10", userId: "user_1", month: "Oct", score: 85, year: 2025 },
    { id: "perf_11", userId: "user_1", month: "Nov", score: 78, year: 2025 },
    { id: "perf_12", userId: "user_1", month: "Dec", score: 88, year: 2025 },
];

const interviewSessions: InterviewSession[] = [
    {
        id: "interview_1",
        userId: "user_1",
        type: "Technical",
        score: 85,
        duration: 45,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: "interview_2",
        userId: "user_1",
        type: "HR",
        score: 78,
        duration: 30,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
];

// Mock Database Functions (Simulating async database operations)
export const db = {
    // User operations
    getUser: async (userId: string): Promise<User | undefined> => {
        await simulateDelay();
        return users.find(u => u.id === userId);
    },
    
    updateUser: async (userId: string, data: Partial<User>): Promise<User | undefined> => {
        await simulateDelay();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            return users[userIndex];
        }
        return undefined;
    },

    // Stats operations
    getStats: async (userId: string): Promise<Stat[]> => {
        await simulateDelay();
        return stats.filter(s => s.userId === userId);
    },

    // Quick Actions operations
    getQuickActions: async (): Promise<QuickAction[]> => {
        await simulateDelay();
        return quickActions;
    },

    // Recent Activities operations
    getRecentActivities: async (userId: string, limit: number = 10): Promise<RecentActivity[]> => {
        await simulateDelay();
        return recentActivities
            .filter(a => a.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    },

    addRecentActivity: async (activity: Omit<RecentActivity, 'id' | 'timestamp'>): Promise<RecentActivity> => {
        await simulateDelay();
        const newActivity: RecentActivity = {
            ...activity,
            id: `activity_${Date.now()}`,
            timestamp: new Date(),
        };
        recentActivities.push(newActivity);
        return newActivity;
    },

    // Performance Data operations
    getPerformanceData: async (userId: string, year?: number): Promise<PerformanceData[]> => {
        await simulateDelay();
        let data = performanceData.filter(p => p.userId === userId);
        if (year) {
            data = data.filter(p => p.year === year);
        }
        return data.sort((a, b) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return months.indexOf(a.month) - months.indexOf(b.month);
        });
    },

    // Interview Sessions operations
    getInterviewSessions: async (userId: string, limit: number = 5): Promise<InterviewSession[]> => {
        await simulateDelay();
        return interviewSessions
            .filter(i => i.userId === userId)
            .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
            .slice(0, limit);
    },

    addInterviewSession: async (session: Omit<InterviewSession, 'id'>): Promise<InterviewSession> => {
        await simulateDelay();
        const newSession: InterviewSession = {
            ...session,
            id: `interview_${Date.now()}`,
        };
        interviewSessions.push(newSession);
        
        // Update stats
        const userStats = stats.find(s => s.userId === session.userId && s.title === "Interviews Completed");
        if (userStats) {
            const currentCount = parseInt(userStats.value);
            userStats.value = (currentCount + 1).toString();
            userStats.change = `+1 this week`;
        }
        
        return newSession;
    },

    // Dashboard aggregated data
    getDashboardData: async (userId: string) => {
        await simulateDelay(800); // Simulate loading time
        const [user, stats, quickActions, recentActivities, performanceData, interviewSessions] = await Promise.all([
            db.getUser(userId),
            db.getStats(userId),
            db.getQuickActions(),
            db.getRecentActivities(userId, 5),
            db.getPerformanceData(userId, new Date().getFullYear()),
            db.getInterviewSessions(userId, 3)
        ]);
        
        return {
            user,
            stats,
            quickActions,
            recentActivities,
            performanceData,
            interviewSessions
        };
    }
};

// Helper function to simulate network delay
const simulateDelay = (ms: number = 500) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Export types and mock data for testing
export const mockData = {
    users,
    stats,
    quickActions,
    recentActivities,
    performanceData,
    interviewSessions
};