'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    collapsed: boolean;
    toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) {
            setCollapsed(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    const toggle = () => setCollapsed(prev => !prev);

    return (
        <SidebarContext.Provider value={{ collapsed, toggle }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}