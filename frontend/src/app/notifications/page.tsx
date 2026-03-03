'use client';
import { useState } from 'react';
import { notifications } from '@/lib/mock-data';
import { HeartIcon, MessageCircleIcon, UserIcon, RepeatIcon, BellIcon, CheckCircleIcon, ZapIcon } from '@/components/ui/Icons';
import { useAuthGate } from '@/components/providers/AuthGuard';

const typeIcons: Record<string, React.ReactNode> = {
    like: <HeartIcon size={16} />,
    comment: <MessageCircleIcon size={16} />,
    follow: <UserIcon size={16} />,
    mention: <BellIcon size={16} />,
    repost: <RepeatIcon size={16} />,
    system: <ZapIcon size={16} />,
    verification: <CheckCircleIcon size={16} />,
};

export default function NotificationsPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('all');
    const [readItems, setReadItems] = useState<Set<string>>(new Set());

    const markRead = (id: string) => setReadItems(prev => new Set(prev).add(id));
    const isUnread = (n: typeof notifications[0]) => !n.read && !readItems.has(n.id);

    const filtered = activeTab === 'all' ? notifications : notifications.filter(n => n.type === activeTab);

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <div className="page-header-row">
                        <h1>Notifications</h1>
                        <button className="btn btn-sm btn-secondary" onClick={() => requireAuth(() => setReadItems(new Set(notifications.map(n => n.id))))}>Mark all read</button>
                    </div>
                </div>
                <div className="tabs">
                    {['all', 'like', 'comment', 'follow', 'mention', 'system'].map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'all' ? 'All' : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{typeIcons[tab]} {tab.charAt(0).toUpperCase() + tab.slice(1)}</span>}
                        </button>
                    ))}
                </div>
                {filtered.map(n => (
                    <div key={n.id} className={`notif-item ${isUnread(n) ? 'unread' : ''}`} onClick={() => requireAuth(() => markRead(n.id))}>
                        <span className="notif-icon" style={{ color: n.type === 'like' ? 'var(--accent)' : n.type === 'follow' ? 'var(--primary)' : 'var(--text-secondary)' }}>{typeIcons[n.type]}</span>
                        <div className="notif-content">
                            <div className="notif-text">
                                {n.actor && <strong>{n.actor.name} </strong>}
                                {n.content}
                            </div>
                            <div className="notif-time">{n.timestamp}</div>
                        </div>
                        {isUnread(n) && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
