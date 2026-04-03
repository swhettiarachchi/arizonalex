'use client';
import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';
import {
    UsersIcon, BarChartIcon, ZapIcon, CheckCircleIcon, ShieldIcon, BotIcon,
    TrendingUpIcon, SearchIcon, AlertTriangleIcon, VerifiedIcon, FileTextIcon,
    ActivityIcon, CpuIcon, GlobeIcon, ChevronRightIcon, LayersIcon, DollarSignIcon
} from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';

const ROLE_LABELS: Record<string, string> = {
    politician: 'Politician', official: 'Gov. Official', journalist: 'Journalist',
    citizen: 'Citizen', admin: 'Admin', businessman: 'Businessman',
    entrepreneur: 'Entrepreneur', crypto_trader: 'Crypto Trader',
    stock_trader: 'Stock Trader', banker: 'Banker', doctor: 'Doctor',
    researcher: 'Researcher', academic: 'Academic', lawyer: 'Lawyer',
    judge: 'Judge', activist: 'Activist', celebrity: 'Celebrity', other: 'Other',
};

const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayersIcon size={13} /> },
    { id: 'users', label: 'Users', icon: <UsersIcon size={13} /> },
    { id: 'content', label: 'Content', icon: <ShieldIcon size={13} /> },
    { id: 'verification', label: 'Verification', icon: <CheckCircleIcon size={13} /> },
    { id: 'ai-monitor', label: 'AI Monitor', icon: <CpuIcon size={13} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChartIcon size={13} /> },
];

export default function AdminPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [userSearch, setUserSearch] = useState('');
    const [removedItems, setRemovedItems] = useState<Set<number>>(new Set());
    const [approvedItems, setApprovedItems] = useState<Set<number>>(new Set());

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [pStats, setPStats] = useState({ totalUsers: 0, activeToday: 0, postsToday: 0, reportsToday: 0, aiModerationsToday: 0, newVerificationRequests: 0, serverUptime: 99.97, avgResponseTime: 42 });

    useEffect(() => {
        fetch('/api/users?limit=50')
            .then(r => r.json())
            .then(data => { if (data.users) setAllUsers(data.users); })
            .catch(() => { });
    }, []);

    const filteredUsers = allUsers.filter((u: any) =>
        !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="page-container home-3col">

            {/* LEFT — Quick actions + health */}
            <aside className="home-left-panel">
                {/* Quick Actions */}
                <div className="hp-card">
                    <div className="hp-card-title"><ZapIcon size={15} /> Quick Actions</div>
                    {[
                        { icon: <BarChartIcon size={14} />, label: 'View Analytics', tab: 'analytics' },
                        { icon: <AlertTriangleIcon size={14} />, label: 'Review Reports', tab: 'content' },
                        { icon: <CheckCircleIcon size={14} />, label: 'Approve Verifications', tab: 'verification' },
                        { icon: <BotIcon size={14} />, label: 'AI Monitor', tab: 'ai-monitor' },
                        { icon: <UsersIcon size={14} />, label: 'User Management', tab: 'users' },
                        { icon: <ShieldIcon size={14} />, label: 'Security Logs', tab: 'dashboard' },
                    ].map((a, i) => (
                        <button key={i} onClick={() => setActiveTab(a.tab)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', color: 'inherit', fontWeight: 500, transition: 'color 0.2s' }}>
                            <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{a.icon}</span>{a.label}
                        </button>
                    ))}
                </div>

                {/* Platform stats mini */}
                <div className="hp-card">
                    <div className="hp-card-title"><GlobeIcon size={15} /> Platform Reach</div>
                    {[
                        { label: 'Total Users', val: formatNumber(pStats.totalUsers), change: '+4.2%', up: true },
                        { label: 'Active Today', val: formatNumber(pStats.activeToday), change: '+12%', up: true },
                        { label: 'Posts Today', val: formatNumber(pStats.postsToday), change: '+8%', up: true },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.label}</div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.val}</div>
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.up ? '#10b981' : '#ef4444' }}>{s.change}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* CENTER — Tabbed Admin panel */}
            <div className="feed-column" style={{ minWidth: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldIcon size={20} />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Admin Panel</h1>
                </div>

                <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: 16 }} className="fade-in">

                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                {[
                                    { icon: <UsersIcon size={20} />, val: formatNumber(pStats.totalUsers), label: 'Total Users', change: '+4.2%', up: true },
                                    { icon: <ZapIcon size={20} />, val: formatNumber(pStats.activeToday), label: 'Active Today', change: '+12%', up: true },
                                    { icon: <FileTextIcon size={20} />, val: formatNumber(pStats.postsToday), label: 'Posts Today', change: '+8%', up: true },
                                    { icon: <AlertTriangleIcon size={20} />, val: String(pStats.reportsToday), label: 'Reports', change: '-5%', up: false },
                                    { icon: <BotIcon size={20} />, val: formatNumber(pStats.aiModerationsToday), label: 'AI Moderations', change: '+15%', up: true },
                                    { icon: <CheckCircleIcon size={20} />, val: String(pStats.newVerificationRequests), label: 'Verification Req.', change: '+3', up: true },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card">
                                        <span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span>
                                        <span className="stat-value">{s.val}</span>
                                        <span className="stat-label">{s.label}</span>
                                        <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="hp-card" style={{ marginBottom: 16 }}>
                                <h4 style={{ marginBottom: 14, fontWeight: 700 }}>User Growth (2025)</h4>
                                <div className="chart-placeholder" style={{ height: 120 }}>
                                    {[30, 42, 55, 48, 65, 72, 60, 78, 85, 92, 88, 95].map((h, i) => (
                                        <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                                </div>
                            </div>

                            <div className="hp-card">
                                <h4 style={{ marginBottom: 12, fontWeight: 700 }}>Security Events (Last 24h)</h4>
                                {[
                                    { label: 'Failed Login Attempts', val: 1243, severity: 'medium' },
                                    { label: 'Suspicious Account Creations', val: 17, severity: 'high' },
                                    { label: 'API Rate Limit Violations', val: 89, severity: 'low' },
                                    { label: 'Content Policy Violations', val: 219, severity: 'medium' },
                                ].map((ev, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ev.severity === 'high' ? '#ef4444' : ev.severity === 'medium' ? '#f59e0b' : '#10b981', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.82rem' }}>{ev.label}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ev.val.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                                <h3 className="section-title" style={{ margin: 0 }}>User Management</h3>
                                <div className="search-box" style={{ maxWidth: 240 }}>
                                    <span className="search-icon"><SearchIcon size={14} /></span>
                                    <input placeholder="Search users" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="card" style={{ overflow: 'auto' }}>
                                <table className="admin-table">
                                    <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Followers</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>@{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className={`role-badge role-${user.role}`}>{ROLE_LABELS[user.role] ?? user.role}</span></td>
                                                <td>
                                                    <span style={{ color: user.verified ? '#10b981' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                                                        {user.verified ? <><VerifiedIcon size={13} /> Verified</> : 'Unverified'}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{formatNumber(user.followers)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button className="btn btn-sm btn-outline" onClick={() => requireAuth(() => { })}>Edit</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => requireAuth(() => { })}>Ban</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* CONTENT */}
                    {activeTab === 'content' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <ShieldIcon size={18} />
                                <h3 className="section-title" style={{ margin: 0 }}>Content Moderation Queue</h3>
                                <span style={{ background: '#ef444420', color: '#ef4444', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px' }}>4 pending</span>
                            </div>
                            {[
                                { id: 1, type: 'Hate Speech', user: 'anon123', content: 'Flagged comment containing targeted slurs against a political group.', severity: 'High', ai: '99.2%' },
                                { id: 2, type: 'Misinformation', user: 'newuser456', content: 'Claim about election results contradicts multiple verified sources.', severity: 'Medium', ai: '78.5%' },
                                { id: 3, type: 'Spam', user: 'bot_account', content: 'Repeated promotional content pushing external site links.', severity: 'Low', ai: '97.8%' },
                                { id: 4, type: 'Harassment', user: 'user789', content: 'Threatening direct messages sent to public official account.', severity: 'High', ai: '95.1%' },
                            ].map(item => !removedItems.has(item.id) && (
                                <div key={item.id} className="hp-card" style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: item.severity === 'High' ? 'rgba(239,68,68,0.12)' : item.severity === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: item.severity === 'High' ? '#ef4444' : item.severity === 'Medium' ? '#f59e0b' : '#10b981' }}>
                                            {item.severity} · {item.type}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>AI Confidence: <strong style={{ color: 'var(--text-primary)' }}>{item.ai}</strong></span>
                                    </div>
                                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.88rem' }}>@{item.user}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{item.content}</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-danger btn-sm" onClick={() => requireAuth(() => setRemovedItems(prev => new Set(prev).add(item.id)))}>Remove</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => setRemovedItems(prev => new Set(prev).add(item.id)))}>Dismiss</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Review</button>
                                    </div>
                                </div>
                            ))}
                            {removedItems.size === 4 && (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    <CheckCircleIcon size={36} />
                                    <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 10, color: 'var(--text-secondary)' }}>Queue cleared</div>
                                </div>
                            )}
                        </>
                    )}

                    {/* VERIFICATION */}
                    {activeTab === 'verification' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <CheckCircleIcon size={18} />
                                <h3 className="section-title" style={{ margin: 0 }}>Pending Verification</h3>
                                <span style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px' }}>3 pending</span>
                            </div>
                            {[
                                { name: 'Maria Santos', username: 'mariasantos', role: 'politician', party: 'Democratic Front', docs: 'Government ID, Official Letter', joined: 'Feb 2026' },
                                { name: 'David Lee', username: 'davidlee', role: 'journalist', docs: 'Press ID, Portfolio URL', joined: 'Jan 2026' },
                                { name: 'Amara Johnson', username: 'amaraj', role: 'official', party: 'Independent', docs: 'Government-issued ID', joined: 'Mar 2026' },
                            ].map((req, i) => !approvedItems.has(i) && (
                                <div key={i} className="hp-card" style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <UserAvatar name={req.name} size="md" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.name}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>@{req.username} · Joined {req.joined}</div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                                <span className={`role-badge role-${req.role}`}>{ROLE_LABELS[req.role] ?? req.role}</span>
                                                {req.party && <span className="role-badge role-politician">{req.party}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FileTextIcon size={13} /> Documents: <strong>{req.docs}</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => setApprovedItems(prev => new Set(prev).add(i)))}>Approve</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => requireAuth(() => setApprovedItems(prev => new Set(prev).add(i)))}>Reject</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Review Docs</button>
                                    </div>
                                </div>
                            ))}
                            {approvedItems.size === 3 && (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    <CheckCircleIcon size={36} />
                                    <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 10, color: 'var(--text-secondary)' }}>All requests processed</div>
                                </div>
                            )}
                        </>
                    )}

                    {/* AI MONITOR */}
                    {activeTab === 'ai-monitor' && (
                        <>
                            <h3 className="section-title">AI System Monitor</h3>
                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                {[
                                    { icon: <BotIcon size={20} />, val: '97.9%', label: 'Model Accuracy', change: '+0.3%', up: true },
                                    { icon: <ZapIcon size={20} />, val: '42ms', label: 'Avg Response Time', change: '-3ms', up: true },
                                    { icon: <BarChartIcon size={20} />, val: '15.6K', label: 'Moderations Today', change: '+15%', up: true },
                                    { icon: <ShieldIcon size={20} />, val: '219', label: 'Auto-Removals', change: '-5%', up: true },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card">
                                        <span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span>
                                        <span className="stat-value">{s.val}</span>
                                        <span className="stat-label">{s.label}</span>
                                        <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="hp-card">
                                <h4 style={{ marginBottom: 14, fontWeight: 700 }}>AI Model Performance</h4>
                                {[
                                    { model: 'Hate Speech Detection', accuracy: 99.2, calls: '4.2K' },
                                    { model: 'Spam Detection', accuracy: 97.8, calls: '8.1K' },
                                    { model: 'Misinformation Checker', accuracy: 94.5, calls: '2.3K' },
                                    { model: 'Sentiment Analyzer', accuracy: 96.1, calls: '12.4K' },
                                    { model: 'Content Recommender', accuracy: 91.3, calls: '45.2K' },
                                ].map((m, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.model}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{m.calls} calls today</div>
                                        </div>
                                        <div style={{ width: 130 }}>
                                            <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                                <div style={{ width: `${m.accuracy}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 3 }} />
                                            </div>
                                            <div style={{ fontSize: '0.72rem', textAlign: 'right', marginTop: 3, color: '#10b981', fontWeight: 700 }}>{m.accuracy}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ANALYTICS */}
                    {activeTab === 'analytics' && (
                        <>
                            <h3 className="section-title">Platform Analytics</h3>
                            <div className="hp-card" style={{ marginBottom: 16 }}>
                                <h4 style={{ marginBottom: 14, fontWeight: 700 }}>Engagement by Role</h4>
                                {[
                                    { role: 'Politicians', pct: 78, posts: '24.2K', engagement: '89%' },
                                    { role: 'Journalists', pct: 65, posts: '18.7K', engagement: '72%' },
                                    { role: 'Businesspeople', pct: 54, posts: '11.3K', engagement: '61%' },
                                    { role: 'Citizens', pct: 42, posts: '45.8K', engagement: '48%' },
                                ].map((r, i) => (
                                    <div key={i} style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                                            <span style={{ fontWeight: 600 }}>{r.role}</span>
                                            <span style={{ color: 'var(--text-tertiary)' }}>{r.posts} posts · {r.engagement} engage</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                            <div style={{ width: `${r.pct}%`, height: '100%', background: 'linear-gradient(90deg,var(--primary),var(--accent))', borderRadius: 3 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="hp-card">
                                <h4 style={{ marginBottom: 14, fontWeight: 700 }}>Monthly Active Users</h4>
                                <div className="chart-placeholder" style={{ height: 120 }}>
                                    {[30, 42, 55, 48, 65, 72, 60, 78, 85, 92, 88, 95].map((h, i) => (
                                        <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* RIGHT — Reports + Activity */}
            <aside className="right-panel">
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><AlertTriangleIcon size={15} /> Recent Reports</div>
                    {[
                        { type: 'Hate Speech', count: 78, trend: 'down', color: '#ef4444' },
                        { type: 'Spam / Bots', count: 92, trend: 'down', color: '#f59e0b' },
                        { type: 'Misinformation', count: 34, trend: 'up', color: '#8b5cf6' },
                        { type: 'Harassment', count: 15, trend: 'down', color: '#3b82f6' },
                    ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{r.type}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.count}</span>
                                <span style={{ fontSize: '0.65rem', color: r.trend === 'down' ? '#10b981' : '#ef4444', fontWeight: 700 }}>{r.trend === 'down' ? '↓' : '↑'}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><ActivityIcon size={15} /> System Activity</div>
                    {[
                        { action: 'User @jamesrivera verified', time: '2m ago', type: 'verify' },
                        { action: 'Content removed: spam#1291', time: '15m ago', type: 'remove' },
                        { action: 'New report filed by @david', time: '32m ago', type: 'report' },
                        { action: 'AI model retrained (v2.4)', time: '1h ago', type: 'ai' },
                    ].map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.type === 'verify' ? '#10b981' : a.type === 'remove' ? '#ef4444' : a.type === 'ai' ? '#8b5cf6' : '#f59e0b', marginTop: 7, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{a.action}</div>
                                <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{a.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
