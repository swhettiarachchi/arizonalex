'use client';
import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, type ApiNotification, timeAgo } from '@/lib/api';
import { HeartIcon, MessageCircleIcon, UserIcon, RepeatIcon, BellIcon, CheckCircleIcon, ZapIcon } from '@/components/ui/Icons';
import { useAuth } from '@/components/providers/AuthProvider';
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
    const { isLoggedIn } = useAuth();
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        if (!isLoggedIn) { setLoading(false); return; }
        try {
            const res = await notificationsApi.getAll();
            setNotifications(res.notifications);
        } catch (_e) {
            // silently fail — user sees empty state
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    const markRead = async (id: string) => {
        try {
            await notificationsApi.markRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (_e) { /* ignore */ }
    };

    const markAllRead = async () => {
        requireAuth(async () => {
            try {
                await notificationsApi.markAllRead();
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch (_e) { /* ignore */ }
        });
    };

    const filtered = activeTab === 'all' ? notifications : notifications.filter(n => n.type === activeTab);

    if (!isLoggedIn) {
        return (
            <div className="page-container">
                <div className="feed-column">
                    <div className="page-header"><h1>Notifications</h1></div>
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <BellIcon size={40} />
                        <p style={{ marginTop: 12 }}>Sign in to see your notifications</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <div className="page-header-row">
                        <h1>Notifications</h1>
                        <button className="btn btn-sm btn-secondary" onClick={markAllRead}>Mark all read</button>
                    </div>
                </div>
                <div className="tabs">
                    {['all', 'like', 'comment', 'follow', 'mention', 'system'].map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'all' ? 'All' : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{typeIcons[tab]} {tab.charAt(0).toUpperCase() + tab.slice(1)}</span>}
                        </button>
                    ))}
                </div>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No notifications yet</div>
                ) : filtered.map(n => (
                    <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n._id)}>
                        <span className="notif-icon" style={{ color: n.type === 'like' ? 'var(--accent)' : n.type === 'follow' ? 'var(--primary)' : 'var(--text-secondary)' }}>{typeIcons[n.type]}</span>
                        <div className="notif-content">
                            <div className="notif-text">
                                {n.actor && <strong>{n.actor.name} </strong>}
                                {n.content}
                            </div>
                            <div className="notif-time">{timeAgo(n.createdAt)}</div>
                        </div>
                        {!n.read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
