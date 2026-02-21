'use client';

import React from 'react';
import { Search, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function TopBar() {
    const { theme, setTheme } = useTheme();

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        suppressHydrationWarning
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="text-muted-foreground hover:text-foreground"
                        suppressHydrationWarning
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-4 text-black" />}
                    </Button>

                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </div>
        </header>
    );
}