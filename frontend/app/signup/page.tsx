'use client';

import { motion } from "framer-motion";
import {
    Sparkles,
    ArrowLeft,
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Sun,
    Moon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/dashboard");
    };

    const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: {
        children: React.ReactNode;
        onClick?: () => void;
        variant?: 'primary' | 'outline' | 'ghost';
        className?: string;
        [key: string]: any;
    }) => {
        const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-lg';
        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
            outline: 'border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground',
            ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
        };
        return (
            <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>
                {children}
            </button>
        );
    };

    const Input = ({ className = '', icon: Icon, ...props }: {
        className?: string;
        icon?: React.ElementType;
        [key: string]: any;
    }) => (
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
            <input
                className={`w-full h-10 px-3 ${Icon ? 'pl-9' : ''} rounded-lg border border-input bg-background/50 backdrop-blur-sm text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
                {...props}
            />
        </div>
    );

    const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <div className={`rounded-2xl border bg-card/80 backdrop-blur-xl text-card-foreground shadow-xl ${className}`}>
            {children}
        </div>
    );

    const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <div className={`flex flex-col space-y-1.5 p-6 pb-2 ${className}`}>
            {children}
        </div>
    );

    const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <h3 className={`text-2xl font-bold leading-none tracking-tight ${className}`}>
            {children}
        </h3>
    );

    const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <p className={`text-sm text-muted-foreground ${className}`}>
            {children}
        </p>
    );

    const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <div className={`p-6 pt-4 ${className}`}>
            {children}
        </div>
    );

    const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
        <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
            {children}
        </label>
    );

    const Separator = ({ className = '' }: { className?: string }) => (
        <div className={`relative h-px w-full bg-border ${className}`} />
    );

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16">
                <button onClick={() => router.push("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <Button variant="ghost" onClick={toggleTheme} className="rounded-full w-10 h-10 p-0">
                    {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative z-10"
            >

                <div className="flex items-center justify-center gap-2 mb-8">
                    <Image src="/logo.png" alt="ElevateAI" width={100} height={30} className="h-8 w-auto object-contain invert dark:invert-0" priority />
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Create your account</CardTitle>
                        <CardDescription>
                            Start your career journey today
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    icon={User}
                                    placeholder="Bhargava Krishna"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    icon={Mail}
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        icon={Lock}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        className="pr-9"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11">
                                Create Account
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                                or continue with
                            </span>
                        </div>

                        <Button variant="outline" className="h-11 w-full">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Log in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}