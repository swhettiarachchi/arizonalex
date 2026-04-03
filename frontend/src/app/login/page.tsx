'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { ZapIcon, EyeIcon, EyeOffIcon, ShieldIcon, ArrowLeftIcon } from '@/components/ui/Icons';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [gsiReady, setGsiReady] = useState(false);

    // 2FA state
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [devOtp, setDevOtp] = useState('');

    const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/';
            } else {
                setError(data.error || 'Google login failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!gsiReady || !GOOGLE_CLIENT_ID) return;
        const g = (window as unknown as Record<string, unknown>).google as { accounts: { id: { initialize: (opts: Record<string, unknown>) => void; renderButton: (el: HTMLElement | null, opts: Record<string, unknown>) => void } } } | undefined;
        if (g?.accounts?.id) {
            g.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            g.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                { theme: 'outline', size: 'large', width: 360, text: 'signin_with', shape: 'rectangular' }
            );
        }
    }, [gsiReady, handleGoogleResponse]);

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

    const handleDemoLogin = async (demoEmail: string) => {
        setLoading(true);
        setError('');
        const result = await login(demoEmail, 'password123');
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
            setError(result.error || 'Demo login failed. Please try again.');
        }
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
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setGsiReady(true)}
            />
            <div className="auth-card fade-in">
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Arizonalex</h1>
                    <p>The Premier Network for Politics, Business & Crypto</p>
                </div>

                {/* Google Sign-In Button */}
                <div className="google-btn-wrap">
                    <div id="google-signin-btn" />
                </div>

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

                <div className="auth-divider">demo accounts</div>

                <div className="oauth-buttons">
                    <button className="oauth-btn" onClick={() => handleDemoLogin('sarah@arizonalex.com')} disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Senator Sarah (Demo)
                    </button>
                    <button className="oauth-btn" onClick={() => handleDemoLogin('admin@arizonalex.com')} disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        Admin (Demo)
                    </button>
                    <button className="oauth-btn" onClick={() => handleDemoLogin('alex@arizonalex.com')} disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Citizen User (Demo)
                    </button>
                </div>

                <div className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="auth-link">Create Account</Link>
                </div>
            </div>
        </div>
    );
}
