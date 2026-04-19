'use client';

import React, { useState } from 'react';
import { Moon, Sun, User, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSidebar } from '@/context/SidebarContext';
import { api } from '../../app/lib/axios'
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

export function TopBar() {
    const { theme, setTheme } = useTheme();
    const { toggleMobile } = useSidebar();
    const router = useRouter();


    const handleLogout = async () => {
        try {
            await api.post(
                "/auth/logout",
                {},
                {
                    withCredentials: true,
                }
            );
            router.replace('/login')
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={toggleMobile}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}