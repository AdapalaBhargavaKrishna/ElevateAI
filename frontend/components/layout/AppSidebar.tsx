'use client';

import React, { useEffect } from 'react';
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
    MessageSquare,
    Settings,
    ChevronsLeft,
    X,
    Menu,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SidebarNavItem = ({
    to,
    icon: Icon,
    label,
    badge,
}: {
    to: string;
    icon: any;
    label: string;
    badge?: string;
}) => {
    const pathname = usePathname();
    const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
    const isActive = pathname === to;

    const handleClick = () => {
        if (mobileOpen) {
            setMobileOpen(false);
        }
    };

    const content = (
        <div
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
                        <Badge
                            variant={badge === 'AI' ? 'default' : 'secondary'}
                            className={`
                text-[10px] px-1.5 py-0.5 h-5
                ${badge === 'AI'
                                    ? 'bg-primary/10 text-primary hover:bg-primary/10'
                                    : ''
                                }
                ${badge === 'New'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : ''
                                }
              `}
                        >
                            {badge}
                        </Badge>
                    )}
                </>
            )}
        </div>
    );

    return collapsed && !mobileOpen ? (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={to} onClick={handleClick}>
                        {content}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                    <span>{label}</span>
                    {badge && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 text-xs"
                        >
                            {badge}
                        </Badge>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        <Link href={to} onClick={handleClick}>
            {content}
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
    const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();
    const pathname = usePathname();

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, setMobileOpen]);

    const handleLogoClick = () => {
        if (collapsed) {
            toggle();
        }
    };

    // Desktop Sidebar
    const DesktopSidebar = () => (
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
                    title={collapsed ? 'Click to expand sidebar' : ''}
                >
                    {collapsed ? (
                        <Image
                            src="/favicon.png"
                            alt="Elevate AI"
                            width={40}
                            height={40}
                            className="invert dark:invert-0"
                        />
                    ) : (
                        <Image
                            src="/logo.png"
                            alt="Elevate AI"
                            width={100}
                            height={40}
                            className="invert dark:invert-0 object-contain"
                        />
                    )}
                </div>

                <div className="ml-auto shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

            <ScrollArea className="flex-1">
                <nav className="px-2 py-4 space-y-1">
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

                    <Separator className="my-4" />

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
            </ScrollArea>

            <div className="p-2 border-t border-border">
                <div
                    className={`flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                        }`}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            BK
                        </AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 min-w-0 overflow-hidden"
                            >
                                <p className="text-sm font-medium truncate text-foreground">
                                    Bhargava Krishna
                                </p>
                                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.aside>
    );

    // Mobile Sidebar using shadcn Sheet
    const MobileSidebar = () => (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed bottom-4 right-4 z-50 md:hidden rounded-full h-12 w-12 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                    <div className="flex items-center h-16 border-b border-border px-4">
                        <Image
                            src="/logo.png"
                            alt="Elevate AI"
                            width={100}
                            height={40}
                            className="invert dark:invert-0 object-contain"
                        />
                    </div>

                    <ScrollArea className="flex-1">
                        <nav className="px-2 py-4 space-y-1">
                            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                Main
                            </p>
                            <div className="space-y-0.5">
                                {mainNav.map((item) => (
                                    <Link
                                        key={item.to}
                                        href={item.to}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div
                                            className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer
                        ${pathname === item.to
                                                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                }
                      `}
                                        >
                                            <item.icon
                                                className={`h-5 w-5 shrink-0 ${pathname === item.to ? 'text-primary' : ''
                                                    }`}
                                            />
                                            <span className="flex-1 text-sm font-medium">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <Badge
                                                    variant={item.badge === 'AI' ? 'default' : 'secondary'}
                                                    className={`
                            text-[10px] px-1.5 py-0.5 h-5
                            ${item.badge === 'AI'
                                                            ? 'bg-primary/10 text-primary hover:bg-primary/10'
                                                            : ''
                                                        }
                            ${item.badge === 'New'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : ''
                                                        }
                          `}
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                Tools
                            </p>
                            <div className="space-y-0.5">
                                {secondaryNav.map((item) => (
                                    <Link
                                        key={item.to}
                                        href={item.to}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div
                                            className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer
                        ${pathname === item.to
                                                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                }
                      `}
                                        >
                                            <item.icon
                                                className={`h-5 w-5 shrink-0 ${pathname === item.to ? 'text-primary' : ''
                                                    }`}
                                            />
                                            <span className="flex-1 text-sm font-medium">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-5">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </ScrollArea>

                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    BK
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">
                                    Bhargava Krishna
                                </p>
                                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    return (
        <>
            <DesktopSidebar />
            <MobileSidebar />
        </>
    );
}