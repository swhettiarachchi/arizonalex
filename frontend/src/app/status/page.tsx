'use client';
import { useState, useEffect } from 'react';
import {
    CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon, ClockIcon,
    ServerIcon, ShieldIcon, BellIcon, SearchIcon, ImageIcon,
    DatabaseIcon, BotIcon, RefreshCwIcon, MailIcon, ActivityIcon
} from '@/components/ui/Icons';

interface ServiceStatus {
    id: string;
    name: string;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    icon: React.ReactNode;
    uptime: number;
    uptimeHistory: number[]; // 90 days
}

interface Incident {
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    severity: 'minor' | 'major' | 'critical';
    createdAt: string;
    updates: { time: string; text: string; status: string }[];
}

const services: ServiceStatus[] = [
    { id: 'feed', name: 'Feed API', status: 'operational', icon: <ActivityIcon size={18} />, uptime: 99.98, uptimeHistory: Array.from({ length: 90 }, () => Math.random() > 0.03 ? 100 : Math.random() > 0.5 ? 95 : 0) },
    { id: 'auth', name: 'Auth Service', status: 'operational', icon: <ShieldIcon size={18} />, uptime: 99.99, uptimeHistory: Array.from({ length: 90 }, () => Math.random() > 0.02 ? 100 : 95) },
    { id: 'market', name: 'Market Data', status: 'degraded', icon: <ActivityIcon size={18} />, uptime: 99.85, uptimeHistory: Array.from({ length: 90 }, (_, i) => i > 85 ? (Math.random() > 0.4 ? 100 : 70) : Math.random() > 0.03 ? 100 : 90) },
    { id: 'notif', name: 'Notifications', status: 'operational', icon: <BellIcon size={18} />, uptime: 99.97, uptimeHistory: Array.from({ length: 90 }, () => Math.random() > 0.04 ? 100 : 90) },
    { id: 'ai', name: 'AI Analysis Engine', status: 'operational', icon: <BotIcon size={18} />, uptime: 99.92, uptimeHistory: Array.from({ length: 90 }, () => Math.random() > 0.05 ? 100 : Math.random() > 0.5 ? 85 : 60) },
    { id: 'search', name: 'Search', status: 'operational', icon: <SearchIcon size={18} />, uptime: 99.96, uptimeHistory: Array.from({ length: 90 }, () => Math.random() > 0.03 ? 100 : 92) },
    { id: 'media', name: 'Media Upload', status: 'operational', icon: <ImageIcon size={18} />, uptime: 99.94, uptimeHistory: Array.from({ length: 90 }, () => Math.random() > 0.04 ? 100 : 88) },
    { id: 'db', name: 'Database Cluster', status: 'operational', icon: <DatabaseIcon size={18} />, uptime: 99.999, uptimeHistory: Array.from({ length: 90 }, () => 100) },
];

const incidents: Incident[] = [
    {
        id: 'INC-247', title: 'Elevated latency on Market Data endpoints', status: 'monitoring',
        severity: 'minor', createdAt: 'Mar 18, 2026 08:12 UTC',
        updates: [
            { time: '08:45 UTC', text: 'We have identified the issue with our market data provider and applied a workaround. Monitoring for stability.', status: 'Monitoring' },
            { time: '08:22 UTC', text: 'Our engineering team has identified elevated latency on the Finnhub WebSocket connection affecting real-time market data.', status: 'Identified' },
            { time: '08:12 UTC', text: 'We are investigating reports of delayed market data updates across the Business and Explore pages.', status: 'Investigating' },
        ]
    },
    {
        id: 'INC-245', title: 'AI Analysis Engine intermittent timeouts', status: 'resolved',
        severity: 'major', createdAt: 'Mar 16, 2026 14:30 UTC',
        updates: [
            { time: '16:15 UTC', text: 'The issue has been fully resolved. AI analysis is processing normally with expected latency. Root cause: GPU memory leak in the sentiment analysis model pipeline.', status: 'Resolved' },
            { time: '15:20 UTC', text: 'We have restarted the affected GPU cluster nodes and are monitoring performance.', status: 'Monitoring' },
            { time: '14:30 UTC', text: 'AI-powered features including sentiment analysis and policy impact scoring are experiencing intermittent failures.', status: 'Investigating' },
        ]
    },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    operational: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Operational', icon: <CheckCircleIcon size={16} /> },
    degraded: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Degraded', icon: <AlertTriangleIcon size={16} /> },
    outage: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Major Outage', icon: <AlertCircleIcon size={16} /> },
    maintenance: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Maintenance', icon: <ClockIcon size={16} /> },
};

const INCIDENT_COLORS: Record<string, string> = {
    investigating: '#ef4444', identified: '#f59e0b', monitoring: '#3b82f6', resolved: '#10b981'
};

export default function StatusPage() {
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subscribeType, setSubscribeType] = useState<'email' | 'sms'>('email');
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setLastRefresh(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    const allOperational = services.every(s => s.status === 'operational');
    const overallStatus = allOperational ? STATUS_CONFIG.operational : STATUS_CONFIG.degraded;

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: overallStatus.bg, border: `1px solid ${overallStatus.color}40`, marginBottom: 20, fontSize: '0.8rem', color: overallStatus.color }}>
                        <ServerIcon size={14} /> System Status
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>
                        {allOperational ? 'All Systems Operational' : 'Partial System Degradation'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <RefreshCwIcon size={13} /> Auto-refreshes every 30s · Last check: {lastRefresh.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            <div className="info-page-content" style={{ maxWidth: 860, margin: '0 auto' }}>
                {/* Services List */}
                <h2 className="info-section-title">Service Status</h2>
                <div className="info-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {services.map((service, i) => {
                        const cfg = STATUS_CONFIG[service.status];
                        return (
                            <div key={service.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < services.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>{service.icon}</span>
                                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{service.name}</span>

                                {/* Uptime mini-chart */}
                                <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 20 }} title={`${service.uptime}% uptime (90 days)`}>
                                    {service.uptimeHistory.slice(-45).map((v, j) => (
                                        <div key={j} style={{ width: 3, height: 20, borderRadius: 1, background: v >= 99 ? '#10b981' : v >= 80 ? '#f59e0b' : '#ef4444', opacity: 0.8 }} />
                                    ))}
                                </div>

                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', minWidth: 55, textAlign: 'right' }}>{service.uptime}%</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: cfg.color, padding: '3px 10px', borderRadius: 8, background: cfg.bg, minWidth: 100, justifyContent: 'center' }}>
                                    {cfg.icon} {cfg.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Active Incidents */}
                <h2 className="info-section-title" style={{ marginTop: 40 }}>Active & Recent Incidents</h2>
                {incidents.map(inc => (
                    <div key={inc.id} className="info-card" style={{ marginBottom: 16, padding: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${INCIDENT_COLORS[inc.status]}20`, color: INCIDENT_COLORS[inc.status], textTransform: 'uppercase' }}>
                                        {inc.status}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                        {inc.severity}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{inc.title}</h3>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{inc.id} · {inc.createdAt}</span>
                        </div>

                        {/* Timeline */}
                        <div style={{ borderLeft: '2px solid var(--border)', marginLeft: 8, paddingLeft: 20 }}>
                            {inc.updates.map((u, i) => (
                                <div key={i} style={{ position: 'relative', paddingBottom: i < inc.updates.length - 1 ? 16 : 0 }}>
                                    <div style={{ position: 'absolute', left: -26, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? INCIDENT_COLORS[inc.status] : 'var(--bg-tertiary)', border: '2px solid var(--border)' }} />
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                                        <strong>{u.status}</strong> — {u.time}
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{u.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Subscribe */}
                <div className="info-card" style={{ padding: 28, marginTop: 32, textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Subscribe to Updates</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Get notified about service disruptions and maintenance windows.
                    </p>

                    {subscribed ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
                            <CheckCircleIcon size={18} /> Subscribed! You&apos;ll receive status updates.
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
                                <button
                                    className={`info-priority-btn ${subscribeType === 'email' ? 'active' : ''}`}
                                    onClick={() => setSubscribeType('email')}
                                    data-priority="medium"
                                >
                                    <MailIcon size={14} /> Email
                                </button>
                                <button
                                    className={`info-priority-btn ${subscribeType === 'sms' ? 'active' : ''}`}
                                    onClick={() => setSubscribeType('sms')}
                                    data-priority="medium"
                                >
                                    <BellIcon size={14} /> SMS
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto' }}>
                                <input
                                    className="info-form-input"
                                    type={subscribeType === 'email' ? 'email' : 'tel'}
                                    placeholder={subscribeType === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
                                    value={subscribeEmail}
                                    onChange={e => setSubscribeEmail(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={() => { if (subscribeEmail.trim()) setSubscribed(true); }}>Subscribe</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
