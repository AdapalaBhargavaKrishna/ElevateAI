'use client';

import React, { useState } from 'react';
import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, ArrowRight, ArrowLeft, Target, Briefcase, Code,
    GraduationCap, Clock, CheckCircle2, Rocket, Sun, Moon
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`flex h-9 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}>
            {children}
        </div>
    );
};

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return <div className={`p-6 ${className}`}>{children}</div>;
};

const Badge = ({ children, variant = "default", className = "" }: {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "outline" | "success";
    className?: string;
}) => {
    const variants = {
        default: "bg-primary/10 text-primary border-0",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
        success: "bg-green-500/10 text-green-600 dark:text-green-400 border-0"
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
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

const careerGoals = [
    "Frontend Developer", "Backend Developer", "Full-Stack Developer",
    "Data Scientist", "ML Engineer", "DevOps Engineer",
    "Mobile Developer", "Cloud Architect", "Product Manager",
    "UI/UX Designer", "Cybersecurity Analyst", "Other",
];

const experienceLevels = [
    { label: "Student / Fresher", value: "fresher", desc: "Currently studying or just graduated", icon: GraduationCap },
    { label: "Junior (0-2 yrs)", value: "junior", desc: "Early career, building foundations", icon: Code },
    { label: "Mid-Level (2-5 yrs)", value: "mid", desc: "Growing expertise, some leadership", icon: Briefcase },
    { label: "Senior (5+ yrs)", value: "senior", desc: "Deep expertise, mentoring others", icon: Target },
];

const topSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
    "React", "Angular", "Vue.js", "Next.js", "Node.js", "Django", "Spring",
    "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "GraphQL",
    "Machine Learning", "Data Analysis", "System Design", "DevOps",
];

const learningPreferences = [
    { label: "Structured Roadmaps", desc: "Step-by-step plans with clear milestones", value: "roadmap" },
    { label: "Practice-First", desc: "Learn by coding challenges and projects", value: "practice" },
    { label: "Interview Prep", desc: "Focus on cracking interviews ASAP", value: "interview" },
    { label: "Balanced Approach", desc: "Mix of theory, practice, and interview prep", value: "balanced" },
];

const timeCommitments = [
    { label: "< 1 hour/day", value: "light" },
    { label: "1-2 hours/day", value: "moderate" },
    { label: "2-4 hours/day", value: "dedicated" },
    { label: "Full-time", value: "fulltime" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [step, setStep] = useState(0);

    const [careerGoal, setCareerGoal] = useState("");
    const [customGoal, setCustomGoal] = useState("");
    const [expLevel, setExpLevel] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [learningPref, setLearningPref] = useState("");
    const [timeCommitment, setTimeCommitment] = useState("");

    const totalSteps = 5;
    const progress = ((step + 1) / totalSteps) * 100;

    const toggleSkill = (s: string) => {
        setSelectedSkills((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return careerGoal !== "";
            case 1: return expLevel !== "";
            case 2: return selectedSkills.length >= 3;
            case 3: return learningPref !== "";
            case 4: return timeCommitment !== "";
            default: return true;
        }
    };

    const handleFinish = () => {
        console.log({
            careerGoal: careerGoal === "Other" ? customGoal : careerGoal,
            expLevel,
            selectedSkills,
            learningPref,
            timeCommitment
        });
        router.push("/user/dashboard");
    };

    const fadeVariants = {
        enter: { opacity: 0, x: 30 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
            </div>

            <div className="fixed top-4 right-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full"
                >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Image
                        src="/logo.png"
                        alt="ElevateAI Logo"
                        width={140}
                        height={140}
                        className="rounded-lg invert dark:invert-0"
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">Step {step + 1} of {totalSteps}</p>
                        <p className="text-xs font-medium text-primary">{Math.round(progress)}%</p>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>

                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
                    <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                            {step === 0 && (
                                <motion.div key="s0" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">What's your dream role?</h2>
                                        <p className="text-sm text-muted-foreground">This helps us tailor your career roadmap</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {careerGoals.map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setCareerGoal(g)}
                                                className={`text-left text-xs font-medium px-3 py-2.5 rounded-lg border transition-all ${careerGoal === g
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-card hover:border-primary/30 text-foreground"
                                                    }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                    {careerGoal === "Other" && (
                                        <Input
                                            placeholder="Type your career goal..."
                                            value={customGoal}
                                            onChange={(e) => setCustomGoal(e.target.value)}
                                            className="bg-muted/30"
                                            autoFocus
                                        />
                                    )}
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="s1" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">Your experience level?</h2>
                                        <p className="text-sm text-muted-foreground">We'll adjust difficulty and recommendations accordingly</p>
                                    </div>
                                    <div className="space-y-2">
                                        {experienceLevels.map((lvl) => {
                                            const Icon = lvl.icon;
                                            return (
                                                <button
                                                    key={lvl.value}
                                                    onClick={() => setExpLevel(lvl.value)}
                                                    className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all ${expLevel === lvl.value
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border bg-card hover:border-primary/30"
                                                        }`}
                                                >
                                                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${expLevel === lvl.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                        }`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{lvl.label}</p>
                                                        <p className="text-[11px] text-muted-foreground">{lvl.desc}</p>
                                                    </div>
                                                    {expLevel === lvl.value && <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">Select your skills</h2>
                                        <p className="text-sm text-muted-foreground">Pick at least 3 skills you're proficient in</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {topSkills.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => toggleSkill(s)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${selectedSkills.includes(s)
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-card hover:border-primary/30 text-foreground"
                                                    }`}
                                            >
                                                {selectedSkills.includes(s) ? "✓ " : ""}
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {selectedSkills.length} selected {selectedSkills.length < 3 && `· Pick ${3 - selectedSkills.length} more`}
                                    </p>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">How do you learn best?</h2>
                                        <p className="text-sm text-muted-foreground">We'll prioritize content that matches your style</p>
                                    </div>
                                    <div className="space-y-2">
                                        {learningPreferences.map((pref) => (
                                            <button
                                                key={pref.value}
                                                onClick={() => setLearningPref(pref.value)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${learningPref === pref.value
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border bg-card hover:border-primary/30"
                                                    }`}
                                            >
                                                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                                                <p className="text-[11px] text-muted-foreground">{pref.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="s4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">How much time can you commit?</h2>
                                        <p className="text-sm text-muted-foreground">This shapes your roadmap timeline</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {timeCommitments.map((tc) => (
                                            <button
                                                key={tc.value}
                                                onClick={() => setTimeCommitment(tc.value)}
                                                className={`flex items-center justify-center gap-2 text-sm font-medium px-4 py-4 rounded-xl border transition-all ${timeCommitment === tc.value
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-card hover:border-primary/30 text-foreground"
                                                    }`}
                                            >
                                                <Clock className="h-4 w-4" />
                                                {tc.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="rounded-xl bg-muted/40 p-4 space-y-2 mt-2">
                                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <Rocket className="h-3.5 w-3.5 text-primary" /> Your Roadmap Preview
                                        </p>
                                        <div className="space-y-1 text-[11px] text-muted-foreground">
                                            <p>🎯 Goal: <span className="text-foreground font-medium">{careerGoal === "Other" ? customGoal : careerGoal}</span></p>
                                            <p>📊 Level: <span className="text-foreground font-medium">{experienceLevels.find((l) => l.value === expLevel)?.label}</span></p>
                                            <p>🛠 Skills: <span className="text-foreground font-medium">{selectedSkills.slice(0, 5).join(", ")}{selectedSkills.length > 5 ? ` +${selectedSkills.length - 5}` : ""}</span></p>
                                            <p>📚 Style: <span className="text-foreground font-medium">{learningPreferences.find((l) => l.value === learningPref)?.label}</span></p>
                                            <p>⏱️ Time: <span className="text-foreground font-medium">{timeCommitments.find((t) => t.value === timeCommitment)?.label}</span></p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep(step - 1)}
                                disabled={step === 0}
                                className="text-xs"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                            </Button>

                            {step < totalSteps - 1 ? (
                                <Button
                                    size="sm"
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed()}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                >
                                    Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleFinish}
                                    disabled={!canProceed()}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                >
                                    <Rocket className="h-3.5 w-3.5 mr-1" /> Launch My Roadmap
                                </Button>
                            )}
                        </div>

                        <div className="text-center mt-3">
                            <button
                                onClick={() => router.push("/user/dashboard")}
                                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}