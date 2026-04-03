'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    MailIcon, MessageSquareIcon, MapPinIcon, PhoneIcon, ClockIcon,
    SendIcon, CheckCircleIcon, ChevronDownIcon, GlobeIcon, ZapIcon,
    AlertCircleIcon, ShieldIcon, HelpCircleIcon, SearchIcon, ArrowRightIcon
} from '@/components/ui/Icons';

const categories = [
    'General Inquiry', 'Technical Support', 'Political Data Questions',
    'Market Data Issues', 'Account & Billing', 'Partnership & Media',
    'API & Developers', 'Legal & Privacy',
];

const priorities = [
    { id: 'low', label: 'Low', desc: 'General question', color: '#10b981' },
    { id: 'medium', label: 'Medium', desc: 'Needs attention', color: '#f59e0b' },
    { id: 'high', label: 'High', desc: 'Urgent issue', color: '#ef4444' },
];

const quickLinks = [
    { label: 'Help Center', desc: 'Browse knowledge base', icon: <HelpCircleIcon size={20} />, href: '/help', color: '#7C3AED' },
    { label: 'FAQ', desc: 'Common questions', icon: <SearchIcon size={20} />, href: '/faq', color: '#3b82f6' },
    { label: 'System Status', desc: 'Check service health', icon: <ZapIcon size={20} />, href: '/status', color: '#10b981' },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '', email: '', category: '', subject: '', message: '', priority: 'medium'
    });
    const [submitted, setSubmitted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [chatStatus, setChatStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

    const handleStartChat = () => {
        setChatStatus('connecting');
        setTimeout(() => setChatStatus('connected'), 1500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setShowSuccess(true), 300);
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (showSuccess) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div className="info-card" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 480 }}>
                    <div className="info-success-icon">
                        <CheckCircleIcon size={44} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Message Sent!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>
                        Thank you for reaching out. We&apos;ve received your message and will respond within our estimated timeframe.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>
                        <ClockIcon size={14} /> Expected response: 4–24 hours
                    </div>
                    <button className="btn btn-primary" onClick={() => { setShowSuccess(false); setSubmitted(false); setFormData({ name: '', email: '', category: '', subject: '', message: '', priority: 'medium' }); }}>
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <MailIcon size={14} /> Contact
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>Get in Touch</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        Questions about political data, market features, or your account? We&apos;re here to help.
                    </p>
                </div>
            </div>

            <div className="info-page-content">
                {/* Quick Links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 12, marginBottom: 32 }}>
                    {quickLinks.map(link => (
                        <Link key={link.label} href={link.href} className="info-card info-card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', textDecoration: 'none' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${link.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color, flexShrink: 0 }}>
                                {link.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{link.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{link.desc}</div>
                            </div>
                            <ArrowRightIcon size={14} />
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    {/* Left: Contact Form */}
                    <div style={{ flex: '1 1 480px', minWidth: 0 }}>
                        <div className="info-card" style={{ padding: 28 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Send us a message</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <div className="info-form-group" style={{ flex: '1 1 200px' }}>
                                        <label className="info-form-label">Name *</label>
                                        <input className="info-form-input" type="text" placeholder="Your full name" value={formData.name} onChange={e => updateField('name', e.target.value)} required />
                                    </div>
                                    <div className="info-form-group" style={{ flex: '1 1 200px' }}>
                                        <label className="info-form-label">Email *</label>
                                        <input className="info-form-input" type="email" placeholder="your@email.com" value={formData.email} onChange={e => updateField('email', e.target.value)} required />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <div className="info-form-group" style={{ flex: '1 1 200px' }}>
                                        <label className="info-form-label">Category *</label>
                                        <div style={{ position: 'relative' }}>
                                            <select className="info-form-select" value={formData.category} onChange={e => updateField('category', e.target.value)} required>
                                                <option value="">Select a category</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <ChevronDownIcon size={14} />
                                        </div>
                                    </div>
                                    <div className="info-form-group" style={{ flex: '1 1 200px' }}>
                                        <label className="info-form-label">Priority</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {priorities.map(p => (
                                                <button key={p.id} type="button"
                                                    className={`info-priority-btn ${formData.priority === p.id ? 'active' : ''}`}
                                                    onClick={() => updateField('priority', p.id)}
                                                    data-priority={p.id}
                                                    style={{ flex: 1 }}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="info-form-group">
                                    <label className="info-form-label">Subject *</label>
                                    <input className="info-form-input" type="text" placeholder="Brief description of your inquiry" value={formData.subject} onChange={e => updateField('subject', e.target.value)} required />
                                </div>

                                <div className="info-form-group">
                                    <label className="info-form-label">Message *</label>
                                    <textarea className="info-form-textarea" placeholder="Tell us how we can help..." value={formData.message} onChange={e => updateField('message', e.target.value)} rows={5} required />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <SendIcon size={16} /> Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Contact Options */}
                    <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                        {/* Emergency */}
                        <div className="info-card" style={{ padding: 22, marginBottom: 16, borderLeft: '3px solid #ef4444' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <AlertCircleIcon size={18} />
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444' }}>Emergency Support</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Account compromised or critical security issue?</p>
                            <a href="mailto:security@arizonalex.com" style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600, textDecoration: 'none' }}>security@arizonalex.com</a>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Response within 1 hour</div>
                        </div>

                        {/* Live Chat */}
                        <div className="info-card info-card-hover" style={{ padding: 22, marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                    <MessageSquareIcon size={22} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Chat</div>
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> 3 agents online
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Get instant help with account, data, or platform issues.</p>
                            
                            {chatStatus === 'idle' && (
                                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handleStartChat}>Start Chat</button>
                            )}
                            {chatStatus === 'connecting' && (
                                <button className="btn btn-primary btn-sm" style={{ width: '100%', opacity: 0.8 }} disabled>
                                    Connecting to agent...
                                </button>
                            )}
                            {chatStatus === 'connected' && (
                                <div style={{ padding: '8px', background: '#10b98120', color: '#10b981', borderRadius: 8, fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                                    Agent connected. Window opened.
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="info-card" style={{ padding: 22, marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MailIcon size={16} /> Email Us
                            </h3>
                            {[
                                { label: 'General Support', email: 'support@arizonalex.com' },
                                { label: 'Press & Media', email: 'press@arizonalex.com' },
                                { label: 'API & Enterprise', email: 'api@arizonalex.com' },
                            ].map(item => (
                                <div key={item.email} style={{ fontSize: '0.82rem', marginBottom: 8 }}>
                                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', marginBottom: 2 }}>{item.label}</div>
                                    <a href={`mailto:${item.email}`} style={{ color: '#7C3AED', textDecoration: 'none' }} className="hover-underline">{item.email}</a>
                                </div>
                            ))}
                        </div>

                        {/* Response Times & SLA */}
                        <div className="info-card" style={{ padding: 22, marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ClockIcon size={16} /> Response Times
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Emergency (Security)', time: '< 1 hour', color: '#ef4444' },
                                    { label: 'Live Chat', time: '< 5 minutes', color: '#10b981' },
                                    { label: 'Email (High)', time: '4–8 hours', color: '#f59e0b' },
                                    { label: 'Email (Medium)', time: '12–24 hours', color: '#3b82f6' },
                                    { label: 'Email (Low)', time: '24–48 hours', color: '#94a3b8' },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        <span style={{ fontWeight: 600, color: r.color }}>{r.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-tertiary)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                <strong style={{ color: 'var(--text-secondary)' }}>Enterprise SLA:</strong> 99.9% uptime guarantee with 15-minute critical response for Enterprise tier customers.
                            </div>
                        </div>

                        {/* Social */}
                        <div className="info-card" style={{ padding: 22, marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <GlobeIcon size={16} /> Follow Us
                            </h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['Twitter/X', 'LinkedIn', 'GitHub'].map(s => (
                                    <a key={s} href={`https://${s.toLowerCase().replace('/', '')}.com/arizonalex`} target="_blank" rel="noreferrer"
                                        style={{ flex: 1, padding: '8px 0', textAlign: 'center', fontSize: '0.78rem', borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', transition: 'background-color 0.2s' }}
                                        className="hover-lift"
                                    >
                                        {s}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Office */}
                        <div className="info-card" style={{ padding: 22 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MapPinIcon size={16} /> Headquarters
                            </h3>
                            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                <MapPinIcon size={20} />
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Arizonalex Inc.<br />
                                100 N. Central Avenue, Suite 1200<br />
                                Phoenix, AZ 85004<br />
                                United States
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <PhoneIcon size={12} /> +1 (480) 555-0147
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 8, padding: '8px 10px', borderRadius: 6, background: 'var(--bg-tertiary)' }}>
                                <strong>Office Hours:</strong> Mon–Fri, 8:00 AM – 6:00 PM MST
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
