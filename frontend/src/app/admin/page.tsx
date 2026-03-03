'use client';
import { useState } from 'react';
import { users, platformStats, formatNumber } from '@/lib/mock-data';
import { UsersIcon, BarChartIcon, ZapIcon, CheckCircleIcon, ShieldIcon, BotIcon, TrendingUpIcon, SearchIcon, AlertTriangleIcon, VerifiedIcon, FileTextIcon } from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';


export default function AdminPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const tabs = ['Dashboard', 'Users', 'Content', 'Verification', 'AI Monitor'];

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header"><h1>Admin Panel</h1></div>
                <div className="tabs">
                    {tabs.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab.toLowerCase().replace(' ', '-') ? 'active' : ''}`} onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}>{tab}</button>
                    ))}
                </div>
                <div style={{ padding: 16 }} className="fade-in">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                {[
                                    { icon: <UsersIcon size={20} />, val: formatNumber(platformStats.totalUsers), label: 'Total Users', change: '+4.2%', up: true },
                                    { icon: <ZapIcon size={20} />, val: formatNumber(platformStats.activeToday), label: 'Active Today', change: '+12%', up: true },
                                    { icon: <FileTextIcon size={20} />, val: formatNumber(platformStats.postsToday), label: 'Posts Today', change: '+8%', up: true },
                                    { icon: <AlertTriangleIcon size={20} />, val: String(platformStats.reportsToday), label: 'Reports', change: '-5%', up: false },
                                    { icon: <BotIcon size={20} />, val: formatNumber(platformStats.aiModerationsToday), label: 'AI Moderations', change: '+15%', up: true },
                                    { icon: <CheckCircleIcon size={20} />, val: String(platformStats.newVerificationRequests), label: 'Verification Req.', change: '+3', up: true },
                                    { icon: <ZapIcon size={20} />, val: platformStats.serverUptime + '%', label: 'Server Uptime' },
                                    { icon: <TrendingUpIcon size={20} />, val: platformStats.avgResponseTime + 'ms', label: 'Avg Response' },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card">
                                        <span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span>
                                        <span className="stat-value">{s.val}</span><span className="stat-label">{s.label}</span>
                                        {s.change && <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                                <h4 style={{ marginBottom: 16 }}>User Growth</h4>
                                <div className="chart-placeholder">{[30, 42, 55, 48, 65, 72, 60, 78, 85, 92, 88, 95].map((h, i) => (<div key={i} className="chart-bar" style={{ height: `${h}%` }} />))}</div>
                            </div>
                            <div className="card" style={{ padding: 20 }}>
                                <h4 style={{ marginBottom: 12 }}>Quick Actions</h4>
                                <div className="grid-2">
                                    {[{ icon: <BarChartIcon size={16} />, l: 'View Analytics' }, { icon: <AlertTriangleIcon size={16} />, l: 'Review Reports' }, { icon: <CheckCircleIcon size={16} />, l: 'Approve Verifications' }, { icon: <BotIcon size={16} />, l: 'AI Settings' }, { icon: <ShieldIcon size={16} />, l: 'Security Logs' }, { icon: <FileTextIcon size={16} />, l: 'Send Announcement' }].map((a, i) => (
                                        <button key={i} className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 8 }} onClick={() => requireAuth(() => { })}>{a.icon} {a.l}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'users' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                <h3 className="section-title" style={{ margin: 0 }}>User Management</h3>
                                <div className="search-box" style={{ maxWidth: 260 }}><span className="search-icon"><SearchIcon size={14} /></span><input placeholder="Search users" /></div>
                            </div>
                            <div className="card" style={{ overflow: 'auto' }}>
                                <table className="admin-table">
                                    <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Followers</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserAvatar name={user.name} avatar={user.avatar} /><div><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>@{user.username}</div></div></div></td>
                                                <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                                                <td><span style={{ color: user.verified ? 'var(--success)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>{user.verified ? <><VerifiedIcon size={13} /> Verified</> : 'Unverified'}</span></td>
                                                <td>{formatNumber(user.followers)}</td>
                                                <td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-sm btn-secondary" onClick={() => requireAuth(() => { })}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => requireAuth(() => { })}>Ban</button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {activeTab === 'content' && (
                        <>
                            <h3 className="section-title">Content Moderation Queue</h3>
                            {[
                                { id: 1, type: 'Hate Speech', user: 'anon123', content: 'Flagged comment containing...', severity: 'High', ai: '99.2%' },
                                { id: 2, type: 'Misinformation', user: 'newuser456', content: 'Claim about election results...', severity: 'Medium', ai: '78.5%' },
                                { id: 3, type: 'Spam', user: 'bot_account', content: 'Buy followers cheap...', severity: 'Low', ai: '97.8%' },
                                { id: 4, type: 'Harassment', user: 'user789', content: 'Threatening message to...', severity: 'High', ai: '95.1%' },
                            ].map(item => (
                                <div key={item.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <span className={`role-badge ${item.severity === 'High' ? 'role-admin' : item.severity === 'Medium' ? 'role-journalist' : 'role-citizen'}`}>{item.severity} · {item.type}</span>
                                            <div style={{ fontWeight: 600, marginTop: 6 }}>@{item.user}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{item.content}</div>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>AI Confidence: {item.ai}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className="btn btn-danger btn-sm" onClick={() => requireAuth(() => { })}>Remove</button><button className="btn btn-secondary btn-sm" onClick={() => requireAuth(() => { })}>Dismiss</button><button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Review</button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    {activeTab === 'verification' && (
                        <>
                            <h3 className="section-title">Pending Verification Requests</h3>
                            {[
                                { name: 'Maria Santos', username: 'mariasantos', role: 'politician', party: 'Democratic Front', docs: 'ID, Official Letter' },
                                { name: 'David Lee', username: 'davidlee', role: 'journalist', docs: 'Press ID, Portfolio' },
                                { name: 'Amara Johnson', username: 'amaraj', role: 'official', party: 'Independent', docs: 'Government ID' },
                            ].map((req, i) => (
                                <div key={i} className="card" style={{ padding: 16, marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <UserAvatar name={req.name} size="md" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700 }}>{req.name}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>@{req.username}</div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                                <span className={`role-badge role-${req.role}`}>{req.role}</span>
                                                {req.party && <span className="role-badge role-politician">{req.party}</span>}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Documents: {req.docs}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => { })}>Approve</button><button className="btn btn-danger btn-sm" onClick={() => requireAuth(() => { })}>Reject</button><button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Review Docs</button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    {activeTab === 'ai-monitor' && (
                        <>
                            <h3 className="section-title">AI System Monitor</h3>
                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                {[
                                    { icon: <BotIcon size={20} />, val: '97.9%', label: 'Model Accuracy' },
                                    { icon: <ZapIcon size={20} />, val: '42ms', label: 'Avg Response Time' },
                                    { icon: <BarChartIcon size={20} />, val: '15.6K', label: 'Moderations Today' },
                                    { icon: <ShieldIcon size={20} />, val: '219', label: 'Auto-Removals' },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card"><span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span><span className="stat-value">{s.val}</span><span className="stat-label">{s.label}</span></div>
                                ))}
                            </div>
                            <div className="card" style={{ padding: 20 }}>
                                <h4 style={{ marginBottom: 12 }}>AI Model Performance</h4>
                                {[
                                    { model: 'Hate Speech Detection', accuracy: 99.2, calls: '4.2K' },
                                    { model: 'Spam Detection', accuracy: 97.8, calls: '8.1K' },
                                    { model: 'Misinformation Checker', accuracy: 94.5, calls: '2.3K' },
                                    { model: 'Sentiment Analyzer', accuracy: 96.1, calls: '12.4K' },
                                    { model: 'Content Recommender', accuracy: 91.3, calls: '45.2K' },
                                ].map((m, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.model}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.calls} calls today</div></div>
                                        <div style={{ width: 120 }}>
                                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${m.accuracy}%` }} /></div>
                                            <div style={{ fontSize: '0.75rem', textAlign: 'right', marginTop: 2, color: 'var(--success)' }}>{m.accuracy}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
