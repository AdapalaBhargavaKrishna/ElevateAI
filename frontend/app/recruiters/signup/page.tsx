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
    BarChart3,
    Building,
    User,
    Phone,
    MapPin,
    CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { api } from '../../lib/axios'
import toast from 'react-hot-toast';

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
import { Checkbox } from "@/components/ui/checkbox";

export default function RecruiterSignupPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { theme, setTheme } = useTheme();

    const [formData, setFormData] = useState({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        position: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
        setError(null);
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            const message = "Passwords do not match";
            setError(message);
            toast.error(message);
            return false;
        }
        if (formData.password.length < 8) {
            const message = "Password must be at least 8 characters";
            setError(message);
            toast.error(message);
            return false;
        }
        if (!agreedToTerms) {
            const message = "Please agree to the Terms of Service and Privacy Policy";
            setError(message);
            toast.error(message);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const { data } = await api.post('/auth/recruiter/signup', {
                fullName: formData.fullName,
                companyName: formData.companyName,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                password: formData.password,
            });
            console.log(data);
            toast.success("Recruiter account created successfully.");
            
            // Redirect to onboarding or dashboard
            if (data.isNewRecruiter) {
                router.replace("/recruiters/onboarding");
            } else {
                router.replace("/recruiters/dashboard");
            }
        } catch (err: any) {
            const message = err.response?.data?.message || "Something went wrong. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
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
                            Candidate Signup
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
                            <span className="text-xs font-medium text-purple-500">Create Recruiter Account</span>
                        </div>
                    </div>

                    <Card className="border-purple-500/20 shadow-xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Join as a Recruiter</CardTitle>
                            <CardDescription>
                                Find and hire the best talent with AI-powered insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Company Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="companyName"
                                            type="text"
                                            placeholder="Acme Inc."
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="recruiter@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Position */}
                                <div className="space-y-2">
                                    <Label htmlFor="position">Your Position</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="position"
                                            type="text"
                                            placeholder="HR Manager / Talent Acquisition"
                                            value={formData.position}
                                            onChange={handleChange}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={handleChange}
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
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-9 pr-9"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={agreedToTerms}
                                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                                    >
                                        I agree to the{" "}
                                        <Link href="/terms" className="text-purple-500 hover:underline">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="text-purple-500 hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </Label>
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating Account..." : "Create Recruiter Account"}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <Separator />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                                    or sign up with
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                className="h-11 w-full"
                                onClick={handleGoogleSignUp}
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
                                Already have a recruiter account?{" "}
                                <Link href="/recruiters/login" className="text-purple-500 hover:underline font-medium">
                                    Sign in
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