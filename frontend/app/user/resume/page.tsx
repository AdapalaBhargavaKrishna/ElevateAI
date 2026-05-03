'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, CheckCircle2, AlertTriangle, XCircle, Sparkles, ArrowRight,
    Clock, Eye, Trash2, Calendar, Briefcase, FileCode, ChevronRight, Loader2,
    Star, Shield, TrendingUp, User, Code, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { resumeApi, ResumeAnalysis, ResumeHistoryItem } from "@/app/lib/resume.api";

// ─── helpers ─────────────────────────────────────────────────────────────────

const scoreColor = (s: number) =>
    s >= 75 ? "text-green-600 dark:text-green-400"
        : s >= 50 ? "text-yellow-600 dark:text-yellow-400"
            : "text-red-600 dark:text-red-400";

const scoreBarColor = (s: number) =>
    s >= 75 ? "bg-green-500" : s >= 50 ? "bg-yellow-500" : "bg-red-500";

const ScoreBar = ({ label, score, max = 100 }: { label: string; score: number; max?: number }) => {
    const pct = Math.round((score / max) * 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-semibold ${scoreColor(pct)}`}>{score}/{max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(pct)}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResumeAnalyzerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [targetRole, setTargetRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ResumeAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!file || !targetRole.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await resumeApi.analyzeFile(file, {
                targetRole: targetRole.trim(),
                jobDescription: jobDescription.trim(),
            });
            setResult(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFile(null);
        setTargetRole('');
        setJobDescription('');
        setResult(null);
        setError(null);
    };

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await resumeApi.getHistory();
            setHistory(data.analyses);
        } catch { /* silent */ }
        finally { setHistoryLoading(false); }
    };

    const handleToggleHistory = () => {
        if (!showHistory) loadHistory();
        setShowHistory(h => !h);
    };

    // ── Derived display values ─────────────────────────────────────────────

    const overallScore = result?.score?.overall_score ?? 0;
    const atsScore = result?.ats?.ats_score ?? null;
    const atsMode = result?.ats?.mode;           // "jd_match" | "no_jd" | "format_only"
    const hasAtsScore = atsMode !== "no_jd" && atsScore !== null;
    const grade = result?.score?.grade;
    const atsGrade = result?.ats?.ats_grade;
    const willPass = result?.ats?.will_pass_ats;

    const breakdown = result?.score?.breakdown ?? {};
    const atsBreakdown: any = result?.ats?.breakdown ?? {};
    const atsFoundKeywords: string[] = Array.from(new Set((atsBreakdown?.keywords?.found_keywords ?? []).map((k: string) => k.toLowerCase())));
    const atsMissingKeywords: string[] = Array.from(new Set((atsBreakdown?.keywords?.missing_keywords ?? []).map((k: string) => k.toLowerCase())));

    const deductions = result?.score?.deductions ?? [];
    const recommendations = result?.ats?.recommendations ?? [];
    const strengths = result?.score?.strengths ?? [];
    const weaknesses = result?.score?.weaknesses ?? [];

    const parsed = result?.parsed_resume ?? {};
    const skillsAnalysis = result?.skills_analysis ?? {};

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Resume Analyzer</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Score your resume, check ATS compatibility and get actionable feedback
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleToggleHistory} className="gap-2 w-full sm:w-auto">
                        <Clock className="h-4 w-4" />
                        {showHistory ? "Hide History" : "Past Analyses"}
                    </Button>
                </div>

                {/* ── History ── */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <Card>
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" /> Previous Analyses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {historyLoading ? (
                                        <div className="flex justify-center py-6">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : history.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            No previous analyses yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {history.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-all">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.fileName ?? "Untitled"}</p>
                                                        <p className="text-xs text-muted-foreground">{item.name ?? ""} · {new Date(item.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right shrink-0 space-y-0.5">
                                                        <p className={`text-sm font-bold ${scoreColor(item.overallScore ?? 0)}`}>{item.overallScore ?? "—"}/100</p>
                                                        <p className="text-xs text-muted-foreground">ATS: {item.atsScore ?? "—"}</p>
                                                    </div>
                                                    {item.scoreGrade && (
                                                        <Badge variant="outline" className="text-xs shrink-0">{item.scoreGrade}</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main upload card ── */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" /> Analyze Your Resume
                            </CardTitle>
                            <CardDescription>
                                Upload your resume and tell us your target role. Job description is optional but improves ATS scoring.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            {/* Target role — required */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4 text-primary" />
                                    Target Role
                                    <span className="text-destructive text-xs">*</span>
                                </label>
                                <Input
                                    value={targetRole}
                                    onChange={e => setTargetRole(e.target.value)}
                                    placeholder="e.g. Senior Full-Stack Developer, Backend Engineer…"
                                    className="h-10"
                                />
                            </div>

                            {/* Job description — optional */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <FileCode className="h-4 w-4 text-primary" />
                                    Job Description
                                    <span className="text-xs text-muted-foreground font-normal">(Optional — paste for better ATS match)</span>
                                </label>
                                <Textarea
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here to get role-specific ATS keyword analysis…"
                                    className="min-h-[100px] resize-none"
                                />
                            </div>

                            {/* File upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Resume File
                                    <span className="text-destructive text-xs">*</span>
                                </label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? "border-primary/40 bg-primary/3" : "border-border hover:border-primary/30"
                                    }`}>
                                    <input
                                        type="file" accept=".pdf,.docx"
                                        onChange={handleFileChange}
                                        className="hidden" id="resume-upload"
                                    />
                                    <label htmlFor="resume-upload" className="cursor-pointer block">
                                        {!file ? (
                                            <>
                                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                                                <p className="text-xs text-muted-foreground mt-1">PDF or DOCX · Max 10 MB</p>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                                                    onClick={e => { e.preventDefault(); setFile(null); }}
                                                >
                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-destructive p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                                    <XCircle className="h-4 w-4 shrink-0" /> {error}
                                </div>
                            )}

                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" onClick={clearForm} className="w-full sm:w-auto">
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!file || !targetRole.trim() || loading}
                                    className="flex-1 gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
                                    ) : (
                                        <>Analyze Resume <ChevronRight className="h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loading state */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                            <Sparkles className="h-5 w-5 text-primary absolute inset-0 m-auto" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-medium text-foreground">Analyzing your resume…</p>
                                            <p className="text-xs text-muted-foreground">Parsing · Scoring · ATS check · Generating insights</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── Results displayed directly below upload ── */}
                    {result && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                            {/* Score overview */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row items-center gap-6">
                                        {/* Circle score */}
                                        <div className="relative h-36 w-36 shrink-0">
                                            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeOpacity="0.4" />
                                                <circle
                                                    cx="50" cy="50" r="42" fill="none"
                                                    stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                                                    strokeDasharray={`${overallScore * 2.64} 264`}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                                                <span className={`text-3xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</span>
                                                <span className="text-xs text-muted-foreground">/100</span>
                                                {grade && <Badge variant="outline" className="text-xs mt-1">{grade}</Badge>}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex-1 w-full space-y-3">
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="text-center p-3 rounded-lg bg-muted/40 border border-border">
                                                    <p className={`text-xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Resume Score</p>
                                                </div>
                                                <div className="text-center p-3 rounded-lg bg-muted/40 border border-border">
                                                    {hasAtsScore ? (
                                                        <>
                                                            <p className={`text-xl font-bold ${scoreColor(atsScore!)}`}>{atsScore}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">ATS Score</p>
                                                            {atsGrade && <Badge variant="outline" className="text-xs mt-1">{atsGrade}</Badge>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-xl font-bold text-muted-foreground">—</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">ATS Score</p>
                                                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">Paste a JD to score</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ATS pass/fail */}
                                            {hasAtsScore ? (
                                                <div className={`flex items-center gap-2 text-sm p-2.5 rounded-lg ${willPass
                                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                                    }`}>
                                                    {willPass
                                                        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                        : <AlertTriangle className="h-4 w-4 shrink-0" />}
                                                    <span className="font-medium">
                                                        {willPass
                                                            ? "Likely to pass ATS filters"
                                                            : "May not pass ATS filters — see recommendations below"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                                    <span className="font-medium">
                                                        Paste a job description above to get your ATS match score
                                                    </span>
                                                </div>
                                            )}

                                            {/* Verdict */}
                                            {result.score.verdict && (
                                                <p className="text-sm text-muted-foreground italic">
                                                    "{result.score.verdict}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Score breakdown */}
                            {Object.keys(breakdown).length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-primary" /> Score Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {Object.entries(breakdown).map(([key, val]: [string, any]) => (
                                            <ScoreBar
                                                key={key}
                                                label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                score={val?.score ?? 0}
                                                max={val?.max ?? 100}
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Candidate info + skills */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Parsed info */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" /> Parsed Info
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        {parsed.name && <p><span className="font-medium text-foreground">Name:</span> <span className="text-muted-foreground">{parsed.name}</span></p>}
                                        {parsed.email && <p><span className="font-medium text-foreground">Email:</span> <span className="text-muted-foreground">{parsed.email}</span></p>}
                                        {parsed.phone && <p><span className="font-medium text-foreground">Phone:</span> <span className="text-muted-foreground">{parsed.phone}</span></p>}
                                        {parsed.location && <p><span className="font-medium text-foreground">Location:</span> <span className="text-muted-foreground">{parsed.location}</span></p>}
                                        {skillsAnalysis.domain && <p><span className="font-medium text-foreground">Domain:</span> <span className="text-muted-foreground">{skillsAnalysis.domain}</span></p>}
                                    </CardContent>
                                </Card>

                                {/* Skills */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Code className="h-4 w-4 text-primary" /> Skills Found
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(parsed.skills ?? []).slice(0, 20).map((s: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                                            ))}
                                            {(parsed.skills ?? []).length > 20 && (
                                                <Badge variant="outline" className="text-xs">+{(parsed.skills ?? []).length - 20} more</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Strengths & Weaknesses */}
                            {(strengths.length > 0 || weaknesses.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {strengths.length > 0 && (
                                        <Card className="border-green-500/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base text-green-600 dark:text-green-400 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" /> Strengths
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {(Array.isArray(strengths) ? strengths : [strengths]).map((s: any, i: number) => (
                                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                            <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                                            {typeof s === 'string' ? s : JSON.stringify(s)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {weaknesses.length > 0 && (
                                        <Card className="border-red-500/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                                                    <XCircle className="h-4 w-4" /> Weaknesses
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {(Array.isArray(weaknesses) ? weaknesses : [weaknesses]).map((w: any, i: number) => (
                                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                            <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                                                            {typeof w === 'string' ? w : JSON.stringify(w)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* Suggestions */}
                            {(deductions.length > 0 || recommendations.length > 0) && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Award className="h-4 w-4 text-primary" /> Improvement Suggestions
                                        </CardTitle>
                                        <CardDescription>Act on these to raise your score</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {deductions.map((d: string, i: number) => (
                                            <div key={`d${i}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                                                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                                <p className="text-sm text-foreground flex-1">{d}</p>
                                            </div>
                                        ))}
                                        {recommendations.map((r: string, i: number) => (
                                            <div key={`r${i}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                                                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-foreground flex-1">{r}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Missing skills */}
                            {(skillsAnalysis.in_demand_missing ?? []).length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-primary" /> In-Demand Skills You're Missing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(skillsAnalysis.in_demand_missing ?? []).map((s: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs border-yellow-500/40 text-yellow-600 dark:text-yellow-400">
                                                    + {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ATS keyword breakdown */}
                            {atsBreakdown.keywords && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">ATS Keyword Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Match ratio: <span className="font-semibold text-foreground">{atsBreakdown.keywords.match_ratio}</span>
                                        </p>
                                        {atsFoundKeywords.length > 0 && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Keywords found:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {atsFoundKeywords.map((k: string, i: number) => (
                                                        <Badge key={i} className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-0">{k}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {atsMissingKeywords.length > 0 && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Missing keywords:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {atsMissingKeywords.map((k: string, i: number) => (
                                                        <Badge key={i} className="text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-0">{k}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Analyse another */}
                            <Button variant="outline" onClick={clearForm} className="w-full gap-2">
                                <Upload className="h-4 w-4" /> Analyze Another Resume
                            </Button>

                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}