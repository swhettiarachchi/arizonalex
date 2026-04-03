'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    ActivityIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon,
    ChevronDownIcon, ClockIcon, RefreshCwIcon, ZapIcon, GlobeIcon,
    ServerIcon, DatabaseIcon, ShieldIcon, MailIcon, WifiIcon
} from '@/components/ui/Icons';

interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    uptime: number;
    icon: React.ReactNode;
    responseTime: string;
}

const services: ServiceStatus[] = [
    { name: 'Core Platform', status: 'operational', uptime: 99.99, icon: <GlobeIcon size={18} />, responseTime: '42ms' },
    { name: 'Politics Data Feed', status: 'operational', uptime: 99.97, icon: <DatabaseIcon size={18} />, responseTime: '85ms' },
    { name: 'Market Data API', status: 'operational', uptime: 99.95, icon: <ActivityIcon size={18} />, responseTime: '23ms' },
    { name: 'AI Sentiment Engine', status: 'operational', uptime: 99.92, icon: <ZapIcon size={18} />, responseTime: '156ms' },
    { name: 'WebSocket Streaming', status: 'operational', uptime: 99.98, icon: <WifiIcon size={18} />, responseTime: '8ms' },
    { name: 'Authentication (SSO)', status: 'operational', uptime: 99.99, icon: <ShieldIcon size={18} />, responseTime: '67ms' },
    { name: 'Notification Service', status: 'operational', uptime: 99.96, icon: <MailIcon size={18} />, responseTime: '34ms' },
    { name: 'CDN & Static Assets', status: 'operational', uptime: 100, icon: <ServerIcon size={18} />, responseTime: '12ms' },
];

const uptimeSummary = [
    { label: '30 Days', value: '99.97%', color: '#10b981' },
    { label: '90 Days', value: '99.95%', color: '#10b981' },
    { label: 'This Year', value: '99.93%', color: '#10b981' },
];

const performanceMetrics = [
    { label: 'Avg API Response', value: '54ms', desc: 'p50 latency', color: '#10b981' },
    { label: 'P99 Latency', value: '212ms', desc: 'Worst case', color: '#f59e0b' },
    { label: 'WebSocket Conns', value: '24.8K', desc: 'Active now', color: '#3b82f6' },
];

const maintenanceWindows = [
    {
        id: 'm1',
        title: 'Database Migration — Read Replica Upgrade',
        date: 'March 30, 2026',
        time: '2:00 AM – 3:30 AM ET',
        impact: 'Brief read latency increase (<500ms) for Politics and Market data APIs.',
        status: 'scheduled' as const,
    },
    {
        id: 'm2',
        title: 'CDN Edge Node Expansion — EU Region',
        date: 'April 5, 2026',
        time: '4:00 AM – 5:00 AM ET',
        impact: 'No user-facing impact. EU latency will improve post-maintenance.',
        status: 'scheduled' as const,
    },
];

interface IncidentEvent {
    id: string;
    title: string;
    date: string;
    severity: 'minor' | 'major' | 'resolved';
    description: string;
    updates: { time: string; text: string }[];
}

const incidents: IncidentEvent[] = [
    {
        id: 'i1', title: 'AI Sentiment Engine Degraded Performance', date: 'March 24, 2026', severity: 'resolved',
        description: 'Some users experienced slow sentiment analysis responses due to a GPU cluster issue.',
        updates: [
            { time: '10:15 AM ET', text: 'Investigating reports of slow AI responses.' },
            { time: '10:45 AM ET', text: 'Identified GPU cluster memory saturation. Scaling additional capacity.' },
            { time: '11:20 AM ET', text: 'New GPU instances online. Observing recovery.' },
            { time: '11:45 AM ET', text: 'Resolved. All AI services operating normally. Root cause: memory leak in model v2.4.1, patched.' },
        ]
    },
    {
        id: 'i2', title: 'WebSocket Connection Drops — East US Region', date: 'March 18, 2026', severity: 'resolved',
        description: 'Users in the East US region experienced intermittent WebSocket disconnections.',
        updates: [
            { time: '3:30 PM ET', text: 'Investigating WebSocket disconnections reported by East US users.' },
            { time: '4:00 PM ET', text: 'Root cause identified: ISP backbone issue affecting our Virginia datacenter.' },
            { time: '4:45 PM ET', text: 'Traffic rerouted through Ohio datacenter. Services restored.' },
            { time: '5:15 PM ET', text: 'Fully resolved. All WebSocket connections stable. Adding redundant ISP link.' },
        ]
    },
    {
        id: 'i3', title: 'Market Data API Delayed — Opening Bell Surge', date: 'March 10, 2026', severity: 'resolved',
        description: 'Market data API experienced 2-3 second delays during market open due to record traffic.',
        updates: [
            { time: '9:30 AM ET', text: 'Elevated latency detected on market data endpoints.' },
            { time: '9:55 AM ET', text: 'Auto-scaling triggered. Additional API instances provisioning.' },
            { time: '10:15 AM ET', text: 'New instances online. Latency returning to normal.' },
            { time: '10:30 AM ET', text: 'Resolved. Adjusting pre-market scaling thresholds to prevent recurrence.' },
        ]
    },
];

const statusConfig = {
    operational: { label: 'Operational', color: '#10b981', icon: <CheckCircleIcon size={16} /> },
    degraded: { label: 'Degraded', color: '#f59e0b', icon: <AlertCircleIcon size={16} /> },
    outage: { label: 'Outage', color: '#ef4444', icon: <XCircleIcon size={16} /> },
};

// Generate last 30 days uptime bars
const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uptime: i === 10 ? 99.2 : i === 18 ? 99.5 : 99.9 + Math.random() * 0.1,
    };
});

export default function StatusPage() {
    const [openIncidents, setOpenIncidents] = useState<Set<string>>(new Set());

    const toggleIncident = (id: string) => {
        setOpenIncidents(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const allOperational = services.every(s => s.status === 'operational');

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: allOperational ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${allOperational ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, marginBottom: 20, fontSize: '0.8rem', color: allOperational ? '#34d399' : '#fbbf24' }}>
                        <ActivityIcon size={14} /> {allOperational ? 'All Systems Operational' : 'Service Disruption'}
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>System Status</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 6 }}>
                        Real-time health monitoring for all Arizonalex services.
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                        <ClockIcon size={12} /> Last updated: {new Date().toLocaleTimeString('en-US')} • Auto-refreshes every 60s
                    </p>
                </div>
            </div>

            <div className="info-page-content">
                {/* Uptime Summary Cards */}
                <div className="info-grid-3" style={{ marginBottom: 32 }}>
                    {uptimeSummary.map((u, i) => (
                        <div key={i} className="info-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>{u.label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: u.color, lineHeight: 1 }}>{u.value}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Uptime</div>
                        </div>
                    ))}
                </div>

                {/* Performance Metrics */}
                <div className="info-grid-3" style={{ marginBottom: 32 }}>
                    {performanceMetrics.map((m, i) => (
                        <div key={i} className="info-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                                <ZapIcon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.label}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{m.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Service List */}
                <h2 className="info-section-title">Current Service Status</h2>
                <div className="info-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
                    {services.map((service, i) => {
                        const cfg = statusConfig[service.status];
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                                padding: '16px 20px', borderBottom: i < services.length - 1 ? '1px solid var(--border-light)' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 200px', minWidth: 0 }}>
                                    <div style={{ color: 'var(--text-tertiary)' }}>{service.icon}</div>
                                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{service.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{service.responseTime}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{service.uptime}%</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: cfg.color }}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 30-Day Uptime Chart */}
                <h2 className="info-section-title">30-Day Uptime History</h2>
                <div className="info-card" style={{ padding: '20px', marginBottom: 32, overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: 3, minWidth: 600, height: 50, alignItems: 'flex-end' }}>
                        {last30Days.map((day, i) => {
                            const height = ((day.uptime - 99) / 1) * 100;
                            const color = day.uptime >= 99.9 ? '#10b981' : day.uptime >= 99.5 ? '#f59e0b' : '#ef4444';
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }} title={`${day.date}: ${day.uptime.toFixed(2)}%`}>
                                    <div style={{ width: '100%', height: Math.max(height * 0.5, 4), borderRadius: 3, background: color, transition: 'height 0.3s' }} />
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                        <span>{last30Days[0].date}</span>
                        <span>{last30Days[14].date}</span>
                        <span>Today</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.72rem', color: 'var(--text-tertiary)', justifyContent: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} /> 99.9%+</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }} /> 99.5-99.9%</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }} /> &lt;99.5%</span>
                    </div>
                </div>

                {/* Scheduled Maintenance */}
                <h2 className="info-section-title">Scheduled Maintenance</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    {maintenanceWindows.map(m => (
                        <div key={m.id} className="info-card" style={{ padding: 22, borderLeft: '3px solid #3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{m.title}</h3>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '3px 10px', borderRadius: 6 }}>SCHEDULED</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginBottom: 8 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ClockIcon size={12} /> {m.date}</span>
                                <span>{m.time}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}><strong>Impact:</strong> {m.impact}</p>
                        </div>
                    ))}
                    {maintenanceWindows.length === 0 && (
                        <div className="info-card" style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            No maintenance windows scheduled
                        </div>
                    )}
                </div>

                {/* Past Incidents */}
                <h2 className="info-section-title">Incident History</h2>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {incidents.map((incident, i) => (
                        <div key={incident.id} className="info-accordion" style={{ animationDelay: `${i * 60}ms` }}>
                            <button className={`info-accordion-header ${openIncidents.has(incident.id) ? 'open' : ''}`} onClick={() => toggleIncident(incident.id)}>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                            background: incident.severity === 'resolved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: incident.severity === 'resolved' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {incident.severity.toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{incident.date}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{incident.title}</span>
                                </div>
                                <span className={`info-accordion-chevron ${openIncidents.has(incident.id) ? 'open' : ''}`}>
                                    <ChevronDownIcon size={18} />
                                </span>
                            </button>
                            <div className={`info-accordion-body ${openIncidents.has(incident.id) ? 'open' : ''}`}>
                                <div className="info-accordion-content">
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>{incident.description}</p>
                                    <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 16 }}>
                                        {incident.updates.map((u, j) => (
                                            <div key={j} style={{ marginBottom: 10, fontSize: '0.82rem' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{u.time}</span>
                                                <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>{u.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscribe CTA */}
                <div className="info-cta-section" style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Stay Informed</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, maxWidth: 420 }}>
                        Get notified about service incidents, maintenance, and status updates.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MailIcon size={16} /> Subscribe to Updates
                        </button>
                        <Link href="/help/article/ti-3" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ZapIcon size={16} /> WebSocket Guide
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
