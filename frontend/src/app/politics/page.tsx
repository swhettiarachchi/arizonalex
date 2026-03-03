'use client';
import { useState } from 'react';
import { polls, promises, events, formatNumber } from '@/lib/mock-data';
import { VoteIcon, CalendarIcon, MapPinIcon, UsersIcon, TrendingUpIcon, BarChartIcon, FileTextIcon, PlusIcon, TargetIcon } from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';


export default function PoliticsPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('overview');
    const tabs = ['Overview', 'Polls', 'Promises', 'Events', 'Analytics', 'Bills'];

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header"><h1>Politics Hub</h1></div>
                <div className="tabs">
                    {tabs.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`} onClick={() => setActiveTab(tab.toLowerCase())}>{tab}</button>
                    ))}
                </div>
                <div style={{ padding: 16 }} className="fade-in">
                    {activeTab === 'overview' && (
                        <>
                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                {[
                                    { icon: <VoteIcon size={20} />, val: '2.4M', label: 'Active Voters', change: '+12%', up: true },
                                    { icon: <BarChartIcon size={20} />, val: '156', label: 'Active Polls', change: '+8%', up: true },
                                    { icon: <FileTextIcon size={20} />, val: '89', label: 'Bills in Discussion', change: '+3%', up: true },
                                    { icon: <CalendarIcon size={20} />, val: '24', label: 'Upcoming Events', change: '+15%', up: true },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card">
                                        <span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span>
                                        <span className="stat-value">{s.val}</span>
                                        <span className="stat-label">{s.label}</span>
                                        <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                    </div>
                                ))}
                            </div>
                            <h3 className="section-title">Active Polls</h3>
                            {polls.slice(0, 1).map(poll => (
                                <div key={poll.id} className="poll-card">
                                    <div className="poll-question">{poll.question}</div>
                                    {poll.options.map((opt, i) => {
                                        const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                                        return (<div key={i} className="poll-option"><div className="poll-bar" style={{ width: `${pct}%` }} /><div className="poll-option-content"><span>{opt.label}</span><span style={{ fontWeight: 600 }}>{pct}%</span></div></div>);
                                    })}
                                    <div className="poll-meta"><span>{formatNumber(poll.totalVotes)} votes</span><span>Ends {poll.endDate}</span></div>
                                </div>
                            ))}
                            <h3 className="section-title" style={{ marginTop: 20 }}>Upcoming Events</h3>
                            {events.slice(0, 2).map(ev => (
                                <div key={ev.id} className="event-card">
                                    <span className="event-type">{ev.type}</span>
                                    <div className="event-title">{ev.title}</div>
                                    <div className="event-detail"><CalendarIcon size={13} /> {ev.date}</div>
                                    <div className="event-detail"><MapPinIcon size={13} /> {ev.location}</div>
                                    <div className="event-detail"><UsersIcon size={13} /> {formatNumber(ev.attendees)} attendees</div>
                                </div>
                            ))}
                        </>
                    )}
                    {activeTab === 'polls' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 className="section-title" style={{ margin: 0 }}>Public Polls</h3>
                                <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}><PlusIcon size={14} /> Create Poll</button>
                            </div>
                            {polls.map(poll => (
                                <div key={poll.id} className="poll-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <UserAvatar name={poll.author.name} avatar={poll.author.avatar} />
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{poll.author.name}</span>
                                    </div>
                                    <div className="poll-question">{poll.question}</div>
                                    {poll.options.map((opt, i) => {
                                        const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                                        return (<div key={i} className="poll-option"><div className="poll-bar" style={{ width: `${pct}%` }} /><div className="poll-option-content"><span>{opt.label}</span><span style={{ fontWeight: 600 }}>{pct}%</span></div></div>);
                                    })}
                                    <div className="poll-meta"><span>{formatNumber(poll.totalVotes)} votes</span><span>Ends {poll.endDate}</span></div>
                                </div>
                            ))}
                        </>
                    )}
                    {activeTab === 'promises' && (
                        <>
                            <h3 className="section-title">Promise Tracker</h3>
                            {promises.map(p => (
                                <div key={p.id} className="promise-card">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                                        <UserAvatar name={p.politician.name} avatar={p.politician.avatar} />
                                        <span className={`promise-status ${p.status}`}>{p.status.replace('-', ' ')}</span>
                                    </div>
                                    <div className="promise-info">
                                        <div className="promise-title">{p.title}</div>
                                        <div className="promise-desc">{p.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{p.politician.name} · {p.category} · {p.date}</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    {activeTab === 'events' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 className="section-title" style={{ margin: 0 }}>Political Events</h3>
                                <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}><PlusIcon size={14} /> Create Event</button>
                            </div>
                            {events.map(ev => (
                                <div key={ev.id} className="event-card">
                                    <span className="event-type">{ev.type}</span>
                                    <div className="event-title">{ev.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0' }}>{ev.description}</div>
                                    <div className="event-detail"><CalendarIcon size={13} /> {ev.date}</div>
                                    <div className="event-detail"><MapPinIcon size={13} /> {ev.location}</div>
                                    <div className="event-detail"><UsersIcon size={13} /> {formatNumber(ev.attendees)} attendees</div>
                                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => { })}>RSVP</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Share</button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    {activeTab === 'analytics' && (
                        <>
                            <h3 className="section-title">Political Analytics</h3>
                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                {[
                                    { icon: <UsersIcon size={20} />, val: '68%', label: 'Voter Turnout Prediction' },
                                    { icon: <TrendingUpIcon size={20} />, val: '72%', label: 'Public Approval Average' },
                                    { icon: <BarChartIcon size={20} />, val: '3.2M', label: 'Political Discussions' },
                                    { icon: <TargetIcon size={20} />, val: '85%', label: 'Policy Engagement Rate' },
                                ].map((s, i) => (
                                    <div key={i} className="stat-card"><span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span><span className="stat-value">{s.val}</span><span className="stat-label">{s.label}</span></div>
                                ))}
                            </div>
                            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                                <h4 style={{ marginBottom: 12 }}>Public Sentiment Meter</h4>
                                {['Economy', 'Healthcare', 'Education', 'Environment'].map((topic, i) => {
                                    const pos = [62, 48, 71, 55][i]; const neg = [18, 32, 12, 25][i]; const neu = 100 - pos - neg;
                                    return (
                                        <div key={topic} style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>{topic}</span><span style={{ color: 'var(--text-tertiary)' }}>{pos}% positive</span>
                                            </div>
                                            <div className="sentiment-meter">
                                                <div className="sentiment-positive" style={{ width: `${pos}%` }} /><div className="sentiment-neutral" style={{ width: `${neu}%` }} /><div className="sentiment-negative" style={{ width: `${neg}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="card" style={{ padding: 20 }}>
                                <h4 style={{ marginBottom: 16 }}>Engagement Trends</h4>
                                <div className="chart-placeholder">{[65, 45, 78, 52, 88, 71, 95, 60, 82, 70, 55, 90].map((h, i) => (<div key={i} className="chart-bar" style={{ height: `${h}%` }} />))}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'bills' && (
                        <>
                            <h3 className="section-title">Legislative Proposals</h3>
                            {[
                                { id: 1, title: 'Digital Privacy Protection Act', status: 'In Committee', supporters: 234, category: 'Technology' },
                                { id: 2, title: 'Green Energy Transition Fund', status: 'Floor Vote', supporters: 189, category: 'Environment' },
                                { id: 3, title: 'Universal Healthcare Extension', status: 'Draft', supporters: 312, category: 'Healthcare' },
                                { id: 4, title: 'Education Modernization Bill', status: 'In Committee', supporters: 156, category: 'Education' },
                            ].map(bill => (
                                <div key={bill.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <div><div style={{ fontWeight: 700 }}>{bill.title}</div><div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{bill.category}</div></div>
                                        <span className="post-type-badge badge-policy">{bill.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><UsersIcon size={13} /> {bill.supporters} supporters</span>
                                    </div>
                                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => { })}>Support</button><button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Discuss</button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
