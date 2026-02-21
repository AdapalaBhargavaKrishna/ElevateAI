'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    Mic,
    FileText,
    Map,
    BarChart3,
    Globe,
    MessageSquare,
    Settings,
    Sparkles,
    ChevronsLeft,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

const SidebarNavItem = ({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: string }) => {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    const isActive = pathname === to;

    return (
        <Link href={to}>
            <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
          flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer
          ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}
          ${isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
        `}
            >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />

                {!collapsed && (
                    <>
                        <span className="flex-1 text-sm font-medium">{label}</span>
                        {badge && (
                            <span className={`
                text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                ${badge === 'AI' ? 'bg-primary/10 text-primary' : ''}
                ${badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
              `}>
                                {badge}
                            </span>
                        )}
                    </>
                )}
            </motion.div>
        </Link>
    );
};

const mainNav = [
    { to: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/user/profile', icon: User, label: 'Profile' },
    { to: '/user/interview', icon: Mic, label: 'Interview Coach', badge: 'AI' },
    { to: '/user/resume', icon: FileText, label: 'Resume Analyzer', badge: 'AI' },
    { to: '/user/roadmap', icon: Map, label: 'Career Roadmap' },
    { to: '/user/analytics', icon: BarChart3, label: 'Analytics' },
];

const secondaryNav = [
    { to: '/user/assistant', icon: MessageSquare, label: 'AI Assistant', badge: 'New' },
    { to: '/user/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
    const { collapsed, toggle } = useSidebar();

    const handleLogoClick = () => {
        if (collapsed) {
            toggle();
        }
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden md:flex shrink-0 flex-col border-r border-border bg-card h-screen sticky top-0 overflow-hidden"
        >
            <div className="flex items-center h-16 border-b border-border px-3 gap-2.5">
                <div
                    className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleLogoClick}
                    title={collapsed ? "Click to expand sidebar" : ""}
                >
                    {collapsed ? (
                        <Image
                            src="/favicon.png"
                            alt="Elevate AI"
                            width={60}
                            height={60}
                            className="invert dark:invert-0"
                        />
                    ) : (
                        <Image
                            src="/logo.png"
                            alt="Elevate AI"
                            width={100}
                            height={100}
                            className="invert dark:invert-0"
                        />
                    )}
                </div>

                <div className="ml-auto shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.div
                            animate={{ rotate: collapsed ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </motion.div>
                    </Button>
                </div>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
                        >
                            Main
                        </motion.p>
                    )}
                </AnimatePresence>
                <div className="space-y-0.5">
                    {mainNav.map((item) => (
                        <SidebarNavItem key={item.to} {...item} />
                    ))}
                </div>

                <div className="my-4 border-t border-border" />

                <AnimatePresence>
                    {!collapsed && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
                        >
                            Tools
                        </motion.p>
                    )}
                </AnimatePresence>
                <div className="space-y-0.5">
                    {secondaryNav.map((item) => (
                        <SidebarNavItem key={item.to} {...item} />
                    ))}
                </div>
            </nav>

            <div className="p-2 border-t border-border">
                <div
                    className={`flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                        }`}
                >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                        BK
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 min-w-0 overflow-hidden"
                            >
                                <p className="text-sm font-medium truncate text-foreground">Bhargava Krishna</p>
                                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.aside>
    );
}