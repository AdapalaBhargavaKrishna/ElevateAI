'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.replace('/login');
        } else {
            setChecked(true);
        }
    }, [router]);

    if (!checked) {
        return <div className="min-h-screen bg-background" />;
    }

    return <AppLayout>{children}</AppLayout>;
}