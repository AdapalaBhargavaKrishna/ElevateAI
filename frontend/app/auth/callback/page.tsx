'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const redirect = searchParams.get('redirect') || '/user/dashboard';

        if (accessToken && refreshToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            router.replace(redirect);
        } else {
            router.replace('/login?error=oauth_failed');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <p className="text-muted-foreground text-sm">Signing you in...</p>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <CallbackHandler />
        </Suspense>
    );
}