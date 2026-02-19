import { UserCog, Github, Layers, BadgeCheck, Mic, Brain, Briefcase, BarChart3, FileText, Target, GitBranch, Activity, Map, BookOpen, Clock, TrendingUp, Award, GanttChart, Share2, Link2, Palette } from "lucide-react";

export const coreFeatures = [
    {
        category: "AI Professional Profile",
        icon: UserCog,
        features: [
            { icon: UserCog, title: "Digital Career Identity", desc: "Centralized profile with photo, bio, and career goals. Multiple resume versions supported." },
            { icon: Github, title: "Profile Integration", desc: "Connect GitHub, LinkedIn, LeetCode, CodeChef for comprehensive skill analysis." },
            { icon: Layers, title: "Project Portfolio", desc: "Showcase projects with tech stack details and achievements." },
            { icon: BadgeCheck, title: "Profile Strength Scoring", desc: "AI-powered analysis of your professional profile with improvement suggestions." },
        ]
    },
    {
        category: "AI Interview Coach",
        icon: Mic,
        features: [
            { icon: Mic, title: "Real-time Mock Interviews", desc: "Speech-to-text conversion with communication and confidence analysis." },
            { icon: Brain, title: "Answer Evaluation", desc: "Quality assessment with filler word detection and improvement tips." },
            { icon: Briefcase, title: "Multiple Interview Modes", desc: "Technical, HR, and managerial interview simulations." },
            { icon: BarChart3, title: "Performance Reports", desc: "Detailed post-interview analysis with history tracking." },
        ]
    },
    {
        category: "AI Resume Analyzer",
        icon: FileText,
        features: [
            { icon: FileText, title: "ATS Compatibility", desc: "Score your resume against Applicant Tracking Systems." },
            { icon: Target, title: "Keyword Optimization", desc: "Role-specific keyword suggestions for better matches." },
            { icon: GitBranch, title: "Resume Tailoring", desc: "Create role-specific versions with AI assistance." },
            { icon: Activity, title: "Before/After Comparison", desc: "Visual improvements tracking for your resumes." },
        ]
    },
    {
        category: "Career Roadmap",
        icon: Map,
        features: [
            { icon: Map, title: "Personalized Roadmaps", desc: "Custom learning paths based on your target role." },
            { icon: Target, title: "Skill Gap Detection", desc: "Identify missing skills with AI analysis." },
            { icon: BookOpen, title: "Course Suggestions", desc: "Personalized course and certification recommendations." },
            { icon: Clock, title: "Timeline Planning", desc: "Structured learning plans with milestones." },
        ]
    },
    {
        category: "Analytics Dashboard",
        icon: TrendingUp,
        features: [
            { icon: TrendingUp, title: "Performance Tracking", desc: "Interview scores and confidence improvement over time." },
            { icon: Award, title: "Progress Metrics", desc: "Resume scores, skill growth, and achievement tracking." },
            { icon: GanttChart, title: "History Timeline", desc: "Visual representation of your improvement journey." },
            { icon: BarChart3, title: "Insights & Analytics", desc: "Data-driven insights for career growth." },
        ]
    },
    {
        category: "Professional Portfolio",
        icon: Share2,
        features: [
            { icon: Share2, title: "Shareable Profile", desc: "Public AI-generated career page for recruiters." },
            { icon: Link2, title: "Custom Links", desc: "Personalized profile URL for easy sharing." },
            { icon: Palette, title: "Project Showcase", desc: "Integrated GitHub projects and achievements." },
            { icon: BadgeCheck, title: "Optional Score Visibility", desc: "Choose to display interview scores to recruiters." },
        ]
    },
];