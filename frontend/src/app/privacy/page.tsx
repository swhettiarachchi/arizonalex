'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    LockIcon, ShieldIcon, EyeIcon, DatabaseIcon, GlobeIcon,
    ClockIcon, ChevronRightIcon, MailIcon, CheckCircleIcon,
    UserIcon, ArrowRightIcon, FileTextIcon, AlertCircleIcon
} from '@/components/ui/Icons';

const glanceCards = [
    { icon: <ShieldIcon size={24} />, title: 'We Never Sell Your Data', desc: 'Your personal information is never sold to advertisers, campaigns, or data brokers.', color: '#10b981' },
    { icon: <LockIcon size={24} />, title: 'You Own Your Data', desc: 'Download, export, or delete your data at any time. Fully GDPR & CCPA compliant.', color: '#3b82f6' },
    { icon: <DatabaseIcon size={24} />, title: 'Bank-Grade Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit. Financial data encrypted end-to-end via Plaid.', color: '#8b5cf6' },
];

const sections = [
    {
        id: 'information-collected',
        title: '1. Information We Collect',
        content: [
            { subtitle: 'Account Information', text: 'When you create an Arizonalex account, we collect your name, email address, username, and password hash. If you authenticate via Google or Apple SSO, we receive your name and email from those providers. Verified users additionally provide identity documentation which is reviewed by our Trust & Safety team and securely destroyed after verification — we do not retain copies of government IDs.' },
            { subtitle: 'Usage & Engagement Data', text: 'We log interactions such as posts, comments, poll votes, followed topics, and saved articles. This data powers your personalized feed and allows features like "trending" algorithms and AI-powered content recommendations. Engagement data is anonymized and aggregated for platform analytics.' },
            { subtitle: 'Financial Data', text: 'If you choose to connect a brokerage account via Plaid, we receive read-only portfolio snapshot data. We never receive your brokerage credentials. Portfolio data is cached in-memory for the duration of your session and purged from our servers within 24 hours. It is never written to permanent storage or shared with any third party.' },
            { subtitle: 'Device & Technical Data', text: 'We collect browser type, operating system, IP address, device identifiers, and referral URLs. This data is used for security (detecting suspicious login attempts), performance optimization (CDN routing), and analytics (understanding platform usage patterns).' },
        ]
    },
    {
        id: 'how-we-use',
        title: '2. How We Use Your Information',
        content: [
            { subtitle: 'Platform Personalization', text: 'Your engagement data helps us surface relevant political updates, market alerts, and community content. Our AI recommendation engine uses your followed topics, reading history, and watchlist activity — but you can override all algorithmic suggestions via the Perspective Balance slider in Settings.' },
            { subtitle: 'Security & Fraud Prevention', text: 'Technical data is analyzed in real-time by our security systems to detect account takeover attempts, bot activity, and platform manipulation. IP addresses are logged for 90 days for security investigation purposes and then permanently deleted.' },
            { subtitle: 'Service Improvement', text: 'Anonymized and aggregated usage patterns help us improve platform features, optimize loading performance, and prioritize our product roadmap. No individual user can be identified from this aggregated data.' },
            { subtitle: 'Legal Compliance', text: 'We may disclose information when required by valid legal process (court orders, subpoenas). We challenge overbroad requests and notify affected users when legally permitted. We publish an annual transparency report documenting all government data requests received.' },
        ]
    },
    {
        id: 'data-sharing',
        title: '3. Data Sharing & Third Parties',
        content: [
            { subtitle: 'We DO NOT Sell Data', text: 'Arizonalex has never and will never sell personal data to advertisers, political campaigns, data brokers, or any other third party. This is a core platform commitment enshrined in our corporate charter.' },
            { subtitle: 'Service Providers', text: 'We share limited data with essential service providers: Stripe (payment processing), Plaid (financial data aggregation), AWS (infrastructure hosting), and Cloudflare (CDN/security). Each provider is contractually bound by strict data processing agreements.' },
            { subtitle: 'Political Advertising', text: 'Arizonalex does not use your personal data for political ad targeting. Political advertisements on our platform are labeled transparently with funding source information and displayed based on broad geographic targeting only — never behavioral profiling.' },
        ]
    },
    {
        id: 'your-rights',
        title: '4. Your Privacy Rights',
        content: [
            { subtitle: 'Access & Portability', text: 'You can request a full export of your data at any time via Settings → Privacy → Download My Data. Exports are available in JSON and CSV formats and are processed within 48 hours. See our Data Export Guide for detailed instructions.' },
            { subtitle: 'Deletion & Erasure', text: 'Request complete account deletion via Settings → Account → Delete Account. A 30-day grace period allows for account recovery. After 30 days, all personal data is permanently and irreversibly deleted from our systems, including backups. Anonymized aggregate data may be retained.' },
            { subtitle: 'Opt-Out Controls', text: 'You have granular control over data usage: disable AI training with your data, opt out of analytics tracking, turn off personalized recommendations, and control cookie preferences — all from Settings → Privacy.' },
            { subtitle: 'Regulatory Rights', text: 'GDPR (EU): Right to access, rectification, erasure, portability, and objection. CCPA (California): Right to know, delete, and opt-out of sale (though we never sell data). Contact privacy@arizonalex.com or use the in-platform tools to exercise any right.' },
        ]
    },
    {
        id: 'ai-data',
        title: '5. AI & Machine Learning',
        content: [
            { subtitle: 'AI Training Data', text: 'By default, your public posts and interactions may be used to improve our AI models (sentiment analysis, policy impact predictions). You can opt out entirely at Settings → Privacy → AI Data Usage without losing access to any AI features.' },
            { subtitle: 'AI-Generated Content', text: 'All AI-generated summaries, analyses, and predictions are clearly labeled with an AI indicator. We never present AI-generated content as human-authored. Our AI models are audited quarterly for political bias.' },
            { subtitle: 'Transparency', text: 'We publish model cards for all production AI models, documenting training methodology, data sources, known limitations, and bias testing results. These are available at arizonalex.com/transparency.' },
        ]
    },
    {
        id: 'cookies',
        title: '6. Cookies & Tracking',
        content: [
            { subtitle: 'Essential Cookies', text: 'Required for core functionality: authentication state, session management, CSRF protection, and language/theme preferences. These cannot be disabled without breaking the platform.' },
            { subtitle: 'Analytics Cookies', text: 'We use privacy-respecting analytics (self-hosted Plausible) to understand page views, feature usage, and error rates. No personally identifiable data is collected. You can opt out via Settings → Privacy → Analytics.' },
            { subtitle: 'Functional Cookies', text: 'Remember your preferences like default news hub, watchlist sorting, and notification settings. Optional and can be disabled, though some convenience features will be lost.' },
            { subtitle: 'Third-Party Trackers', text: 'We do NOT use Google Analytics, Facebook Pixel, or any third-party tracking pixels. We do not participate in cross-site tracking or retargeting networks.' },
        ]
    },
    {
        id: 'security',
        title: '7. Security Measures',
        content: [
            { subtitle: 'Encryption', text: 'All data in transit is encrypted with TLS 1.3. All data at rest is encrypted with AES-256. Database connections use mTLS (mutual TLS). Financial data uses additional application-layer encryption.' },
            { subtitle: 'Access Controls', text: 'Employee access to user data requires multi-factor authentication, role-based permissions, and is logged in an immutable audit trail. Access is granted on a least-privilege basis and reviewed quarterly.' },
            { subtitle: 'Infrastructure', text: 'Hosted on AWS with SOC 2 Type II, ISO 27001, and FedRAMP compliance. Multi-region redundancy with automated failover. Annual penetration testing by independent security firms.' },
            { subtitle: 'Incident Response', text: 'We maintain a documented incident response plan with a dedicated security team. In the event of a data breach, we will notify affected users within 72 hours as required by GDPR and applicable state laws.' },
        ]
    },
    {
        id: 'contact',
        title: '8. Contact & DPO',
        content: [
            { subtitle: 'Data Protection Officer', text: 'Our DPO can be reached at dpo@arizonalex.com for any privacy-related inquiries, data subject requests, or concerns about our data practices.' },
            { subtitle: 'Privacy Team', text: 'For general privacy questions: privacy@arizonalex.com. For security concerns: security@arizonalex.com. Response within 48 hours for standard inquiries, 24 hours for security-related matters.' },
            { subtitle: 'Mailing Address', text: 'Arizonalex Inc., Privacy Team, 100 N. Central Avenue, Suite 1200, Phoenix, AZ 85004, United States.' },
        ]
    },
];

const versionHistory = [
    { version: '3.2', date: 'March 1, 2026', changes: 'Added AI training opt-out controls, expanded cookie section, updated CCPA references.' },
    { version: '3.1', date: 'January 15, 2026', changes: 'Clarified financial data handling with Plaid, added data retention timelines.' },
    { version: '3.0', date: 'November 1, 2025', changes: 'Major rewrite: restructured sections, added Privacy at a Glance, expanded security measures.' },
    { version: '2.5', date: 'August 10, 2025', changes: 'Added GDPR-compliant data portability details and DPO contact information.' },
];

export default function PrivacyPage() {
    const [activeSection, setActiveSection] = useState('');
    const [cookiePrefs, setCookiePrefs] = useState({ analytics: true, functional: true });
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );
        Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const ToggleSwitch = ({ active, onToggle, label }: { active: boolean; onToggle: () => void; label: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
            <button onClick={onToggle} style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
                background: active ? 'var(--primary)' : 'var(--bg-tertiary)', border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`
            }}>
                <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                    left: active ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
            </button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <LockIcon size={14} /> Privacy
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>Privacy Policy</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        How Arizonalex collects, uses, and protects your personal data.
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem', marginTop: 6 }}>
                        Effective: March 1, 2026 • Version 3.2
                    </p>
                </div>
            </div>

            <div className="info-page-content">
                {/* Privacy at a Glance */}
                <div className="info-grid-3" style={{ marginBottom: 32 }}>
                    {glanceCards.map((card, i) => (
                        <div key={i} className="info-card" style={{ textAlign: 'center', padding: '24px 20px', animationDelay: `${i * 80}ms` }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${card.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: card.color }}>
                                {card.icon}
                            </div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6 }}>{card.title}</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    {/* Main Content */}
                    <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                        {sections.map((section, i) => (
                            <div key={section.id} id={section.id} ref={el => { sectionRefs.current[section.id] = el; }}
                                className="info-card" style={{ marginBottom: 16, padding: 'clamp(20px, 4vw, 28px)' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>{section.title}</h2>
                                {section.content.map((item, j) => (
                                    <div key={j} style={{ marginBottom: j < section.content.length - 1 ? 16 : 0 }}>
                                        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.subtitle}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Cookie Preferences */}
                        <div id="cookie-prefs" ref={el => { sectionRefs.current['cookie-prefs'] = el; }}
                            className="info-card" style={{ padding: 'clamp(20px, 4vw, 28px)', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 }}>Cookie Preferences</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                Manage your cookie settings. Essential cookies cannot be disabled.
                            </p>
                            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Essential Cookies</span>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Required for core functionality</div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Always On</span>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <ToggleSwitch active={cookiePrefs.analytics} onToggle={() => setCookiePrefs(p => ({...p, analytics: !p.analytics}))} label="Analytics Cookies" />
                            </div>
                            <ToggleSwitch active={cookiePrefs.functional} onToggle={() => setCookiePrefs(p => ({...p, functional: !p.functional}))} label="Functional Cookies" />
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 14, width: '100%' }}>Save Preferences</button>
                        </div>

                        {/* Version History */}
                        <div id="version-history" ref={el => { sectionRefs.current['version-history'] = el; }}
                            className="info-card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Version History</h2>
                            {versionHistory.map((v, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: i < versionHistory.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(124,58,237,0.1)', padding: '2px 10px', borderRadius: 6, height: 'fit-content' }}>v{v.version}</span>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>{v.date}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.changes}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ flex: '0 1 240px', minWidth: 200 }}>
                        <div style={{ position: 'sticky', top: 80 }}>
                            <div className="info-card" style={{ padding: 18 }}>
                                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contents</h3>
                                {[...sections.map(s => ({ id: s.id, label: s.title.replace(/^\d+\.\s/, '') })),
                                    { id: 'cookie-prefs', label: 'Cookie Preferences' },
                                    { id: 'version-history', label: 'Version History' },
                                ].map(item => (
                                    <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none',
                                        background: activeSection === item.id ? 'rgba(124,58,237,0.1)' : 'transparent',
                                        color: activeSection === item.id ? '#a78bfa' : 'var(--text-secondary)',
                                        fontSize: '0.78rem', fontWeight: activeSection === item.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                    }}>
                                        <ChevronRightIcon size={11} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="info-card" style={{ padding: 16, marginTop: 14, fontSize: '0.8rem' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.82rem' }}>Quick Actions</h4>
                                <Link href="/help/article/ap-4" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', color: '#7C3AED', textDecoration: 'none', fontSize: '0.8rem' }}>
                                    <FileTextIcon size={13} /> Export My Data
                                </Link>
                                <Link href="/help/article/ap-1" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', color: '#7C3AED', textDecoration: 'none', fontSize: '0.8rem' }}>
                                    <EyeIcon size={13} /> Privacy Rights Guide
                                </Link>
                                <a href="mailto:privacy@arizonalex.com" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', color: '#7C3AED', textDecoration: 'none', fontSize: '0.8rem' }}>
                                    <MailIcon size={13} /> Contact DPO
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
