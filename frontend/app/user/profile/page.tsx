'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Github, Linkedin, MapPin, ExternalLink, Code, Share2,
    Eye, Plus, Briefcase, GraduationCap, Sparkles,
    FolderOpen, Award, Globe, Calendar, CheckCircle,
    Pencil, Mail, Phone, Trophy, Users, Zap, BookOpen
} from "lucide-react";

interface UserInfo {
    phone?: string;
    location?: string;
    bio?: string;
    careerGoal?: string;
    currentRole?: string;
    yearsOfExp?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    leetcode?: string;
    skills: { name: string }[];
    experiences: {
        id: string; company: string; role: string;
        from: string; to?: string; location?: string;
        description?: string; current: boolean;
    }[];
    education: {
        id: string; institution: string; degree: string;
        field: string; from: string; to?: string; grade?: string;
    }[];
    projects: {
        id: string; name: string; description?: string;
        techStack?: string; liveUrl?: string; repoUrl?: string; featured: boolean;
    }[];
    certifications: {
        id: string; name: string; issuer: string;
        year: string; credentialUrl?: string; expiry?: string;
    }[];
}

interface Me {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    elevateScore: number;
}

const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35 }
};

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [me, setMe] = useState<Me | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, infoRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/user-info'),
                ]);
                setMe(meRes.data.user);
                setUserInfo(infoRes.data.userInfo ?? null);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const goToMyInfo = () => router.push('/user/myinfo');
    const handlePreview = () => router.push('/preview');
    const handleShare = async () => {
        if (!me?.id) return;
        try {
            await navigator.clipboard.writeText(`https://elevateai-career.vercel.app/profile/${me.id}`);
            toast.success('Profile link copied to clipboard.');
        } catch (err) {
            console.error("Copy profile link failed:", err);
            toast.error('Failed to copy profile link. Please try again.');
        }
    };

    const skillsCount = userInfo?.skills?.length ?? 0;
    const experienceCount = userInfo?.experiences?.length ?? 0;
    const projectsCount = userInfo?.projects?.length ?? 0;
    const certificationsCount = userInfo?.certifications?.length ?? 0;
    const educationCount = userInfo?.education?.length ?? 0;

    const sectionsDone = [
        Boolean(userInfo?.currentRole),
        Boolean(userInfo?.location),
        Boolean(userInfo?.bio),
        skillsCount > 0,
        experienceCount > 0,
        projectsCount > 0,
        educationCount > 0,
        certificationsCount > 0,
    ].filter(Boolean).length;
    const profileCompletion = Math.round((sectionsDone / 8) * 100);

    const linksCount = [
        userInfo?.github,
        userInfo?.linkedin,
        userInfo?.leetcode,
        userInfo?.website,
    ].filter(Boolean).length;

    const socialLinks = [
        { icon: Github, label: "GitHub", href: userInfo?.github },
        { icon: Linkedin, label: "LinkedIn", href: userInfo?.linkedin },
        { icon: Code, label: "LeetCode", href: userInfo?.leetcode },
        { icon: Globe, label: "Website", href: userInfo?.website },
    ].filter((link) => Boolean(link.href));

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

                {/* Header with actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">My Profile</h1>
                        <p className="text-sm text-muted-foreground mt-1">Your complete developer identity — portfolio, skills, and AI-powered insights</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePreview}>
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                        </Button>
                        <Button size="sm" className="gap-1.5 shadow-sm" onClick={handleShare}>
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </div>

                {/* Completion Banner */}
                <motion.div {...fadeUp}>
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" /> Profile Strength
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Complete more sections to improve discoverability and get better AI recommendations.
                                    </p>
                                    <div className="mt-3">
                                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${profileCompletion}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{profileCompletion}% complete</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="text-xs">{skillsCount} skills</Badge>
                                    <Badge variant="secondary" className="text-xs">{projectsCount} projects</Badge>
                                    <Badge variant="secondary" className="text-xs">{experienceCount} experiences</Badge>
                                    <Button size="sm" className="gap-1.5" onClick={goToMyInfo}>
                                        <Pencil className="h-3.5 w-3.5" /> Complete Profile
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Profile Card - Dense but clean */}
                <motion.div {...fadeUp}>
                    <Card className="shadow-sm overflow-hidden">
                        <CardContent className="p-6 sm:p-7">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Avatar + Quick Links Sidebar */}
                                <div className="lg:w-64 flex flex-col items-center lg:items-start gap-4">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-full ring-4 ring-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                                            <img
                                                src={`https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(me?.fullName || "User")}`}
                                                alt={me?.fullName || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    
                                    {/* Social Links Compact */}
                                    {socialLinks.length > 0 && (
                                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                            {socialLinks.map((social) => (
                                                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="group">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-full hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                                    >
                                                        <social.icon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Main Info Section */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-bold tracking-tight">{me?.fullName || "—"}</h2>
                                            {userInfo?.currentRole && (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {userInfo.currentRole}
                                                    </Badge>
                                                    {userInfo?.yearsOfExp && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Briefcase className="h-3 w-3" /> {userInfo.yearsOfExp} yrs
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                {userInfo?.location && (
                                                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {userInfo.location}</span>
                                                )}
                                                <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {me?.email}</span>
                                                {userInfo?.phone && (
                                                    <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {userInfo.phone}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Elevate Score - Compact */}
                                        <div className="flex items-center gap-3 bg-gradient-to-br from-primary/5 to-primary/10 px-4 py-2.5 rounded-xl shrink-0">
                                            <div className="relative h-12 w-12">
                                                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                                                    <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" strokeOpacity="0.3" />
                                                    <circle
                                                        cx="24" cy="24" r="20" fill="none"
                                                        stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
                                                        strokeDasharray={`${((me?.elevateScore ?? 0) / 100) * 125.6} 125.6`}
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-foreground">
                                                    {me?.elevateScore ?? 0}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-foreground">Elevate Score</p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                    <Trophy className="h-2.5 w-2.5 text-primary" /> AI Rating
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {userInfo?.bio && (
                                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed border-l-2 border-primary/30 pl-3">{userInfo.bio}</p>
                                    )}
                                    {!userInfo?.bio && (
                                        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/20 p-3">
                                            <p className="text-xs text-muted-foreground">Add a bio to share your professional story and career aspirations.</p>
                                        </div>
                                    )}

                                    {userInfo?.careerGoal && (
                                        <div className="mt-4 flex items-center gap-2 text-xs bg-secondary/30 rounded-full px-3 py-1.5 w-fit">
                                            <Zap className="h-3 w-3 text-primary" />
                                            <span className="text-muted-foreground">Career Goal:</span>
                                            <span className="font-medium text-foreground">{userInfo.careerGoal}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs - Clean */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted/40 p-1 w-full justify-start gap-1 rounded-lg h-auto">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm px-4 py-2 rounded-md">
                            <BookOpen className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="experience" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm px-4 py-2 rounded-md">
                            <Briefcase className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> Experience
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm px-4 py-2 rounded-md">
                            <FolderOpen className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> Projects
                        </TabsTrigger>
                        <TabsTrigger value="certifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm px-4 py-2 rounded-md">
                            <Award className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> Certifications
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-2">
                        {/* Skills Section */}
                        <motion.div {...fadeUp}>
                            <Card className="shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Code className="h-4 w-4 text-primary" />
                                            </div>
                                            <h3 className="text-base font-semibold">Skills & Technologies</h3>
                                            {skillsCount > 0 && <Badge variant="secondary" className="text-[10px]">{skillsCount}</Badge>}
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={goToMyInfo}>
                                            <Pencil className="h-3 w-3" /> Edit
                                        </Button>
                                    </div>

                                    {skillsCount > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {userInfo?.skills.map((s) => (
                                                <span key={s.name} className="text-xs px-3 py-1.5 rounded-full border bg-muted/30 text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={<Code className="h-8 w-8 text-muted-foreground/40" />} message="No skills added" onAdd={goToMyInfo} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Education Section */}
                        <motion.div {...fadeUp}>
                            <Card className="shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <GraduationCap className="h-4 w-4 text-primary" />
                                            </div>
                                            <h3 className="text-base font-semibold">Education</h3>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={goToMyInfo}>
                                            <Pencil className="h-3 w-3" /> Edit
                                        </Button>
                                    </div>

                                    {educationCount > 0 ? (
                                        <div className="space-y-3">
                                            {userInfo?.education.map((edu) => (
                                                <div key={edu.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <GraduationCap className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{edu.degree} in {edu.field}</p>
                                                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{edu.from} – {edu.to || "Present"}</span>
                                                            {edu.grade && <Badge variant="outline" className="text-[10px]">{edu.grade}</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={<GraduationCap className="h-8 w-8 text-muted-foreground/40" />} message="No education added" onAdd={goToMyInfo} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Experience Tab */}
                    <TabsContent value="experience" className="mt-2">
                        <Card className="shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold">Work History</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={goToMyInfo}>
                                        <Plus className="h-3 w-3" /> Add
                                    </Button>
                                </div>

                                {experienceCount > 0 ? (
                                    <div className="space-y-4">
                                        {userInfo?.experiences.map((exp) => (
                                            <div key={exp.id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-primary/20 ml-3">
                                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background"></div>
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold">{exp.role}</p>
                                                        <p className="text-xs text-muted-foreground">{exp.company}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{exp.from} – {exp.current ? "Present" : exp.to || "—"}</span>
                                                            {exp.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {exp.location}</span>}
                                                        </div>
                                                        {exp.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                                                    </div>
                                                    {exp.current && <Badge className="text-[9px] bg-primary/10 text-primary">Current</Badge>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<Briefcase className="h-8 w-8 text-muted-foreground/40" />} message="No work experience added" onAdd={goToMyInfo} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Projects Tab */}
                    <TabsContent value="projects" className="mt-2">
                        <Card className="shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FolderOpen className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold">Portfolio Projects</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={goToMyInfo}>
                                        <Plus className="h-3 w-3" /> Add
                                    </Button>
                                </div>

                                {projectsCount > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userInfo?.projects.map((proj) => (
                                            <div key={proj.id} className="border rounded-lg p-4 space-y-3 bg-muted/5 hover:bg-muted/10 transition-all hover:shadow-sm">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold flex items-center gap-2">
                                                            {proj.name}
                                                            {proj.featured && <Sparkles className="h-3 w-3 text-primary" />}
                                                        </p>
                                                        {proj.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>}
                                                    </div>
                                                    {proj.featured && <Badge variant="secondary" className="text-[9px]">Featured</Badge>}
                                                </div>
                                                {proj.techStack && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {proj.techStack.split(",").slice(0, 4).map((t) => (
                                                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t.trim()}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-3 pt-1">
                                                    {proj.liveUrl && (
                                                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            <ExternalLink className="h-3 w-3" /> Live Demo
                                                        </a>
                                                    )}
                                                    {proj.repoUrl && (
                                                        <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            <Github className="h-3 w-3" /> Source
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<FolderOpen className="h-8 w-8 text-muted-foreground/40" />} message="No projects added" onAdd={goToMyInfo} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Certifications Tab */}
                    <TabsContent value="certifications" className="mt-2">
                        <Card className="shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Award className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold">Professional Certifications</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={goToMyInfo}>
                                        <Plus className="h-3 w-3" /> Add
                                    </Button>
                                </div>

                                {certificationsCount > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userInfo?.certifications.map((cert) => (
                                            <div key={cert.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/5 hover:bg-muted/10 transition-all">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Award className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold">{cert.name}</p>
                                                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <Badge variant="outline" className="text-[9px]">{cert.year}</Badge>
                                                        {cert.expiry && <span className="text-[10px] text-muted-foreground">Expires {cert.expiry}</span>}
                                                        {cert.credentialUrl && (
                                                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                                                                <ExternalLink className="h-2.5 w-2.5" /> Verify
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<Award className="h-8 w-8 text-muted-foreground/40" />} message="No certifications added" onAdd={goToMyInfo} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Professional Stat Card Component
function StatCard({ icon: Icon, label, value, subtext, color }: { 
    icon: any; label: string; value: number; subtext: string; color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
        green: "from-green-500/10 to-green-500/5 border-green-500/20",
        purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
        orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
    };
    
    const iconColors = {
        blue: "text-blue-500",
        green: "text-green-500",
        purple: "text-purple-500",
        orange: "text-orange-500",
    };

    return (
        <Card className={`bg-gradient-to-br ${colorClasses[color]} border shadow-sm hover:shadow-md transition-all`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{subtext}</p>
                    </div>
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br from-current/20 to-current/5 flex items-center justify-center ${iconColors[color]}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Empty State Component
function EmptyState({ icon, message, onAdd }: { icon: React.ReactNode; message: string; onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            {icon}
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onAdd}>
                <Plus className="h-3.5 w-3.5" /> Add in My Info
            </Button>
        </div>
    );
}
