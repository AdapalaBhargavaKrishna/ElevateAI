"use client";

import { useCallback, type ReactNode } from "react";
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
import { Separator } from "@/components/ui/separator";

import { UserProfile } from "../data/profile";

type ProfilePreviewViewProps = {
    profile: UserProfile;
    backHref: string;
    shareUrl: string;
    backLabel?: string;
};

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Skeleton className="h-9 w-32 bg-muted rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-lg bg-muted" />
                        <Skeleton className="h-9 w-28 rounded-lg bg-muted" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                <div className="text-center space-y-4">
                    <Skeleton className="h-28 w-28 rounded-2xl mx-auto bg-muted" />
                    <Skeleton className="h-8 w-48 mx-auto bg-muted" />
                    <Skeleton className="h-4 w-64 mx-auto bg-muted" />
                    <div className="flex items-center justify-center gap-4">
                        <Skeleton className="h-4 w-32 bg-muted" />
                        <Skeleton className="h-4 w-40 bg-muted" />
                    </div>
                    <Skeleton className="h-20 w-full max-w-xl mx-auto bg-muted" />
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-8 w-20 rounded-full bg-muted" />
                        ))}
                    </div>
                    <Skeleton className="h-16 w-48 mx-auto rounded-xl bg-muted" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card/40 backdrop-blur-md border-border/50">
                        <CardContent className="p-5 space-y-3">
                            <Skeleton className="h-5 w-20 bg-muted" />
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className="h-6 w-20 rounded-full bg-muted" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-md border-border/50">
                        <CardContent className="p-5 space-y-3">
                            <Skeleton className="h-5 w-28 bg-muted" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="bg-muted/50 border-none">
                                        <CardContent className="p-3 space-y-2">
                                            <Skeleton className="h-4 w-32 bg-muted" />
                                            <Skeleton className="h-3 w-24 bg-muted" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardContent className="p-5 space-y-4">
                        <Skeleton className="h-5 w-24 bg-muted" />
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40 bg-muted" />
                                    <Skeleton className="h-3 w-32 bg-muted" />
                                    <Skeleton className="h-12 w-full bg-muted" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                    <CardContent className="p-5 space-y-4">
                        <Skeleton className="h-5 w-24 bg-muted" />
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-48 bg-muted" />
                                    <Skeleton className="h-3 w-32 bg-muted" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center opacity-80">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                {icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground dark:text-white">{message}</p>
        </div>
    );
}

export function ProfilePreviewSkeleton() {
    return <ProfileSkeleton />;
}

export default function ProfilePreviewView({ profile, backHref, shareUrl, backLabel = "Back to Profile" }: ProfilePreviewViewProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const progress = ((profile.elevateScore ?? 0) / 100) * circumference;

    const initials = profile.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

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
        <div className="min-h-screen bg-background relative selection:bg-primary/30">
            {/* Ambient Background Gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10" />

            <div className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push(backHref)} className="hover:bg-primary/10 hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> {backLabel}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" className="gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all" onClick={handleShare}>
                            <Share2 className="h-3.5 w-3.5" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative text-center rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 sm:p-12 shadow-xl overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <Image
                            src="/logo.png"
                            alt="ElevateAI"
                            width={140}
                            height={42}
                            className="mx-auto mb-8 invert dark:invert-0 drop-shadow-md hover:scale-105 transition-transform duration-500"
                        />
                        <Avatar className="h-32 w-32 rounded-3xl mx-auto mb-6 shadow-2xl overflow-hidden bg-white flex items-center justify-center border-4 border-background ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-500">
                            <img
                                src={`https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(profile.fullName)}`}
                                alt={profile.fullName}
                                className="h-full w-full object-cover rounded-3xl hover:scale-110 transition-transform duration-700"
                            />
                        </Avatar>

                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white">
                            {profile.fullName}
                        </h1>
                        <p className="text-lg font-medium text-primary mt-2 dark:text-white">
                            {profile.currentRole || "Open to opportunities"}
                            {profile.yearsOfExp ? <span className="text-muted-foreground font-normal dark:text-white"> · {profile.yearsOfExp} years experience</span> : ""}
                        </p>

                        <div className="flex items-center justify-center gap-6 mt-4 text-sm font-medium text-muted-foreground dark:text-white flex-wrap">
                            {profile.location && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                                    <MapPin className="h-4 w-4 text-primary" /> {profile.location}
                                </span>
                            )}
                            {profile.careerGoal && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                                    <Target className="h-4 w-4 text-primary" /> {profile.careerGoal}
                                </span>
                            )}
                        </div>

                        {profile.bio ? (
                            <p className="text-base text-foreground/80 mt-6 max-w-2xl mx-auto leading-relaxed dark:text-white">
                                {profile.bio}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-6 max-w-xl mx-auto italic dark:text-white">
                                Ready to make an impact.
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                            {socialLinks.map((social) => (
                                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-full gap-2 text-sm border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                                        <social.icon className="h-4 w-4" /> {social.label}
                                    </Button>
                                </a>
                            ))}
                        </div>

                        <div className="inline-flex items-center gap-4 mt-8 rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-md px-6 py-3 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 group/score">
                            <div className="relative h-14 w-14">
                                <svg className="h-14 w-14 -rotate-90 drop-shadow-md" viewBox="0 0 52 52">
                                    <circle
                                        cx="26"
                                        cy="26"
                                        r={radius}
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-muted"
                                        strokeWidth="5"
                                    />
                                    <circle
                                        cx="26"
                                        cy="26"
                                        r={radius}
                                        fill="none"
                                        className="text-primary"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - progress}
                                        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground dark:text-white group-hover/score:scale-110 transition-transform">
                                    {profile.elevateScore}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-foreground dark:text-white">Elevate Score</p>
                                <p className="text-xs font-medium text-primary dark:text-white">AI-verified readiness</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="h-full">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Code className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight dark:text-white">Core Skills</h2>
                                </div>
                                {profile.skills.length ? (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {profile.skills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="dark:text-white px-3 py-1.5 text-sm bg-background border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-colors">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<Code className="h-6 w-6 text-primary/50" />} message="No skills highlighted yet" />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="h-full">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Award className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight dark:text-white">Certifications</h2>
                                </div>
                                {profile.certifications.length ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        {profile.certifications.map((certification) => (
                                            <div key={certification.name} className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                                                <p className="text-sm font-bold text-foreground dark:text-white leading-tight">{certification.name}</p>
                                                <p className="text-xs font-medium text-muted-foreground dark:text-white mt-1">
                                                    {certification.issuer} · {certification.year}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<Award className="h-6 w-6 text-primary/50" />} message="No certifications added yet" />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                    <Card className="bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight dark:text-white">Experience</h2>
                            </div>
                            {profile.experiences.length ? (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                    {profile.experiences.map((experience, index) => (
                                        <div key={`${experience.company}-${experience.role}-${index}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2 ml-0 md:ml-0 z-10 group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all duration-300">
                                                <Briefcase className="h-4 w-4" />
                                            </div>

                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-border/50 bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                                    <h3 className="text-base font-bold text-foreground dark:text-white">{experience.role}</h3>
                                                    {experience.current && (
                                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0 h-5 text-[10px] uppercase font-bold tracking-wider">Current</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-semibold text-primary dark:text-white">{experience.company}</p>
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-white mt-2 mb-3">
                                                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                                        <Calendar className="h-3 w-3" />
                                                        {experience.from} – {experience.current ? "Present" : experience.to || "—"}
                                                    </span>
                                                    {experience.location && (
                                                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                                            <MapPin className="h-3 w-3" />
                                                            {experience.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {experience.description && (
                                                    <p className="text-sm text-foreground/80 leading-relaxed dark:text-white">{experience.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Briefcase className="h-8 w-8 text-primary/50" />} message="No work experience added yet" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ExternalLink className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight dark:text-white">Projects</h2>
                                </div>
                                {profile.projects.length ? (
                                    <div className="space-y-4">
                                        {profile.projects.map((project) => (
                                            <div key={project.name} className="p-5 rounded-2xl border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <h3 className="text-base font-bold text-foreground dark:text-white">{project.name}</h3>
                                                    <div className="flex gap-2 shrink-0">
                                                        {project.liveUrl && (
                                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="Live Preview">
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {project.repoUrl && (
                                                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="Source Code">
                                                                <Github className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {project.description && <p className="text-sm text-foreground/80 mb-4 leading-relaxed dark:text-white">{project.description}</p>}
                                                {project.techStack && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {project.techStack.split(",").map((tech) => (
                                                            <Badge key={tech} variant="outline" className="text-xs px-2 py-0.5 border-border/50 bg-background">
                                                                {tech.trim()}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<ExternalLink className="h-8 w-8 text-primary/50" />} message="No projects added yet" />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight dark:text-white">Education</h2>
                                </div>
                                {profile.education.length ? (
                                    <div className="space-y-4">
                                        {profile.education.map((education) => (
                                            <div key={`${education.institution}-${education.degree}`} className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-foreground dark:text-white leading-tight">
                                                        {education.degree} in {education.field}
                                                    </h3>
                                                    <p className="text-sm font-semibold text-primary mt-1 dark:text-white">
                                                        {education.institution}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-white mt-2">
                                                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                                            <Calendar className="h-3 w-3" />
                                                            {education.from} – {education.to || "Present"}
                                                        </span>
                                                        {education.grade && (
                                                            <span className="bg-muted/50 px-2 py-1 rounded-md">
                                                                GPA: {education.grade}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={<GraduationCap className="h-8 w-8 text-primary/50" />} message="No education added yet" />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}