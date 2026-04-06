'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ZapIcon, ArrowLeftIcon, MailIcon, AlertCircleIcon, CheckCircleIcon } from '@/components/ui/Icons';

function ForgotPasswordInner() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [providerError, setProviderError] = useState('');

    // If user returns from Supabase reset link with step=reset
    const step = searchParams.get('step');
    const isResetStep = step === 'reset';

    // Handle reset step separately (Supabase redirects here after user clicks link)
    useEffect(() => {
        if (isResetStep) {
            // The user clicked the reset link — Supabase has already validated the token
            // We should show a success message and redirect to login
            setSent(false);
        }
    }, [isResetStep]);

    const handleSendLink = async () => {
        setError('');
        setProviderError('');
        if (!email) { setError('Please enter your email'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSent(true);
            } else if (data.errorType === 'provider_mismatch') {
                setProviderError(data.error);
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch { setError('Network error. Please try again.'); }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{ maxWidth: 420 }}>
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Reset Password</h1>
                    <p>{sent ? 'Check your inbox' : 'Enter your email to receive a reset link'}</p>
                </div>

                {error && (
                    <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircleIcon size={16} />{error}
                    </div>
                )}

                {providerError && (
                    <div className="auth-error" style={{ flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircleIcon size={16} />{providerError}
                        </div>
                        <Link href="/login" style={{
                            padding: '8px 16px', borderRadius: 6,
                            background: '#4285f4', color: 'white', textDecoration: 'none',
                            fontWeight: 600, fontSize: '0.85rem', textAlign: 'center',
                            display: 'inline-block',
                        }}>
                            Go to Login →
                        </Link>
                    </div>
                )}

                {!sent ? (
                    <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><MailIcon size={18} /></span>
                                <input
                                    className="form-input auth-input-with-icon"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                                    id="forgot-email-input"
                                />
                            </div>
                        </div>
                        <button onClick={handleSendLink} disabled={loading} className="btn btn-primary btn-lg auth-submit-btn" id="forgot-send-btn">
                            {loading ? <span className="auth-spinner" /> : 'Send Reset Link'}
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'rgba(34,197,94,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', color: '#22c55e',
                        }}>
                            <CheckCircleIcon size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Check Your Email</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                            We&apos;ve sent a password reset link to:
                        </p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 20 }}>
                            {email}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 20 }}>
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                            If you don&apos;t see the email, check your spam folder.
                        </p>
                        <button
                            onClick={() => { setSent(false); setEmail(''); }}
                            style={{
                                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                                padding: '8px 16px', cursor: 'pointer', color: 'var(--text-primary)',
                                fontSize: '0.85rem', fontWeight: 600,
                            }}
                        >
                            Try a different email
                        </button>
                    </div>
                )}

                <div className="auth-footer" style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                    <ArrowLeftIcon size={14} />
                    <Link href="/login" className="auth-link">Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="auth-page">
                <div className="auth-card fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <span className="auth-spinner" />
                </div>
            </div>
        }>
            <ForgotPasswordInner />
        </Suspense>
    );
}
