'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notifications, users, formatNumber } from '@/lib/mock-data';
import {
    HeartIcon, HeartFilledIcon, MessageCircleIcon, UserIcon, RepeatIcon,
    BellIcon, CheckCircleIcon, ZapIcon, ShieldIcon, GlobeIcon, UsersIcon,
    TrendingUpIcon, ActivityIcon, ChevronRightIcon
} from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';

const typeIcons: Record<string, React.ReactNode> = {
    like: <HeartFilledIcon size={15} />,
    comment: <MessageCircleIcon size={15} />,
    follow: <UserIcon size={15} />,
    mention: <BellIcon size={15} />,
    repost: <RepeatIcon size={15} />,
    system: <ZapIcon size={15} />,
    verification: <CheckCircleIcon size={15} />,
};

const typeColors: Record<string, string> = {
    like: '#ef4444', comment: '#3b82f6', follow: '#10b981',
    mention: '#f59e0b', repost: '#8b5cf6', system: '#6366f1', verification: '#10b981',
};

const typeBg: Record<string, string> = {
    like: 'rgba(239,68,68,0.1)', comment: 'rgba(59,130,246,0.1)', follow: 'rgba(16,185,129,0.1)',
    mention: 'rgba(245,158,11,0.1)', repost: 'rgba(139,92,246,0.1)', system: 'rgba(99,102,241,0.1)', verification: 'rgba(16,185,129,0.1)',
};

const tabConfig = [
    { id: 'all', label: 'All', icon: <BellIcon size={13} /> },
    { id: 'like', label: 'Likes', icon: <HeartIcon size={13} /> },
    { id: 'comment', label: 'Comments', icon: <MessageCircleIcon size={13} /> },
    { id: 'follow', label: 'Follows', icon: <UserIcon size={13} /> },
    { id: 'mention', label: 'Mentions', icon: <BellIcon size={13} /> },
    { id: 'system', label: 'System', icon: <ZapIcon size={13} /> },
];

export default function NotificationsPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('all');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [readItems, setReadItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(data => { if (data.notifications) setItems(data.notifications); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const markRead = (id: string) => setReadItems(prev => new Set(prev).add(id));
    const markAll = () => requireAuth(() => {
        fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => { });
        setReadItems(new Set(items.map((n: any) => n.id)));
    });
    const isUnread = (n: any) => !n.read && !readItems.has(n.id);
    const filtered = activeTab === 'all' ? items : items.filter((n: any) => n.type === activeTab);
    const unreadCount = items.filter((n: any) => isUnread(n)).length;

    return (
        <div className="page-container home-3col">

            {/* LEFT — Activity Summary */}
            <aside className="home-left-panel">
                <div className="hp-card">
                    <div className="hp-card-title"><ActivityIcon size={15} /> Activity Summary</div>
                    {[
                        { label: 'Unread', val: unreadCount, color: '#ef4444', icon: <BellIcon size={14} /> },
                        { label: 'New Followers', val: items.filter((n: any) => n.type === 'follow').length, color: '#10b981', icon: <UserIcon size={14} /> },
                        { label: 'Likes Given', val: items.filter((n: any) => n.type === 'like').length, color: '#ef4444', icon: <HeartIcon size={14} /> },
                        { label: 'Mentions', val: items.filter((n: any) => n.type === 'mention').length, color: '#f59e0b', icon: <BellIcon size={14} /> },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.label}</div>
                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{s.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* People you may know */}
                <div className="hp-card">
                    <div className="hp-card-title"><UsersIcon size={15} /> People You May Know</div>
                    {users.slice(0, 4).map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <Link href={`/profile/${u.username}`}><UserAvatar name={u.name} avatar={u.avatar} size="sm" /></Link>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{formatNumber(u.followers)} followers</div>
                            </div>
                            <button className="btn btn-outline btn-sm" style={{ fontSize: '0.7rem', padding: '3px 8px', flexShrink: 0 }} onClick={() => requireAuth(() => { })}>Follow</button>
                        </div>
                    ))}
                </div>

                {/* Trending topics sidebar */}
                <div className="hp-card">
                    <div className="hp-card-title"><TrendingUpIcon size={15} /> Trending Now</div>
                    {['#DigitalPrivacyAct', '#Election2026', '#GreenEnergy', '#InfrastructureBill'].map((tag, i) => (
                        <Link key={i} href={`/explore?q=${encodeURIComponent(tag)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--primary)' }}>{tag}</span>
                            <ChevronRightIcon size={13} />
                        </Link>
                    ))}
                </div>
            </aside>

            {/* CENTER — Notifications feed */}
            <div className="feed-column" style={{ minWidth: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10, backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BellIcon size={20} />
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Notifications</h1>
                        {unreadCount > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px' }}>{unreadCount}</span>}
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={markAll}>Mark all read</button>
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {tabConfig.map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification items */}
                {filtered.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <BellIcon size={40} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 12, color: 'var(--text-secondary)' }}>No notifications</div>
                    </div>
                ) : filtered.map(n => (
                    <div key={n.id}
                        className={`notif-item ${isUnread(n) ? 'unread' : ''} fade-in`}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: isUnread(n) ? 'var(--bg-secondary)' : 'transparent', transition: 'background 0.2s' }}
                        onClick={() => requireAuth(() => markRead(n.id))}>
                        {/* Actor avatar or type icon */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            {n.actor
                                ? <UserAvatar name={n.actor.name} avatar={n.actor.avatar} size="sm" />
                                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: typeBg[n.type] || 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColors[n.type] || 'var(--text-secondary)' }}>{typeIcons[n.type]}</div>}
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: typeBg[n.type] || 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColors[n.type] || 'var(--text-secondary)', border: '2px solid var(--bg-primary)' }}>
                                {typeIcons[n.type]}
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                                {n.actor && <Link href={`/profile/${n.actor.username}`} onClick={e => e.stopPropagation()} style={{ fontWeight: 700, color: 'inherit', textDecoration: 'none' }}>{n.actor.name} </Link>}
                                <span style={{ color: 'var(--text-secondary)' }}>{n.content}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{n.timestamp}</div>
                        </div>
                        {isUnread(n) && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 8 }} />}
                    </div>
                ))}
            </div>

            {/* RIGHT — Stats & links */}
            <aside className="right-panel">
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><ShieldIcon size={15} /> Notification Settings</div>
                    {[
                        ['Likes', true], ['Comments', true], ['New Followers', true],
                        ['Mentions', true], ['Reposts', false], ['System Updates', true],
                    ].map(([label, on], i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{label}</span>
                            <button onClick={() => requireAuth(() => { })} style={{ width: 36, height: 20, borderRadius: 10, background: on ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><GlobeIcon size={15} /> Quick Links</div>
                    {[
                        { label: 'Your Profile', href: '/profile' },
                        { label: 'Bookmarks', href: '/bookmarks' },
                        { label: 'Explore Trending', href: '/explore' },
                        { label: 'Politics Hub', href: '/politics' },
                        { label: 'Business Hub', href: '/business' },
                    ].map(link => (
                        <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem', fontWeight: 500 }}>
                            {link.label} <ChevronRightIcon size={14} />
                        </Link>
                    ))}
                </div>
            </aside>
        </div>
    );
}
