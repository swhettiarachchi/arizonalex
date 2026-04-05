'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ZapIcon } from '@/components/ui/Icons';
import FaceVerification, { FaceVerificationResult } from '@/components/ui/FaceVerification';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikilkixuvtemkpviwpzr.supabase.co';

const ROLES = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'politician', label: 'Politician' },
    { value: 'official', label: 'Government Official' },
    { value: 'journalist', label: 'Journalist' },
    { value: 'businessman', label: 'Businessman' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'crypto_trader', label: 'Crypto Trader' },
    { value: 'stock_trader', label: 'Stock Trader' },
    { value: 'banker', label: 'Banker' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'academic', label: 'Academic' },
    { value: 'lawyer', label: 'Lawyer' },
    { value: 'judge', label: 'Judge' },
    { value: 'activist', label: 'Activist' },
    { value: 'celebrity', label: 'Celebrity' },
    { value: 'other', label: 'Other' },
];

const PARTIES = [
    'Independent', 'Democrat', 'Republican', 'Libertarian', 'Green Party', 'Other', 'None'
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [faceData, setFaceData] = useState<FaceVerificationResult | null>(null);
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        username: '', bio: '', role: 'citizen', party: ''
    });
    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    // ── Google OAuth — direct redirect to Supabase OAuth endpoint ──
    const handleGoogleOAuth = () => {
        setGoogleLoading(true);
        setError('');
        try {
            const redirectTo = `${window.location.origin}/auth/callback`;
            const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&flow_type=implicit`;
            window.location.href = authUrl;
        } catch {
            setError('Failed to start Google sign-up. Please try again.');
            setGoogleLoading(false);
        }
    };

    const validateStep1 = () => {
        if (!form.name.trim()) return 'Name is required';
        if (!form.email.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) return 'Passwords do not match';
        return '';
    };

    const validateStep2 = () => {
        if (!form.username.trim()) return 'Username is required';
        if (form.username.length < 3 || form.username.length > 30) return 'Username must be 3-30 characters';
        return '';
    };

    const nextStep = () => {
        setError('');
        if (step === 1) {
            const err = validateStep1();
            if (err) { setError(err); return; }
        }
        if (step === 2) {
            const err = validateStep2();
            if (err) { setError(err); return; }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(s => s - 1);
    };

    const handleCreate = async (skipFace = false) => {
        setLoading(true);
        setError('');
        try {
            const payload: Record<string, unknown> = {
                name: form.name,
                email: form.email,
                password: form.password,
                username: form.username,
                bio: form.bio,
                role: form.role,
                party: form.party,
            };
            if (!skipFace && faceData) {
                payload.faceVerified = true;
                payload.faceioId = faceData.faceioId;
                payload.verificationScore = faceData.verificationScore;
                payload.verificationDate = faceData.verifiedAt;
            }
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFaceSuccess = (result: FaceVerificationResult) => {
        setFaceData(result);
        setTimeout(() => handleCreate(false), 1500);
    };

    const handleFaceSkip = () => {
        handleCreate(true);
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{ maxWidth: 520 }}>
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Join Arizonalex</h1>
                    <p>Create your account</p>
                </div>

                {/* Google Sign-Up via Supabase OAuth */}
                <button
                    className="oauth-btn google-oauth-btn"
                    onClick={handleGoogleOAuth}
                    disabled={googleLoading}
                    id="google-oauth-signup-btn"
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

                <div className="auth-divider">or sign up with email</div>

                {/* Progress Indicator — 4 Steps */}
                <div className="register-progress">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`register-progress-step ${s < step ? 'completed' : ''} ${s === step ? 'active' : ''}`}>
                            <div className="register-progress-dot">
                                {s < step ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : s}
                            </div>
                            <span className="register-progress-label">
                                {s === 1 ? 'Account' : s === 2 ? 'Profile' : s === 3 ? 'Role' : 'Verify'}
                            </span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="auth-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        {error}
                    </div>
                )}

                {/* Step 1: Account Details */}
                {step === 1 && (
                    <div className="auth-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-name">Full Name</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <input id="reg-name" className="form-input auth-input-with-icon" type="text" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email Address</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                <input id="reg-email" className="form-input auth-input-with-icon" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">Password</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <input id="reg-password" className="form-input auth-input-with-icon" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} autoComplete="new-password" />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                                    {showPass ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <input id="reg-confirm" className="form-input auth-input-with-icon" type={showPass ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} autoComplete="new-password" />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg auth-submit-btn" onClick={nextStep}>
                            Continue
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </button>
                    </div>
                )}

                {/* Step 2: Profile Info */}
                {step === 2 && (
                    <div className="auth-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-username">Username</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>@</span>
                                <input id="reg-username" className="form-input auth-input-with-icon" type="text" placeholder="johndoe" value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} maxLength={30} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-bio">Bio <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span></label>
                            <textarea
                                id="reg-bio"
                                className="form-input"
                                placeholder="Tell us about yourself..."
                                value={form.bio}
                                onChange={e => update('bio', e.target.value)}
                                rows={3}
                                maxLength={160}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{form.bio.length}/160</div>
                        </div>
                        <div className="auth-step-actions">
                            <button className="btn btn-secondary btn-lg" onClick={prevStep}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                Back
                            </button>
                            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={nextStep}>
                                Continue
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Role & Party */}
                {step === 3 && (
                    <div className="auth-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-role">Your Role</label>
                            <select id="reg-role" className="form-input form-select" value={form.role} onChange={e => update('role', e.target.value)}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        {['politician', 'official'].includes(form.role) && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-party">Political Affiliation</label>
                                <select id="reg-party" className="form-input form-select" value={form.party} onChange={e => update('party', e.target.value)}>
                                    <option value="">Select party</option>
                                    {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="auth-terms">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="auth-link">Terms of Service</Link>{' '}and{' '}
                            <Link href="/privacy" className="auth-link">Privacy Policy</Link>.
                        </div>
                        <div className="auth-step-actions">
                            <button className="btn btn-secondary btn-lg" onClick={prevStep}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                Back
                            </button>
                            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={nextStep}>
                                Continue to Verify
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Face Verification */}
                {step === 4 && (
                    <div className="auth-form">
                        <FaceVerification
                            onSuccess={handleFaceSuccess}
                            onSkip={handleFaceSkip}
                            showSkip={true}
                        />
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <span className="auth-spinner" />
                                <p style={{ color: 'var(--text-tertiary)', marginTop: 8, fontSize: '0.85rem' }}>
                                    Creating your account…
                                </p>
                            </div>
                        )}
                        <div className="auth-step-actions" style={{ marginTop: 12 }}>
                            <button className="btn btn-secondary btn-lg" onClick={prevStep}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                Back
                            </button>
                        </div>
                    </div>
                )}

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link href="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
