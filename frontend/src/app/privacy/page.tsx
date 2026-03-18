'use client';
import { useState } from 'react';
import {
    ShieldIcon, LockIcon, FileTextIcon, DownloadIcon, ChevronDownIcon,
    GlobeIcon, ClockIcon, EyeIcon, UsersIcon, SettingsIcon, MailIcon, AlertTriangleIcon
} from '@/components/ui/Icons';

const sections = [
    { id: 'collection', title: '1. Data Collection', icon: <FileTextIcon size={16} /> },
    { id: 'usage', title: '2. How We Use Data', icon: <SettingsIcon size={16} /> },
    { id: 'sharing', title: '3. Sharing & Disclosure', icon: <UsersIcon size={16} /> },
    { id: 'cookies', title: '4. Cookies & Tracking', icon: <GlobeIcon size={16} /> },
    { id: 'rights', title: '5. Your Rights', icon: <ShieldIcon size={16} /> },
    { id: 'retention', title: '6. Data Retention', icon: <ClockIcon size={16} /> },
    { id: 'security', title: '7. Security', icon: <LockIcon size={16} /> },
    { id: 'contact', title: '8. Contact Us', icon: <MailIcon size={16} /> },
];

const versionHistory = [
    { version: '3.2', date: 'March 1, 2026', changes: 'Updated CCPA compliance section, added AI data processing disclosure' },
    { version: '3.1', date: 'January 15, 2026', changes: 'Added Global Politics data handling provisions' },
    { version: '3.0', date: 'November 1, 2025', changes: 'Major revision for GDPR Article 22 automated decision-making' },
    { version: '2.5', date: 'August 20, 2025', changes: 'Added financial data encryption disclosure' },
];

export default function PrivacyPage() {
    const [activeSection, setActiveSection] = useState('collection');
    const [showVersions, setShowVersions] = useState(false);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#60a5fa' }}>
                        <ShieldIcon size={14} /> Legal
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>Privacy Policy</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>How Arizonalex collects, uses, and protects your data.</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ClockIcon size={13} /> Last updated: March 1, 2026
                        </span>
                        <button className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowVersions(!showVersions)}>
                            v3.2 <ChevronDownIcon size={13} />
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <DownloadIcon size={13} /> Download PDF
                        </button>
                    </div>
                    {showVersions && (
                        <div className="info-card" style={{ marginTop: 12, textAlign: 'left', maxWidth: 440, margin: '12px auto 0' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>Version History</h4>
                            {versionHistory.map(v => (
                                <div key={v.version} style={{ padding: '8px 0', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span style={{ fontWeight: 700, color: '#7C3AED' }}>v{v.version}</span>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{v.date}</span>
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)' }}>{v.changes}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="info-page-content" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* Sticky TOC */}
                <nav className="info-toc">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12, letterSpacing: '0.05em' }}>Contents</div>
                    {sections.map(s => (
                        <button
                            key={s.id}
                            className={`info-toc-item ${activeSection === s.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(s.id)}
                        >
                            {s.icon}
                            <span>{s.title}</span>
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="info-legal-content">
                    <section id="collection" className="info-legal-section">
                        <h2>1. Data Collection</h2>
                        <p>Arizonalex collects information to provide, improve, and secure our political intelligence and financial analysis platform. We are committed to transparency about the data we collect and how it is used.</p>
                        <h3>1.1 Information You Provide</h3>
                        <p>When you create an account, we collect your name, email address, username, and password. You may optionally provide your location, political interests, professional role, and biographical information. If you connect a financial portfolio, we collect read-only access tokens — we never store your financial credentials.</p>
                        <h3>1.2 Information Collected Automatically</h3>
                        <p>We automatically collect device information (browser type, operating system, device identifiers), usage data (pages visited, features used, interaction patterns), IP address for security and geolocation, and referral sources. This data helps us improve platform performance and detect unauthorized access.</p>
                        <h3>1.3 Political Engagement Data</h3>
                        <p>When you interact with political content — voting in polls, following legislation, commenting on policy — we collect this engagement data to personalize your feed and provide relevant AI analysis. This data is never shared with political campaigns, parties, or PACs.</p>
                    </section>

                    <section id="usage" className="info-legal-section">
                        <h2>2. How We Use Data</h2>
                        <p>We use collected data for the following purposes:</p>
                        <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>
                            <li>Providing and personalizing the Arizonalex platform experience</li>
                            <li>Delivering AI-powered political analysis and market insights tailored to your interests</li>
                            <li>Processing and analyzing legislative documents, congressional votes, and policy changes</li>
                            <li>Generating aggregated, anonymized political sentiment reports</li>
                            <li>Detecting and preventing misinformation, fraud, and platform abuse</li>
                            <li>Communicating service updates, security alerts, and relevant notifications</li>
                            <li>Improving platform performance, accessibility, and user experience</li>
                        </ul>

                        <div className="info-highlight-box" style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <EyeIcon size={16} />
                                <strong style={{ fontSize: '0.88rem' }}>AI & Automated Decision-Making</strong>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Our AI analysis tools process public political data and market information to generate insights. These automated analyses do not make decisions about your account access, content visibility, or financial recommendations. You can opt out of AI-personalized feeds in Settings → Privacy.
                            </p>
                        </div>
                    </section>

                    <section id="sharing" className="info-legal-section">
                        <h2>3. Sharing & Disclosure</h2>
                        <p>Arizonalex does not sell your personal data. We may share limited data in the following circumstances:</p>
                        <h3>3.1 Service Providers</h3>
                        <p>We work with trusted third-party providers for cloud infrastructure (AWS), payment processing (Stripe), email delivery, analytics, and content delivery. All service providers are bound by strict data processing agreements.</p>
                        <h3>3.2 Legal Requirements</h3>
                        <p>We may disclose information when required by law, subpoena, court order, or government request. We will notify affected users unless prohibited by law, and we publish a transparency report detailing all government data requests received.</p>
                        <h3>3.3 Aggregated Data</h3>
                        <p>We may share anonymized, aggregated political sentiment data and market trend analyses with research institutions, news organizations, and academic partners. This data cannot be used to identify individual users.</p>
                    </section>

                    <section id="cookies" className="info-legal-section">
                        <h2>4. Cookies & Tracking</h2>
                        <p>We use essential cookies for authentication, session management, and security. Analytics cookies help us understand usage patterns. You can manage cookie preferences in your browser settings or through our cookie consent banner.</p>
                        <p>We do not use third-party advertising trackers. We do not participate in cross-site tracking programs. Our analytics are processed through privacy-respecting tools with IP anonymization enabled. Financial data connections use separate, encrypted session cookies.</p>
                    </section>

                    <section id="rights" className="info-legal-section">
                        <h2>5. Your Rights</h2>
                        <div className="info-highlight-box" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <ShieldIcon size={16} />
                                <strong style={{ fontSize: '0.88rem' }}>GDPR Rights (EU/EEA Users)</strong>
                            </div>
                            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                                <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
                                <li><strong>Right to Rectification:</strong> Correct inaccurate personal information</li>
                                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                                <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
                                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                            </ul>
                        </div>
                        <div className="info-highlight-box" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', marginTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <AlertTriangleIcon size={16} />
                                <strong style={{ fontSize: '0.88rem' }}>CCPA Rights (California Residents)</strong>
                            </div>
                            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                                <li><strong>Right to Know:</strong> What personal information is collected and how it is used</li>
                                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                                <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information (we do not sell data)</li>
                                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of exercising privacy rights</li>
                            </ul>
                        </div>
                    </section>

                    <section id="retention" className="info-legal-section">
                        <h2>6. Data Retention</h2>
                        <p>We retain account data for as long as your account is active. Posts and public content remain visible until deleted by you or through moderation. After account deletion, personal data is purged within 30 days, though anonymized analytics and aggregated political sentiment data may be retained indefinitely for research purposes.</p>
                        <p>Financial data connected through portfolio tracking is cached for performance but never stored permanently. Real-time market data is sourced from third-party providers and subject to their respective data retention policies. Legislative tracking data references public government databases.</p>
                    </section>

                    <section id="security" className="info-legal-section">
                        <h2>7. Security</h2>
                        <p>We implement industry-standard security measures including:</p>
                        <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>
                            <li>AES-256 encryption for data at rest and TLS 1.3 for data in transit</li>
                            <li>SOC2 Type II certified infrastructure with AWS GovCloud for political data</li>
                            <li>Regular third-party penetration testing and security audits</li>
                            <li>Rate limiting, DDoS protection, and real-time threat monitoring</li>
                            <li>Mandatory two-factor authentication for verified accounts and internal staff</li>
                            <li>Bug bounty program for responsible security disclosure</li>
                        </ul>
                    </section>

                    <section id="contact" className="info-legal-section">
                        <h2>8. Contact Us</h2>
                        <p>For privacy-related inquiries, data requests, or concerns:</p>
                        <div className="info-card" style={{ background: 'var(--bg-tertiary)', padding: 20, marginTop: 12 }}>
                            <div style={{ fontSize: '0.88rem', marginBottom: 8 }}><strong>Data Protection Officer:</strong> privacy@arizonalex.com</div>
                            <div style={{ fontSize: '0.88rem', marginBottom: 8 }}><strong>Mailing Address:</strong> Arizonalex Inc., 100 N. Central Ave, Suite 1200, Phoenix, AZ 85004</div>
                            <div style={{ fontSize: '0.88rem' }}><strong>Response Time:</strong> We respond to all privacy requests within 30 days as required by applicable law.</div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
