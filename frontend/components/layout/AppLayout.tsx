'use client';

import React from 'react';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { SidebarProvider } from '@/context/SidebarContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}