'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    SearchIcon, BookmarkIcon, ShieldIcon, LandmarkIcon, BriefcaseIcon,
    BotIcon, UsersIcon, SettingsIcon, HelpCircleIcon, ChevronRightIcon,
    MessageSquareIcon, MailIcon, ArrowRightIcon, AlertCircleIcon,
    CreditCardIcon, FileTextIcon, ZapIcon, TrendingUpIcon, LockIcon
} from '@/components/ui/Icons';

interface HelpCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    articleCount: number;
    color: string;
}

interface PopularArticle {
    id: string;
    title: string;
    tag: string;
    tagColor: string;
    readTime: string;
}

const helpCategories: HelpCategory[] = [
    { id: 'getting-started', title: 'Getting Started', description: 'New to Arizonalex? Learn the basics of political engagement and market analysis.', icon: <ZapIcon size={24} />, articleCount: 12, color: '#7C3AED' },
    { id: 'account-privacy', title: 'Account & Privacy', description: 'Manage your profile, security settings, two-factor authentication, and data preferences.', icon: <LockIcon size={24} />, articleCount: 18, color: '#3b82f6' },
    { id: 'politics-legislation', title: 'Politics & Legislation', description: 'Track bills, follow debates, understand legislative processes and political analytics.', icon: <LandmarkIcon size={24} />, articleCount: 15, color: '#ef4444' },
    { id: 'markets-finance', title: 'Markets & Finance', description: 'Real-time market data, portfolio tracking, economic indicators, and financial tools.', icon: <BriefcaseIcon size={24} />, articleCount: 22, color: '#10b981' },
    { id: 'ai-tools', title: 'AI Tools', description: 'Leverage AI-powered sentiment analysis, policy impact predictions, and market forecasting.', icon: <BotIcon size={24} />, articleCount: 9, color: '#f59e0b' },
    { id: 'community', title: 'Community Guidelines', description: 'Understand our rules for respectful discourse, content moderation, and reporting.', icon: <UsersIcon size={24} />, articleCount: 8, color: '#06b6d4' },
    { id: 'technical', title: 'Technical Issues', description: 'Troubleshoot login problems, browser compatibility, notifications, and app performance.', icon: <SettingsIcon size={24} />, articleCount: 14, color: '#8b5cf6' },
    { id: 'billing', title: 'Billing & Subscriptions', description: 'Manage your subscription plan, payment methods, invoices, and premium features.', icon: <CreditCardIcon size={24} />, articleCount: 11, color: '#ec4899' },
];

const popularArticles: PopularArticle[] = [
    { id: '1', title: 'How to Track a Bill Through Congress Using Arizonalex', tag: 'LEGISLATION', tagColor: '#ef4444', readTime: '5 min' },
    { id: '2', title: 'Setting Up Real-Time Market Alerts for S&P 500 Movements', tag: 'MARKETS', tagColor: '#10b981', readTime: '4 min' },
    { id: '3', title: 'Understanding Your Data Privacy Rights on Arizonalex', tag: 'PRIVACY', tagColor: '#3b82f6', readTime: '6 min' },
    { id: '4', title: 'Using AI Sentiment Analysis for Political Trend Predictions', tag: 'AI TOOLS', tagColor: '#f59e0b', readTime: '7 min' },
    { id: '5', title: 'How to Report Misinformation and Political Disinformation', tag: 'COMMUNITY', tagColor: '#06b6d4', readTime: '3 min' },
    { id: '6', title: 'Connecting Your Portfolio for Automated Financial Tracking', tag: 'MARKETS', tagColor: '#10b981', readTime: '5 min' },
];

const searchSuggestions = [
    'How to create a poll', 'Track legislation', 'Market alerts setup',
    'Reset password', 'AI analysis tools', 'Report a post', 'Subscription plans',
    'Two-factor authentication', 'Export data', 'Community guidelines'
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = searchSuggestions.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <div className="info-hero">
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <HelpCircleIcon size={14} /> Help Center
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
                        How can we help you?
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 28, lineHeight: 1.6 }}>
                        Search our knowledge base or browse categories below to find answers about politics, markets, and platform features.
                    </p>
                    <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
                        <div className="info-search-box">
                            <SearchIcon size={18} />
                            <input
                                type="text"
                                placeholder="Search for help articles, tutorials, FAQs..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                        {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                            <div className="info-search-dropdown">
                                {filteredSuggestions.map((s, i) => (
                                    <button key={i} className="info-search-item" onClick={() => { setSearchQuery(s); setShowSuggestions(false); }}>
                                        <SearchIcon size={14} />
                                        <span>{s}</span>
                                        <ArrowRightIcon size={12} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="info-page-content">
                <h2 className="info-section-title">Browse by Category</h2>
                <div className="info-grid-4">
                    {helpCategories.map((cat, i) => (
                        <div key={cat.id} className="info-card info-card-hover" style={{ animationDelay: `${i * 60}ms` }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, marginBottom: 14 }}>
                                {cat.icon}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{cat.title}</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{cat.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    <FileTextIcon size={12} /> {cat.articleCount} articles
                                </span>
                                <span style={{ color: cat.color, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                                    Explore <ChevronRightIcon size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Popular Articles */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>Popular Articles</h2>
                <div className="info-grid-2">
                    {popularArticles.map((article, i) => (
                        <div key={article.id} className="info-card info-card-hover" style={{ animationDelay: `${i * 60}ms`, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ flex: 1 }}>
                                <span className="info-tag" style={{ background: `${article.tagColor}20`, color: article.tagColor }}>
                                    {article.tag}
                                </span>
                                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: 8, lineHeight: 1.4 }}>
                                    {article.title}
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 8, display: 'inline-block' }}>
                                    {article.readTime} read
                                </span>
                            </div>
                            <ChevronRightIcon size={16} />
                        </div>
                    ))}
                </div>

                {/* Contact Support CTA */}
                <div className="info-cta-section" style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Still need help?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 28, maxWidth: 500 }}>
                        Our support team is available 24/7 to assist with any questions about politics tracking, market data, or platform features.
                    </p>
                    <div className="info-grid-3" style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div className="info-card" style={{ textAlign: 'center', padding: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#7C3AED' }}>
                                <MessageSquareIcon size={22} />
                            </div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Live Chat</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>Chat with our team in real-time</p>
                            <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Online now
                            </span>
                        </div>
                        <div className="info-card" style={{ textAlign: 'center', padding: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#3b82f6' }}>
                                <MailIcon size={22} />
                            </div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Email Support</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>Get a response within 24 hours</p>
                            <span style={{ fontSize: '0.78rem', color: '#3b82f6' }}>support@arizonalex.com</span>
                        </div>
                        <div className="info-card" style={{ textAlign: 'center', padding: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#10b981' }}>
                                <UsersIcon size={22} />
                            </div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Community Forum</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>Get help from the community</p>
                            <Link href="/explore" style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                Visit Forum <ArrowRightIcon size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
