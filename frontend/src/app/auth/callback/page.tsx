'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Completing sign-in...');
    const [hasError, setHasError] = useState(false);
    const [errorDetail, setErrorDetail] = useState('');

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
                        // Check for provider mismatch error
                        if (syncData.errorType === 'provider_mismatch') {
                            setStatus(syncData.error || 'Wrong login method');
                            setErrorDetail(syncData.provider === 'email'
                                ? 'Please go to the login page and use your email and password.'
                                : 'Please go to the login page and use Google sign-in.');
                            setHasError(true);
                            return; // Don't auto-redirect — show error with link
                        }

                        console.error('Session sync failed:', syncData);
                        setStatus('Account setup failed. Redirecting...');
                        setHasError(true);
                        setTimeout(() => router.push('/login?error=server_error'), 2500);
                        return;
                    }

                    setStatus('Success! Redirecting...');
                    window.location.href = '/';
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
                            setStatus('Authentication failed. Redirecting...');
                            setHasError(true);
                            setTimeout(() => router.push('/login?error=auth_failed'), 2500);
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
                                    ? 'Please go to the login page and use your email and password.'
                                    : 'Please go to the login page and use Google sign-in.');
                                setHasError(true);
                                return;
                            }

                            setStatus('Account setup failed. Redirecting...');
                            setHasError(true);
                            setTimeout(() => router.push('/login?error=server_error'), 2500);
                            return;
                        }

                        setStatus('Success! Redirecting...');
                        window.location.href = '/';
                        return;
                    } catch (err) {
                        console.error('Code exchange error:', err);
                        setStatus('Authentication failed. Redirecting...');
                        setHasError(true);
                        setTimeout(() => router.push('/login?error=auth_failed'), 2500);
                        return;
                    }
                }

                // No code or tokens found
                setStatus('No authentication data found. Redirecting...');
                setHasError(true);
                setTimeout(() => router.push('/login?error=no_code'), 2500);
            } catch (err) {
                console.error('Auth callback error:', err);
                setStatus('Something went wrong. Redirecting...');
                setHasError(true);
                setTimeout(() => router.push('/login?error=server_error'), 2500);
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 240, gap: 16, textAlign: 'center',
                padding: '32px 24px',
            }}>
                {!hasError && <span className="auth-spinner" />}
                {hasError && (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--warning, #f59e0b)" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                )}
                <p style={{
                    color: hasError ? 'var(--warning, #f59e0b)' : 'var(--text-secondary)',
                    fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5,
                }}>
                    {status}
                </p>
                {errorDetail && (
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem', marginTop: -8,
                    }}>
                        {errorDetail}
                    </p>
                )}
                {hasError && (
                    <Link
                        href="/login"
                        style={{
                            marginTop: 8,
                            padding: '10px 24px',
                            borderRadius: 8,
                            background: 'var(--primary)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            transition: 'opacity 0.15s',
                        }}
                    >
                        Go to Login
                    </Link>
                )}
            </div>
        </div>
    );
}
