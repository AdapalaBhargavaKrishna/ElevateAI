'use client';

import { motion } from "framer-motion";
import { Eye, EyeOff, Sun, Moon, Shield, ArrowUpRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { api } from '../lib/axios';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/signup', { email, password, fullName: name });
            toast.success("Account created successfully.");
            router.push("/onboarding/user");
        } catch (error: unknown) {
            const message =
                typeof error === "object" && error !== null && "response" in error &&
                typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Something went wrong"
                    : "Something went wrong";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background selection:bg-primary/20">
            {/* LEFT PANEL */}
            <div className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] flex-col overflow-hidden"
                style={{ background: 'linear-gradient(160deg, hsl(220 25% 12%) 0%, hsl(225 30% 8%) 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundSize: '40px 40px',
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                }} />
                <div className="absolute top-0 right-0 w-[60%] h-[60%] opacity-20" style={{
                    background: `radial-gradient(ellipse at 80% 20%, hsl(172 70% 45% / 0.4) 0%, transparent 70%)`,
                }} />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] opacity-15" style={{
                    background: `radial-gradient(ellipse at 20% 80%, hsl(200 80% 50% / 0.3) 0%, transparent 70%)`,
                }} />
                <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
                            <Image src="/logo.png" alt="ElevateAI" width={130} height={38}
                                className="h-8 w-auto object-contain brightness-0 invert opacity-90" priority />
                        </div>
                    </motion.div>
                    <div className="flex-1 flex flex-col justify-center max-w-md">
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 mb-5">
                            Get Started Free
                        </motion.p>
                        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-[2.5rem] xl:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-5">
                            Your career,<br /><span className="text-white/40">reimagined.</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-[15px] text-white/50 leading-relaxed max-w-sm mb-10">
                            Create your free account and unlock AI-driven interview coaching, resume optimization, and career analytics.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
                            className="space-y-3">
                            {["5 specialized AI coaching agents", "Real-time feedback & scoring", "Personalized career roadmap", "Resume optimization"].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-[13px] text-white/50 font-medium">{item}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
                        className="flex items-center justify-between">
                        <p className="text-[11px] text-white/25 font-medium">© {new Date().getFullYear()} ElevateAI</p>
                        <button onClick={() => router.push("/")}
                            className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 font-medium uppercase tracking-wider transition-colors">
                            Back to home <ArrowUpRight className="h-3 w-3" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="relative flex-1 flex flex-col min-h-screen lg:min-h-0">
                <div className="relative z-20 flex items-center justify-between p-6 lg:px-10">
                    <div className="flex items-center gap-3 lg:hidden">
                        <Image src="/logo.png" alt="ElevateAI" width={100} height={30}
                            className="h-7 w-auto object-contain invert dark:invert-0" priority />
                    </div>
                    <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
                        Already have an account?
                        <Link href="/login" className="text-foreground font-semibold hover:text-primary transition-colors ml-1">Sign in</Link>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        className="hover:bg-muted/60 rounded-full h-9 w-9">
                        {mounted ? (isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />) : <div className="h-[18px] w-[18px]" />}
                    </Button>
                </div>
                <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }} className="w-full max-w-[380px]">
                        <div className="mb-8">
                            <h1 className="text-[26px] font-bold tracking-tight text-foreground">Create account</h1>
                            <p className="text-[13px] text-muted-foreground mt-1.5">Get started for free — no credit card required</p>
                        </div>
                        <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}
                            className="w-full h-11 border-border/80 text-foreground hover:bg-muted/60 rounded-lg font-medium text-[13px] transition-all">
                            <svg className="h-[18px] w-[18px] mr-2.5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>
                        <div className="relative my-6">
                            <Separator className="bg-border/60" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">or</span>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-[13px] font-medium text-foreground">Full name</Label>
                                <Input id="name" placeholder="Bhargava Krishna" value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    className="h-11 bg-transparent border-border/70 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-lg text-[13px] font-medium placeholder:text-muted-foreground/40 transition-colors" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-[13px] font-medium text-foreground">Email</Label>
                                <Input id="email" type="email" placeholder="you@company.com" value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    className="h-11 bg-transparent border-border/70 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-lg text-[13px] font-medium placeholder:text-muted-foreground/40 transition-colors" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[13px] font-medium text-foreground">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        className="h-11 pr-11 bg-transparent border-border/70 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-lg text-[13px] font-medium placeholder:text-muted-foreground/40 transition-colors" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/8 border border-destructive/15 text-[13px]">
                                    <Shield className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                    <p className="text-destructive/90 font-medium leading-snug">{error}</p>
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading}
                                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-lg font-semibold text-[13px] transition-all mt-1">
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Creating account…
                                    </span>
                                ) : "Create account"}
                            </Button>
                        </form>
                        <p className="text-center text-[11px] text-muted-foreground/50 mt-5 leading-relaxed">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                        <p className="text-center text-[13px] text-muted-foreground mt-5 lg:hidden">
                            Already have an account?{" "}
                            <Link href="/login" className="text-foreground font-semibold hover:text-primary transition-colors">Sign in</Link>
                        </p>
                    </motion.div>
                </div>
                <div className="relative z-10 flex items-center justify-center pb-6 px-6">
                    <span className="text-[11px] text-muted-foreground/40 font-medium">Secured with 256-bit encryption</span>
                </div>
            </div>
        </div>
    );
}