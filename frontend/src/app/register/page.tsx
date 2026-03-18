'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ZapIcon, CameraIcon, ShieldIcon } from '@/components/ui/Icons';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', username: '', bio: '', role: 'citizen', party: '' });
    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const handleCreate = async () => {
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    username: form.username,
                    bio: form.bio,
                    role: form.role,
                    party: form.party,
                }),
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

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Join Arizonalex</h1>
                    <p>Step {step} of 3</p>
                </div>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(52, 211, 153, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--success)' }}>
                        <ShieldIcon size={32} />
                    </div>
                    <h2 style={{ marginBottom: 12 }}>Registration Disabled</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        Arizonalex is currently in <strong>Demo Mode</strong>.
                        Manual account creation is restricted to maintain the integrity of the live presentation.
                    </p>
                    <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 24, fontSize: '0.9rem' }}>
                        Please use one of our pre-seeded <strong>Demo Accounts</strong> to explore the full suite of features.
                    </div>
                    <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'block' }}>
                        Go to Demo Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
