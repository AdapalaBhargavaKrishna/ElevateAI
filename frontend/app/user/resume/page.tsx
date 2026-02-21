'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, CheckCircle2, AlertTriangle, XCircle, Sparkles, ArrowRight,
    Clock, Eye, Trash2, Calendar, Briefcase, FileCode, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`flex h-9 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const TextArea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    return (
        <textarea
            className={`flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const Progress = ({ value, className = "" }: { value: number; className?: string }) => {
    return (
        <div className={`w-full bg-muted/30 rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
};

const Badge = ({ children, variant = "default", className = "" }: {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "outline" | "success" | "warning";
    className?: string;
}) => {
    const variants = {
        default: "bg-primary/10 text-primary border-0",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
        success: "bg-green-500/10 text-green-600 dark:text-green-400 border-0",
        warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-0"
    };

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

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
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Resume Analyzer</h1>
                        <p className="text-sm text-muted-foreground mt-1">Get your resume scored and optimized for ATS systems</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <Clock className="h-4 w-4" />
                        {showHistory ? "Hide History" : "View History"}
                    </Button>
                </div>

                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-card border border-border rounded-lg p-4 mb-4">
                                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Previous Uploads
                                </h3>
                                <div className="space-y-2">
                                    {resumeHistory.map((resume) => (
                                        <motion.div
                                            key={resume.id}
                                            whileHover={{ x: 2 }}
                                            className={`flex items-center gap-3 p-2 rounded-lg border ${selectedResume?.id === resume.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'} transition-all cursor-pointer`}
                                            onClick={() => setSelectedResume(resume)}
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground truncate">{resume.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{resume.role}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {resume.date}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{resume.size}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-primary">{resume.score}</p>
                                                <p className="text-xs text-muted-foreground">ATS Score</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Tell us about your target role
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                                <Briefcase className="h-3 w-3 text-primary" />
                                Target Role
                            </label>
                            <Input
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g., Senior Full-Stack Developer, Frontend Engineer..."
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                                <FileCode className="h-3 w-3 text-primary" />
                                Job Description (Optional but recommended)
                            </label>
                            <TextArea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here for better ATS optimization..."
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                                <FileText className="h-4 w-4 text-primary" />
                                Upload Resume <span className="text-destructive">*</span>
                            </label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
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
                                            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                                            <p className="text-xs text-muted-foreground">Click to upload or drag and drop</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX (Max 10MB)</p>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <span className="text-sm text-foreground">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
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

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={clearForm}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 text-xs bg-primary hover:bg-primary/90"
                                onClick={handleSubmit}
                                disabled={!targetRole || !file}
                            >
                                Analyze Resume <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-xl p-5"
                >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative h-24 w-24 shrink-0">
                            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeOpacity="0.3" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${85 * 2.64} 264`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-foreground">85</span>
                                <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            {scoreCategories.map((cat) => (
                                <div key={cat.label} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground font-medium flex items-center gap-1">
                                            {cat.status === "good" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            )}
                                            {cat.label}
                                        </span>
                                        <span className="text-muted-foreground">{cat.score}%</span>
                                    </div>
                                    <Progress value={cat.score} className="h-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h2 className="text-sm font-semibold text-foreground">Improvement Suggestions</h2>
                    <div className="space-y-2">
                        {suggestions.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="bg-card border border-border rounded-lg p-3 flex items-start gap-2 hover:shadow-sm transition-shadow"
                            >
                                {s.type === "error" && <XCircle className="h-4 w-4 text-destructive shrink-0 mt-1" />}
                                {s.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />}
                                {s.type === "info" && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />}
                                <p className="text-sm text-foreground flex-1">{s.text}</p>
                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Resumes Analyzed", value: "12", icon: FileText },
                        { label: "Avg. Score", value: "82%", icon: CheckCircle2 },
                        { label: "Improvements", value: "24", icon: Sparkles },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card border border-border rounded-lg p-3 text-center">
                            <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                            <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}