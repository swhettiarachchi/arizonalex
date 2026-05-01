'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthGate, isProtectedRoute, getProtectedRouteInfo } from '@/components/providers/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Link from 'next/link';
import { ZapIcon } from '@/components/ui/Icons';
import { saveIntendedRoute, trackProtectedPageAttempt } from '@/lib/useGuestAnalytics';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/auth/callback', '/verify-face'];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isLoggedIn, loading } = useAuth();
    const { openAuthModal } = useAuthGate();
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

    // ── Protected Route Guard ──
    // If user is NOT logged in and tries to access a protected route,
    // show a premium "sign in required" placeholder instead of the page content.
    const isProtected = isProtectedRoute(pathname);
    const showProtectedPlaceholder = isProtected && !isLoggedIn && !loading;

    // Track the attempt for analytics
    if (showProtectedPlaceholder) {
        trackProtectedPageAttempt(pathname);
    }

    const routeInfo = showProtectedPlaceholder ? getProtectedRouteInfo(pathname) : null;

    // All other pages show sidebar + mobile nav (even for guests)
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {showProtectedPlaceholder ? (
                    <ProtectedPagePlaceholder
                        routeInfo={routeInfo}
                        pathname={pathname}
                        onSignIn={() => {
                            saveIntendedRoute(pathname);
                            openAuthModal(routeInfo?.desc || 'Sign in to access this page.', pathname);
                        }}
                    />
                ) : (
                    children
                )}
            </main>
            <MobileNav />
        </div>
    );
}

/* ── Protected Page Placeholder Component ── */
function ProtectedPagePlaceholder({
    routeInfo,
    pathname,
    onSignIn,
}: {
    routeInfo: { icon: string; label: string; desc: string } | null;
    pathname: string;
    onSignIn: () => void;
}) {
    return (
        <div className="protected-placeholder">
            {/* Decorative background */}
            <div className="protected-placeholder-bg" />

            <div className="protected-placeholder-card fade-in">
                {/* Icon */}
                <div className="protected-placeholder-icon-wrap">
                    <span className="protected-placeholder-emoji">
                        {routeInfo?.icon || '🔒'}
                    </span>
                </div>

                {/* Title */}
                <h1 className="protected-placeholder-title">
                    {routeInfo?.label || 'Protected Page'}
                </h1>

                {/* Description */}
                <p className="protected-placeholder-desc">
                    {routeInfo?.desc || 'You need to sign in to access this page.'}
                </p>

                {/* CTA Buttons */}
                <div className="protected-placeholder-actions">
                    <button
                        className="btn btn-primary btn-lg protected-placeholder-btn"
                        onClick={onSignIn}
                        id="protected-sign-in"
                    >
                        <ZapIcon size={18} />
                        Sign In
                    </button>
                    <Link
                        href={`/register?returnTo=${encodeURIComponent(pathname)}`}
                        className="btn btn-outline btn-lg protected-placeholder-btn"
                        id="protected-register"
                    >
                        Create Account
                    </Link>
                </div>

                {/* Browse as guest hint */}
                <p className="protected-placeholder-hint">
                    You can still browse public content like profiles, debates, and news without signing in.
                </p>
            </div>
        </div>
    );
}
