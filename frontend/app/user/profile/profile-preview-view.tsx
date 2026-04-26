"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Globe,
    Github,
    Linkedin,
    MapPin,
    ExternalLink,
    Code,
    Award,
    ArrowLeft,
    Briefcase,
    GraduationCap,
    Target,
    Calendar,
    Mail,
    Share2,
    Sun,
    Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

import { UserProfile } from "../data/profile";

type ProfilePreviewViewProps = {
    profile: UserProfile;
    backHref: string;
    shareUrl: string;
    backLabel?: string;
};

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-muted/20 dark:bg-background">
            <div className="border-b border-border bg-background sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Skeleton className="h-9 w-32 bg-muted rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-lg bg-muted" />
                        <Skeleton className="h-9 w-28 rounded-lg bg-muted" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <Card className="overflow-hidden border-border bg-card shadow-sm rounded-2xl">
                    <div className="h-32 sm:h-48 w-full bg-muted border-b border-border" />
                    <CardContent className="p-6 sm:p-10 pt-0 sm:pt-0 relative">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-20 mb-6">
                            <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl border-4 border-card shadow-md bg-muted shrink-0" />
                            <div className="flex-1 pb-2 space-y-3 w-full">
                                <Skeleton className="h-8 w-64 bg-muted" />
                                <Skeleton className="h-5 w-48 bg-muted" />
                                <div className="flex gap-4 mt-2">
                                    <Skeleton className="h-4 w-32 bg-muted" />
                                    <Skeleton className="h-4 w-32 bg-muted" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-20 w-full max-w-3xl bg-muted mt-4" />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-card border-border shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <Skeleton className="h-5 w-20 bg-muted" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Skeleton key={i} className="h-6 w-20 rounded-md bg-muted" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <Skeleton className="h-5 w-28 bg-muted" />
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-md bg-muted" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-card border-border shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <Skeleton className="h-6 w-32 bg-muted" />
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg bg-muted shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-48 bg-muted" />
                                            <Skeleton className="h-4 w-32 bg-muted" />
                                            <Skeleton className="h-16 w-full bg-muted" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center opacity-80">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-1">
                {icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{message}</p>
        </div>
    );
}

export function ProfilePreviewSkeleton() {
    return <ProfileSkeleton />;
}

export default function ProfilePreviewView({ profile, backHref, shareUrl, backLabel = "Back to Profile" }: ProfilePreviewViewProps) {
    const router = useRouter();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [designVariant, setDesignVariant] = useState<'minimal' | 'dense'>('dense');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const socialLinks = [
        { icon: Github, label: "GitHub", href: profile.github },
        { icon: Linkedin, label: "LinkedIn", href: profile.linkedin },
        { icon: Globe, label: "Website", href: profile.website },
        { icon: Mail, label: "Email", href: profile.email ? `mailto:${profile.email}` : "" },
    ].filter((link) => link.href);

    const handleShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [shareUrl]);

    return (
        <div className="relative">
            {/* Design Toggle Switch */}
            <div className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-zinc-900 rounded-full shadow-2xl border border-zinc-200 dark:border-zinc-800 p-1 flex items-center gap-1">
                <Button variant={designVariant === 'dense' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDesignVariant('dense')} className="rounded-full text-xs h-8 px-4 font-semibold">Professional Dense</Button>
                <Button variant={designVariant === 'minimal' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDesignVariant('minimal')} className="rounded-full text-xs h-8 px-4 font-semibold">Minimalist</Button>
            </div>

            {designVariant === 'dense' ? (
                // DENSE PROFESSIONAL DESIGN
                <div className="min-h-screen bg-muted/20 dark:bg-background relative selection:bg-primary/30 pb-24">
                    <div className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
                        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => router.push(backHref)} className="hover:bg-muted transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-1.5" /> {backLabel}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                    className="hover:bg-muted transition-colors"
                                >
                                    {mounted ? (resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-4 w-4" />) : <div className="h-5 w-5" />}
                                </Button>
                                <Button size="sm" className="gap-1.5 shadow-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleShare}>
                                    <Share2 className="h-3.5 w-3.5" /> Share
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                        {/* Hero Section */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <Card className="overflow-hidden border-border bg-card shadow-sm rounded-xl">
                                <div className="h-40 w-full gradient-bg border-b border-border relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20">
                                        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                                    <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-white/30" />
                                                </pattern>
                                            </defs>
                                            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                                        </svg>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary border border-border">
                                            <Target className="h-4 w-4" /> Readiness Score: {profile.elevateScore}/100
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-6 sm:p-10 pt-0 sm:pt-0 relative">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-20 mb-6 z-10">
                                        <Avatar className="h-32 w-32 sm:h-40 sm:w-40 rounded-xl border-4 border-card shadow-xl glow bg-white dark:bg-slate-900 overflow-hidden shrink-0">
                                            <img src={`https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(profile.fullName)}`} alt={profile.fullName} className="h-full w-full object-cover" />
                                        </Avatar>
                                        <div className="flex-1 pb-2">
                                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.fullName}</h1>
                                            <p className="text-lg text-primary font-bold mt-1">
                                                {profile.currentRole || "Open to opportunities"}
                                                {profile.yearsOfExp ? <span className="text-muted-foreground font-normal"> • {profile.yearsOfExp} years exp</span> : ""}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground font-semibold flex-wrap">
                                                {profile.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.location}</span>}
                                                {profile.careerGoal && <span className="flex items-center gap-1.5"><Target className="h-4 w-4" /> {profile.careerGoal}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pb-2 w-full sm:w-auto">
                                            {socialLinks.map((social) => (
                                                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-md gap-2 text-sm border-border bg-background hover:bg-muted transition-colors font-bold">
                                                        <social.icon className="h-4 w-4 text-primary" /> <span className="hidden sm:inline">{social.label}</span>
                                                    </Button>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    {profile.bio && (
                                        <div className="bg-muted/30 border border-border rounded-lg p-5 mt-6">
                                            <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">About</h3>
                                            <p className="text-base text-foreground/90 max-w-4xl leading-relaxed">
                                                {profile.bio}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column (Skills & Certs) */}
                            <div className="md:col-span-1 space-y-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
                                    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                                        <div className="bg-muted/50 border-b border-border px-5 py-3 flex items-center gap-2">
                                            <Code className="h-5 w-5 text-primary" />
                                            <h2 className="text-base font-bold tracking-tight text-foreground">Skills</h2>
                                        </div>
                                        <CardContent className="p-5">
                                            {profile.skills.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold rounded-md">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState icon={<Code className="h-5 w-5 text-muted-foreground" />} message="No skills added" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                                    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                                        <div className="bg-muted/50 border-b border-border px-5 py-3 flex items-center gap-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            <h2 className="text-base font-bold tracking-tight text-foreground">Certifications</h2>
                                        </div>
                                        <CardContent className="p-5">
                                            {profile.certifications.length ? (
                                                <div className="space-y-4">
                                                    {profile.certifications.map((certification) => (
                                                        <div key={certification.name} className="flex gap-3 items-start border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                                                <Award className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-foreground leading-tight">{certification.name}</p>
                                                                <p className="text-xs font-bold text-muted-foreground mt-1">
                                                                    {certification.issuer} <span className="opacity-50 mx-1">•</span> {certification.year}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState icon={<Award className="h-5 w-5 text-muted-foreground" />} message="No certifications added" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Right Column (Experience, Projects, Education) */}
                            <div className="md:col-span-2 space-y-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                                    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                                        <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-bold tracking-tight text-foreground">Experience</h2>
                                        </div>
                                        <CardContent className="p-6">
                                            {profile.experiences.length ? (
                                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                                                    {profile.experiences.map((experience, index) => (
                                                        <div key={`${experience.company}-${experience.role}-${index}`} className="relative flex gap-6">
                                                            <div className="flex items-center justify-center w-9 h-9 rounded bg-card border-2 border-border text-primary shadow-sm shrink-0 z-10 relative mt-1">
                                                                <Briefcase className="h-4 w-4" />
                                                            </div>

                                                            <div className="flex-1 pb-2">
                                                                <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-foreground">{experience.role}</h3>
                                                                        <p className="text-base font-bold text-primary mt-0.5">{experience.company}</p>
                                                                    </div>
                                                                    {experience.current && (
                                                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-bold rounded-md">Current</Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground mt-2 mb-3 flex-wrap">
                                                                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        {experience.from} – {experience.current ? "Present" : experience.to || "—"}
                                                                    </span>
                                                                    {experience.location && (
                                                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                                                                            <MapPin className="h-3.5 w-3.5" />
                                                                            {experience.location}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {experience.description && (
                                                                    <p className="text-sm text-foreground/80 leading-relaxed mt-4 bg-muted/30 p-4 rounded-lg border border-border/50">{experience.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState icon={<Briefcase className="h-6 w-6 text-muted-foreground" />} message="No work experience added" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
                                    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                                        <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center gap-2">
                                            <ExternalLink className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-bold tracking-tight text-foreground">Projects</h2>
                                        </div>
                                        <CardContent className="p-6">
                                            {profile.projects.length ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    {profile.projects.map((project) => (
                                                        <div key={project.name} className="p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                                                                <div className="flex gap-2 shrink-0">
                                                                    {project.repoUrl && (
                                                                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
                                                                            <Github className="h-4 w-4" />
                                                                        </a>
                                                                    )}
                                                                    {project.liveUrl && (
                                                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
                                                                            <ExternalLink className="h-4 w-4" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {project.description && <p className="text-sm text-muted-foreground mb-5 flex-1 leading-relaxed">{project.description}</p>}
                                                            {project.techStack && (
                                                                <div className="flex flex-wrap gap-2 mt-auto">
                                                                    {project.techStack.split(",").map((tech) => (
                                                                        <span key={tech} className="text-xs font-bold text-foreground bg-muted px-2.5 py-1 rounded border border-border">
                                                                            {tech.trim()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState icon={<ExternalLink className="h-6 w-6 text-muted-foreground" />} message="No projects added" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                                    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                                        <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-bold tracking-tight text-foreground">Education</h2>
                                        </div>
                                        <CardContent className="p-6">
                                            {profile.education.length ? (
                                                <div className="space-y-4">
                                                    {profile.education.map((education) => (
                                                        <div key={`${education.institution}-${education.degree}`} className="flex gap-5 p-5 rounded-xl border border-border bg-muted/20">
                                                            <div className="h-14 w-14 rounded border-2 border-border bg-card flex items-center justify-center shrink-0 shadow-sm text-primary">
                                                                <GraduationCap className="h-7 w-7" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-base font-bold text-foreground leading-tight">
                                                                    {education.degree} in {education.field}
                                                                </h3>
                                                                <p className="text-sm font-bold text-primary mt-1">
                                                                    {education.institution}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground mt-3 flex-wrap">
                                                                    <span className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border border-border/50">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        {education.from} – {education.to || "Present"}
                                                                    </span>
                                                                    {education.grade && (
                                                                        <span className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border border-border/50">
                                                                            <Award className="h-3.5 w-3.5 text-primary" />
                                                                            GPA: {education.grade}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState icon={<GraduationCap className="h-6 w-6 text-muted-foreground" />} message="No education added" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // MINIMALIST DESIGN
                <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] relative selection:bg-zinc-200 dark:selection:bg-zinc-800 pb-24">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] sticky top-0 z-50">
                        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => router.push(backHref)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                                <ArrowLeft className="h-4 w-4 mr-1.5" /> {backLabel}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                >
                                    {mounted ? (resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <div className="h-4 w-4" />}
                                </Button>
                                <Button size="sm" className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-none gap-1.5 rounded-lg" onClick={handleShare}>
                                    <Share2 className="h-3.5 w-3.5" /> Share
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                        {/* Hero Bento Box */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <Avatar className="h-24 w-24 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white overflow-hidden shrink-0">
                                            <img src={`https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(profile.fullName)}`} alt={profile.fullName} className="h-full w-full object-cover" />
                                        </Avatar>
                                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-transparent rounded-md font-medium text-xs">
                                            Score: {profile.elevateScore}/100
                                        </Badge>
                                    </div>

                                    <div>
                                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{profile.fullName}</h1>
                                        <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
                                            {profile.currentRole || "Open to opportunities"}
                                            {profile.yearsOfExp ? ` • ${profile.yearsOfExp} years exp` : ""}
                                        </p>
                                        <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium flex-wrap">
                                            {profile.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.location}</span>}
                                            {profile.careerGoal && <span className="flex items-center gap-1.5"><Target className="h-4 w-4" /> {profile.careerGoal}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-1 flex flex-col gap-6">
                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex-1 flex flex-col">
                                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider">About</h2>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                                            {profile.bio || "Ready to make an impact."}
                                        </p>
                                    </div>

                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider">Connect</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {socialLinks.map((social) => (
                                                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg gap-2 text-sm border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                        <social.icon className="h-4 w-4" /> <span className="hidden sm:inline">{social.label}</span>
                                                    </Button>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column (Skills & Certs) */}
                            <div className="md:col-span-1 space-y-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full">
                                        <div className="flex items-center gap-2 mb-4">
                                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Skills</h2>
                                        </div>
                                        {profile.skills.length ? (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {profile.skills.map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-[13px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium rounded-md">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState icon={<Code className="h-5 w-5 text-zinc-400" />} message="No skills added" />
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full">
                                        <div className="flex items-center gap-2 mb-4">
                                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Certifications</h2>
                                        </div>
                                        {profile.certifications.length ? (
                                            <div className="space-y-3 pt-1">
                                                {profile.certifications.map((certification) => (
                                                    <div key={certification.name} className="flex flex-col">
                                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{certification.name}</p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                            {certification.issuer} · {certification.year}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState icon={<Award className="h-5 w-5 text-zinc-400" />} message="No certifications added" />
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column (Experience, Projects, Education) */}
                            <div className="md:col-span-2 space-y-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
                                        <div className="flex items-center gap-2 mb-6">
                                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Experience</h2>
                                        </div>
                                        {profile.experiences.length ? (
                                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
                                                {profile.experiences.map((experience, index) => (
                                                    <div key={`${experience.company}-${experience.role}-${index}`} className="relative flex gap-6">
                                                        <div className="w-[11px] h-[11px] rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0 z-10 relative mt-1.5" />
                                                        <div className="flex-1 pb-2">
                                                            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                                                                <div>
                                                                    <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{experience.role}</h3>
                                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{experience.company}</p>
                                                                </div>
                                                                {experience.current && (
                                                                    <Badge className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-none rounded-md text-xs font-medium">Current</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500 mt-1 mb-3 flex-wrap">
                                                                <span className="flex items-center gap-1">
                                                                    {experience.from} – {experience.current ? "Present" : experience.to || "—"}
                                                                </span>
                                                                {experience.location && (
                                                                    <span className="flex items-center gap-1">
                                                                        · {experience.location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {experience.description && (
                                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{experience.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState icon={<Briefcase className="h-5 w-5 text-zinc-400" />} message="No work experience added" />
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
                                        <div className="flex items-center gap-2 mb-6">
                                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Projects</h2>
                                        </div>
                                        {profile.projects.length ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {profile.projects.map((project) => (
                                                    <div key={project.name} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col h-full">
                                                        <div className="flex justify-between items-start gap-4 mb-2">
                                                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.name}</h3>
                                                            <div className="flex gap-2 shrink-0">
                                                                {project.repoUrl && (
                                                                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                                                        <Github className="h-4 w-4" />
                                                                    </a>
                                                                )}
                                                                {project.liveUrl && (
                                                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {project.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-1">{project.description}</p>}
                                                        {project.techStack && (
                                                            <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                                                {project.techStack.split(",").map((tech) => (
                                                                    <span key={tech} className="text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md">
                                                                        {tech.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState icon={<ExternalLink className="h-5 w-5 text-zinc-400" />} message="No projects added" />
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                                    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
                                        <div className="flex items-center gap-2 mb-6">
                                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Education</h2>
                                        </div>
                                        {profile.education.length ? (
                                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
                                                {profile.education.map((education, index) => (
                                                    <div key={`${education.institution}-${education.degree}-${index}`} className="relative flex gap-6">
                                                        <div className="w-[11px] h-[11px] rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0 z-10 relative mt-1.5" />
                                                        <div className="flex-1 pb-2">
                                                            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                                                                {education.degree} in {education.field}
                                                            </h3>
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                                                {education.institution}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2 flex-wrap">
                                                                <span>
                                                                    {education.from} – {education.to || "Present"}
                                                                </span>
                                                                {education.grade && (
                                                                    <span>· GPA: {education.grade}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState icon={<GraduationCap className="h-5 w-5 text-zinc-400" />} message="No education added" />
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}