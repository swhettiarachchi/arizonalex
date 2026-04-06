'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Completing sign-in...');
    const [hasError, setHasError] = useState(false);
    const [errorDetail, setErrorDetail] = useState('');
    const [errorType, setErrorType] = useState<'provider_mismatch' | 'general' | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check for tokens in URL hash (implicit flow)
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                // Check for code in URL params (authorization code flow)
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');

                if (accessToken && refreshToken) {
                    // Implicit flow — tokens are in the URL hash
                    setStatus('Setting up your account...');

                    const syncRes = await fetch('/api/auth/session-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        }),
                    });

                    const syncData = await syncRes.json().catch(() => ({}));

                    if (!syncRes.ok) {
                        if (syncData.errorType === 'provider_mismatch') {
                            setStatus(syncData.error || 'Wrong login method');
                            setErrorDetail(syncData.provider === 'email'
                                ? 'This email is already registered with email/password. Please go to the login page and use your email and password instead.'
                                : 'Please go to the login page and use Google sign-in.');
                            setHasError(true);
                            setErrorType('provider_mismatch');
                            return;
                        }

                        console.error('Session sync failed:', syncData);
                        setStatus('Account setup failed');
                        setErrorDetail('Something went wrong during sign-in. Please try again.');
                        setHasError(true);
                        setErrorType('general');
                        return;
                    }

                    setStatus('Success! Redirecting to home...');
                    setTimeout(() => {
                        window.location.replace('/');
                    }, 500);
                    return;
                }

                if (code) {
                    // Authorization code flow
                    setStatus('Exchanging authorization code...');
                    try {
                        const { getSupabase } = await import('@/lib/supabase');
                        const supabase = getSupabase();
                        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                        if (exchangeError || !data.session) {
                            console.error('Code exchange failed:', exchangeError);
                            setStatus('Authentication failed');
                            setErrorDetail('Could not complete Google sign-in. Please try again.');
                            setHasError(true);
                            setErrorType('general');
                            return;
                        }

                        setStatus('Setting up your account...');
                        const syncRes = await fetch('/api/auth/session-sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                access_token: data.session.access_token,
                                refresh_token: data.session.refresh_token,
                            }),
                        });

                        const syncData = await syncRes.json().catch(() => ({}));

                        if (!syncRes.ok) {
                            if (syncData.errorType === 'provider_mismatch') {
                                setStatus(syncData.error || 'Wrong login method');
                                setErrorDetail(syncData.provider === 'email'
                                    ? 'This email is already registered with email/password. Please go to the login page and use your email and password instead.'
                                    : 'Please go to the login page and use Google sign-in.');
                                setHasError(true);
                                setErrorType('provider_mismatch');
                                return;
                            }

                            setStatus('Account setup failed');
                            setErrorDetail('Something went wrong during sign-in. Please try again.');
                            setHasError(true);
                            setErrorType('general');
                            return;
                        }

                        setStatus('Success! Redirecting to home...');
                        setTimeout(() => {
                            window.location.replace('/');
                        }, 500);
                        return;
                    } catch (err) {
                        console.error('Code exchange error:', err);
                        setStatus('Authentication failed');
                        setErrorDetail('Could not complete Google sign-in. Please try again.');
                        setHasError(true);
                        setErrorType('general');
                        return;
                    }
                }

                // No code or tokens found
                setStatus('No authentication data found');
                setErrorDetail('The sign-in process was interrupted. Please try again.');
                setHasError(true);
                setErrorType('general');
            } catch (err) {
                console.error('Auth callback error:', err);
                setStatus('Something went wrong');
                setErrorDetail('An unexpected error occurred. Please try again.');
                setHasError(true);
                setErrorType('general');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 280, gap: 16, textAlign: 'center',
                padding: '32px 24px',
            }}>
                {!hasError && (
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}>
                        <span className="auth-spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    </div>
                )}
                {hasError && (
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: errorType === 'provider_mismatch' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={errorType === 'provider_mismatch' ? '#f59e0b' : '#ef4444'} strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                )}

                <p style={{
                    color: hasError ? (errorType === 'provider_mismatch' ? '#f59e0b' : '#ef4444') : 'var(--text-primary)',
                    fontSize: '1rem', fontWeight: 700, lineHeight: 1.5,
                }}>
                    {status}
                </p>

                {errorDetail && (
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem', marginTop: -8, lineHeight: 1.5,
                        maxWidth: 360,
                    }}>
                        {errorDetail}
                    </p>
                )}

                {hasError && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, width: '100%', maxWidth: 280 }}>
                        <Link
                            href="/login"
                            style={{
                                padding: '10px 24px',
                                borderRadius: 8,
                                background: 'var(--primary)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                textAlign: 'center',
                                transition: 'opacity 0.15s',
                            }}
                        >
                            Go to Login
                        </Link>
                        <Link
                            href="/register"
                            style={{
                                padding: '10px 24px',
                                borderRadius: 8,
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                textAlign: 'center',
                                transition: 'opacity 0.15s',
                            }}
                        >
                            Create Account
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
