'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Completing sign-in...');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const supabase = getSupabase();

                // Check for code in URL params (PKCE flow)
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');

                if (code) {
                    // Exchange the authorization code for a session
                    // The Supabase client has the PKCE code verifier in localStorage
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError || !data.session) {
                        console.error('Code exchange failed:', exchangeError);
                        setStatus('Authentication failed. Redirecting...');
                        setHasError(true);
                        setTimeout(() => router.push('/login?error=auth_failed'), 2000);
                        return;
                    }
                }

                // Check for hash-based tokens (implicit flow fallback)
                // The Supabase client with detectSessionInUrl: true handles this automatically

                // Wait briefly for Supabase to process any URL tokens
                await new Promise(resolve => setTimeout(resolve, 500));

                // Get the current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    console.error('No session after callback:', sessionError);
                    setStatus('Authentication failed. Redirecting...');
                    setHasError(true);
                    setTimeout(() => router.push('/login?error=auth_failed'), 2000);
                    return;
                }

                setStatus('Setting up your account...');

                // Sync the session to httpOnly cookies and ensure profile exists
                const syncRes = await fetch('/api/auth/session-sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: session.access_token,
                        refresh_token: session.refresh_token,
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
                // Use window.location for a full reload to reflect the new auth state
                window.location.href = '/';
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
