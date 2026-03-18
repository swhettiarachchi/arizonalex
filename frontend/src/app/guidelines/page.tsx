'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    UsersIcon, ShieldIcon, LandmarkIcon, BriefcaseIcon, AlertTriangleIcon,
    BotIcon, ScaleIcon, CheckCircleIcon, XIcon, ChevronRightIcon,
    AlertCircleIcon, HelpCircleIcon, FlagIcon, MessageSquareIcon, ArrowRightIcon
} from '@/components/ui/Icons';

interface GuidelineSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    allowed: string[];
    notAllowed: string[];
}

const guidelines: GuidelineSection[] = [
    {
        id: 'discourse', title: 'Respectful Discourse', icon: <UsersIcon size={22} />, color: '#7C3AED',
        description: 'Arizonalex is built for constructive political and financial discussion. Disagree respectfully, engage with facts, and elevate the conversation.',
        allowed: ['Fact-based criticism of policies and legislation', 'Citing credible sources to support your position', 'Respectful debate across party lines and ideologies', 'Sharing personal experiences with government services'],
        notAllowed: ['Personal attacks on other users or ad hominem arguments', 'Deliberately inflammatory statements designed to provoke', 'Mocking or belittling users based on their political beliefs', 'Dogpiling or coordinated targeting of individual users']
    },
    {
        id: 'political', title: 'Political Content Rules', icon: <LandmarkIcon size={22} />, color: '#3b82f6',
        description: 'Political discourse is core to Arizonalex. We protect vigorous debate while preventing manipulation and foreign interference.',
        allowed: ['Expressing political opinions and endorsements', 'Sharing official campaign materials with disclosure', 'Discussing election results from certified sources', 'Creating polls on policy topics and political issues'],
        notAllowed: ['Fabricating quotes from political figures', 'Sharing false voter suppression tactics or fake polling locations', 'Foreign government-backed coordinated influence operations', 'Impersonating elected officials or government accounts']
    },
    {
        id: 'financial', title: 'Financial Advice Disclaimer', icon: <BriefcaseIcon size={22} />, color: '#10b981',
        description: 'Market data and analysis on Arizonalex are for informational purposes only. Users must not present unqualified opinions as professional financial advice.',
        allowed: ['Sharing market analysis with clear methodology disclosure', 'Discussing public company financials and SEC filings', 'Providing educational content about investing concepts', 'Using AI tools for personal research and analysis'],
        notAllowed: ['Presenting unqualified opinions as investment advice', 'Pump-and-dump schemes or coordinated market manipulation', 'Sharing insider information or non-public material data', 'Guaranteeing investment returns or making false profit claims']
    },
    {
        id: 'misinfo', title: 'Misinformation Policy', icon: <AlertTriangleIcon size={22} />, color: '#ef4444',
        description: 'Arizonalex combats misinformation with fact-checking, AI detection, and community reporting. Repeated violations result in account restrictions.',
        allowed: ['Sharing preliminary data with uncertainty disclaimers', 'Expressing opinions clearly labeled as personal views', 'Linking to peer-reviewed research and primary sources', 'Correcting misinformation with factual evidence'],
        notAllowed: ['Publishing fabricated statistics or fake research', 'Sharing manipulated images/video without clear disclosure', 'Spreading debunked conspiracy theories as fact', 'Creating deepfakes of public figures without AI-content labels']
    },
    {
        id: 'harassment', title: 'Harassment & Hate Speech', icon: <ShieldIcon size={22} />, color: '#8b5cf6',
        description: 'Zero tolerance for harassment, threats, and hate speech. This includes targeted behavior based on race, gender, religion, nationality, disability, or political affiliation.',
        allowed: ['Reporting concerning behavior through official channels', 'Blocking users whose content you find offensive', 'Constructive criticism of public figures\' professional actions', 'Discussing systemic issues affecting specific communities'],
        notAllowed: ['Direct or implied threats of violence against any individual', 'Hate speech targeting protected characteristics', 'Doxxing — revealing private personal information', 'Sustained harassment campaigns or stalking behavior']
    },
    {
        id: 'ai-content', title: 'AI-Generated Content', icon: <BotIcon size={22} />, color: '#f59e0b',
        description: 'AI tools are powerful but require responsible use. All AI-generated content must be clearly labeled and not used to deceive.',
        allowed: ['Using AI tools to draft and refine political analysis', 'Generating data visualizations and summaries with AI', 'Clearly labeling AI-assisted content as such', 'Using AI translation for multilingual political coverage'],
        notAllowed: ['Posting AI-generated content as original human analysis', 'Creating AI deepfakes or synthetic media without labels', 'Using AI to generate mass spam or inauthentic engagement', 'Automating posts to manipulate trending topics']
    },
    {
        id: 'enforcement', title: 'Enforcement & Appeals', icon: <ScaleIcon size={22} />, color: '#06b6d4',
        description: 'Our enforcement system is transparent, consistent, and fair. All users have the right to appeal moderation decisions.',
        allowed: ['Appealing moderation decisions within 30 days', 'Requesting specific explanation for content removal', 'Contacting support for account restriction questions', 'Viewing your enforcement history in account settings'],
        notAllowed: ['Creating alt accounts to evade bans or restrictions', 'Threatening moderators or content review staff', 'Filing frivolous mass reports against users you disagree with', 'Sharing private moderation correspondence publicly']
    },
];

const strikeSystem = [
    { level: 1, label: 'First Strike', action: 'Warning + Content Removal', color: '#f59e0b', desc: 'Educational notice explaining the violation. Content is removed.' },
    { level: 2, label: 'Second Strike', action: '24-Hour Posting Restriction', color: '#f97316', desc: 'Account posting is restricted for 24 hours. All features remain accessible in read-only mode.' },
    { level: 3, label: 'Third Strike', action: '7-Day Suspension', color: '#ef4444', desc: 'Full account suspension for 7 days. Profile is hidden, existing content remains.' },
    { level: 4, label: 'Fourth Strike', action: 'Permanent Ban', color: '#dc2626', desc: 'Account is permanently terminated. Appeal available within 90 days through formal review process.' },
];

export default function GuidelinesPage() {
    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero">
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <ShieldIcon size={14} /> Community Guidelines
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
                        Community Guidelines
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                        Arizonalex is a platform for informed political discourse and financial analysis. These guidelines ensure a safe, productive environment for all users.
                    </p>
                </div>
            </div>

            <div className="info-page-content">
                {/* Guidelines Sections */}
                {guidelines.map((section, i) => (
                    <div key={section.id} className="info-card" style={{ marginBottom: 20, padding: 28, animationDelay: `${i * 60}ms` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.color, flexShrink: 0 }}>
                                {section.icon}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{section.title}</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{section.description}</p>
                            </div>
                        </div>

                        {/* Allowed vs Not Allowed table */}
                        <div className="info-grid-2" style={{ gap: 16 }}>
                            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                                    <CheckCircleIcon size={16} /> What&apos;s Allowed
                                </div>
                                {section.allowed.map((item, j) => (
                                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: j < section.allowed.length - 1 ? 8 : 0, lineHeight: 1.4 }}>
                                        <CheckCircleIcon size={13} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>
                                    <XIcon size={16} /> Not Allowed
                                </div>
                                {section.notAllowed.map((item, j) => (
                                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: j < section.notAllowed.length - 1 ? 8 : 0, lineHeight: 1.4 }}>
                                        <AlertCircleIcon size={13} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Strike System */}
                <h2 className="info-section-title" style={{ marginTop: 40 }}>Strike System</h2>
                <div className="info-card" style={{ padding: 28 }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        Violations are tracked through a progressive strike system. Strikes expire after 12 months of good standing. Severity determines which strike level is applied — critical safety violations may skip directly to suspension.
                    </p>
                    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 3, background: 'var(--border)', zIndex: 0 }} />
                        <div className="info-strike-grid">
                            {strikeSystem.map(s => (
                                <div key={s.level} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${s.color}20`, border: `3px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontWeight: 800, fontSize: '0.9rem', color: s.color }}>
                                        {s.level}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: s.color, marginBottom: 6 }}>{s.action}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{s.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Appeals CTA */}
                <div className="info-cta-section" style={{ marginTop: 40 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Need to Appeal a Decision?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, maxWidth: 440 }}>
                        Every user has the right to appeal moderation decisions. Our independent review board ensures fair, consistent enforcement.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/report" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <FlagIcon size={16} /> File an Appeal
                        </Link>
                        <Link href="/help" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <HelpCircleIcon size={16} /> Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
