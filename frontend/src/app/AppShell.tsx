'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { BellIcon, MailIcon, LandmarkIcon, BookmarkIcon } from '@/components/ui/Icons';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/auth/callback', '/verify-face'];
const PROTECTED_PAGES = ['/notifications', '/messages', '/politics', '/bookmarks'];

const PROTECTED_PAGE_INFO: Record<string, { icon: React.ReactNode; label: string; desc: string }> = {
    '/notifications': { icon: <BellIcon size={28} />, label: 'Notifications', desc: 'Sign in to see your notifications, mentions, and activity.' },
    '/messages': { icon: <MailIcon size={28} />, label: 'Messages', desc: 'Sign in to send and receive direct messages.' },
    '/politics': { icon: <LandmarkIcon size={28} />, label: 'Politics Hub', desc: 'Sign in to access polls, promise trackers, events, and political analytics.' },
    '/bookmarks': { icon: <BookmarkIcon size={28} />, label: 'Bookmarks', desc: 'Sign in to view your saved posts and bookmarks.' },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const [intercepting, setIntercepting] = useState(false);

    // ── Global OAuth Token Interceptor ──
    // If Supabase redirects tokens to ANY page (e.g. root `/`) via hash fragment,
    // catch them and redirect to /auth/callback to process properly.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hash = window.location.hash;
        if (!hash) return;

        // Check if the hash contains OAuth tokens
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken && pathname !== '/auth/callback') {
            // Tokens landed on the wrong page — redirect to callback handler
            setIntercepting(true);
            window.location.replace(`/auth/callback${hash}`);
            return;
        }
    }, [pathname]);

    // Show loading state while intercepting OAuth tokens
    if (intercepting) {
        return (
            <main className="main-content">
                <div className="auth-page">
                    <div className="auth-card fade-in" style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', minHeight: 200, gap: 16, textAlign: 'center',
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}>
                            <span className="auth-spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                        </div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Completing sign-in...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // Login/register pages render without the app shell
    if (isAuthPage) {
        return <main className="main-content">{children}</main>;
    }

    // All other pages show sidebar + mobile nav (even for guests)
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
            <MobileNav />
        </div>
    );
}
