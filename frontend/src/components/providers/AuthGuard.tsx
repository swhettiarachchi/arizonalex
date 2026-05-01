'use client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useAuth } from './AuthProvider';
import { XIcon, ZapIcon, EyeIcon, EyeOffIcon } from '../ui/Icons';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { saveIntendedRoute, trackBlockedInteraction } from '@/lib/useGuestAnalytics';

/* ── Protected Route Config ── */
export const PROTECTED_ROUTES: Record<string, { icon: string; label: string; desc: string }> = {
    '/notifications': { icon: '🔔', label: 'Notifications', desc: 'Sign in to see your notifications, mentions, and activity.' },
    '/messages': { icon: '✉️', label: 'Messages', desc: 'Sign in to send and receive direct messages.' },
    '/wallet': { icon: '💰', label: 'Wallet', desc: 'Sign in to manage your debate credits and earnings.' },
    '/create-post': { icon: '✏️', label: 'Create Post', desc: 'Sign in to create posts and share your thoughts.' },
    '/bookmarks': { icon: '🔖', label: 'Bookmarks', desc: 'Sign in to view your saved posts and bookmarks.' },
    '/settings': { icon: '⚙️', label: 'Settings', desc: 'Sign in to manage your account settings.' },
    '/admin': { icon: '🛡️', label: 'Admin', desc: 'Sign in to access the admin dashboard.' },
    '/verify': { icon: '✅', label: 'Verification', desc: 'Sign in to get your account verified.' },
    '/verify-face': { icon: '🪪', label: 'Face Verification', desc: 'Sign in to complete face verification.' },
    '/politics': { icon: '🏛️', label: 'Politics Hub', desc: 'Sign in to access polls, trackers, and political analytics.' },
    '/profile': { icon: '👤', label: 'Your Profile', desc: 'Sign in to view and manage your profile.' },
};

/** Check if a pathname is protected (supports nested routes like /settings/security) */
export function isProtectedRoute(pathname: string): boolean {
    // /profile/:username is public, but /profile (own profile) is protected
    if (pathname.startsWith('/profile/')) return false;
    return Object.keys(PROTECTED_ROUTES).some(route => pathname === route || pathname.startsWith(route + '/'));
}

/** Get the route info for a protected path */
export function getProtectedRouteInfo(pathname: string): { icon: string; label: string; desc: string } | null {
    // Direct match
    if (PROTECTED_ROUTES[pathname]) return PROTECTED_ROUTES[pathname];
    // Nested match (e.g. /settings/security -> /settings)
    const parentRoute = Object.keys(PROTECTED_ROUTES).find(route => pathname.startsWith(route + '/'));
    if (parentRoute) return PROTECTED_ROUTES[parentRoute];
    return null;
}

/* ── Context ── */
interface AuthGateContextType {
    requireAuth: (action: () => void, contextMessage?: string) => void;
    openAuthModal: (contextMessage?: string, returnTo?: string) => void;
    closeAuthModal: () => void;
}

const AuthGateContext = createContext<AuthGateContextType>({
    requireAuth: () => { },
    openAuthModal: () => { },
    closeAuthModal: () => { },
});

/* ── Provider ── */
export function AuthGateProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [contextMessage, setContextMessage] = useState('');
    const [returnToRoute, setReturnToRoute] = useState('');

    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Close modal on escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        if (showModal) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [showModal]);

    // Lock body scroll when modal open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setShowPass(false);
        setLoginLoading(false);
        setGoogleLoading(false);
        setLoginError('');
        setLoginSuccess(false);
    };

    const openAuthModal = useCallback((message?: string, returnTo?: string) => {
        if (isLoggedIn) return;
        setContextMessage(message || '');
        setReturnToRoute(returnTo || '');
        if (returnTo) saveIntendedRoute(returnTo);
        resetForm();
        setShowModal(true);
        trackBlockedInteraction();
    }, [isLoggedIn]);

    const closeAuthModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const requireAuth = useCallback((action: () => void, message?: string) => {
        if (isLoggedIn) {
            action();
        } else {
            openAuthModal(message);
        }
    }, [isLoggedIn, openAuthModal]);

    // ── Email/Password Login ──
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setLoginError('Please fill in all fields');
            return;
        }
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success && data.user) {
                setLoginSuccess(true);
                const destination = returnToRoute || '/';
                setTimeout(() => {
                    setShowModal(false);
                    window.location.replace(destination);
                }, 800);
            } else {
                setLoginError(data.error || 'Login failed. Please try again.');
                setLoginLoading(false);
            }
        } catch {
            setLoginError('Network error. Please try again.');
            setLoginLoading(false);
        }
    };

    // ── Google OAuth ──
    const handleGoogleOAuth = async () => {
        setGoogleLoading(true);
        setLoginError('');
        // Save intended route before OAuth redirect
        if (returnToRoute) saveIntendedRoute(returnToRoute);
        try {
            const supabase = getSupabase();
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (oauthError) {
                setLoginError('Failed to start Google sign-in.');
                setGoogleLoading(false);
            }
        } catch {
            setLoginError('Failed to start Google sign-in.');
            setGoogleLoading(false);
        }
    };

    // ── Navigate to full login/register page ──
    const goToLoginPage = () => {
        setShowModal(false);
        const params = returnToRoute ? `?returnTo=${encodeURIComponent(returnToRoute)}` : '';
        router.push(`/login${params}`);
    };

    const goToRegisterPage = () => {
        setShowModal(false);
        const params = returnToRoute ? `?returnTo=${encodeURIComponent(returnToRoute)}` : '';
        router.push(`/register${params}`);
    };

    return (
        <AuthGateContext.Provider value={{ requireAuth, openAuthModal, closeAuthModal }}>
            {children}
            {showModal && typeof document !== 'undefined' && createPortal(
                <div className="auth-gate-overlay" onClick={closeAuthModal}>
                    <div className="auth-gate-modal fade-in" onClick={e => e.stopPropagation()}>
                        {/* Close button */}
                        <button className="auth-gate-close" onClick={closeAuthModal} aria-label="Close">
                            <XIcon size={20} />
                        </button>

                        {/* Header */}
                        <div className="auth-gate-header">
                            <div className="auth-gate-logo">
                                <ZapIcon size={24} />
                            </div>
                            <h2 className="auth-gate-title">
                                {loginSuccess ? 'Welcome back!' : 'Sign in to Arizonalex'}
                            </h2>
                            {contextMessage && !loginSuccess && (
                                <p className="auth-gate-context">{contextMessage}</p>
                            )}
                            {!contextMessage && !loginSuccess && (
                                <p className="auth-gate-context">
                                    Join the premier network for politics, business &amp; crypto.
                                </p>
                            )}
                        </div>

                        {loginSuccess ? (
                            /* ── Success State ── */
                            <div className="auth-gate-success">
                                <div className="auth-gate-success-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <p className="auth-gate-success-text">Login successful! Redirecting...</p>
                                <span className="auth-spinner" />
                            </div>
                        ) : (
                            /* ── Login Form ── */
                            <>
                                {/* Google OAuth */}
                                <button
                                    className="auth-gate-google-btn"
                                    onClick={handleGoogleOAuth}
                                    disabled={googleLoading}
                                    id="auth-gate-google"
                                >
                                    {googleLoading ? (
                                        <span className="auth-spinner" style={{ width: 18, height: 18 }} />
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 48 48">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </button>

                                <div className="auth-gate-divider">
                                    <span>or sign in with email</span>
                                </div>

                                {/* Email/Password form */}
                                <form onSubmit={handleEmailLogin} className="auth-gate-form">
                                    <div className="auth-gate-field">
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            autoComplete="email"
                                            className="auth-gate-input"
                                            id="auth-gate-email"
                                        />
                                    </div>
                                    <div className="auth-gate-field">
                                        <div className="auth-gate-password-wrap">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                placeholder="Password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                autoComplete="current-password"
                                                className="auth-gate-input"
                                                id="auth-gate-password"
                                            />
                                            <button
                                                type="button"
                                                className="auth-gate-eye"
                                                onClick={() => setShowPass(!showPass)}
                                                tabIndex={-1}
                                                aria-label={showPass ? 'Hide password' : 'Show password'}
                                            >
                                                {showPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {loginError && (
                                        <div className="auth-gate-error">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                            {loginError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="auth-gate-submit"
                                        disabled={loginLoading}
                                        id="auth-gate-submit"
                                    >
                                        {loginLoading ? <span className="auth-spinner" style={{ width: 18, height: 18 }} /> : 'Sign In'}
                                    </button>
                                </form>

                                {/* Footer links */}
                                <div className="auth-gate-footer">
                                    <button className="auth-gate-link" onClick={goToLoginPage}>
                                        Forgot password?
                                    </button>
                                    <div className="auth-gate-footer-register">
                                        Don&apos;t have an account?{' '}
                                        <button className="auth-gate-link auth-gate-link-primary" onClick={goToRegisterPage}>
                                            Create Account
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </AuthGateContext.Provider>
    );
}

export const useAuthGate = () => useContext(AuthGateContext);
