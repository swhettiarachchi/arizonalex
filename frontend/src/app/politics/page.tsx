'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import {
    VoteIcon, CalendarIcon, MapPinIcon, UsersIcon, TrendingUpIcon, BarChartIcon,
    FileTextIcon, PlusIcon, TargetIcon, LandmarkIcon, CheckCircleIcon, ClockIcon,
    ActivityIcon, ArrowUpRightIcon, ArrowDownRightIcon, ChevronRightIcon, ShieldIcon,
    GlobeIcon, DollarSignIcon, XIcon, ZapIcon
} from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';

// --- Toast Component ---
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            background: type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
            padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8,
            animation: 'slideInUp 0.3s ease-out'
        }}>
            <CheckCircleIcon size={16} />
            {message}
        </div>
    );
}

// --- Modals ---
function CreatePollModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (poll: any) => void }) {
    const [q, setQ] = useState('');
    const [opts, setOpts] = useState(['', '']);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOpts = opts.filter(o => o.trim() !== '');
        if (!q || validOpts.length < 2) return;

        // Map to what the backend expects: question, options, endDate
        onSubmit({
            question: q,
            options: validOpts.map((label: string) => ({ label })),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="modal-content" style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400, border: '1px solid var(--border)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><XIcon size={20} /></button>
                <h3 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><BarChartIcon size={18} /> Create Public Poll</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Poll Question</label>
                        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="What do you want to ask?" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} required />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Options</label>
                        {opts.map((opt, i) => (
                            <input key={i} value={opt} onChange={e => {
                                const newOpts = [...opts]; newOpts[i] = e.target.value; setOpts(newOpts);
                            }} placeholder={`Option ${i + 1}`} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none', marginBottom: 8 }} required={i < 2} />
                        ))}
                        {opts.length < 4 && (
                            <button type="button" onClick={() => setOpts([...opts, ''])} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><PlusIcon size={12} /> Add Option</button>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Publish Poll</button>
                </form>
            </div>
        </div>
    );
}

function CreateEventModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (ev: any) => void }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('rally');
    const [loc, setLoc] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !loc || !date) return;
        onSubmit({
            title,
            description: desc,
            type,
            location: loc,
            date: new Date(date).toISOString()
        });
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="modal-content" style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 16, width: '100%', maxWidth: 450, border: '1px solid var(--border)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><XIcon size={20} /></button>
                <h3 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><CalendarIcon size={18} /> Organize Political Event</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Event Title (e.g. Townhall Discussion)" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} required />
                    </div>
                    <div>
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Event Summary & Agenda..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none', minHeight: 80, resize: 'none' }} required />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select value={type} onChange={e => setType(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}>
                            <option value="rally">Rally</option>
                            <option value="townhall">Townhall</option>
                            <option value="meeting">Meeting</option>
                            <option value="speech">Keynote Speech</option>
                        </select>
                        <input type="text" value={loc} onChange={e => setLoc(e.target.value)} placeholder="Location (City, State)" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} required />
                    </div>
                    <div>
                        <input type="text" value={date} onChange={e => setDate(e.target.value)} placeholder="Date & Time (e.g. Oct 15, 6:00 PM)" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 8 }}>Register Event</button>
                </form>
            </div>
        </div>
    );
}

const ROLE_LABELS: Record<string, string> = {
    politician: 'Politician', official: 'Gov. Official', journalist: 'Journalist',
    citizen: 'Citizen', admin: 'Admin', businessman: 'Businessman',
    entrepreneur: 'Entrepreneur', crypto_trader: 'Crypto Trader',
    stock_trader: 'Stock Trader', banker: 'Banker', doctor: 'Doctor',
    researcher: 'Researcher', academic: 'Academic', lawyer: 'Lawyer',
    judge: 'Judge', activist: 'Activist', celebrity: 'Celebrity', other: 'Other',
};

const PROMISE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    kept: { label: 'Kept', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    broken: { label: 'Broken', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    pending: { label: 'Pending', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const BILL_STATUS: Record<string, { label: string; color: string }> = {
    floor_vote: { label: 'Floor Vote', color: '#ef4444' },
    committee: { label: 'In Committee', color: '#6366f1' },
    debate: { label: 'Under Debate', color: '#f59e0b' },
    passed: { label: 'Passed', color: '#10b981' },
};

const EVENT_TYPE_COLORS: Record<string, string> = {
    speech: '#3b82f6', rally: '#ef4444', meeting: '#10b981',
    townhall: '#f59e0b', debate: '#8b5cf6',
};

const tabs = [
    { id: 'overview', label: 'Overview', icon: <GlobeIcon size={13} /> },
    { id: 'polls', label: 'Polls', icon: <BarChartIcon size={13} /> },
    { id: 'promises', label: 'Promises', icon: <CheckCircleIcon size={13} /> },
    { id: 'events', label: 'Events', icon: <CalendarIcon size={13} /> },
    { id: 'bills', label: 'Legislation', icon: <FileTextIcon size={13} /> },
    { id: 'analytics', label: 'Analytics', icon: <ActivityIcon size={13} /> },
];

export default function PoliticsPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('overview');

    // UI State
    const [showPollModal, setShowPollModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    // Static Data State
    const stats = [
        { label: 'Active Voters', val: '2.4M', change: '+12%', up: true },
        { label: 'Active Polls', val: '156', change: '+8%', up: true },
        { label: 'Bills in Discussion', val: '89', change: '+3%', up: true },
        { label: 'Upcoming Events', val: '24', change: '+15%', up: true },
    ];
    const [econIndicators, setEconIndicators] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [pollsList, setPollsList] = useState<any[]>([]);
    const [promisesList, setPromisesList] = useState<any[]>([]);
    const [contributors, setContributors] = useState<any[]>([]);
    const loading = false;
    const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});
    const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);

    // Fetch all politics data from APIs
    useEffect(() => {
        fetch('/api/politics/bills').then(r => r.json()).then(data => { if (data.bills) setBills(data.bills); }).catch(() => { });
        fetch('/api/politics/polls').then(r => r.json()).then(data => { if (data.polls) setPollsList(data.polls); }).catch(() => { });
        fetch('/api/politics/promises').then(r => r.json()).then(data => { if (data.promises) setPromisesList(data.promises); }).catch(() => { });
        fetch('/api/politics/events').then(r => r.json()).then(data => { if (data.events) setEvents(data.events); }).catch(() => { });
        fetch('/api/politics/stats').then(r => r.json()).then(data => { if (data.economicIndicators) setEconIndicators(data.economicIndicators); }).catch(() => { });
        fetch('/api/users?limit=6').then(r => r.json()).then(data => { if (data.users) setContributors(data.users); }).catch(() => { });
    }, []);
    const analyticsData = {
        overview: [
            { label: 'Voter Turnout Prediction', val: '68%', change: '+3%', up: true },
            { label: 'Public Approval Average', val: '72%', change: '+1.4%', up: true },
            { label: 'Political Discussions', val: '3.2M', change: '+18%', up: true },
            { label: 'Policy Engagement Rate', val: '85%', change: '+5%', up: true },
        ],
        sentiment: [
            { topic: 'Economy', pos: 62, neg: 18, neu: 20 },
            { topic: 'Healthcare', pos: 48, neg: 32, neu: 20 },
            { topic: 'Education', pos: 71, neg: 12, neu: 17 },
            { topic: 'Environment', pos: 55, neg: 25, neu: 20 },
            { topic: 'Security', pos: 66, neg: 14, neu: 20 },
        ],
        trends: [65, 45, 78, 52, 88, 71, 95, 60, 82, 70, 55, 90]
    };
    const [politicalNews, setPoliticalNews] = useState<any[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [newsIsLive, setNewsIsLive] = useState(false);
    const [newsLastUpdated, setNewsLastUpdated] = useState<number>(0);

    useEffect(() => {
        const fetchPolNews = async () => {
            try {
                const res = await fetch('/api/news');
                if (res.ok) {
                    const data = await res.json();
                    setPoliticalNews((data.articles || []).slice(0, 8));
                    setNewsIsLive(data.isLive === true);
                    setNewsLastUpdated(data.lastUpdated || Date.now());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingNews(false);
            }
        };
        fetchPolNews();
        const int = setInterval(fetchPolNews, 60000);
        return () => clearInterval(int);
    }, []);
    const [selectedPoliticalNews, setSelectedPoliticalNews] = useState<any>(null);

    const castVote = (pollId: string, optIdx: number) =>
        requireAuth(() => {
            setPollsList(prev => prev.map(p => {
                if (p.id === pollId && p.voted === undefined) {
                    const newOpts = [...p.options];
                    newOpts[optIdx] = { ...newOpts[optIdx], votes: newOpts[optIdx].votes + 1 };
                    showToast('Vote cast successfully!', 'success');
                    return { ...p, options: newOpts, voted: optIdx, totalVotes: (p.totalVotes || 0) + 1 };
                }
                return p;
            }));
        });

    const voteBill = (billId: string, type: 'support' | 'oppose') =>
        requireAuth(() => {
            setBills(prev => prev.map(b => {
                if (b.id === billId) {
                    showToast(`Vote recorded: ${type}`, 'success');
                    return type === 'support' 
                        ? { ...b, forVotes: b.forVotes + 1, userVote: type }
                        : { ...b, againstVotes: b.againstVotes + 1, userVote: type };
                }
                return b;
            }));
        });

    const rsvpEvent = (eventId: string) =>
        requireAuth(() => {
            setEvents(prev => prev.map(e => {
                if (e.id === eventId) {
                    const isNowRsvped = !e.isRSVPed;
                    showToast(isNowRsvped ? 'RSVP confirmed!' : 'RSVP cancelled', 'success');
                    return { ...e, isRSVPed: isNowRsvped, attendees: isNowRsvped ? e.attendees + 1 : Math.max(0, e.attendees - 1) };
                }
                return e;
            }));
        });

    return (
        <div className="page-container home-3col">

            {/* LEFT — Key political stats */}
            <aside className="home-left-panel">
                {/* Platform stats */}
                <div className="hp-card">
                    <div className="hp-card-title"><LandmarkIcon size={15} /> Political Pulse</div>
                    {(stats.length > 0 ? stats : [
                        { label: 'Active Voters', val: '2.4M', change: '+12%', up: true },
                        { label: 'Active Polls', val: '156', change: '+8%', up: true },
                        { label: 'Bills in Discussion', val: '89', change: '+3%', up: true },
                        { label: 'Upcoming Events', val: '24', change: '+15%', up: true },
                    ]).map((s, i) => {
                        const iconMap: Record<string, React.ReactNode> = {
                            'Active Voters': <UsersIcon size={14} />,
                            'Active Polls': <BarChartIcon size={14} />,
                            'Bills in Discussion': <FileTextIcon size={14} />,
                            'Upcoming Events': <CalendarIcon size={14} />
                        };
                        const tabMap: Record<string, string> = {
                            'Active Polls': 'polls',
                            'Bills in Discussion': 'bills',
                            'Upcoming Events': 'events',
                            'Active Voters': 'analytics'
                        };
                        const targetTab = tabMap[s.label];

                        return (
                            <div
                                key={i}
                                onClick={() => targetTab && setActiveTab(targetTab)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 0',
                                    borderBottom: '1px solid var(--border-light)',
                                    cursor: targetTab ? 'pointer' : 'default',
                                    transition: 'background-color 0.2s ease',
                                }}
                                className="pulse-item-hover"
                            >
                                <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{iconMap[s.label] || <ActivityIcon size={14} />}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.label}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.val}</div>
                                </div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.up ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {s.up ? <ArrowUpRightIcon size={11} /> : <ArrowDownRightIcon size={11} />}{s.change}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Upcoming Events mini-list */}
                <div className="hp-card">
                    <div className="hp-card-title"><CalendarIcon size={15} /> Next Events</div>
                    {events.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', padding: '8px 0' }}>Loading events...</div>}
                    {events.slice(0, 3).map(ev => (
                        <div key={ev.id}
                            onClick={() => setActiveTab('events')}
                            style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-light)', cursor: 'pointer', borderRadius: 8, padding: '8px', transition: 'background 0.2s' }}
                            className="pulse-item-hover"
                        >
                            <div style={{ minWidth: 40, textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '4px 0', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.56rem', color: EVENT_TYPE_COLORS[ev.type] || 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{ev.type}</div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1 }}>{ev.date.split(' ')[1]?.replace(',', '')}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 2 }}>{ev.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPinIcon size={11} /> {ev.location}</div>
                                <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}><UsersIcon size={11} /> {formatNumber(ev.attendees)} attending</div>
                            </div>
                            <ChevronRightIcon size={14} />
                        </div>
                    ))}
                    {events.length > 0 && (
                        <button className="tab active" style={{ width: '100%', borderRadius: 8, marginTop: 4 }} onClick={() => setActiveTab('events')}>View All Events <ChevronRightIcon size={13} /></button>
                    )}
                </div>

                {/* Sentiment */}
                <div className="hp-card">
                    <div className="hp-card-title"><ActivityIcon size={15} /> Public Sentiment</div>
                    {['Economy', 'Healthcare', 'Education', 'Environment'].map((topic, i) => {
                        const pos = [62, 48, 71, 55][i];
                        const neg = [18, 32, 12, 25][i];
                        const isSelected = sentimentFilter === topic;
                        return (
                            <div key={topic}
                                onClick={() => {
                                    setSentimentFilter(isSelected ? null : topic);
                                    setActiveTab('analytics');
                                    showToast(`Viewing ${topic} sentiment details`, 'success');
                                }}
                                style={{
                                    marginBottom: 12, cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
                                    border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                                    background: isSelected ? 'rgba(59,130,246,0.06)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                                className="pulse-item-hover"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{topic}</span>
                                    <span style={{ color: '#10b981', fontWeight: 700 }}>{pos}% positive</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: `${pos}%`, background: '#10b981' }} />
                                    <div style={{ width: `${100 - pos - neg}%`, background: 'var(--bg-tertiary)' }} />
                                    <div style={{ width: `${neg}%`, background: '#ef4444' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* CENTER — Main content */}
            <div className="feed-column" style={{ minWidth: 0 }}>

                {/* Live news ticker */}
                {politicalNews.length > 0 && (
                    <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', overflowX: 'hidden', position: 'relative' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, whiteSpace: 'nowrap', background: newsIsLive ? '#ef4444' : 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em', zIndex: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {newsIsLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />}
                            LIVE
                        </span>
                        <div className="ticker-scroll" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                            {politicalNews.slice(0, 4).map(n => (
                                <span key={n.id} style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    onClick={() => setSelectedPoliticalNews(n)}>
                                    <span style={{ color: n.urgencyLevel === 'breaking' ? '#ef4444' : n.urgencyLevel === 'high' ? '#f97316' : 'var(--text-tertiary)', fontWeight: 700, marginRight: 4 }}>
                                        {n.urgencyLevel === 'breaking' ? '🔴' : n.urgencyLevel === 'high' ? '🟡' : '•'}
                                    </span>
                                    {n.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LandmarkIcon size={20} />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Politics Hub</h1>
                    {newsIsLive && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '3px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />Live Updates</span>}
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '16px' }} className="fade-in">

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Featured Poll */}
                            <div className="hp-card" style={{ marginBottom: 16 }}>
                                <div className="hp-card-title"><BarChartIcon size={15} /> Featured Poll</div>
                                {(() => {
                                    const poll = pollsList[0];
                                    if (!poll) return <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No active polls</div>;
                                    const voted = poll.voted;
                                    return (
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 12, lineHeight: 1.4 }}>{poll.question}</div>
                                            {poll.options.map((opt: any, i: number) => {
                                                const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                                                return (
                                                    <button key={i} onClick={() => castVote(poll.id, i)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
                                                        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${voted === i ? 'var(--primary)' : 'var(--border)'}`, background: 'var(--bg-tertiary)' }}>
                                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: voted !== undefined ? `${pct}%` : '0%', background: voted === i ? 'rgba(59,130,246,0.18)' : 'rgba(100,116,139,0.1)', transition: 'width 0.6s ease' }} />
                                                            <div style={{ position: 'relative', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                                <span style={{ fontWeight: voted === i ? 700 : 500 }}>{opt.label}</span>
                                                                {voted !== undefined && <span style={{ fontWeight: 700, color: voted === i ? 'var(--primary)' : 'var(--text-secondary)' }}>{pct}%</span>}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                                                <span><UsersIcon size={11} /> {formatNumber(poll.totalVotes)} votes</span>
                                                <span><ClockIcon size={11} /> Ends {poll.endDate}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Active Bills preview */}
                            <div className="hp-card" style={{ marginBottom: 16 }}>
                                <div className="hp-card-title"><FileTextIcon size={15} /> Active Legislation</div>
                                {bills.slice(0, 2).map((bill: any) => {
                                    const st = BILL_STATUS[bill.status] || { label: bill.status, color: '#94a3b8' };
                                    const total = bill.forVotes + bill.againstVotes;
                                    const forPct = total > 0 ? (bill.forVotes / total) * 100 : 50;
                                    return (
                                        <div key={bill.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${st.color}20`, color: st.color }}>{st.label}</span>
                                                <span style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{bill.code}</span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>{bill.title}</div>
                                            <div style={{ height: 6, borderRadius: 3, display: 'flex', overflow: 'hidden', marginBottom: 4 }}>
                                                <div style={{ width: `${forPct}%`, background: '#10b981' }} />
                                                <div style={{ width: `${100 - forPct}%`, background: '#ef4444' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                                                <span style={{ color: '#10b981', fontWeight: 700 }}>{bill.forVotes} For</span>
                                                <span style={{ color: '#ef4444', fontWeight: 700 }}>{bill.againstVotes} Against</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <button className="tab active" style={{ width: '100%', borderRadius: 8 }} onClick={() => setActiveTab('bills')}>View All Bills <ChevronRightIcon size={13} /></button>
                            </div>

                            {/* Upcoming Events */}
                            <div className="hp-card">
                                <div className="hp-card-title"><CalendarIcon size={15} /> Upcoming Events</div>
                                {events.slice(0, 2).map((ev: any) => (
                                    <div key={ev.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${EVENT_TYPE_COLORS[ev.type] || '#6366f1'}20`, color: EVENT_TYPE_COLORS[ev.type] || '#6366f1', textTransform: 'capitalize' }}>{ev.type}</span>
                                        <div style={{ fontWeight: 700, marginTop: 6, marginBottom: 4 }}>{ev.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{ev.description}</div>
                                        <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon size={12} />{ev.date}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPinIcon size={12} />{ev.location}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><UsersIcon size={12} />{formatNumber(ev.attendees)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button className="btn btn-primary btn-sm" style={{ flex: 1, minWidth: '80px' }} onClick={() => rsvpEvent(ev.id)}>RSVP</button>
                                            <button className="btn btn-outline btn-sm" style={{ flex: 1, minWidth: '80px' }} onClick={() => requireAuth(() => showToast('Event link copied to clipboard', 'success'))}>Share</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Live Political News Feed */}
                            <div className="hp-card" style={{ marginTop: 16 }}>
                                <div className="hp-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GlobeIcon size={15} /> Political News Feed</span>
                                    {newsIsLive && <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />LIVE</span>}
                                </div>
                                {loadingNews && politicalNews.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading news...</div>
                                )}
                                {politicalNews.length === 0 && !loadingNews && (
                                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No political news available right now</div>
                                )}
                                {politicalNews.map((article: any) => {
                                    const sentColors: Record<string, { color: string; bg: string }> = {
                                        positive: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                                        negative: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
                                        neutral: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
                                    };
                                    const sent = sentColors[article.sentiment] || sentColors.neutral;
                                    return (
                                        <div key={article.id} onClick={() => setSelectedPoliticalNews(article)}
                                            style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.15s' }}
                                            className="pulse-item-hover">
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5, alignItems: 'center' }}>
                                                {(article.urgencyLevel === 'breaking' || article.urgencyLevel === 'high') && (
                                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: article.urgencyLevel === 'breaking' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.12)', color: article.urgencyLevel === 'breaking' ? '#ef4444' : '#f97316' }}>
                                                        {article.urgencyLevel === 'breaking' ? 'BREAKING' : 'HIGH'}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: sent.bg, color: sent.color }}>{article.sentiment}</span>
                                                {article.country && article.country !== 'Global' && (
                                                    <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>🌍 {article.country}</span>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4, lineHeight: 1.35 }}>{article.title}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                <span style={{ fontWeight: 600 }}>{article.source}</span>
                                                <span>•</span>
                                                <span>{article.timeAgo}</span>
                                                {article.impactScore && <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: article.impactScore >= 70 ? '#ef4444' : article.impactScore >= 50 ? '#f59e0b' : '#6b7280' }}><ZapIcon size={10} />{article.impactScore}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* POLLS */}
                    {activeTab === 'polls' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 className="section-title" style={{ margin: 0 }}>Public Polls</h3>
                                <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setShowPollModal(true)}><PlusIcon size={14} /> Create Poll</button>
                            </div>
                            {pollsList.map(poll => {
                                const voted = poll.voted;
                                return (
                                    <div key={poll.id} className="hp-card" style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                            <UserAvatar name={poll.author?.name || 'Anonymous'} avatar={poll.author?.avatar || ''} size="sm" />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{poll.author?.name || 'Anonymous'}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>@{poll.author?.username || 'anonymous'}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, lineHeight: 1.4 }}>{poll.question}</div>
                                        {poll.options.map((opt: any, i: number) => {
                                            const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                                            return (
                                                <button key={i} onClick={() => castVote(poll.id, i)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
                                                    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${voted === i ? 'var(--primary)' : 'var(--border)'}`, background: 'var(--bg-tertiary)' }}>
                                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: voted !== undefined ? `${pct}%` : '0%', background: voted === i ? 'rgba(59,130,246,0.18)' : 'rgba(100,116,139,0.1)', transition: 'width 0.6s ease' }} />
                                                        <div style={{ position: 'relative', padding: '9px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                            <span style={{ fontWeight: voted === i ? 700 : 500 }}>{opt.label}</span>
                                                            {voted !== undefined && <span style={{ fontWeight: 700, color: voted === i ? 'var(--primary)' : 'var(--text-secondary)' }}>{pct}%</span>}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                                            <span>{formatNumber(poll.totalVotes)} votes</span>
                                            <span>Ends {poll.endDate}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* PROMISES */}
                    {
                        activeTab === 'promises' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <CheckCircleIcon size={18} />
                                    <h3 className="section-title" style={{ margin: 0 }}>Promise Tracker</h3>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                    {Object.entries(PROMISE_STATUS).map(([k, v]) => (
                                        <span key={k} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: v.bg, color: v.color }}>
                                            {v.label}: {promisesList.filter(p => p.status === k).length}
                                        </span>
                                    ))}
                                </div>
                                {promisesList.map((p: any) => {
                                    const st = PROMISE_STATUS[p.status];
                                    return (
                                        <div key={p.id} className="hp-card" style={{ marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                <Link href={`/profile/${p.politician.username}`}><UserAvatar name={p.politician.name} avatar={p.politician.avatar} size="sm" /></Link>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{p.category}</span>
                                                    </div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{p.title}</div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{p.description}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                                                        {p.politician.name} · Promised {p.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )
                    }

                    {/* EVENTS */}
                    {
                        activeTab === 'events' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 className="section-title" style={{ margin: 0 }}>Political Events</h3>
                                    <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setShowEventModal(true)}><PlusIcon size={14} /> Create Event</button>
                                </div>
                                {events.map(ev => (
                                    <div key={ev.id} className="hp-card" style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${EVENT_TYPE_COLORS[ev.type] || '#6366f1'}20`, color: EVENT_TYPE_COLORS[ev.type] || '#6366f1', textTransform: 'capitalize' }}>{ev.type}</span>
                                            <div style={{ minWidth: 44, textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '4px 6px' }}>
                                                <div style={{ fontSize: '0.56rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>{ev.date.split(' ')[0]}</div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>{ev.date.split(' ')[1]?.replace(',', '')}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{ev.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{ev.description}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={13} />{ev.date}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={13} />{ev.location}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><UsersIcon size={13} />{formatNumber(ev.attendees)} attending</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button className={`btn btn-sm ${ev.isRSVPed ? 'btn-outline' : 'btn-primary'}`} style={{ flex: 1, minWidth: '100px' }} onClick={() => rsvpEvent(ev.id)}>
                                                {ev.isRSVPed ? 'Cancel RSVP' : 'RSVP Now'}
                                            </button>
                                            <button className="btn btn-outline btn-sm" style={{ flex: 1, minWidth: '100px' }} onClick={() => requireAuth(() => showToast('Event link copied to clipboard', 'success'))}>Share Event</button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )
                    }

                    {/* BILLS */}
                    {
                        activeTab === 'bills' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <FileTextIcon size={18} />
                                    <h3 className="section-title" style={{ margin: 0 }}>Active Legislation</h3>
                                </div>
                                {bills.map(bill => {
                                    const st = BILL_STATUS[bill.status] || { label: bill.status, color: '#94a3b8' };
                                    const total = bill.forVotes + bill.againstVotes;
                                    const forPct = total > 0 ? Math.round((bill.forVotes / total) * 100) : 50;
                                    return (
                                        <div key={bill.id} className="hp-card" style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${st.color}20`, color: st.color }}>{st.label}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>{bill.code} · {bill.category}</span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{bill.title}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{bill.description}</div>
                                            {total > 0 && (
                                                <>
                                                    <div style={{ height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden', marginBottom: 6 }}>
                                                        <div style={{ width: `${forPct}%`, background: 'linear-gradient(90deg,#10b981,#059669)' }} />
                                                        <div style={{ width: `${100 - forPct}%`, background: 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 10 }}>
                                                        <span style={{ color: '#10b981', fontWeight: 700 }}>For: {bill.forVotes} ({forPct}%)</span>
                                                        <span style={{ color: '#ef4444', fontWeight: 700 }}>Against: {bill.againstVotes} ({100 - forPct}%)</span>
                                                    </div>
                                                </>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                                                <CalendarIcon size={13} /> Vote: <strong style={{ color: 'var(--text-primary)' }}>{bill.date}</strong>
                                                <span style={{ marginLeft: 'auto' }}>{bill.daysActive} days active</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button className={`btn btn-sm ${bill.userVote === 'support' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, minWidth: '80px' }} onClick={() => voteBill(bill.id, 'support')}>Support</button>
                                                <button className={`btn btn-sm ${bill.userVote === 'oppose' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, minWidth: '80px' }} onClick={() => voteBill(bill.id, 'oppose')}>Oppose</button>
                                                <button className="btn btn-outline btn-sm" style={{ flex: 1, minWidth: '80px' }} onClick={() => requireAuth(() => showToast('Discussion thread opened', 'success'))}>Discuss</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )
                    }

                    {/* ANALYTICS */}
                    {
                        activeTab === 'analytics' && (
                            <>
                                {/* ANALYTICS */}
                                {
                                    activeTab === 'analytics' && (
                                        <>
                                            <h3 className="section-title">Political Analytics</h3>
                                            <div className="stats-grid" style={{ marginBottom: 20 }}>
                                                {(analyticsData?.overview || [
                                                    { label: 'Voter Turnout Prediction', val: '68%', change: '+3%', up: true },
                                                    { label: 'Public Approval Average', val: '72%', change: '+1.4%', up: true },
                                                    { label: 'Political Discussions', val: '3.2M', change: '+18%', up: true },
                                                    { label: 'Policy Engagement Rate', val: '85%', change: '+5%', up: true },
                                                ]).map((s: any, i: number) => (
                                                    <div key={i} className="stat-card pulse-item-hover" style={{ cursor: 'pointer' }} onClick={() => showToast(`Insight: ${s.label} is currently ${s.up ? 'increasing' : 'decreasing'} by ${s.change.replace('+', '')}`, 'success')}>
                                                        <span className="stat-icon" style={{ color: 'var(--primary)' }}>
                                                            {i === 0 ? <UsersIcon size={20} /> : i === 1 ? <TrendingUpIcon size={20} /> : i === 2 ? <BarChartIcon size={20} /> : <TargetIcon size={20} />}
                                                        </span>
                                                        <span className="stat-value">{s.val}</span>
                                                        <span className="stat-label">{s.label}</span>
                                                        <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="hp-card" style={{ marginBottom: 16 }}>
                                                <h4 style={{ marginBottom: 14, fontWeight: 700 }}>Public Sentiment by Topic</h4>
                                                {(analyticsData?.sentiment || [
                                                    { topic: 'Economy', pos: 62, neg: 18, neu: 20 },
                                                    { topic: 'Healthcare', pos: 48, neg: 32, neu: 20 },
                                                    { topic: 'Education', pos: 71, neg: 12, neu: 17 },
                                                    { topic: 'Environment', pos: 55, neg: 25, neu: 20 },
                                                    { topic: 'Security', pos: 66, neg: 14, neu: 20 },
                                                ]).map((s: any) => {
                                                    const isSelected = sentimentFilter === s.topic;
                                                    return (
                                                        <div key={s.topic}
                                                            onClick={() => setSentimentFilter(isSelected ? null : s.topic)}
                                                            style={{
                                                                marginBottom: 14, cursor: 'pointer', padding: '10px', borderRadius: 10,
                                                                background: isSelected ? 'rgba(59,130,246,0.06)' : 'transparent',
                                                                border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            className="pulse-item-hover"
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                                                                <span style={{ fontWeight: 600 }}>{s.topic} {isSelected && <span style={{ color: 'var(--primary)', fontSize: '0.7rem', marginLeft: 4 }}>(Focused)</span>}</span>
                                                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{s.pos}% positive · {s.neg}% negative</span>
                                                            </div>
                                                            <div style={{ height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden', gap: 2 }}>
                                                                <div style={{ width: `${s.pos}%`, background: '#10b981', borderRadius: '4px 0 0 4px' }} />
                                                                <div style={{ width: `${s.neu}%`, background: 'var(--bg-tertiary)' }} />
                                                                <div style={{ width: `${s.neg}%`, background: '#ef4444', borderRadius: '0 4px 4px 0' }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="hp-card">
                                                <h4 style={{ marginBottom: 14, fontWeight: 700 }}>Engagement Trends (2025)</h4>
                                                <div className="chart-placeholder" style={{ height: 120 }}>
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                                                        const h = (analyticsData?.trends || [65, 45, 78, 52, 88, 71, 95, 60, 82, 70, 55, 90])[i];
                                                        return (
                                                            <div key={i}
                                                                className="chart-bar pulse-item-hover"
                                                                title={`${month} 2025: ${h}% engagement`}
                                                                onClick={() => {
                                                                    showToast(`${month} 2025 engagement: ${h}%`, 'success');
                                                                    window.open(`https://www.google.com/search?q=US+politics+events+${month}+2025`, '_blank', 'noopener,noreferrer');
                                                                }}
                                                                style={{
                                                                    height: `${h}%`,
                                                                    opacity: sentimentFilter ? (i % 3 === 0 ? 1 : 0.4) : 1,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                                                </div>
                                                {sentimentFilter && (
                                                    <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>
                                                        Showing specific engagement for {sentimentFilter}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )
                                }
                            </>
                        )
                    }
                </div >
            </div >

            {/* RIGHT — Economic impact & contributors */}
            < aside className="right-panel" >
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><DollarSignIcon size={15} /> Economic Impact</div>
                    {econIndicators.slice(0, 4).map((ind, idx) => {
                        const url = (ind as any).url;
                        return (
                            <div key={ind.id}
                                onClick={() => {
                                    if (url) {
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                    } else {
                                        showToast(`${ind.label}: ${ind.value} (${ind.change})`, 'success');
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }}
                                className="pulse-item-hover"
                            >
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{ind.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{ind.period}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{ind.value}</div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: ind.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                            {ind.positive ? <ArrowUpRightIcon size={11} /> : <ArrowDownRightIcon size={11} />}{ind.change}
                                        </div>
                                    </div>
                                    {url && <ArrowUpRightIcon size={12} />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><ShieldIcon size={15} /> Top Contributors</div>
                    {contributors.filter((u: any) => u.role === 'politician' || u.role === 'official').slice(0, 4).map((u: any) => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <Link href={`/profile/${u.username}`}><UserAvatar name={u.name} avatar={u.avatar} size="sm" /></Link>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.name}</div>
                                <span className={`role-badge role-${u.role}`} style={{ fontSize: '0.6rem' }}>{u.role === 'official' ? 'Gov. Official' : 'Politician'}</span>
                            </div>
                            <button className={`btn btn-sm ${followedUsers[u.username] ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.72rem', padding: '3px 9px' }} onClick={() => requireAuth(async () => {
                                try {
                                    const res = await fetch('/api/users/follow', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ username: u.username })
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        setFollowedUsers(prev => ({ ...prev, [u.username]: data.following }));
                                        showToast(data.following ? `Following ${u.name}` : `Unfollowed ${u.name}`, 'success');
                                    } else {
                                        showToast('Failed to follow', 'error');
                                    }
                                } catch {
                                    showToast('Failed to connect to server', 'error');
                                }
                            })}>{followedUsers[u.username] ? 'Following' : 'Follow'}</button>
                        </div>
                    ))}
                </div>
            </aside >

            {/* Modals & Overlays */}
            {showPollModal && (
                <CreatePollModal
                    onClose={() => setShowPollModal(false)}
                    onSubmit={(poll) => requireAuth(async () => {
                        try {
                            const res = await fetch('/api/politics/polls', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(poll)
                            });
                            const data = await res.json();
                            if (res.ok && data.poll) {
                                setPollsList(prev => [data.poll, ...prev]);
                                setShowPollModal(false);
                                showToast('Your poll was published live!', 'success');
                            } else {
                                showToast(data.error || 'Failed to publish poll', 'error');
                            }
                        } catch {
                            showToast('Failed to connect to server', 'error');
                        }
                    })}
                />
            )}

            {showEventModal && (
                <CreateEventModal
                    onClose={() => setShowEventModal(false)}
                    onSubmit={(ev) => requireAuth(async () => {
                        try {
                            const res = await fetch('/api/politics/events', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(ev)
                            });
                            const data = await res.json();
                            if (res.ok && data.event) {
                                setEvents(prev => [data.event, ...prev]);
                                setShowEventModal(false);
                                showToast('Your event has been scheduled', 'success');
                            } else {
                                showToast(data.error || 'Failed to schedule event', 'error');
                            }
                        } catch {
                            showToast('Failed to connect to server', 'error');
                        }
                    })}
                />
            )}

            {/* Political News Detail Modal */}
            {selectedPoliticalNews && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
                    onClick={() => setSelectedPoliticalNews(null)}>
                    <div className="modal-content fade-in" style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 16, width: '95%', maxWidth: 520, border: '1px solid var(--border)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedPoliticalNews(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><XIcon size={20} /></button>

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                            {(selectedPoliticalNews.urgencyLevel === 'breaking' || selectedPoliticalNews.urgencyLevel === 'high') && (
                                <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12, background: selectedPoliticalNews.urgencyLevel === 'breaking' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.12)', color: selectedPoliticalNews.urgencyLevel === 'breaking' ? '#ef4444' : '#f97316' }}>
                                    {selectedPoliticalNews.urgencyLevel === 'breaking' ? 'BREAKING' : 'HIGH URGENCY'}
                                </span>
                            )}
                            {selectedPoliticalNews.sentiment && (
                                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 12, background: selectedPoliticalNews.sentiment === 'positive' ? 'rgba(16,185,129,0.12)' : selectedPoliticalNews.sentiment === 'negative' ? 'rgba(239,68,68,0.12)' : 'rgba(107,114,128,0.12)', color: selectedPoliticalNews.sentiment === 'positive' ? '#10b981' : selectedPoliticalNews.sentiment === 'negative' ? '#ef4444' : '#6b7280' }}>
                                    {selectedPoliticalNews.sentiment}
                                </span>
                            )}
                            {selectedPoliticalNews.topic && (
                                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>{selectedPoliticalNews.topic}</span>
                            )}
                        </div>

                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35, margin: '0 0 12px' }}>{selectedPoliticalNews.title}</h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{selectedPoliticalNews.source}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{selectedPoliticalNews.timeAgo}</span>
                            {selectedPoliticalNews.country && selectedPoliticalNews.country !== 'Global' && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>🌍 {selectedPoliticalNews.country}</span>
                            )}
                        </div>

                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, borderLeft: '3px solid #8b5cf6' }}>
                            <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#8b5cf6', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <ActivityIcon size={12} /> AI SUMMARY
                            </div>
                            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, margin: 0, color: 'var(--text-secondary)' }}>
                                {selectedPoliticalNews.description || 'Our intelligence team is monitoring this developing political story and will provide expert analysis shortly.'}
                            </p>
                        </div>

                        {selectedPoliticalNews.keyPoints && selectedPoliticalNews.keyPoints.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>Key Points</div>
                                {selectedPoliticalNews.keyPoints.map((kp: string, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: '#8b5cf6', fontWeight: 700, flexShrink: 0 }}>•</span>
                                        <span>{kp}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                            {selectedPoliticalNews.url ? (
                                <a href={selectedPoliticalNews.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <ArrowUpRightIcon size={14} /> Read Full Story
                                </a>
                            ) : (
                                <a href={`https://news.google.com/search?q=${encodeURIComponent(selectedPoliticalNews.title)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <ArrowUpRightIcon size={14} /> Search on Google News
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div >
    );
}
