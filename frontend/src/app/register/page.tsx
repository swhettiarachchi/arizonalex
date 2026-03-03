'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ZapIcon, CameraIcon, ShieldIcon } from '@/components/ui/Icons';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', username: '', bio: '', role: 'citizen', party: '' });
    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Join Arizonalex</h1>
                    <p>Step {step} of 3</p>
                </div>
                <div className="progress-bar" style={{ marginBottom: 24 }}><div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} /></div>

                {step === 1 && (
                    <>
                        <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="At least 8 characters" value={form.password} onChange={e => update('password', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} /></div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <div className="form-group"><label className="form-label">Username</label><input className="form-input" placeholder="@yourhandle" value={form.username} onChange={e => update('username', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" style={{ minHeight: 80, resize: 'vertical' }} placeholder="Tell us about yourself..." value={form.bio} onChange={e => update('bio', e.target.value)} /></div>
                        <div className="form-group">
                            <label className="form-label">Profile Picture</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                <CameraIcon size={28} /><div style={{ marginTop: 8, fontSize: '0.88rem' }}>Click to upload photo</div>
                            </div>
                        </div>
                    </>
                )}
                {step === 3 && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Account Type</label>
                            <select className="form-input" value={form.role} onChange={e => update('role', e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
                                <option value="citizen">Citizen</option><option value="politician">Politician / Public Official</option><option value="journalist">Journalist / Media</option><option value="official">Government Official</option>
                            </select>
                        </div>
                        {(form.role === 'politician' || form.role === 'official') && (
                            <div className="form-group"><label className="form-label">Political Affiliation (Optional)</label><input className="form-input" placeholder="Party name" value={form.party} onChange={e => update('party', e.target.value)} /></div>
                        )}
                        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldIcon size={16} /> Security</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Two-factor authentication will be enabled by default. Your data is encrypted end-to-end.</div>
                        </div>
                    </>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {step > 1 && <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>Back</button>}
                    {step < 3 ? <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(s => s + 1)}>Continue</button> : <Link href="/" className="btn btn-primary btn-lg" style={{ flex: 1 }}>Create Account</Link>}
                </div>
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
