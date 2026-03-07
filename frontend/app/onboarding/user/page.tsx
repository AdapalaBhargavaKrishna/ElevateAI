'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { api } from '../../lib/axios';
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, ArrowLeft, Target, Briefcase, Code,
    GraduationCap, CheckCircle2, Rocket, Sun, Moon, MapPin, User
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={`flex h-9 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
);

const Textarea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className={`flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className}`}
        {...props}
    />
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
    <div className={`w-full bg-muted/30 rounded-full overflow-hidden ${className}`}>
        <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${value}%` }}
        />
    </div>
);

const careerGoals = [
    "Frontend Developer", "Backend Developer", "Full-Stack Developer",
    "Data Scientist", "ML Engineer", "DevOps Engineer",
    "Mobile Developer", "Cloud Architect", "Product Manager",
    "UI/UX Designer", "Cybersecurity Analyst", "Other",
];

const experienceLevels = [
    { label: "Student / Fresher", value: "0-1", desc: "Currently studying or just graduated", icon: GraduationCap },
    { label: "Junior (0-2 yrs)", value: "1-2", desc: "Early career, building foundations", icon: Code },
    { label: "Mid-Level (2-5 yrs)", value: "2-4", desc: "Growing expertise, some leadership", icon: Briefcase },
    { label: "Senior (5+ yrs)", value: "6-10", desc: "Deep expertise, mentoring others", icon: Target },
];

const topSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
    "React", "Angular", "Vue.js", "Next.js", "Node.js", "Django", "Spring",
    "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "GraphQL",
    "Machine Learning", "Data Analysis", "System Design", "DevOps",
];

export default function OnboardingPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [step, setStep] = useState(0);

    const [careerGoal, setCareerGoal] = useState("");
    const [customGoal, setCustomGoal] = useState("");

    const [currentRole, setCurrentRole] = useState("");
    const [yearsOfExp, setYearsOfExp] = useState("");

    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");

    const totalSteps = 5;
    const progress = ((step + 1) / totalSteps) * 100;

    const toggleSkill = (s: string) => {
        setSelectedSkills((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return careerGoal !== "" && (careerGoal !== "Other" || customGoal.trim() !== "");
            case 1: return currentRole.trim() !== "" && yearsOfExp !== "";
            case 2: return selectedSkills.length >= 3;
            case 3: return location.trim() !== "";
            case 4: return true;
            default: return true;
        }
    };

    const handleOnboardingComplete = async () => {
        const finalData = {
            careerGoal: careerGoal === "Other" ? customGoal.trim() : careerGoal,
            currentRole: currentRole.trim(),
            yearsOfExp,
            skills: selectedSkills,
            location: location.trim(),
            bio: bio.trim(),
        };

        try {
            await api.post('/auth/onboarding/complete', finalData);
            router.push("/user/dashboard");
        } catch (err) {
            console.error("Onboarding error:", err);
        }
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

                            {/* Step 0 — Career Goal */}
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

                            {/* Step 1 — Current Role + Years of Experience */}
                            {step === 1 && (
                                <motion.div key="s1" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">Your current position?</h2>
                                        <p className="text-sm text-muted-foreground">Tell us where you are right now</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium">Current Role / Title</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="e.g. Software Engineer, Student, Intern..."
                                                value={currentRole}
                                                onChange={(e) => setCurrentRole(e.target.value)}
                                                className="pl-9 bg-muted/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium">Years of Experience</label>
                                        <div className="space-y-2">
                                            {experienceLevels.map((lvl) => {
                                                const Icon = lvl.icon;
                                                return (
                                                    <button
                                                        key={lvl.value}
                                                        onClick={() => setYearsOfExp(lvl.value)}
                                                        className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all ${yearsOfExp === lvl.value
                                                            ? "border-primary bg-primary/10"
                                                            : "border-border bg-card hover:border-primary/30"
                                                            }`}
                                                    >
                                                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${yearsOfExp === lvl.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{lvl.label}</p>
                                                            <p className="text-[11px] text-muted-foreground">{lvl.desc}</p>
                                                        </div>
                                                        {yearsOfExp === lvl.value && <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 — Skills */}
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
                                                {selectedSkills.includes(s) ? "✓ " : ""}{s}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {selectedSkills.length} selected {selectedSkills.length < 3 && `· Pick ${3 - selectedSkills.length} more`}
                                    </p>
                                </motion.div>
                            )}

                            {/* Step 3 — Location + Bio */}
                            {step === 3 && (
                                <motion.div key="s3" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">Almost done!</h2>
                                        <p className="text-sm text-muted-foreground">A few more details to complete your profile</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium">Where are you based? <span className="text-destructive">*</span></label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="e.g. Hyderabad, India"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="pl-9 bg-muted/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium">Short Bio <span className="text-muted-foreground/60">(optional)</span></label>
                                        <Textarea
                                            placeholder="Tell us a little about yourself, your interests, or what you're working towards..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="bg-muted/30"
                                        />
                                        <p className="text-[10px] text-muted-foreground text-right">{bio.length}/300</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4 — Summary */}
                            {step === 4 && (
                                <motion.div key="s4" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">You're all set! 🎉</h2>
                                        <p className="text-sm text-muted-foreground">Here's a summary of your profile</p>
                                    </div>

                                    <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <Rocket className="h-3.5 w-3.5 text-primary" /> Profile Summary
                                        </p>
                                        <div className="space-y-2 text-[11px] text-muted-foreground">
                                            <div className="flex items-start gap-2">
                                                <span>🎯</span>
                                                <span>Career Goal: <span className="text-foreground font-medium">{careerGoal === "Other" ? customGoal : careerGoal}</span></span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span>💼</span>
                                                <span>Current Role: <span className="text-foreground font-medium">{currentRole}</span></span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span>📊</span>
                                                <span>Experience: <span className="text-foreground font-medium">{experienceLevels.find((l) => l.value === yearsOfExp)?.label}</span></span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span>🛠</span>
                                                <span>Skills: <span className="text-foreground font-medium">{selectedSkills.slice(0, 5).join(", ")}{selectedSkills.length > 5 ? ` +${selectedSkills.length - 5} more` : ""}</span></span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span>📍</span>
                                                <span>Location: <span className="text-foreground font-medium">{location}</span></span>
                                            </div>
                                            {bio && (
                                                <div className="flex items-start gap-2">
                                                    <span>📝</span>
                                                    <span>Bio: <span className="text-foreground font-medium">{bio.length > 80 ? bio.slice(0, 80) + "..." : bio}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground text-center">
                                        You can always update these details from <span className="text-primary font-medium">My Info</span>
                                    </p>
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
                                    onClick={handleOnboardingComplete}
                                    disabled={!canProceed()}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                >
                                    <Rocket className="h-3.5 w-3.5 mr-1" /> Complete Setup
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}