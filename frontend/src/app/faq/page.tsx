'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    HelpCircleIcon, ChevronDownIcon, ThumbsUpIcon, ThumbsDownIcon,
    SearchIcon, ArrowRightIcon, UserIcon, SettingsIcon, ShieldIcon,
    CreditCardIcon, BotIcon, LockIcon, ZapIcon, FileTextIcon, StarIcon
} from '@/components/ui/Icons';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    popular?: boolean;
    relatedArticle?: { id: string; title: string };
}

const categories = [
    { id: 'all', label: 'All', icon: <ZapIcon size={14} /> },
    { id: 'general', label: 'General', icon: <ZapIcon size={14} /> },
    { id: 'account', label: 'Account', icon: <UserIcon size={14} /> },
    { id: 'features', label: 'Features', icon: <SettingsIcon size={14} /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldIcon size={14} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCardIcon size={14} /> },
    { id: 'api', label: 'API', icon: <BotIcon size={14} /> },
];

const faqItems: FAQItem[] = [
    // General
    { id: 'g1', category: 'general', popular: true, question: 'What is Arizonalex?', answer: 'Arizonalex is an AI-powered political and financial social media platform that combines real-time legislative tracking, market data analysis, and community discourse. We provide tools for monitoring congressional votes, tracking economic indicators, and engaging in informed political discussion with verified officials, journalists, and citizens.', relatedArticle: { id: 'gs-1', title: 'Welcome to Arizonalex: Your Platform Tour' } },
    { id: 'g2', category: 'general', popular: true, question: 'How is Arizonalex different from other social platforms?', answer: 'Unlike traditional social media, Arizonalex integrates real-time political data (bill tracking, vote records, policy analysis) with financial market data (S&P 500, NASDAQ, bond yields). Our AI-powered analysis engine provides sentiment analysis on legislation, and our verification system ensures you know exactly who you\'re engaging with — from verified politicians to credentialed journalists.' },
    { id: 'g3', category: 'general', question: 'Is Arizonalex available outside the United States?', answer: 'Yes! While our core political data focuses on U.S. federal and state legislation, our Global Politics hub covers international affairs, diplomacy, and elections worldwide. Financial data includes global market indices, currencies, and commodities. We are actively expanding coverage to EU, UK, and Asia-Pacific political systems.' },
    { id: 'g4', category: 'general', question: 'Who can sign up for Arizonalex?', answer: 'Arizonalex is open to everyone — citizens, journalists, political officials, researchers, financial analysts, and more. We offer verified account badges for politicians, government officials, and credentialed journalists. All users must be at least 16 years old and agree to our Community Guidelines.' },
    { id: 'g5', category: 'general', question: 'How does the verification system work?', answer: 'Our multi-tier verification system includes: Blue badges for government officials and elected representatives, Gold badges for credentialed journalists and news organizations, and Green badges for recognized financial analysts and economists. Verification requires government ID, professional credentials, or organizational affiliation proof.', relatedArticle: { id: 'gs-3', title: 'Complete Guide to Getting Verified on Arizonalex' } },

    // Account
    { id: 'a1', category: 'account', popular: true, question: 'How do I create an account?', answer: 'Visit arizonalex.com/register and provide your name, email, and a secure password. You can also sign up using Google or Apple SSO. After registration, verify your email address and complete your profile with your political interests, market watchlist, and notification preferences.' },
    { id: 'a2', category: 'account', question: 'How do I reset my password?', answer: 'Go to Settings → Security → Change Password, or click "Forgot Password" on the login page. We\'ll send a secure reset link to your registered email. For accounts with 2FA enabled, you\'ll also need to verify through your authenticator app. Reset links expire after 30 minutes for security.' },
    { id: 'a3', category: 'account', question: 'Can I change my username?', answer: 'Yes, you can change your username once every 30 days. Go to Settings → Profile → Edit Username. Note that your old username will become available to others after 14 days, and any @mentions of your old username in existing posts will not automatically update.' },
    { id: 'a4', category: 'account', popular: true, question: 'How do I enable two-factor authentication?', answer: 'Navigate to Settings → Security → Two-Factor Authentication. We support authenticator apps (Google Authenticator, Authy), SMS-based verification, and hardware security keys (YubiKey). We strongly recommend using an authenticator app for the highest security, especially for verified accounts.', relatedArticle: { id: 'ap-2', title: 'Setting Up Two-Factor Authentication (2FA)' } },
    { id: 'a5', category: 'account', question: 'How do I delete my account?', answer: 'Go to Settings → Account → Delete Account. You\'ll have a 30-day grace period during which you can reactivate your account. After 30 days, all your posts, comments, and personal data will be permanently deleted in accordance with GDPR and CCPA requirements. Market data and anonymized analytics may be retained.' },

    // Features
    { id: 'f1', category: 'features', popular: true, question: 'How does the AI policy analysis work?', answer: 'Our AI analysis engine uses natural language processing to analyze legislation text, congressional speeches, and policy documents. It provides impact assessments across sectors (healthcare, finance, tech), sentiment scores, and predicted market implications. The model is trained on historical legislative outcomes and market correlations over 20+ years of data.', relatedArticle: { id: 'ai-1', title: 'Using AI Sentiment Analysis for Political Trend Predictions' } },
    { id: 'f2', category: 'features', question: 'How do I set up market alerts?', answer: 'Navigate to Business → My Watchlist → Add Alert. You can set alerts for price thresholds, percentage changes, volume spikes, and AI-detected political events that may impact specific sectors. Alerts can be delivered via push notification, email, or SMS. Premium users can set unlimited alerts with custom conditions.', relatedArticle: { id: 'mf-1', title: 'Setting Up Real-Time Market Alerts for S&P 500 Movements' } },
    { id: 'f3', category: 'features', question: 'What is the Political Pulse feature?', answer: 'Political Pulse is a real-time dashboard that aggregates and visualizes political sentiment across social media, news outlets, and congressional activity. It includes approval ratings, legislative momentum indicators, party alignment scores, and trend predictions. Updated every 5 minutes with data from verified sources.', relatedArticle: { id: 'pl-2', title: 'Using the Political Pulse Dashboard' } },
    { id: 'f4', category: 'features', question: 'Can I track specific bills and legislation?', answer: 'Yes! Use the Politics Hub → Bill Tracker to search for specific bills by number, title, or sponsor. You can follow bills to receive notifications on committee hearings, amendments, floor votes, and presidential action. Our AI provides impact analysis and predicts passage probability based on historical and current political dynamics.', relatedArticle: { id: 'pl-1', title: 'How to Track a Bill Through Congress Using Arizonalex' } },
    { id: 'f5', category: 'features', question: 'How do I create and manage polls?', answer: 'Go to Politics Hub → Create Poll. You can create single-choice or multi-choice polls with up to 8 options, set duration (1 hour to 7 days), and add topic tags. Results show real-time breakdown by user role (citizen, politician, journalist) and geographic distribution. Premium polls include demographic analytics.' },

    // Privacy
    { id: 'p1', category: 'privacy', popular: true, question: 'What data does Arizonalex collect?', answer: 'We collect account information (name, email), usage data (posts, interactions), device information, and optional location data. Financial data connections (portfolio tracking) are encrypted end-to-end and never shared. Political engagement data (votes on polls, followed topics) is used to personalize your feed. See our full Privacy Policy for comprehensive details.', relatedArticle: { id: 'ap-1', title: 'Understanding Your Data Privacy Rights on Arizonalex' } },
    { id: 'p2', category: 'privacy', question: 'Can I make my profile private?', answer: 'Yes. Go to Settings → Privacy → Profile Visibility. Options include: Public (visible to everyone), Followers Only (visible to approved followers), or Private (profile hidden from search). Note that verified public officials\' accounts remain partially public per our transparency policy for democratic accountability.' },
    { id: 'p3', category: 'privacy', question: 'How does Arizonalex handle political bias?', answer: 'We use algorithmically balanced content distribution to ensure users see perspectives from across the political spectrum. Our AI moderation system detects and flags misleading claims regardless of political affiliation. We publish quarterly transparency reports on content moderation decisions and algorithmic fairness audits.', relatedArticle: { id: 'ai-2', title: 'Understanding AI Model Transparency and Bias Controls' } },
    { id: 'p4', category: 'privacy', question: 'Does Arizonalex share data with political campaigns?', answer: 'Absolutely not. We never sell user data to political campaigns, PACs, or organizations. Political advertising on Arizonalex must comply with strict transparency requirements, including disclosure of funding sources. Users can opt out of all targeted political advertising in Settings → Privacy → Ad Preferences.' },
    { id: 'p5', category: 'privacy', question: 'How can I download my data?', answer: 'Go to Settings → Privacy → Download My Data. You can request a full export of your account data in JSON or CSV format, including posts, comments, poll votes, saved articles, and interaction history. GDPR-compliant data exports are processed within 48 hours. You can also request specific data categories.', relatedArticle: { id: 'ap-4', title: 'Complete Guide to Data Export and Portability' } },

    // Billing
    { id: 'b1', category: 'billing', popular: true, question: 'What subscription plans are available?', answer: 'We offer three tiers: Free (basic feed, limited AI analysis, 5 market alerts), Pro at $9.99/month (unlimited AI analysis, real-time market data, priority support, advanced analytics), and Enterprise (custom pricing for organizations, teams features, API access, dedicated account manager). Annual plans receive a 20% discount.', relatedArticle: { id: 'bs-1', title: 'Understanding Arizonalex Subscription Tiers' } },
    { id: 'b2', category: 'billing', question: 'How do I cancel my subscription?', answer: 'Go to Settings → Billing → Manage Subscription → Cancel. You\'ll retain Pro features until the end of your current billing period. No cancellation fees. If you cancel within 48 hours of upgrading, we offer a full refund. Annual plans can be prorated upon cancellation by contacting support.' },
    { id: 'b3', category: 'billing', question: 'What payment methods are accepted?', answer: 'We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay. Enterprise accounts can pay by invoice (NET-30) or wire transfer. All payment data is processed through Stripe and is PCI DSS Level 1 compliant. We never store full card numbers on our servers.' },
    { id: 'b4', category: 'billing', question: 'Do you offer refunds?', answer: 'Yes. Pro monthly subscriptions are eligible for a full refund within 14 days of the charge date if you haven\'t used more than 50% of Pro-exclusive features. Annual subscriptions can be prorated. Contact our billing team at billing@arizonalex.com or through the in-app support chat for refund requests.' },
    { id: 'b5', category: 'billing', question: 'Is there a student or educator discount?', answer: 'Yes! Students and educators receive 50% off Pro plans. Verify your status through SheerID with a valid .edu email or student ID. Nonprofit organizations focused on civic engagement, journalism, or political transparency are eligible for free Pro access — contact partnerships@arizonalex.com.' },

    // API
    { id: 'x1', category: 'api', popular: true, question: 'Does Arizonalex offer a public API?', answer: 'Yes, our REST API and WebSocket endpoints are available for Pro and Enterprise users. The API provides access to public political data (bill tracking, vote records), market data feeds, and AI analysis endpoints. Rate limits vary by plan: Pro gets 1,000 requests/hour, Enterprise gets 50,000 requests/hour with dedicated infrastructure.', relatedArticle: { id: 'ti-2', title: 'API Rate Limiting Strategies and Best Practices' } },
    { id: 'x2', category: 'api', question: 'How do I get API credentials?', answer: 'Navigate to Settings → Developer → API Keys. Generate a new API key with specific scopes (read-only, read-write, admin). Each plan supports up to 5 API keys. Keys can be rotated at any time. We recommend using environment variables and never exposing keys in client-side code. Webhook endpoints can also be configured here.' },
    { id: 'x3', category: 'api', question: 'What data formats does the API support?', answer: 'Our API supports JSON (default) and Protocol Buffers for high-performance applications. WebSocket feeds deliver real-time market data and political event updates in JSON format. Historical data exports are available in CSV, Parquet, and JSON Lines formats for data analysis and machine learning applications.' },
    { id: 'x4', category: 'api', question: 'Are there SDKs available?', answer: 'We provide official SDKs for Python, JavaScript/TypeScript, Go, and Ruby. Community-maintained SDKs are available for Java, C#, and Rust. All SDKs include built-in rate limiting, retry logic, and type-safe models. Documentation and examples are available at docs.arizonalex.com/sdks.' },
    { id: 'x5', category: 'api', question: 'What is the API uptime guarantee?', answer: 'Enterprise API customers receive a 99.95% uptime SLA with credits for any downtime. Pro API access targets 99.9% uptime. We maintain real-time status monitoring at status.arizonalex.com. Planned maintenance windows are announced 72 hours in advance and scheduled during low-traffic hours (2-4 AM ET).' },
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const setFeedbackFor = (id: string, type: 'up' | 'down') => {
        setFeedback(prev => ({ ...prev, [id]: type }));
    };

    const filteredFAQs = useMemo(() => {
        let items = activeCategory === 'all' ? faqItems : faqItems.filter(f => f.category === activeCategory);
        if (searchQuery.trim().length > 1) {
            const q = searchQuery.toLowerCase();
            items = items.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
        }
        return items;
    }, [activeCategory, searchQuery]);

    const expandAll = () => setOpenItems(new Set(filteredFAQs.map(f => f.id)));
    const collapseAll = () => setOpenItems(new Set());

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <HelpCircleIcon size={14} /> FAQ
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 10 }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 20 }}>
                        Find answers to common questions about the Arizonalex platform.
                    </p>
                    {/* Search */}
                    <div className="info-search-box" style={{ maxWidth: 480, margin: '0 auto' }}>
                        <SearchIcon size={16} />
                        <input
                            type="text"
                            placeholder="Search FAQ..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <div className="info-page-content">
                {/* Category Tabs + Expand/Collapse */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    <div className="info-tabs-sticky" style={{ position: 'static', padding: 0, background: 'none', borderBottom: 'none' }}>
                        <div className="info-tabs" style={{ flexWrap: 'wrap' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`info-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.icon}
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={expandAll} style={{ fontSize: '0.75rem' }}>Expand All</button>
                        <button className="btn btn-outline btn-sm" onClick={collapseAll} style={{ fontSize: '0.75rem' }}>Collapse All</button>
                    </div>
                </div>

                {/* Results count */}
                {searchQuery && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                        {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
                    </p>
                )}

                {/* FAQ Accordions */}
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {filteredFAQs.length === 0 && (
                        <div className="info-card" style={{ textAlign: 'center', padding: 40 }}>
                            <HelpCircleIcon size={32} />
                            <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>No matching questions found. Try a different search term.</p>
                        </div>
                    )}
                    {filteredFAQs.map((faq, i) => (
                        <div key={faq.id} className="info-accordion" style={{ animationDelay: `${i * 40}ms` }}>
                            <button
                                className={`info-accordion-header ${openItems.has(faq.id) ? 'open' : ''}`}
                                onClick={() => toggleItem(faq.id)}
                            >
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                                    {faq.popular && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                            <StarIcon size={10} /> Popular
                                        </span>
                                    )}
                                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{faq.question}</span>
                                </div>
                                <span className={`info-accordion-chevron ${openItems.has(faq.id) ? 'open' : ''}`}>
                                    <ChevronDownIcon size={18} />
                                </span>
                            </button>
                            <div className={`info-accordion-body ${openItems.has(faq.id) ? 'open' : ''}`}>
                                <div className="info-accordion-content">
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{faq.answer}</p>
                                    
                                    {/* Related Article Link */}
                                    {faq.relatedArticle && (
                                        <Link href={`/help/article/${faq.relatedArticle.id}`} style={{
                                            display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 14px',
                                            borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)',
                                            textDecoration: 'none', color: '#a78bfa', fontSize: '0.82rem', fontWeight: 600, transition: 'background 0.2s'
                                        }}>
                                            <FileTextIcon size={14} />
                                            <span style={{ flex: 1 }}>Read: {faq.relatedArticle.title}</span>
                                            <ArrowRightIcon size={12} />
                                        </Link>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Was this helpful?</span>
                                        <button
                                            className={`info-feedback-btn ${feedback[faq.id] === 'up' ? 'active-up' : ''}`}
                                            onClick={() => setFeedbackFor(faq.id, 'up')}
                                        >
                                            <ThumbsUpIcon size={14} /> Yes
                                        </button>
                                        <button
                                            className={`info-feedback-btn ${feedback[faq.id] === 'down' ? 'active-down' : ''}`}
                                            onClick={() => setFeedbackFor(faq.id, 'down')}
                                        >
                                            <ThumbsDownIcon size={14} /> No
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="info-cta-section" style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Still have questions?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, maxWidth: 400 }}>
                        Check our Help Center for detailed guides or reach out to our support team.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/help" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <SearchIcon size={16} /> Visit Help Center
                        </Link>
                        <Link href="/contact" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <ArrowRightIcon size={16} /> Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
