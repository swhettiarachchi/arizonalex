'use client';
import { useState } from 'react';
import {
    FileTextIcon, ChevronDownIcon, ShieldIcon, LandmarkIcon,
    AlertTriangleIcon, UsersIcon, ClockIcon, DownloadIcon,
    CheckCircleIcon, BriefcaseIcon, BotIcon, GlobeIcon, ScaleIcon
} from '@/components/ui/Icons';

interface TermsSection {
    id: string;
    title: string;
    content: string[];
    icon: React.ReactNode;
}

const termsSections: TermsSection[] = [
    {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        icon: <FileTextIcon size={18} />,
        content: [
            'By accessing or using the Arizonalex platform, you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and Community Guidelines. If you do not agree to these Terms, you must not use the platform.',
            'Arizonalex reserves the right to modify these Terms at any time. Material changes will be communicated via email and in-platform notification at least 30 days before taking effect. Continued use after the effective date constitutes acceptance of modified Terms.',
            'These Terms constitute a legally binding agreement between you and Arizonalex Inc., a Delaware corporation headquartered in Phoenix, Arizona. You must be at least 16 years of age to create an account.'
        ]
    },
    {
        id: 'accounts',
        title: '2. User Accounts',
        icon: <UsersIcon size={18} />,
        content: [
            'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access. Accounts are non-transferable and may not be sold, traded, or given to another party.',
            'Verified accounts (politicians, journalists, officials) must provide accurate credential documentation. Misrepresenting your identity, professional role, or affiliation is grounds for immediate account termination and potential legal action.',
            'You may not create multiple accounts for the purpose of evading bans, manipulating engagement metrics, or conducting coordinated inauthentic behavior. Automated account creation is prohibited without prior written authorization.'
        ]
    },
    {
        id: 'content-moderation',
        title: '3. Content Moderation Policy',
        icon: <ShieldIcon size={18} />,
        content: [
            'Arizonalex employs a hybrid moderation system combining AI automated detection and human review. Our moderation covers political speech, financial claims, misinformation, harassment, and platform manipulation. All moderation decisions are documented and reviewable.',
            'Content is evaluated based on our Community Guidelines, applicable law, and democratic discourse principles. We apply consistent standards regardless of political affiliation, party, or ideology. Our quarterly transparency reports detail moderation volumes, categories, and appeal outcomes.',
            'Users may appeal moderation decisions within 30 days. Appeals are reviewed by an independent moderation review board. During appeal review, restricted content remains hidden but the account remains active unless there is an imminent safety risk.'
        ]
    },
    {
        id: 'election-integrity',
        title: '4. Election Integrity Policy',
        icon: <LandmarkIcon size={18} />,
        content: [
            'During election periods (defined as 90 days before any federal, state, or local election), enhanced content policies apply. False claims about voting procedures, polling locations, or eligibility requirements are immediately removed regardless of intent.',
            'Political advertising on Arizonalex must include clear disclosure of funding source, targeting criteria, and spend amount. All political ads are archived in our publicly searchable Political Ad Library for 7 years. Deepfakes and AI-generated content depicting candidates must be clearly labeled.',
            'Premature election result declarations, claims of fraud without credible evidence, and calls for violence related to election outcomes are strictly prohibited. Our Election Integrity Team operates 24/7 during election periods with direct escalation to law enforcement when necessary.'
        ]
    },
    {
        id: 'financial-disclaimer',
        title: '5. Financial Disclaimer',
        icon: <BriefcaseIcon size={18} />,
        content: [
            'Arizonalex provides financial data, market analysis, and AI-generated insights for informational and educational purposes only. Nothing on this platform constitutes investment advice, financial planning guidance, or a recommendation to buy, sell, or hold any financial instrument.',
            'AI-generated market predictions, sentiment analyses, and policy impact assessments are probabilistic estimates based on historical data and should not be the sole basis for investment decisions. Past performance indicators displayed on the platform do not guarantee future results.',
            'Arizonalex is not registered as a broker-dealer, investment adviser, or financial planner with the SEC, FINRA, or any state regulatory authority. Users should consult qualified financial professionals before making investment decisions. Arizonalex disclaims all liability for financial losses resulting from reliance on platform content.'
        ]
    },
    {
        id: 'ai-content',
        title: '6. AI-Generated Content',
        icon: <BotIcon size={18} />,
        content: [
            'Arizonalex utilizes artificial intelligence for content analysis, sentiment detection, policy impact prediction, and market forecasting. All AI-generated content is labeled with an "AI Analysis" badge and includes confidence scores where applicable.',
            'While we strive for accuracy, AI outputs may contain errors, biases, or incomplete analysis. Users should independently verify AI-generated information, particularly for legislative interpretations, financial projections, and political sentiment assessments.',
            'Users may not present AI-generated analysis as their own original research, expert opinion, or professional advice without attribution to Arizonalex. Scraping, repackaging, or commercial redistribution of AI analysis without an Enterprise license is prohibited.'
        ]
    },
    {
        id: 'intellectual-property',
        title: '7. Intellectual Property',
        icon: <ScaleIcon size={18} />,
        content: [
            'Content you post on Arizonalex remains yours. By posting, you grant Arizonalex a worldwide, non-exclusive, royalty-free license to display, distribute, and promote your content within the platform. This license terminates when you delete your content or account.',
            'You may not post copyrighted material without authorization. Legislative documents, court filings, and government-produced content referenced on the platform are public domain. News article excerpts are used under fair use principles with source attribution.',
            'The Arizonalex name, logo, design system, AI models, and proprietary analytics tools are protected intellectual property. Unauthorized reproduction, reverse engineering, or commercial use is prohibited and subject to legal action.'
        ]
    },
    {
        id: 'international',
        title: '8. International Use & Jurisdiction',
        icon: <GlobeIcon size={18} />,
        content: [
            'Arizonalex is operated from the United States. Users accessing the platform from other jurisdictions are responsible for compliance with their local laws. We make no representation that the platform is appropriate or available for use in all locations.',
            'EU/EEA users are protected under GDPR provisions as detailed in our Privacy Policy. UK users are covered under the UK GDPR. Data transfers to the United States comply with applicable data transfer mechanisms including Standard Contractual Clauses.',
            'These Terms are governed by the laws of the State of Arizona, USA. Any disputes shall be resolved through binding arbitration in Maricopa County, Arizona, except where prohibited by consumer protection laws in your jurisdiction.'
        ]
    },
    {
        id: 'termination',
        title: '9. Termination & Suspension',
        icon: <AlertTriangleIcon size={18} />,
        content: [
            'Arizonalex may suspend or terminate accounts that violate these Terms, our Community Guidelines, or applicable law. We provide notice and explanation for most enforcement actions, with immediate suspension reserved for imminent safety threats or legal requirements.',
            'You may delete your account at any time through Settings → Account → Delete Account. Upon deletion, your public posts are removed, personal data is purged within 30 days, and any active subscriptions are cancelled with prorated refunds for annual plans.',
            'Sections related to intellectual property, disclaimers, limitation of liability, and dispute resolution survive termination of these Terms.'
        ]
    },
];

export default function TermsPage() {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['acceptance']));
    const [agreed, setAgreed] = useState(false);

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#60a5fa' }}>
                        <FileTextIcon size={14} /> Legal
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>Terms of Service</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>The rules and agreements governing your use of Arizonalex.</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ClockIcon size={13} /> Effective: March 1, 2026
                        </span>
                        <button className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <DownloadIcon size={13} /> Download PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="info-page-content" style={{ maxWidth: 820, margin: '0 auto' }}>
                {termsSections.map((section, i) => (
                    <div key={section.id} className="info-accordion" style={{ animationDelay: `${i * 50}ms` }}>
                        <button
                            className={`info-accordion-header ${openSections.has(section.id) ? 'open' : ''}`}
                            onClick={() => toggleSection(section.id)}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                {section.icon}
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{section.title}</span>
                            </span>
                            <span className={`info-accordion-chevron ${openSections.has(section.id) ? 'open' : ''}`}>
                                <ChevronDownIcon size={18} />
                            </span>
                        </button>
                        <div className={`info-accordion-body ${openSections.has(section.id) ? 'open' : ''}`}>
                            <div className="info-accordion-content">
                                {section.content.map((p, j) => (
                                    <p key={j} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: j < section.content.length - 1 ? 14 : 0 }}>{p}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Agree Footer */}
            <div className="info-sticky-footer">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#7C3AED' }} />
                        I have read and agree to the Terms of Service
                    </label>
                    <button className="btn btn-primary" disabled={!agreed} style={{ opacity: agreed ? 1 : 0.5 }}>
                        <CheckCircleIcon size={16} /> Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
