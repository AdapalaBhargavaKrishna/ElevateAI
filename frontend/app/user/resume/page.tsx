'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, CheckCircle2, AlertTriangle, XCircle, Sparkles, ArrowRight,
    Clock, Eye, Trash2, Calendar, Briefcase, FileCode, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const resumeHistory = [
    { id: 1, name: "Full-Stack_Resume_BK.pdf", date: "Feb 15, 2026", score: 85, size: "2.4 MB", role: "Senior Full-Stack Developer" },
    { id: 2, name: "Frontend_Resume_v3.pdf", date: "Jan 20, 2026", score: 78, size: "1.8 MB", role: "Frontend Engineer" },
    { id: 3, name: "Backend_Engineer_Resume.pdf", date: "Dec 8, 2025", score: 92, size: "2.1 MB", role: "Backend Developer" },
    { id: 4, name: "DevOps_Resume_2025.pdf", date: "Nov 12, 2025", score: 71, size: "1.9 MB", role: "DevOps Engineer" },
];

const scoreCategories = [
    { label: "ATS Compatibility", score: 85, status: "good" },
    { label: "Keyword Optimization", score: 62, status: "warning" },
    { label: "Grammar & Structure", score: 92, status: "good" },
    { label: "Impact Statements", score: 70, status: "warning" },
    { label: "Formatting", score: 88, status: "good" },
];

const suggestions = [
    { type: "error", text: "Missing quantified achievements in work experience section" },
    { type: "warning", text: 'Add relevant keywords: "CI/CD", "Agile", "Microservices"' },
    { type: "warning", text: "Skills section should be organized by category" },
    { type: "info", text: "Consider adding a professional summary at the top" },
    { type: "info", text: "Link to GitHub and portfolio for stronger profile" },
];

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

export default function ResumeAnalyzerPage() {
    const [showHistory, setShowHistory] = useState(false);
    const [selectedResume, setSelectedResume] = useState<typeof resumeHistory[0] | null>(null);
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!targetRole || !file) return;
        console.log({ targetRole, jobDescription, file });
    };

    const clearForm = () => {
        setTargetRole("");
        setJobDescription("");
        setFile(null);
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Resume Analyzer</h1>
                            <p className="text-sm text-muted-foreground mt-1">Get your resume scored and optimized for ATS systems</p>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="w-full sm:w-auto"
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    {showHistory ? "Hide History" : "View History"}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View your previous resume analyses</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* History Section */}
                    <AnimatePresence>
                        {showHistory && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Previous Uploads
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            {resumeHistory.map((resume) => (
                                                <motion.div
                                                    key={resume.id}
                                                    whileHover={{ x: 2 }}
                                                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${selectedResume?.id === resume.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/30'
                                                        } transition-all cursor-pointer`}
                                                    onClick={() => setSelectedResume(resume)}
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-foreground truncate">{resume.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{resume.role}</p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" /> {resume.date}
                                                                </span>
                                                                <span>•</span>
                                                                <span>{resume.size}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-sm font-semibold text-primary">{resume.score}</p>
                                                            <p className="text-xs text-muted-foreground">ATS Score</p>
                                                        </div>
                                                        <div className="flex gap-1 shrink-0">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View resume</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Delete</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Upload Form */}
                    <motion.div variants={fadeUp} initial="initial" animate="animate">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Tell us about your target role
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                        Target Role <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        placeholder="e.g., Senior Full-Stack Developer, Frontend Engineer..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        <FileCode className="h-4 w-4 text-primary" />
                                        Job Description
                                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                    </label>
                                    <Textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here for better ATS optimization..."
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Upload Resume <span className="text-destructive">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/30 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label htmlFor="resume-upload" className="cursor-pointer block">
                                            {!file ? (
                                                <>
                                                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX (Max 10MB)</p>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FileText className="h-5 w-5 text-primary shrink-0" />
                                                        <div className="text-left min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setFile(null);
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={clearForm}
                                        className="w-full sm:w-auto order-2 sm:order-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!targetRole || !file}
                                        className="w-full sm:w-auto order-1 sm:order-2"
                                    >
                                        Analyze Resume <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Score Overview */}
                    <motion.div
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row items-center gap-6">
                                    {/* Score Circle */}
                                    <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0">
                                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeOpacity="0.3" />
                                            <circle
                                                cx="50" cy="50" r="42" fill="none"
                                                stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                                                strokeDasharray={`${85 * 2.64} 264`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl sm:text-3xl font-bold text-foreground">85</span>
                                            <span className="text-xs text-muted-foreground">/100</span>
                                        </div>
                                    </div>

                                    {/* Score Categories */}
                                    <div className="flex-1 w-full space-y-3">
                                        {scoreCategories.map((cat) => (
                                            <div key={cat.label} className="space-y-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-foreground flex items-center gap-1.5">
                                                        {cat.status === "good" ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                        {cat.label}
                                                    </span>
                                                    <span className="text-muted-foreground font-medium">{cat.score}%</span>
                                                </div>
                                                <Progress value={cat.score} className="h-1.5" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Suggestions */}
                    <motion.div
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Improvement Suggestions</CardTitle>
                                <CardDescription>Actionable insights to improve your resume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {suggestions.map((s, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                            className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors"
                                        >
                                            {s.type === "error" && <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                                            {s.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />}
                                            {s.type === "info" && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                                            <p className="text-sm text-foreground flex-1">{s.text}</p>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Resumes Analyzed", value: "12", icon: FileText },
                            { label: "Average Score", value: "82%", icon: CheckCircle2 },
                            { label: "Improvements Made", value: "24", icon: Sparkles },
                        ].map((stat) => (
                            <Card key={stat.label}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <stat.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}