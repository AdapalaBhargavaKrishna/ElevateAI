"use client";

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Skeleton className="h-9 w-32 bg-gray-200 dark:bg-gray-800" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-md bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-9 w-28 bg-gray-200 dark:bg-gray-800" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="text-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-2xl mx-auto bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-8 w-48 mx-auto bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-4 w-64 mx-auto bg-gray-200 dark:bg-gray-800" />
                    <div className="flex items-center justify-center gap-4">
                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-4 w-40 bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <Skeleton className="h-20 w-full max-w-xl mx-auto bg-gray-200 dark:bg-gray-800" />
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-800" />
                        ))}
                    </div>
                    <Skeleton className="h-14 w-36 mx-auto rounded-xl bg-gray-200 dark:bg-gray-800" />
                </div>

                <Card className="border-gray-200 dark:border-gray-800">
                    <CardContent className="p-5 space-y-3">
                        <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-800" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800">
                    <CardContent className="p-5 space-y-4">
                        <Skeleton className="h-5 w-24 bg-gray-200 dark:bg-gray-800" />
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-800" />
                                    <Skeleton className="h-3 w-40 bg-gray-200 dark:bg-gray-800" />
                                    <Skeleton className="h-3 w-48 bg-gray-200 dark:bg-gray-800" />
                                    <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-800" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <Card key={i} className="border-gray-200 dark:border-gray-800">
                                <CardContent className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-800" />
                                    <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((j) => (
                                            <Skeleton key={j} className="h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-4 w-10 bg-gray-200 dark:bg-gray-800" />
                                        <Skeleton className="h-4 w-10 bg-gray-200 dark:bg-gray-800" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <Card className="border-gray-200 dark:border-gray-800">
                    <CardContent className="p-5 space-y-3">
                        <Skeleton className="h-5 w-24 bg-gray-200 dark:bg-gray-800" />
                        <div className="flex gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-800" />
                                <Skeleton className="h-3 w-40 bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800">
                    <CardContent className="p-5 space-y-3">
                        <Skeleton className="h-5 w-28 bg-gray-200 dark:bg-gray-800" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="border-gray-200 dark:border-gray-800">
                                    <CardContent className="p-3 space-y-2">
                                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-800" />
                                        <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            {icon}
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}

export function ProfilePreviewSkeleton() {
    return <ProfileSkeleton />;
}

export default function ProfilePreviewView({ profile, backHref, shareUrl, backLabel = "Back to Profile" }: ProfilePreviewViewProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progress = ((profile.elevateScore ?? 0) / 100) * circumference;

    const initials = profile.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase();

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
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push(backHref)}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> {backLabel}
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={handleShare}>
                            <Share2 className="h-3.5 w-3.5" /> Share Profile
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <Avatar className="h-24 w-24 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden bg-muted/20 flex items-center justify-center">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={profile.fullName}
                                className="h-full w-full object-cover rounded-2xl"
                            />
                        ) : (
                            <span className="text-2xl font-semibold text-primary">{initials}</span>
                        )}
                    </Avatar>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.fullName}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {profile.currentRole || "Open to opportunities"}
                        {profile.yearsOfExp ? ` · ${profile.yearsOfExp} years experience` : ""}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {profile.location}
                            </span>
                        )}
                        {profile.careerGoal && (
                            <span className="flex items-center gap-1">
                                <Target className="h-3.5 w-3.5 text-primary" /> {profile.careerGoal}
                            </span>
                        )}
                    </div>
                    {profile.bio ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
                            {profile.bio}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
                            Add a bio in My Info to make this preview more compelling.
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                        {socialLinks.map((social) => (
                            <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                    <social.icon className="h-3.5 w-3.5" /> {social.label}
                                </Button>
                            </a>
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-3 mt-5 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
                        <div className="relative h-10 w-10">
                            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 44 44">
                                <circle
                                    cx="22"
                                    cy="22"
                                    r="18"
                                    fill="none"
                                    stroke="currentColor"
                                    className="text-gray-200 dark:text-gray-700"
                                    strokeWidth="3.5"
                                />
                                <circle
                                    cx="22"
                                    cy="22"
                                    r="18"
                                    fill="none"
                                    className="text-[#2bd4bd]"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - progress}
                                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                                {profile.elevateScore}
                            </span>
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-semibold text-foreground">Elevate Score</p>
                            <p className="text-[10px] text-muted-foreground">AI-powered rating</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-5 space-y-3">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" /> Skills
                            </h2>
                            {profile.skills.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="dark:text-white">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Code className="h-8 w-8 text-muted-foreground/40" />} message="No skills added yet" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary" /> Experience
                            </h2>
                            {profile.experiences.length ? (
                                profile.experiences.map((experience, index) => (
                                    <div key={`${experience.company}-${experience.role}-${index}`}>
                                        <div className="flex gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Briefcase className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{experience.role}</p>
                                                    {experience.current && (
                                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">Current</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{experience.company}</p>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {experience.from} – {experience.current ? "Present" : experience.to || "—"}
                                                    {experience.location ? ` · ${experience.location}` : ""}
                                                </p>
                                                {experience.description && (
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{experience.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        {index < profile.experiences.length - 1 && <Separator className="my-4" />}
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<Briefcase className="h-8 w-8 text-muted-foreground/40" />} message="No work experience added yet" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
                    {profile.projects.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {profile.projects.map((project) => (
                                <Card key={project.name}>
                                    <CardContent className="p-4 space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                                        {project.description && <p className="text-xs text-gray-600 dark:text-gray-400">{project.description}</p>}
                                        {project.techStack && (
                                            <div className="flex flex-wrap gap-1">
                                                {project.techStack.split(",").map((tech) => (
                                                    <Badge key={tech} variant="outline" className="text-[10px] px-1.5 py-0">
                                                        {tech.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-1">
                                            {project.liveUrl && (
                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                    <ExternalLink className="h-3 w-3" /> Live
                                                </a>
                                            )}
                                            {project.repoUrl && (
                                                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                    <Github className="h-3 w-3" /> Repo
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-5">
                                <EmptyState icon={<ExternalLink className="h-8 w-8 text-muted-foreground/40" />} message="No projects added yet" />
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card>
                        <CardContent className="p-5 space-y-3">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-primary" /> Education
                            </h2>
                            {profile.education.length ? (
                                profile.education.map((education) => (
                                    <div key={`${education.institution}-${education.degree}`} className="flex gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {education.degree} in {education.field}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {education.institution} · {education.from}–{education.to || "Present"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<GraduationCap className="h-8 w-8 text-muted-foreground/40" />} message="No education added yet" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="p-5 space-y-3">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" /> Certifications
                            </h2>
                            {profile.certifications.length ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {profile.certifications.map((certification) => (
                                        <Card key={certification.name} className="border-gray-200 dark:border-gray-800">
                                            <CardContent className="p-3">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{certification.name}</p>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                                    {certification.issuer} · {certification.year}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Award className="h-8 w-8 text-muted-foreground/40" />} message="No certifications added yet" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}