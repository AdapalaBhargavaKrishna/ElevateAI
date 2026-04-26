"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
    Mail,
    Share2,
    Sun,
    Moon,
    Trophy,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UserProfile } from "../data/profile";

type ProfilePreviewViewProps = {
    profile: UserProfile;
    backHref: string;
    shareUrl: string;
    backLabel?: string;
};

/* ─── Skeleton ──────────────────────────────────────────────────────── */

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Skeleton className="h-9 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                        <Skeleton className="h-9 w-24 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header skeleton */}
                <div className="flex items-start gap-6 mb-12">
                    <Skeleton className="h-[72px] w-[72px] rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-64 bg-zinc-100 dark:bg-zinc-800" />
                        <Skeleton className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800" />
                        <div className="flex gap-4 mt-2">
                            <Skeleton className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800" />
                            <Skeleton className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                    </div>
                </div>

                {/* Two column skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-10">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800" />
                            <Skeleton className="h-20 w-full bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800" />
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-7 w-20 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800" />
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-2 pb-6">
                                    <Skeleton className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800" />
                                    <Skeleton className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800" />
                                    <Skeleton className="h-16 w-full bg-zinc-100 dark:bg-zinc-800" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Empty State ───────────────────────────────────────────────────── */

function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 gap-2.5 text-center">
            <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center">
                {icon}
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">{message}</p>
        </div>
    );
}

/* ─── Section Header ────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <h2 className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-6">
            <span className="w-1.5 h-3.5 rounded-sm bg-indigo-500 mr-2.5"></span>
            {children}
        </h2>
    );
}

/* ─── Exports ───────────────────────────────────────────────────────── */

export function ProfilePreviewSkeleton() {
    return <ProfileSkeleton />;
}

export default function ProfilePreviewView({ profile, backHref, shareUrl, backLabel = "Back to Profile" }: ProfilePreviewViewProps) {
    const router = useRouter();
    const { setTheme, resolvedTheme } = useTheme();
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
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800">
            {/* ── Top Bar ─────────────────────────────────────────── */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(backHref)}
                        className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 -ml-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> {backLabel}
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                            className="text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 h-8 w-8 transition-colors"
                        >
                            {mounted ? (resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <div className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-sm h-8 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                            onClick={handleShare}
                        >
                            <Share2 className="h-3.5 w-3.5" /> Share
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* ── Profile Header ──────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-14 pb-12 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="h-[80px] w-[80px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shrink-0">
                        <img
                            src={`https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(profile.fullName)}`}
                            alt={profile.fullName}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                                {profile.fullName}
                            </h1>

                        </div>
                        <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
                            {profile.currentRole || "Open to opportunities"}
                        </p>
                        <div className="flex items-center gap-5 mt-4 text-[13px] text-zinc-500 dark:text-zinc-400 flex-wrap">
                            {profile.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" /> {profile.location}
                                </span>
                            )}
                            {profile.yearsOfExp && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" /> {profile.yearsOfExp} years experience
                                </span>
                            )}
                        </div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-6">
                                {socialLinks.map((social) => (
                                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                        >
                                            <social.icon className="h-4 w-4" />
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 px-5 py-4 rounded-2xl self-start shrink-0">
                        <div className="relative h-14 w-14">
                            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" fill="none" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="4" />
                                <circle
                                    cx="24" cy="24" r="20" fill="none"
                                    className="stroke-indigo-500 dark:stroke-indigo-500" strokeWidth="4" strokeLinecap="round"
                                    strokeDasharray="125.6"
                                    strokeDashoffset={125.6 - (profile.elevateScore / 100) * 125.6}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                {profile.elevateScore}
                            </span>
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">Elevate Score</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                                <Trophy className="h-3.5 w-3.5 text-indigo-500" /> Your AI rating
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Two-Column Content ──────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-16 gap-y-16">
                    {/* ─ Left Column ─ */}
                    <div className="lg:col-span-1 space-y-12">
                        {/* About */}
                        {profile.bio && (
                            <section>
                                <SectionTitle>About</SectionTitle>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {profile.bio}
                                </p>
                            </section>
                        )}

                        {/* Skills */}
                        <section>
                            <SectionTitle>Skills</SectionTitle>
                            {profile.skills.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="text-[13px] text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 rounded-md px-2.5 py-1 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-default"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Code className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />} message="No skills added" />
                            )}
                        </section>

                        {/* Certifications */}
                        <section>
                            <SectionTitle>Certifications</SectionTitle>
                            {profile.certifications.length ? (
                                <div className="space-y-4">
                                    {profile.certifications.map((cert) => (
                                        <div key={cert.name} className="group">
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                                {cert.name}
                                            </p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                                                {cert.issuer} · {cert.year}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Award className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />} message="No certifications added" />
                            )}
                        </section>

                        {/* Links */}
                        {socialLinks.length > 0 && (
                            <section>
                                <SectionTitle>Links</SectionTitle>
                                <div className="space-y-1">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1.5 px-2 -mx-2 rounded-md hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 group"
                                        >
                                            <social.icon className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400 transition-colors" />
                                            <span className="truncate">{social.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* ─ Right Column ─ */}
                    <div className="lg:col-span-2 space-y-14">
                        {/* Experience */}
                        <section>
                            <SectionTitle>Experience</SectionTitle>
                            {profile.experiences.length ? (
                                <div className="space-y-0 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                                    {profile.experiences.map((exp, index) => (
                                        <div
                                            key={`${exp.company}-${exp.role}-${index}`}
                                            className="relative flex gap-5 pb-8 last:pb-0"
                                        >
                                            <div className="w-[11px] h-[11px] rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 shrink-0 z-10 relative mt-1.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                                            {exp.role}
                                                        </h3>
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                                                            {exp.company}
                                                        </p>
                                                    </div>
                                                    {exp.current && (
                                                        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded px-2 py-0.5 shrink-0">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-[13px] text-zinc-500 dark:text-zinc-500 mt-2 flex-wrap">
                                                    <span>{exp.from} – {exp.current ? "Present" : exp.to || "—"}</span>
                                                    {exp.location && <span>· {exp.location}</span>}
                                                </div>
                                                {exp.description && (
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Briefcase className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />} message="No work experience added" />
                            )}
                        </section>

                        {/* Projects */}
                        <section>
                            <SectionTitle>Projects</SectionTitle>
                            {profile.projects.length ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {profile.projects.map((project) => (
                                        <div
                                            key={project.name}
                                            className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col h-full hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group"
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-2.5">
                                                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <div className="flex gap-1 shrink-0">
                                                    {project.repoUrl && (
                                                        <a
                                                            href={project.repoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors p-1.5 rounded-md"
                                                        >
                                                            <Github className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                    {project.liveUrl && (
                                                        <a
                                                            href={project.liveUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors p-1.5 rounded-md"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            {project.description && (
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-1 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            )}
                                            {project.techStack && (
                                                <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                                    {project.techStack.split(",").map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 px-2 py-0.5 rounded"
                                                        >
                                                            {tech.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<ExternalLink className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />} message="No projects added" />
                            )}
                        </section>

                        {/* Education */}
                        <section>
                            <SectionTitle>Education</SectionTitle>
                            {profile.education.length ? (
                                <div className="space-y-0 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                                    {profile.education.map((edu, index) => (
                                        <div
                                            key={`${edu.institution}-${edu.degree}-${index}`}
                                            className="relative flex gap-5 pb-6 last:pb-0"
                                        >
                                            <div className="w-[11px] h-[11px] rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 shrink-0 z-10 relative mt-1.5" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                                    {edu.degree} in {edu.field}
                                                </h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                                                    {edu.institution}
                                                </p>
                                                <div className="flex items-center gap-3 text-[13px] text-zinc-500 dark:text-zinc-500 mt-2 flex-wrap">
                                                    <span>{edu.from} – {edu.to || "Present"}</span>
                                                    {edu.grade && <span>· GPA: {edu.grade}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<GraduationCap className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />} message="No education added" />
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}