'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    SearchIcon, ShieldIcon, LandmarkIcon, BriefcaseIcon,
    BotIcon, UsersIcon, SettingsIcon, HelpCircleIcon, ChevronRightIcon,
    MessageSquareIcon, MailIcon, ArrowRightIcon, FlagIcon,
    CreditCardIcon, FileTextIcon, ZapIcon, LockIcon, ActivityIcon,
    PlayCircleIcon, ClockIcon, StarIcon
} from '@/components/ui/Icons';
import { helpArticles, searchArticles } from '@/lib/help-articles';

interface HelpCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    articleCount: number;
    color: string;
}

const helpCategories: HelpCategory[] = [
    { id: 'getting-started', title: 'Getting Started', description: 'New to Arizonalex? Learn the basics of political engagement and market analysis.', icon: <ZapIcon size={24} />, articleCount: 14, color: '#7C3AED' },
    { id: 'account-privacy', title: 'Account & Privacy', description: 'Manage your profile, security settings, two-factor authentication, and data preferences.', icon: <LockIcon size={24} />, articleCount: 20, color: '#3b82f6' },
    { id: 'politics-legislation', title: 'Politics & Legislation', description: 'Track bills, follow debates, understand legislative processes and political analytics.', icon: <LandmarkIcon size={24} />, articleCount: 17, color: '#ef4444' },
    { id: 'markets-finance', title: 'Markets & Finance', description: 'Real-time market data, portfolio tracking, economic indicators, and financial tools.', icon: <BriefcaseIcon size={24} />, articleCount: 24, color: '#10b981' },
    { id: 'ai-tools', title: 'AI Tools', description: 'Leverage AI-powered sentiment analysis, policy impact predictions, and market forecasting.', icon: <BotIcon size={24} />, articleCount: 11, color: '#f59e0b' },
    { id: 'community', title: 'Community Guidelines', description: 'Understand our rules for respectful discourse, content moderation, and reporting.', icon: <UsersIcon size={24} />, articleCount: 10, color: '#06b6d4' },
    { id: 'technical', title: 'Technical Issues', description: 'Troubleshoot login problems, browser compatibility, API performance, and WebSocket issues.', icon: <SettingsIcon size={24} />, articleCount: 16, color: '#8b5cf6' },
    { id: 'billing', title: 'Billing & Subscriptions', description: 'Manage your subscription plan, payment methods, invoices, and premium features.', icon: <CreditCardIcon size={24} />, articleCount: 13, color: '#ec4899' },
];

const quickActions = [
    { label: 'Report Issue', icon: <FlagIcon size={20} />, href: '/report', color: '#ef4444' },
    { label: 'System Status', icon: <ActivityIcon size={20} />, href: '/status', color: '#10b981' },
    { label: 'Get Verified', icon: <ShieldIcon size={20} />, href: '/verify', color: '#8b5cf6' },
    { label: 'View FAQ', icon: <HelpCircleIcon size={20} />, href: '/faq', color: '#f59e0b' },
];

const videoTutorials = [
    { title: 'Setting Up Your Political Dashboard', duration: '4:30', views: '12.5K', color: '#7C3AED' },
    { title: 'Linking Your Portfolio with Plaid', duration: '3:15', views: '8.2K', color: '#10b981' },
    { title: 'Understanding AI Sentiment Analysis', duration: '6:45', views: '15.1K', color: '#f59e0b' },
];

// Sort articles by most recent
const recentArticles = [...helpArticles]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 4);

const popularArticles = helpArticles.slice(0, 6);

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = searchQuery.length > 2 ? searchArticles(searchQuery).slice(0, 5) : [];

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
                                    <Link key={i} href={`/help/article/${s.id}`} className="info-search-item" style={{ textDecoration: 'none' }} onMouseDown={() => setShowSuggestions(false)}>
                                        <SearchIcon size={14} />
                                        <div style={{ flex: 1 }}>
                                            <span>{s.title}</span>
                                            <span style={{ display: 'block', fontSize: '0.72rem', color: s.tagColor, fontWeight: 600, marginTop: 2 }}>{s.tag}</span>
                                        </div>
                                        <ArrowRightIcon size={12} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="info-page-content">
                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: 12, marginBottom: 40 }}>
                    {quickActions.map((action) => (
                        <Link key={action.label} href={action.href} className="info-card info-card-hover" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px',
                            textDecoration: 'none', textAlign: 'center'
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${action.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
                                {action.icon}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{action.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Category Cards */}
                <h2 className="info-section-title">Browse by Category</h2>
                <div className="info-grid-4">
                    {helpCategories.map((cat, i) => (
                        <Link key={cat.id} href={`/help/${cat.id}`} className="info-card info-card-hover" style={{ animationDelay: `${i * 60}ms`, textDecoration: 'none', display: 'block' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, marginBottom: 14 }}>
                                {cat.icon}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{cat.title}</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{cat.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FileTextIcon size={12} /> {cat.articleCount} articles
                                </span>
                                <span style={{ color: cat.color, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                                    Explore <ChevronRightIcon size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recently Updated */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockIcon size={18} /> Recently Updated
                    </span>
                </h2>
                <div className="info-grid-2">
                    {recentArticles.map((article, i) => (
                        <Link key={article.id} href={`/help/article/${article.id}`} className="info-card info-card-hover" style={{ animationDelay: `${i * 60}ms`, display: 'flex', alignItems: 'flex-start', gap: 14, textDecoration: 'none' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <span className="info-tag" style={{ background: `${article.tagColor}20`, color: article.tagColor }}>
                                        {article.tag}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{article.lastUpdated}</span>
                                </div>
                                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: 6, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                                    {article.title}
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6, display: 'inline-block' }}>
                                    {article.readTime} read
                                </span>
                            </div>
                            <div style={{ color: 'var(--text-tertiary)' }}>
                                <ChevronRightIcon size={16} />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Popular Articles */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarIcon size={18} /> Popular Articles
                    </span>
                </h2>
                <div className="info-grid-2">
                    {popularArticles.map((article, i) => (
                        <Link key={article.id} href={`/help/article/${article.id}`} className="info-card info-card-hover" style={{ animationDelay: `${i * 60}ms`, display: 'flex', alignItems: 'flex-start', gap: 14, textDecoration: 'none' }}>
                            <div style={{ flex: 1 }}>
                                <span className="info-tag" style={{ background: `${article.tagColor}20`, color: article.tagColor }}>
                                    {article.tag}
                                </span>
                                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: 8, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                                    {article.title}
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 8, display: 'inline-block' }}>
                                    {article.readTime} read
                                </span>
                            </div>
                            <div style={{ color: 'var(--text-tertiary)' }}>
                                <ChevronRightIcon size={16} />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Video Tutorials */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlayCircleIcon size={18} /> Video Tutorials
                    </span>
                </h2>
                <div className="info-grid-3">
                    {videoTutorials.map((video, i) => (
                        <div key={i} className="info-card info-card-hover" style={{ animationDelay: `${i * 80}ms`, cursor: 'pointer' }}>
                            <div style={{
                                height: 120, borderRadius: 12, background: `linear-gradient(135deg, ${video.color}20, ${video.color}08)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                                border: `1px solid ${video.color}20`, position: 'relative'
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', background: `${video.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: video.color
                                }}>
                                    <PlayCircleIcon size={28} />
                                </div>
                                <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                                    {video.duration}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{video.title}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{video.views} views</span>
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
