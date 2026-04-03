'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ShieldIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon, CheckCircleIcon,
    AlertTriangleIcon, XIcon, ClockIcon, ArrowLeftIcon, LogOutIcon,
    MonitorIcon, ActivityIcon, RefreshCwIcon, AlertCircleIcon, KeyIcon,
} from '@/components/ui/Icons';

/* ─── Types ─── */
interface SessionData { _id: string; device: string; browser: string; os: string; ip: string; location: string; lastActive: string; createdAt: string; }
interface LoginEntry { _id: string; ip: string; device: string; browser: string; os: string; location: string; success: boolean; failReason: string; createdAt: string; }
interface AlertEntry { _id: string; type: string; title: string; message: string; ip: string; device: string; read: boolean; createdAt: string; }
interface SecurityOverview { twoFactorEnabled: boolean; passwordChangedAt: string | null; email: string; authProvider: string; activeSessions: number; unreadAlerts: number; }

/* ─── Password Strength Meter ─── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    const levels = [
        { label: 'Very Weak', color: '#ef4444' },
        { label: 'Weak', color: '#f97316' },
        { label: 'Fair', color: '#eab308' },
        { label: 'Strong', color: '#22c55e' },
        { label: 'Very Strong', color: '#10b981' },
    ];
    const idx = Math.min(score, 4);
    return { score, ...levels[idx] };
}

/* ─── Helper ─── */
async function secApi(path: string, method = 'GET', body?: Record<string, unknown>) {
    const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api/auth/security/${path}`, opts);
    return res.json();
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

/* ════════════════════════════════════════════════════════ */
export default function SecuritySettingsPage() {
    const { user, isLoggedIn, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    // Overview
    const [overview, setOverview] = useState<SecurityOverview | null>(null);

    // Sections
    const [activeTab, setActiveTab] = useState<string>('overview');

    // Change password
    const [curPw, setCurPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurPw, setShowCurPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Change email
    const [newEmail, setNewEmail] = useState('');
    const [emailPw, setEmailPw] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailStep, setEmailStep] = useState<'request' | 'verify'>('request');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [emailDevOtp, setEmailDevOtp] = useState('');

    // 2FA
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [twoFAStep, setTwoFAStep] = useState<'idle' | 'sent' | 'backup'>('idle');
    const [twoFACode, setTwoFACode] = useState('');
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [twoFAMsg, setTwoFAMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [disablePw, setDisablePw] = useState('');
    const [showDisable, setShowDisable] = useState(false);
    const [devOtp, setDevOtp] = useState('');

    // Sessions
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [sessLoading, setSessLoading] = useState(false);

    // Login History
    const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
    const [histLoading, setHistLoading] = useState(false);

    // Alerts
    const [alerts, setAlerts] = useState<AlertEntry[]>([]);
    const [alertsUnread, setAlertsUnread] = useState(0);
    const [alertsLoading, setAlertsLoading] = useState(false);

    // Delete account
    const [deletePw, setDeletePw] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Status messages
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ── Load overview ──
    const loadOverview = useCallback(async () => {
        const data = await secApi('overview');
        if (data.success) {
            setOverview(data.security);
            setTwoFAEnabled(data.security.twoFactorEnabled);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) { router.push('/login'); return; }
        if (isLoggedIn) loadOverview();
    }, [isLoggedIn, authLoading, router, loadOverview]);

    // ── Load tab-specific data ──
    useEffect(() => {
        if (!isLoggedIn) return;
        if (activeTab === 'sessions') { setSessLoading(true); secApi('sessions').then(d => { if (d.success) setSessions(d.sessions); setSessLoading(false); }); }
        if (activeTab === 'history') { setHistLoading(true); secApi('login-history').then(d => { if (d.success) setLoginHistory(d.history); setHistLoading(false); }); }
        if (activeTab === 'alerts') { setAlertsLoading(true); secApi('alerts').then(d => { if (d.success) { setAlerts(d.alerts); setAlertsUnread(d.unreadCount); } setAlertsLoading(false); }); }
    }, [activeTab, isLoggedIn]);

    if (authLoading || !isLoggedIn) return (<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="auth-spinner" style={{ width: 32, height: 32 }} /></div>);

    const strength = getPasswordStrength(newPw);

    // ── Handlers ──
    const handleChangePassword = async () => {
        setPwMsg(null);
        if (!curPw || !newPw) { setPwMsg({ type: 'error', text: 'All fields are required' }); return; }
        if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); return; }
        if (newPw.length < 8) { setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
        setPwLoading(true);
        const data = await secApi('change-password', 'POST', { currentPassword: curPw, newPassword: newPw });
        setPwLoading(false);
        if (data.success) { setPwMsg({ type: 'success', text: 'Password changed successfully' }); setCurPw(''); setNewPw(''); setConfirmPw(''); loadOverview(); }
        else setPwMsg({ type: 'error', text: data.message || 'Failed to change password' });
    };

    const handleRequestEmailChange = async () => {
        setEmailMsg(null);
        if (!newEmail || !emailPw) { setEmailMsg({ type: 'error', text: 'Email and password are required' }); return; }
        setEmailLoading(true);
        const data = await secApi('change-email/request', 'POST', { newEmail, password: emailPw });
        setEmailLoading(false);
        if (data.success) { setEmailStep('verify'); setEmailMsg({ type: 'success', text: 'Verification code sent to new email' }); if (data.devOtp) setEmailDevOtp(data.devOtp); }
        else setEmailMsg({ type: 'error', text: data.message || 'Failed' });
    };

    const handleVerifyEmailChange = async () => {
        setEmailMsg(null);
        if (!emailOtp) { setEmailMsg({ type: 'error', text: 'Enter the verification code' }); return; }
        setEmailLoading(true);
        const data = await secApi('change-email/verify', 'POST', { code: emailOtp });
        setEmailLoading(false);
        if (data.success) { setEmailMsg({ type: 'success', text: 'Email updated successfully' }); setEmailStep('request'); setNewEmail(''); setEmailPw(''); setEmailOtp(''); setEmailDevOtp(''); loadOverview(); }
        else setEmailMsg({ type: 'error', text: data.message || 'Failed' });
    };

    const handleEnable2FA = async () => {
        setTwoFAMsg(null);
        setTwoFALoading(true);
        const data = await secApi('2fa/enable', 'POST');
        setTwoFALoading(false);
        if (data.success) { setTwoFAStep('sent'); setTwoFAMsg({ type: 'success', text: 'Code sent to your email' }); if (data.devOtp) setDevOtp(data.devOtp); }
        else setTwoFAMsg({ type: 'error', text: data.message || 'Failed' });
    };

    const handleVerify2FA = async () => {
        setTwoFAMsg(null);
        if (!twoFACode) { setTwoFAMsg({ type: 'error', text: 'Enter the code' }); return; }
        setTwoFALoading(true);
        const data = await secApi('2fa/verify', 'POST', { code: twoFACode });
        setTwoFALoading(false);
        if (data.success) { setTwoFAEnabled(true); setTwoFAStep('backup'); setBackupCodes(data.backupCodes); setTwoFACode(''); setDevOtp(''); setTwoFAMsg({ type: 'success', text: 'Two-factor authentication enabled' }); loadOverview(); }
        else setTwoFAMsg({ type: 'error', text: data.message || 'Invalid code' });
    };

    const handleDisable2FA = async () => {
        setTwoFAMsg(null);
        if (!disablePw) { setTwoFAMsg({ type: 'error', text: 'Password required' }); return; }
        setTwoFALoading(true);
        const data = await secApi('2fa/disable', 'POST', { password: disablePw });
        setTwoFALoading(false);
        if (data.success) { setTwoFAEnabled(false); setShowDisable(false); setDisablePw(''); setTwoFAStep('idle'); setTwoFAMsg({ type: 'success', text: '2FA disabled' }); loadOverview(); }
        else setTwoFAMsg({ type: 'error', text: data.message || 'Failed' });
    };

    const handleRevokeSession = async (id: string) => {
        const data = await secApi(`sessions/${id}`, 'DELETE');
        if (data.success) setSessions(prev => prev.filter(s => s._id !== id));
    };

    const handleRevokeAll = async () => {
        setActionMsg(null);
        const data = await secApi('sessions/all', 'DELETE');
        if (data.success) { setActionMsg({ type: 'success', text: data.message }); secApi('sessions').then(d => { if (d.success) setSessions(d.sessions); }); }
    };

    const handleMarkAlertsRead = async () => {
        await secApi('alerts/read-all', 'POST');
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
        setAlertsUnread(0);
    };

    const handleDeleteAccount = async () => {
        setDeleteMsg(null);
        if (!deletePw) { setDeleteMsg({ type: 'error', text: 'Password required' }); return; }
        setDeleteLoading(true);
        const data = await secApi('delete-account', 'POST', { password: deletePw });
        setDeleteLoading(false);
        if (data.success) { await logout(); router.push('/login'); }
        else setDeleteMsg({ type: 'error', text: data.message || 'Failed' });
    };

    /* ─── Shared styles ─── */
    const tile: React.CSSProperties = { background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border-light)', padding: 'clamp(20px,4vw,32px)', marginBottom: 16 };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' };
    const btnPrimary: React.CSSProperties = { padding: '10px 24px', borderRadius: 10, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' };
    const btnOutline: React.CSSProperties = { padding: '10px 24px', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' };
    const label: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <ShieldIcon size={16} /> },
        { id: 'password', label: 'Password', icon: <LockIcon size={16} /> },
        { id: 'email', label: 'Email', icon: <MailIcon size={16} /> },
        { id: '2fa', label: 'Two-Factor', icon: <KeyIcon size={16} /> },
        { id: 'sessions', label: 'Sessions', icon: <MonitorIcon size={16} /> },
        { id: 'history', label: 'Login History', icon: <ClockIcon size={16} /> },
        { id: 'alerts', label: 'Alerts', icon: <AlertCircleIcon size={16} /> },
        { id: 'danger', label: 'Delete Account', icon: <AlertTriangleIcon size={16} /> },
    ];

    function Msg({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
        if (!msg) return null;
        return (<div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '0.84rem', fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: msg.type === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{msg.type === 'success' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}{msg.text}</div>);
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)', padding: 'clamp(20px,4vw,32px) clamp(16px,5vw,40px)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 16, fontWeight: 500 }}><ArrowLeftIcon size={14} /> Back to Profile</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}><ShieldIcon size={24} /></div>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Security Settings</h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Manage your account security and privacy</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(16px,4vw,32px) clamp(16px,5vw,40px)', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Sidebar Tabs */}
                <nav style={{ flex: '0 0 min(220px, 100%)', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 20 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === t.id ? 700 : 500, background: activeTab === t.id ? 'rgba(139,92,246,0.1)' : 'transparent', color: activeTab === t.id ? '#a78bfa' : 'var(--text-secondary)', transition: 'all 0.15s', textAlign: 'left' }}>
                            {t.icon}{t.label}
                            {t.id === 'alerts' && alertsUnread > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{alertsUnread}</span>}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div style={{ flex: '1 1 min(500px, 100%)' }}>

                    {/* ── Overview ── */}
                    {activeTab === 'overview' && overview && (
                        <div>
                            <div style={tile}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Security Overview</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                                    <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Two-Factor Auth</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: overview.twoFactorEnabled ? '#22c55e' : '#ef4444' }} />
                                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{overview.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Sessions</div>
                                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{overview.activeSessions}</span>
                                    </div>
                                    <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password Last Changed</div>
                                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{overview.passwordChangedAt ? timeAgo(overview.passwordChangedAt) : 'Never'}</span>
                                    </div>
                                    <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{overview.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={tile}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Quick Actions</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    <button onClick={() => setActiveTab('password')} style={btnOutline}><LockIcon size={14} /> Change Password</button>
                                    <button onClick={() => setActiveTab('2fa')} style={btnOutline}><KeyIcon size={14} /> {overview.twoFactorEnabled ? 'Manage' : 'Enable'} 2FA</button>
                                    <button onClick={() => setActiveTab('sessions')} style={btnOutline}><MonitorIcon size={14} /> View Sessions</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Change Password ── */}
                    {activeTab === 'password' && (
                        <div style={tile}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><LockIcon size={20} /> Change Password</h2>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>Choose a strong password and don&apos;t reuse it for other accounts.</p>
                            <Msg msg={pwMsg} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                                <div>
                                    <label style={label}>Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showCurPw ? 'text' : 'password'} value={curPw} onChange={e => setCurPw(e.target.value)} style={inputStyle} placeholder="Enter current password" />
                                        <button type="button" onClick={() => setShowCurPw(!showCurPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>{showCurPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}</button>
                                    </div>
                                </div>
                                <div>
                                    <label style={label}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} placeholder="Enter new password" />
                                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>{showNewPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}</button>
                                    </div>
                                    {newPw && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                                {[0, 1, 2, 3, 4].map(i => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < strength.score ? strength.color : 'var(--border)' }} />))}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={label}>Confirm New Password</label>
                                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} placeholder="Confirm new password" />
                                    {confirmPw && newPw !== confirmPw && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4, display: 'block' }}>Passwords do not match</span>}
                                </div>
                                <button onClick={handleChangePassword} disabled={pwLoading} style={{ ...btnPrimary, opacity: pwLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {pwLoading ? <span className="auth-spinner" style={{ width: 16, height: 16 }} /> : <><LockIcon size={14} /> Update Password</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Change Email ── */}
                    {activeTab === 'email' && (
                        <div style={tile}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><MailIcon size={20} /> Change Email</h2>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Current email: <strong style={{ color: 'var(--text-primary)' }}>{overview?.email || user?.email}</strong></p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>A verification code will be sent to your new email address.</p>
                            <Msg msg={emailMsg} />
                            {emailStep === 'request' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                                    <div><label style={label}>New Email Address</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} placeholder="new@example.com" /></div>
                                    <div><label style={label}>Confirm Your Password</label><input type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)} style={inputStyle} placeholder="Enter your password" /></div>
                                    <button onClick={handleRequestEmailChange} disabled={emailLoading} style={{ ...btnPrimary, opacity: emailLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{emailLoading ? <span className="auth-spinner" style={{ width: 16, height: 16 }} /> : <><MailIcon size={14} /> Send Verification Code</>}</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                                    {emailDevOtp && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', color: '#a78bfa' }}>Dev OTP: <strong>{emailDevOtp}</strong></div>}
                                    <div><label style={label}>Verification Code</label><input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} style={{ ...inputStyle, letterSpacing: 4, fontSize: '1.1rem', textAlign: 'center', fontWeight: 700 }} placeholder="000000" maxLength={6} /></div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={handleVerifyEmailChange} disabled={emailLoading} style={{ ...btnPrimary, flex: 1, opacity: emailLoading ? 0.6 : 1 }}>{emailLoading ? <span className="auth-spinner" style={{ width: 16, height: 16 }} /> : 'Verify & Update'}</button>
                                        <button onClick={() => { setEmailStep('request'); setEmailMsg(null); }} style={btnOutline}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 2FA ── */}
                    {activeTab === '2fa' && (
                        <div style={tile}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><KeyIcon size={20} /> Two-Factor Authentication</h2>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>Add an extra layer of security by requiring a verification code during login.</p>
                            <Msg msg={twoFAMsg} />

                            {/* Status */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: twoFAEnabled ? '#22c55e' : '#ef4444' }} />
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                {twoFAEnabled && !showDisable && <button onClick={() => setShowDisable(true)} style={{ ...btnOutline, padding: '6px 16px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Disable</button>}
                            </div>

                            {/* Enable flow */}
                            {!twoFAEnabled && twoFAStep === 'idle' && (
                                <button onClick={handleEnable2FA} disabled={twoFALoading} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 8, opacity: twoFALoading ? 0.6 : 1 }}>{twoFALoading ? <span className="auth-spinner" style={{ width: 16, height: 16 }} /> : <><KeyIcon size={14} /> Enable Two-Factor Authentication</>}</button>
                            )}

                            {twoFAStep === 'sent' && (
                                <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {devOtp && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', color: '#a78bfa' }}>Dev OTP: <strong>{devOtp}</strong></div>}
                                    <div><label style={label}>Enter Verification Code</label><input type="text" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} style={{ ...inputStyle, letterSpacing: 4, fontSize: '1.1rem', textAlign: 'center', fontWeight: 700 }} placeholder="000000" maxLength={6} /></div>
                                    <button onClick={handleVerify2FA} disabled={twoFALoading} style={{ ...btnPrimary, opacity: twoFALoading ? 0.6 : 1 }}>{twoFALoading ? <span className="auth-spinner" style={{ width: 16, height: 16 }} /> : 'Verify & Enable'}</button>
                                </div>
                            )}

                            {twoFAStep === 'backup' && backupCodes.length > 0 && (
                                <div style={{ marginTop: 16, padding: 20, borderRadius: 12, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Backup Codes</h3>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 14 }}>Save these codes in a safe place. Each code can only be used once.</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                                        {backupCodes.map((code, i) => (<div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)' }}>{code}</div>))}
                                    </div>
                                </div>
                            )}

                            {/* Disable flow */}
                            {showDisable && (
                                <div style={{ marginTop: 16, padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <p style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>Confirm your password to disable 2FA</p>
                                    <input type="password" value={disablePw} onChange={e => setDisablePw(e.target.value)} style={inputStyle} placeholder="Enter your password" />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={handleDisable2FA} disabled={twoFALoading} style={{ ...btnPrimary, background: '#ef4444', flex: 1, opacity: twoFALoading ? 0.6 : 1 }}>Disable 2FA</button>
                                        <button onClick={() => { setShowDisable(false); setDisablePw(''); }} style={btnOutline}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Sessions ── */}
                    {activeTab === 'sessions' && (
                        <div style={tile}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}><MonitorIcon size={20} /> Active Sessions</h2>
                                {sessions.length > 1 && <button onClick={handleRevokeAll} style={{ ...btnOutline, padding: '6px 16px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}><LogOutIcon size={13} /> Revoke All Others</button>}
                            </div>
                            {actionMsg && <Msg msg={actionMsg} />}
                            {sessLoading ? <div style={{ textAlign: 'center', padding: 32 }}><div className="auth-spinner" style={{ width: 24, height: 24 }} /></div> : sessions.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>No active sessions found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {sessions.map(s => (
                                        <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}><MonitorIcon size={16} /></div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{s.browser} on {s.os}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.ip} · {s.location} · {timeAgo(s.lastActive)}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRevokeSession(s._id)} style={{ ...btnOutline, padding: '5px 14px', fontSize: '0.75rem' }}>Revoke</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Login History ── */}
                    {activeTab === 'history' && (
                        <div style={tile}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><ClockIcon size={20} /> Login History</h2>
                            {histLoading ? <div style={{ textAlign: 'center', padding: 32 }}><div className="auth-spinner" style={{ width: 24, height: 24 }} /></div> : loginHistory.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>No login history found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {loginHistory.map(h => (
                                        <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.success ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{h.browser} on {h.os}{!h.success && <span style={{ color: '#ef4444', fontWeight: 700 }}> — Failed</span>}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{h.ip} · {h.location} · {timeAgo(h.createdAt)}{h.failReason ? ` · ${h.failReason}` : ''}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Security Alerts ── */}
                    {activeTab === 'alerts' && (
                        <div style={tile}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}><AlertCircleIcon size={20} /> Security Alerts {alertsUnread > 0 && <span style={{ fontSize: '0.72rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{alertsUnread} new</span>}</h2>
                                {alertsUnread > 0 && <button onClick={handleMarkAlertsRead} style={{ ...btnOutline, padding: '6px 16px', fontSize: '0.78rem' }}>Mark All Read</button>}
                            </div>
                            {alertsLoading ? <div style={{ textAlign: 'center', padding: 32 }}><div className="auth-spinner" style={{ width: 24, height: 24 }} /></div> : alerts.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>No security alerts.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {alerts.map(a => (
                                        <div key={a._id} style={{ padding: '14px 16px', borderRadius: 10, background: a.read ? 'var(--bg-secondary)' : 'rgba(139,92,246,0.05)', border: `1px solid ${a.read ? 'var(--border-light)' : 'rgba(139,92,246,0.15)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{a.title}</span>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{timeAgo(a.createdAt)}</span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{a.message}</p>
                                            {a.device && <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{a.device} · {a.ip}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Delete Account ── */}
                    {activeTab === 'danger' && (
                        <div style={{ ...tile, borderColor: 'rgba(239,68,68,0.2)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 10 }}><AlertTriangleIcon size={20} /> Delete Account</h2>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                            <Msg msg={deleteMsg} />
                            {!deleteConfirm ? (
                                <button onClick={() => setDeleteConfirm(true)} style={{ ...btnOutline, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>I want to delete my account</button>
                            ) : (
                                <div style={{ padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <p style={{ fontSize: '0.88rem', color: '#ef4444', fontWeight: 600, margin: 0 }}>This is irreversible. Enter your password to confirm.</p>
                                    <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} style={inputStyle} placeholder="Enter your password" />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ ...btnPrimary, background: '#ef4444', flex: 1, opacity: deleteLoading ? 0.6 : 1 }}>{deleteLoading ? <span className="auth-spinner" style={{ width: 16, height: 16 }} /> : 'Delete My Account'}</button>
                                        <button onClick={() => { setDeleteConfirm(false); setDeletePw(''); }} style={btnOutline}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
