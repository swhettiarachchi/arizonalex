'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import {
    HeartIcon, HeartFilledIcon, MessageCircleIcon, UserIcon, RepeatIcon,
    BellIcon, CheckCircleIcon, ZapIcon, ShieldIcon, GlobeIcon, UsersIcon,
    TrendingUpIcon, ActivityIcon, ChevronRightIcon
} from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';

const typeIcons: Record<string, React.ReactNode> = {
    like: <HeartIcon size={18} strokeWidth={1.5} />,
    comment: <MessageCircleIcon size={18} strokeWidth={1.5} />,
    follow: <UserIcon size={18} strokeWidth={1.5} />,
    mention: <BellIcon size={18} strokeWidth={1.5} />,
    repost: <RepeatIcon size={18} strokeWidth={1.5} />,
    system: <ZapIcon size={18} strokeWidth={1.5} />,
    verification: <ShieldIcon size={18} strokeWidth={1.5} />,
};

const typeColors: Record<string, string> = {
    like: '#ef4444', comment: 'var(--text-secondary)', follow: 'var(--text-secondary)',
    mention: 'var(--text-secondary)', repost: 'var(--text-secondary)', system: 'var(--text-secondary)', verification: '#10b981',
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
     
    const [items, setItems] = useState<any[]>([]);
    const [readItems, setReadItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

    const [settings, setSettings] = useState<Record<string, boolean>>({
        'Likes': true,
        'Comments': true,
        'New Followers': true,
        'Mentions': true,
        'Reposts': false,
        'System Updates': true,
    });

    const toggleSetting = (key: string) => {
        requireAuth(() => {
            setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        });
    };

    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(data => { if (data.notifications) setItems(data.notifications); })
            .catch(() => { })
            .finally(() => setLoading(false));
        fetch('/api/users?limit=4')
            .then(r => r.json())
            .then(data => { if (data.users) setSuggestedUsers(data.users); })
            .catch(() => { });
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
                    {suggestedUsers.map((u: any) => (
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
                <div className="tabs" style={{ display: 'flex', gap: 6, padding: '12px 16px', borderBottom: '1px solid var(--border-light)', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {tabConfig.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                padding: '8px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                                background: activeTab === tab.id ? 'var(--text-primary)' : 'var(--bg-secondary)',
                                color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification items */}
                {filtered.length === 0 ? (
                    <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-tertiary)' }}><BellIcon size={32} /></div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>You&apos;re all caught up!</div>
                        <div style={{ fontSize: '0.85rem', marginTop: 4 }}>No new notifications to display right now.</div>
                    </div>
                ) : (
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['Today', 'Yesterday', 'Earlier'].map(group => {
                            const groupItems = filtered.filter(n => {
                                if (group === 'Today') return String(n.timestamp).includes('m ago') || String(n.timestamp).includes('h ago');
                                if (group === 'Yesterday') return String(n.timestamp).includes('1d ago');
                                return !String(n.timestamp).includes('m ago') && !String(n.timestamp).includes('h ago') && !String(n.timestamp).includes('1d ago');
                            });

                            if (groupItems.length === 0) return null;

                            return (
                                <div key={group}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '12px 0 8px 4px' }}>{group}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {groupItems.map(n => (
                                            <div key={n.id}
                                                className={`notif-card ${isUnread(n) ? 'unread' : ''} fade-in`}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', 
                                                    background: isUnread(n) ? 'linear-gradient(145deg, var(--bg-card), var(--bg-secondary))' : 'var(--bg-card)', 
                                                    border: isUnread(n) ? '1px solid var(--border)' : '1px solid var(--border-light)',
                                                    borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                                                    position: 'relative', overflow: 'hidden'
                                                }}
                                                onClick={() => requireAuth(() => markRead(n.id))}
                                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                
                                                {isUnread(n) && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--primary)' }} />}

                                                <div style={{ flexShrink: 0 }}>
                                                    {n.actor
                                                        ? <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)' }}><UserAvatar name={n.actor.name} avatar={n.actor.avatar} /></div>
                                                        : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColors[n.type] || 'var(--text-secondary)' }}>{typeIcons[n.type]}</div>}
                                                </div>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ fontSize: '0.92rem', lineHeight: 1.4, flex: 1 }}>
                                                            {n.actor && (
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, color: typeColors[n.type] || 'var(--text-secondary)', verticalAlign: 'text-bottom' }}>
                                                                    {typeIcons[n.type]}
                                                                </span>
                                                            )}
                                                            {n.actor && <Link href={`/profile/${n.actor.username}`} onClick={e => e.stopPropagation()} style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>{n.actor.name} </Link>}
                                                            <span style={{ color: 'var(--text-secondary)' }}>{n.content}</span>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>{n.timestamp}</div>
                                                        </div>

                                                        {/* Inline Interactive Actions on the right edge */}
                                                        {n.type === 'follow' && (
                                                            <button className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 20, fontWeight: 600, flexShrink: 0 }} onClick={e => { e.stopPropagation(); requireAuth(() => {}); }}>Follow Back</button>
                                                        )}
                                                        {(n.type === 'comment' || n.type === 'mention') && (
                                                            <button className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={e => { e.stopPropagation(); requireAuth(() => {}); }}>
                                                                <MessageCircleIcon size={14} /> Reply
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* RIGHT — Stats & links */}
            <aside className="right-panel">
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><ShieldIcon size={15} /> Notification Settings</div>
                    {Object.entries(settings).map(([label, on]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{label}</span>
                            <button onClick={() => toggleSetting(label)} style={{ width: 36, height: 20, borderRadius: 10, background: on ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
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
                        <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', margin: '0 -8px', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem', fontWeight: 500, borderRadius: 8, transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            {link.label} <ChevronRightIcon size={14} />
                        </Link>
                    ))}
                </div>
            </aside>
        </div>
    );
}
