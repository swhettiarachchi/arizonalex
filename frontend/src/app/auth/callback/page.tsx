'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Completing sign-in...');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check for code in URL params (authorization code flow)
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');

                // Check for tokens in URL hash (implicit flow)
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

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

                    if (!syncRes.ok) {
                        const errData = await syncRes.json().catch(() => ({}));
                        console.error('Session sync failed:', errData);
                        setStatus('Account setup failed. Redirecting...');
                        setHasError(true);
                        setTimeout(() => router.push('/login?error=server_error'), 2000);
                        return;
                    }

                    setStatus('Success! Redirecting...');
                    window.location.href = '/';
                    return;
                }

                if (code) {
                    // Authorization code flow — exchange code via Supabase client
                    setStatus('Exchanging authorization code...');
                    try {
                        const { getSupabase } = await import('@/lib/supabase');
                        const supabase = getSupabase();
                        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                        if (exchangeError || !data.session) {
                            console.error('Code exchange failed:', exchangeError);
                            setStatus('Authentication failed. Redirecting...');
                            setHasError(true);
                            setTimeout(() => router.push('/login?error=auth_failed'), 2000);
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

                        if (!syncRes.ok) {
                            console.error('Session sync failed');
                            setStatus('Account setup failed. Redirecting...');
                            setHasError(true);
                            setTimeout(() => router.push('/login?error=server_error'), 2000);
                            return;
                        }

                        setStatus('Success! Redirecting...');
                        window.location.href = '/';
                        return;
                    } catch (err) {
                        console.error('Code exchange error:', err);
                        // Fallback: try server-side code exchange
                        const serverRes = await fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`);
                        if (serverRes.redirected) {
                            window.location.href = serverRes.url;
                            return;
                        }
                        setStatus('Authentication failed. Redirecting...');
                        setHasError(true);
                        setTimeout(() => router.push('/login?error=auth_failed'), 2000);
                        return;
                    }
                }

                // No code or tokens found
                setStatus('No authentication data found. Redirecting...');
                setHasError(true);
                setTimeout(() => router.push('/login?error=no_code'), 2000);
            } catch (err) {
                console.error('Auth callback error:', err);
                setStatus('Something went wrong. Redirecting...');
                setHasError(true);
                setTimeout(() => router.push('/login?error=server_error'), 2000);
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 220, gap: 16, textAlign: 'center',
            }}>
                {!hasError && <span className="auth-spinner" />}
                {hasError && (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                )}
                <p style={{
                    color: hasError ? 'var(--danger)' : 'var(--text-secondary)',
                    fontSize: '0.9rem', fontWeight: 500,
                }}>
                    {status}
                </p>
            </div>
        </div>
    );
}
