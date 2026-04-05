'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { ZapIcon, EyeIcon, EyeOffIcon, ShieldIcon, ArrowLeftIcon } from '@/components/ui/Icons';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikilkixuvtemkpviwpzr.supabase.co';

function LoginPageInner() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // 2FA state
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [devOtp, setDevOtp] = useState('');

    // Show error from OAuth redirect
    useEffect(() => {
        const err = searchParams.get('error');
        if (err === 'auth_failed') setError('Google sign-in failed. Please try again.');
        else if (err === 'no_code') setError('Authorization code missing. Please try again.');
        else if (err === 'server_error') setError('Server error during sign-in. Please try again.');
    }, [searchParams]);

    // ── Google OAuth — direct redirect to Supabase OAuth endpoint ──
    const handleGoogleOAuth = () => {
        setGoogleLoading(true);
        setError('');
        try {
            const redirectTo = `${window.location.origin}/auth/callback`;
            const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&flow_type=implicit`;
            window.location.href = authUrl;
        } catch (err) {
            console.error('Google OAuth redirect error:', err);
            setError('Failed to start Google sign-in. Please try again.');
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            if (result.requires2FA && result.tempToken) {
                setRequires2FA(true);
                setTempToken(result.tempToken);
                if (result.devOtp) setDevOtp(result.devOtp);
            } else {
                router.push('/');
            }
        } else {
            setError(result.error || 'Login failed. Please try again.');
        }
    };

    const handle2FAVerify = async () => {
        if (!otpCode) { setError('Please enter the verification code'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, code: otpCode }),
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/';
            } else {
                setError(data.message || data.error || 'Invalid code');
            }
        } catch {
            setError('Network error');
        }
        setLoading(false);
    };

    // ── 2FA Verification Screen ──
    if (requires2FA) {
        return (
            <div className="auth-page">
                <div className="auth-card fade-in">
                    <div className="auth-logo">
                        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ShieldIcon size={24} /></div>
                        <h1>Two-Factor Verification</h1>
                        <p>Enter the verification code sent to your email</p>
                    </div>

                    {devOtp && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', color: '#a78bfa', textAlign: 'center', marginBottom: 16 }}>
                            Dev OTP: <strong>{devOtp}</strong>
                        </div>
                    )}

                    {error && (
                        <div className="auth-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="otp-code">Verification Code</label>
                            <input
                                id="otp-code"
                                className="form-input"
                                type="text"
                                placeholder="000000"
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value)}
                                maxLength={8}
                                style={{ letterSpacing: 4, textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}
                                autoFocus
                            />
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 6 }}>You can also use a backup code</p>
                        </div>

                        <button
                            onClick={handle2FAVerify}
                            className="btn btn-primary btn-lg auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? <span className="auth-spinner" /> : 'Verify & Sign In'}
                        </button>
                    </div>

                    <div className="auth-footer">
                        <button onClick={() => { setRequires2FA(false); setTempToken(''); setOtpCode(''); setDevOtp(''); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ArrowLeftIcon size={14} /> Back to login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Login Screen ──
    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Arizonalex</h1>
                    <p>The Premier Network for Politics, Business & Crypto</p>
                </div>

                {/* Google Sign-In via Supabase OAuth */}
                <button
                    className="oauth-btn google-oauth-btn"
                    onClick={handleGoogleOAuth}
                    disabled={googleLoading}
                    id="google-oauth-btn"
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)',
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                >
                    {googleLoading ? (
                        <span className="auth-spinner" />
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

                <div className="auth-divider">or sign in with email</div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email Address</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            <input
                                id="login-email"
                                className="form-input auth-input-with-icon"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
                        </div>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <input
                                id="login-password"
                                className="form-input auth-input-with-icon"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPass(!showPass)}
                                tabIndex={-1}
                                aria-label={showPass ? 'Hide password' : 'Show password'}
                            >
                                {showPass ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-spinner" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="auth-link">Create Account</Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="auth-page">
                <div className="auth-card fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <span className="auth-spinner" />
                </div>
            </div>
        }>
            <LoginPageInner />
        </Suspense>
    );
}
