'use client';

import { motion } from "framer-motion";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Mail,
    Lock,
    Sun,
    Moon,
    Building2,
    Briefcase,
    Users,
    BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { api } from '../../lib/axios'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function RecruiterLoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { theme, setTheme } = useTheme();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam === "email_exists_local") {
            alert('This email is registered with a password. Please log in normally.')
        }
    }, [searchParams]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/recruiter/login', { email, password });
            console.log(data);
            if (data.isNewRecruiter) {
                router.replace("/recruiters/onboarding");
            } else {
                router.replace("/recruiters/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/recruiter/google`;
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
                {/* Background Effects - Purple tint */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl" />
                </div>

                {/* Top Navigation */}
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/login")}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Candidate Login
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={toggleTheme}
                                    size="icon"
                                    className="rounded-full"
                                >
                                    {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle theme</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Logo and Badge */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Image
                                src="/logo.png"
                                alt="ElevateAI"
                                width={100}
                                height={30}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <Building2 className="h-3.5 w-3.5 text-purple-500" />
                            <span className="text-xs font-medium text-purple-500">Recruiter Portal</span>
                        </div>
                    </div>

                    <Card className="border-purple-500/20 shadow-xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome Back, Recruiter</CardTitle>
                            <CardDescription>
                                Access your dashboard to find and hire top talent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="recruiter@company.com"
                                            value={email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link 
                                            href="/recruiters/forgot-password" 
                                            className="text-xs text-purple-500 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                            className="pl-9 pr-9"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign In as Recruiter"}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <Separator />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                                    or continue with
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                className="h-11 w-full"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>

                            <p className="text-center text-sm text-muted-foreground mt-6">
                                Don't have a recruiter account?{" "}
                                <Link href="/recruiters/signup" className="text-purple-500 hover:underline font-medium">
                                    Sign up as Recruiter
                                </Link>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Features Footer */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Briefcase className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Post Jobs</p>
                        </div>
                        <div className="text-center">
                            <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Find Talent</p>
                        </div>
                        <div className="text-center">
                            <BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Analytics</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </TooltipProvider>
    );
}