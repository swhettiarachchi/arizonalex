'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    ShieldIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon,
    ChevronRightIcon, UserIcon, MessageSquareIcon, ImageIcon,
    FlagIcon, ZapIcon, LockIcon, FileTextIcon, ArrowRightIcon, ClockIcon
} from '@/components/ui/Icons';

interface GuidelineSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    allowed: string[];
    notAllowed: string[];
    example?: { scenario: string; verdict: string; verdictColor: string };
}

const guidelines: GuidelineSection[] = [
    {
        id: 'discourse',
        title: 'Civil Discourse',
        icon: <MessageSquareIcon size={22} />,
        color: '#3b82f6',
        description: 'Arizonalex exists for informed political and financial discussion. We expect disagreement — but always with respect.',
        allowed: ['Respectful debate with evidence-based arguments', 'Challenging ideas, policies, and voting records', 'Sharing opposing viewpoints with civil tone', 'Citing reputable sources to support positions', 'Using data and AI tools to strengthen arguments'],
        notAllowed: ['Personal attacks, insults, or name-calling', 'Threatening language or incitement to violence', 'Doxing or sharing private personal information', 'Dehumanizing language toward any group', 'Brigading or coordinated harassment campaigns'],
        example: { scenario: '"This bill would increase healthcare costs by 15% according to CBO analysis" vs "Anyone who supports this bill is an idiot"', verdict: 'Attack the policy, not the person', verdictColor: '#3b82f6' },
    },
    {
        id: 'authenticity',
        title: 'Authenticity & Accuracy',
        icon: <ShieldIcon size={22} />,
        color: '#10b981',
        description: 'Trust is the foundation of our platform. We hold all users — verified and unverified — to strict accuracy standards.',
        allowed: ['Sharing verified news from reputable outlets', 'Expressing opinions clearly labeled as such', 'Using AI sentiment tools with context', 'Correcting mistakes transparently with edits', 'Citing primary sources and official documents'],
        notAllowed: ['Spreading known misinformation or disinformation', 'Manipulating AI-generated data or screenshots', 'Creating deepfakes of public figures', 'Misrepresenting verified credentials or badges', 'Impersonating other users, officials, or organizations'],
        example: { scenario: 'A user shares a screenshot claiming a politician voted a certain way. Our AI flags the screenshot as altered — the actual vote record shows the opposite.', verdict: 'Doctored evidence = immediate suspension', verdictColor: '#ef4444' },
    },
    {
        id: 'financial',
        title: 'Financial Content & Market Discussion',
        icon: <ZapIcon size={22} />,
        color: '#f59e0b',
        description: 'Market discussions must be honest, transparent, and comply with SEC regulations.',
        allowed: ['Sharing personal investment theses with disclaimers', 'Discussing market trends with cited data', 'Using Arizonalex tools for portfolio analysis', 'Educational content about investing strategies', 'Reporting on company earnings and financial news'],
        notAllowed: ['Pump-and-dump schemes or coordinated buying', 'Insider trading tips or material non-public info', 'Market manipulation through misleading claims', 'Presenting paid promotions as organic advice', 'Impersonating licensed financial advisors'],
        example: { scenario: 'A user posts "Buy $XYZ now, it\'s about to moon 🚀" without disclosure that they hold a large position and are being paid to promote it.', verdict: 'Undisclosed paid promotion = content removal + strike', verdictColor: '#f59e0b' },
    },
    {
        id: 'privacy',
        title: 'Privacy & Data Protection',
        icon: <LockIcon size={22} />,
        color: '#8b5cf6',
        description: 'Protecting personal information is paramount — both your own and others\'.',
        allowed: ['Sharing your own public voting participation', 'Discussing publicly available campaign finance data', 'Posting about your own political engagement', 'Sharing content from public government proceedings', 'Referencing official public records and filings'],
        notAllowed: ['Sharing private addresses, phone numbers, or emails', 'Publishing non-public personal identification documents', 'Revealing private voting records or ballot choices', 'Leaking confidential corporate or government information', 'Scraping or harvesting other users\' profile data'],
        example: { scenario: 'After a heated debate, a user posts the home address of a politician they disagree with and encourages people to "pay them a visit."', verdict: 'Doxing = immediate permanent ban', verdictColor: '#ef4444' },
    },
    {
        id: 'media',
        title: 'Media & Content Standards',
        icon: <ImageIcon size={22} />,
        color: '#ec4899',
        description: 'All media shared on Arizonalex must meet our quality and appropriateness standards.',
        allowed: ['Original infographics and data visualizations', 'Licensed or Creative Commons media', 'Screenshots with proper attribution', 'Political cartoons and satire (labeled)', 'AI-generated analysis visualizations'],
        notAllowed: ['NSFW or explicit material of any kind', 'Graphic violence or gore', 'Copyrighted content without permission', 'AI-generated deepfake images of real people', 'Misleading charts with manipulated scales'],
        example: { scenario: 'A user creates a chart showing economic growth data but intentionally truncates the Y-axis to make a 0.5% change look like a 50% swing.', verdict: 'Misleading visualization = content flagged + warning', verdictColor: '#f59e0b' },
    },
];

const strikeSystem = [
    { strike: 1, label: 'First Strike — Warning', desc: 'Content removed, educational notice sent. Account remains fully functional.', color: '#f59e0b' },
    { strike: 2, label: 'Second Strike — Restriction', desc: '7-day posting restriction. Read-only access. Cannot create polls or DM.', color: '#f97316' },
    { strike: 3, label: 'Third Strike — Suspension', desc: '30-day suspension with appeal opportunity. All content behind review wall.', color: '#ef4444' },
    { strike: 4, label: 'Fourth Strike — Permanent Ban', desc: 'Account permanently banned. All content removed. IP and device logged.', color: '#dc2626' },
];

const quickReference = [
    'Debate policies, not people',
    'Always cite your sources',
    'Label opinions as opinions',
    'Never share private information',
    'Disclose financial conflicts of interest',
];

export default function GuidelinesPage() {
    const [activeSection, setActiveSection] = useState('');
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );
        Object.values(sectionRefs.current).forEach(el => {
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <ShieldIcon size={14} /> Guidelines
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>Community Guidelines</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        The rules and standards that keep Arizonalex safe, trustworthy, and informative for everyone.
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <ClockIcon size={12} /> Last updated: March 1, 2026 • Version 3.2
                    </div>
                </div>
            </div>

            <div className="info-page-content">
                {/* Quick Reference */}
                <div className="info-card" style={{ padding: 22, marginBottom: 32, borderLeft: '3px solid #7C3AED' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ZapIcon size={16} /> Quick Reference — The 5 Rules
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {quickReference.map((rule, i) => (
                            <span key={i} style={{
                                padding: '6px 14px', borderRadius: 8, background: 'var(--bg-tertiary)',
                                fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {i + 1}
                                </span>
                                {rule}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    {/* Main Content */}
                    <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                        {guidelines.map((section, i) => (
                            <div
                                key={section.id}
                                id={section.id}
                                ref={el => { sectionRefs.current[section.id] = el; }}
                                className="info-card"
                                style={{ marginBottom: 20, padding: 'clamp(20px, 4vw, 28px)', animationDelay: `${i * 60}ms` }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${section.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.color }}>
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2 }}>{section.title}</h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>{section.description}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 14 }}>
                                    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CheckCircleIcon size={13} /> ALLOWED
                                        </div>
                                        {section.allowed.map((item, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 7, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: '#10b981', marginTop: 2, flexShrink: 0 }}>✓</span>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <XCircleIcon size={13} /> NOT ALLOWED
                                        </div>
                                        {section.notAllowed.map((item, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 7, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: '#ef4444', marginTop: 2, flexShrink: 0 }}>✗</span>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {section.example && (
                                    <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px dashed var(--border)' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example Scenario</div>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{section.example.scenario}</p>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: section.example.verdictColor }}>→ {section.example.verdict}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Strike System */}
                        <div id="strikes" ref={el => { sectionRefs.current['strikes'] = el; }} className="info-card" style={{ padding: 'clamp(20px, 4vw, 28px)', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircleIcon size={20} /> Enforcement: Strike System
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                                Violations are handled through a progressive strike system. Severe violations (threats, doxing, deepfakes) may skip directly to suspension or permanent ban.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {strikeSystem.map(s => (
                                    <div key={s.strike} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: 12, background: `${s.color}06`, border: `1px solid ${s.color}18` }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%', background: `${s.color}20`, color: s.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
                                        }}>
                                            {s.strike}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: s.color, marginBottom: 2 }}>{s.label}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Appeal */}
                        <div id="appeals" ref={el => { sectionRefs.current['appeals'] = el; }} className="info-card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Appeals Process</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                                We believe in fair enforcement. If you believe a moderation action was applied in error, you have the right to appeal.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    'Submit an appeal within 14 days of the action via Settings → Account → Appeals.',
                                    'A different moderator (not the original reviewer) will evaluate your case.',
                                    'Appeals are resolved within 3–5 business days.',
                                    'If overturned, the strike is removed and your record updated.',
                                    'Each action can only be appealed once.',
                                ].map((step, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, color: 'var(--text-tertiary)' }}>
                                            {i + 1}
                                        </span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar TOC */}
                    <div style={{ flex: '0 1 240px', minWidth: 200 }}>
                        <div style={{ position: 'sticky', top: 80 }}>
                            <div className="info-card" style={{ padding: 18 }}>
                                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>On This Page</h3>
                                {[...guidelines.map(g => ({ id: g.id, label: g.title })), { id: 'strikes', label: 'Strike System' }, { id: 'appeals', label: 'Appeals Process' }].map(item => (
                                    <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none',
                                        background: activeSection === item.id ? 'rgba(124,58,237,0.1)' : 'transparent',
                                        color: activeSection === item.id ? '#a78bfa' : 'var(--text-secondary)',
                                        fontSize: '0.82rem', fontWeight: activeSection === item.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                    }}>
                                        <ChevronRightIcon size={12} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <Link href="/report" className="info-card info-card-hover" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, marginTop: 14, textDecoration: 'none' }}>
                                <FlagIcon size={18} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Report a Violation</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Help keep the community safe</div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
