'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { EyeIcon, EyeOffIcon, ZapIcon } from '@/components/ui/Icons';

export default function LoginPage() {
    const { login, loading, error } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSignIn = async () => {
        setLocalError('');
        if (!email || !password) {
            setLocalError('Please enter your email and password.');
            return;
        }
        try {
            await login(email, password);
            router.push('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
            setLocalError(msg);
        }
    };

    const displayError = localError || error;

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}><ZapIcon size={24} /></div>
                    <h1>Arizonalex</h1>
                    <p>The Political Social Platform</p>
                </div>
                <div className="oauth-buttons">
                    <button className="oauth-btn" onClick={() => setLocalError('OAuth coming soon')}><svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg> Continue with Google</button>
                </div>
                <div className="auth-divider">or</div>

                {displayError && (
                    <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#f87171', fontSize: '0.88rem' }}>
                        {displayError}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        className="form-input"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            className="form-input"
                            type={showPass ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                        />
                        <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                            {showPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                    </div>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: 8 }}
                    onClick={handleSignIn}
                    disabled={loading}
                >
                    {loading ? '⏳ Signing in...' : 'Sign In'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.82rem', color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '8px 12px' }}>
                    💡 Try: <code>alex@arizonalex.com</code> / <code>password123</code>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
