'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ZapIcon, ArrowLeftIcon, MailIcon, LockIcon, CheckCircleIcon, AlertCircleIcon, EyeIcon, EyeOffIcon, KeyIcon } from '@/components/ui/Icons';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devOtp, setDevOtp] = useState('');

    const handleSendCode = async () => {
        setError('');
        if (!email) { setError('Please enter your email'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) { setStep('code'); if (data.devOtp) setDevOtp(data.devOtp); }
            else setError(data.message || 'Failed');
        } catch { setError('Network error'); }
        setLoading(false);
    };

    const handleResetPassword = async () => {
        setError('');
        if (!code || !newPw) { setError('All fields are required'); return; }
        if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
        if (newPw.length < 8) { setError('Password must be at least 8 characters'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword: newPw }),
            });
            const data = await res.json();
            if (data.success) setStep('done');
            else setError(data.message || 'Failed');
        } catch { setError('Network error'); }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{ maxWidth: 420 }}>
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Reset Password</h1>
                    <p>{step === 'email' ? 'Enter your email to receive a reset code' : step === 'code' ? 'Enter the code and your new password' : 'Your password has been reset'}</p>
                </div>

                {error && (
                    <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircleIcon size={16} />{error}
                    </div>
                )}

                {step === 'email' && (
                    <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><MailIcon size={18} /></span>
                                <input className="form-input auth-input-with-icon" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                            </div>
                        </div>
                        <button onClick={handleSendCode} disabled={loading} className="btn btn-primary btn-lg auth-submit-btn">
                            {loading ? <span className="auth-spinner" /> : 'Send Reset Code'}
                        </button>
                    </div>
                )}

                {step === 'code' && (
                    <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {devOtp && (
                            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', color: '#a78bfa', textAlign: 'center' }}>
                                Dev OTP: <strong>{devOtp}</strong>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Verification Code</label>
                            <input className="form-input" type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" maxLength={6} style={{ letterSpacing: 4, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><LockIcon size={18} /></span>
                                <input className="form-input auth-input-with-icon" type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 8 chars)" />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}</button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input className="form-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" />
                        </div>
                        <button onClick={handleResetPassword} disabled={loading} className="btn btn-primary btn-lg auth-submit-btn">
                            {loading ? <span className="auth-spinner" /> : 'Reset Password'}
                        </button>
                    </div>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#22c55e' }}><CheckCircleIcon size={28} /></div>
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Your password has been reset successfully. You can now sign in with your new password.</p>
                        <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'block' }}>Sign In</Link>
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
