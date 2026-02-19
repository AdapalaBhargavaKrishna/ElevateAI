'use client';

import { motion } from "framer-motion";
import {
  Mic, FileText, Map, TrendingUp, Zap, Brain,
  ChevronRight, ArrowRight, Menu, X,
  Users, Bot, Network, History, GanttChart, BarChart3,
  Award, Target, Clock, BadgeCheck, Github,
  BookOpen, Briefcase, Layers,
  MessageSquare, Bell, UserCog, Trophy, Activity, GitBranch,
  Share2, Link2, Palette,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { coreFeatures } from "@/data/coreFeatures";
import { advancedFeatures } from "@/data/advancedFeatures";
import { steps } from "@/data/steps";
import { faqs } from "@/data/faqs";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const milestones = [
  { value: "5", label: "Specialized AI Agents", icon: Bot },
  { value: "24/7", label: "AI Availability", icon: Clock },
  { value: "Real-time", label: "Analysis", icon: Zap },
];

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const Button = ({ children, onClick, variant = 'primary', size = 'default', className = '', ...props }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    [key: string]: any;
  }) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-full';
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
    };
    const sizes = {
      default: 'h-10 px-5 py-2 text-sm',
      sm: 'h-9 rounded-full px-4 text-xs',
      lg: 'h-12 rounded-full px-8 text-base',
      icon: 'h-10 w-10 rounded-full p-0',
    };
    return (
      <button onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string;[key: string]: any }) => (
    <div className={`rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 ${className}`} {...props}>
      {children}
    </div>
  );

  const CardContent = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string;[key: string]: any }) => (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 py-2'
        : 'bg-transparent py-4'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Image src="/logo.png" alt="ElevateAI" width={100} height={30} className="h-8 w-auto object-contain" priority />
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent/50">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </Button>
            <Button variant="outline" size="default" onClick={() => router.push("/login")}>Log in</Button>
            <Button size="default" onClick={() => router.push("/signup")}>Get Started</Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={mobileMenuOpen ? "open" : "closed"}
          variants={{ open: { opacity: 1, height: "auto", marginTop: "1rem" }, closed: { opacity: 0, height: 0, marginTop: 0 } }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/50"
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-accent/50 rounded-xl transition-colors">
                {link.label}
              </a>
            ))}
            <div className="h-px bg-border/50 my-2" />
            <Button variant="outline" size="lg" className="w-full justify-center" onClick={() => router.push("/login")}>Log in</Button>
            <Button size="lg" className="w-full justify-center bg-primary text-primary-foreground" onClick={() => router.push("/signup")}>Get Started</Button>
          </div>
        </motion.div>
      </nav>

      <section className="pt-36 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
            <Zap className="h-3.5 w-3.5" /> Introducing ElevateAI Beta
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Ace Every Interview. <span className="text-primary">Land Your Dream Job.</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            We're building the future of career preparation. Join our beta and be among the first to experience AI-powered interview coaching.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/signup")}>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/demo")}>Watch Demo</Button>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-8 mt-16">
            {milestones.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Core Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Your Complete Career Ecosystem</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Six integrated modules working together to accelerate your career journey.</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {coreFeatures.map((cat, idx) => (
              <button key={idx} onClick={() => setActiveCategory(idx)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === idx ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent text-muted-foreground'}`}>
                {cat.category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreFeatures[activeCategory].features.map((feature, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full hover:border-primary/30 hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="advanced" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Advanced Technology</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Powered by Cutting-Edge AI</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Multi-agent architecture with long-term memory and real-time analytics.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full hover:border-primary/30 group">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={8}
            className="mt-16 p-8 rounded-3xl bg-card border border-border/50">
            <h3 className="text-2xl font-bold text-center mb-8">Five Specialized AI Agents in Collaboration</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "Interview Evaluation", icon: Mic },
                { name: "Resume Optimization", icon: FileText },
                { name: "Skill Gap Analysis", icon: Target },
                { name: "Career Strategy", icon: Map },
                { name: "HR Evaluation", icon: Users },
              ].map((agent, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <agent.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <span className="text-xs font-medium">{agent.name}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">Agents collaborate in real-time, sharing insights to provide unified career guidance</p>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Four Steps to Your Dream Career</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex gap-5 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <span className="text-5xl font-black text-primary/30 shrink-0 group-hover:scale-110 transition-transform">{s.num}</span>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.details key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-colors">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-medium text-foreground hover:text-primary transition-colors list-none">
                  {f.q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">

          <div className="max-w-sm">
            <Image
              src="/logo.png"
              alt="ElevateAI"
              width={120}
              height={40}
              className="h-7 w-auto object-contain mb-4"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              ElevateAI is building the future of AI-powered career preparation —
              helping students and professionals ace interviews with intelligent,
              real-time feedback.
            </p>

            <p className="text-xs text-muted-foreground mt-4">
              🚀 Currently in Beta
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>


          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">
              Stay Connected
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Join early access and be part of the journey.
            </p>

            <button
              onClick={() => router.push("/signup")}
              className="gradient-bg text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 transition"
            >
              Get Early Access
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ElevateAI. All rights reserved.
        </div>
      </footer>

    </div>
  );
}