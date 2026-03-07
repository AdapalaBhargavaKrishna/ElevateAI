'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import {
    Github, Linkedin, MapPin, ExternalLink, Code, Share2,
    Eye, Plus, Briefcase, GraduationCap, Sparkles,
    FolderOpen, Award, Globe, Calendar, CheckCircle,
    Pencil
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

    const initials = me?.fullName
        ? me.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
        : "?";

    const goToMyInfo = () => router.push('/user/myinfo');

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
                        <p className="text-sm text-muted-foreground mt-1">Your public developer profile</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                        </Button>
                        <Button size="sm" className="gap-1.5">
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div {...fadeUp}>
                    <Card>
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Avatar */}
                                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shrink-0">
                                    <span className="text-2xl sm:text-3xl font-semibold text-primary">{initials}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{me?.fullName || "—"}</h2>
                                            {userInfo?.currentRole && (
                                                <p className="text-base text-muted-foreground mt-0.5">{userInfo.currentRole}</p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                {userInfo?.location && (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" /> {userInfo.location}
                                                    </span>
                                                )}
                                                {userInfo?.yearsOfExp && (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Briefcase className="h-3.5 w-3.5 text-primary" /> {userInfo.yearsOfExp} yrs exp
                                                    </span>
                                                )}
                                                {userInfo?.careerGoal && (
                                                    <Badge variant="secondary" className="text-xs gap-1">
                                                        <Sparkles className="h-3 w-3 text-primary" /> {userInfo.careerGoal}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Elevate Score */}
                                        <div className="flex items-center gap-3 bg-primary/5 px-4 py-3 rounded-xl self-start shrink-0">
                                            <div className="relative h-14 w-14">
                                                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                                                    <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" strokeOpacity="0.3" />
                                                    <circle
                                                        cx="24" cy="24" r="20" fill="none"
                                                        stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"
                                                        strokeDasharray={`${((me?.elevateScore ?? 0) / 100) * 125.6} 125.6`}
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                                                    {me?.elevateScore ?? 0}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Elevate Score</p>
                                                <p className="text-xs text-muted-foreground">Your AI rating</p>
                                            </div>
                                        </div>
                                    </div>

                                    {userInfo?.bio && (
                                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{userInfo.bio}</p>
                                    )}

                                    {/* Links */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {userInfo?.github && (
                                            <a href={userInfo.github} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 text-xs">
                                                    <Github className="h-3.5 w-3.5" /> GitHub
                                                </Button>
                                            </a>
                                        )}
                                        {userInfo?.linkedin && (
                                            <a href={userInfo.linkedin} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 text-xs">
                                                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                                </Button>
                                            </a>
                                        )}
                                        {userInfo?.leetcode && (
                                            <a href={userInfo.leetcode} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 text-xs">
                                                    <Code className="h-3.5 w-3.5" /> LeetCode
                                                </Button>
                                            </a>
                                        )}
                                        {userInfo?.website && (
                                            <a href={userInfo.website} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 text-xs">
                                                    <Globe className="h-3.5 w-3.5" /> Website
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-4 h-auto p-1">
                        <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                        <TabsTrigger value="experience" className="text-xs sm:text-sm">Experience</TabsTrigger>
                        <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
                        <TabsTrigger value="certifications" className="text-xs sm:text-sm">Certs</TabsTrigger>
                    </TabsList>

                    {/* ── Overview ── */}
                    <TabsContent value="overview" className="space-y-6">

                        {/* Skills */}
                        <motion.div {...fadeUp}>
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <Code className="h-4 w-4 text-primary" /> Skills
                                            {userInfo?.skills?.length ? (
                                                <Badge variant="secondary" className="text-[10px]">{userInfo.skills.length}</Badge>
                                            ) : null}
                                        </h3>
                                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={goToMyInfo}>
                                            <Pencil className="h-3 w-3" /> Edit
                                        </Button>
                                    </div>

                                    {userInfo?.skills?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {userInfo.skills.map((s) => (
                                                <span key={s.name} className="text-xs px-2.5 py-1 rounded-full border bg-muted/30 text-foreground">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={<Code className="h-8 w-8 text-muted-foreground/40" />}
                                            message="No skills added yet"
                                            onAdd={goToMyInfo}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Education */}
                        <motion.div {...fadeUp}>
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" /> Education
                                        </h3>
                                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={goToMyInfo}>
                                            <Pencil className="h-3 w-3" /> Edit
                                        </Button>
                                    </div>

                                    {userInfo?.education?.length ? (
                                        <div className="space-y-3">
                                            {userInfo.education.map((edu) => (
                                                <div key={edu.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <GraduationCap className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{edu.degree} in {edu.field}</p>
                                                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Calendar className="h-3 w-3" /> {edu.from} – {edu.to || "Present"}
                                                            {edu.grade && <> · GPA: {edu.grade}</>}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={<GraduationCap className="h-8 w-8 text-muted-foreground/40" />}
                                            message="No education added yet"
                                            onAdd={goToMyInfo}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* ── Experience ── */}
                    <TabsContent value="experience">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-primary" /> Work Experience
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={goToMyInfo}>
                                        <Plus className="h-3 w-3" /> Add
                                    </Button>
                                </div>

                                {userInfo?.experiences?.length ? (
                                    <div className="space-y-3">
                                        {userInfo.experiences.map((exp) => (
                                            <div key={exp.id} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/10">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Briefcase className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-medium text-foreground">{exp.role}</p>
                                                        {exp.current && (
                                                            <Badge className="text-[9px] px-1.5 bg-primary/10 text-primary">Current</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{exp.company}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {exp.from} – {exp.current ? "Present" : exp.to || "—"}
                                                        {exp.location && <> · {exp.location}</>}
                                                    </p>
                                                    {exp.description && (
                                                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Briefcase className="h-8 w-8 text-muted-foreground/40" />}
                                        message="No work experience added yet"
                                        onAdd={goToMyInfo}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Projects ── */}
                    <TabsContent value="projects">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-primary" /> Projects
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={goToMyInfo}>
                                        <Plus className="h-3 w-3" /> Add
                                    </Button>
                                </div>

                                {userInfo?.projects?.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userInfo.projects.map((proj) => (
                                            <div key={proj.id} className="border rounded-lg p-4 space-y-3 bg-muted/10">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{proj.name}</p>
                                                        {proj.description && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                                                        )}
                                                    </div>
                                                    {proj.featured && (
                                                        <Badge variant="secondary" className="text-[10px] shrink-0">Featured</Badge>
                                                    )}
                                                </div>
                                                {proj.techStack && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {proj.techStack.split(",").slice(0, 4).map((t) => (
                                                            <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.trim()}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    {proj.liveUrl && (
                                                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            <ExternalLink className="h-3 w-3" /> Live
                                                        </a>
                                                    )}
                                                    {proj.repoUrl && (
                                                        <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            <Github className="h-3 w-3" /> Repo
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<FolderOpen className="h-8 w-8 text-muted-foreground/40" />}
                                        message="No projects added yet"
                                        onAdd={goToMyInfo}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Certifications ── */}
                    <TabsContent value="certifications">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                        <Award className="h-4 w-4 text-primary" /> Certifications
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={goToMyInfo}>
                                        <Plus className="h-3 w-3" /> Add
                                    </Button>
                                </div>

                                {userInfo?.certifications?.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userInfo.certifications.map((cert) => (
                                            <div key={cert.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/10">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Award className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{cert.name}</p>
                                                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{cert.year}</span>
                                                        {cert.expiry && (
                                                            <span className="text-xs text-muted-foreground">Expires {cert.expiry}</span>
                                                        )}
                                                        {cert.credentialUrl && (
                                                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                                <ExternalLink className="h-3 w-3" /> View
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0">
                                                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Verified
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Award className="h-8 w-8 text-muted-foreground/40" />}
                                        message="No certifications added yet"
                                        onAdd={goToMyInfo}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

/* ───── Empty State Component ───── */
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