'use client';
import { useState, use } from 'react';
import { getArticlesByCategory } from '@/lib/help-articles';
import Link from 'next/link';
import {
    ChevronRightIcon, FileTextIcon, ArrowLeftIcon, ClockIcon, SearchIcon, ArrowRightIcon,
    ZapIcon, LockIcon, LandmarkIcon, ActivityIcon, BotIcon, UsersIcon, SettingsIcon, CreditCardIcon
} from '@/components/ui/Icons';

const CATEGORIES: Record<string, { title: string, desc: string, color: string, icon: React.ReactNode }> = {
    'getting-started': { title: 'Getting Started', desc: 'Welcome to Arizonalex! Learn the basics of your political & financial dashboard.', color: '#7C3AED', icon: <ZapIcon size={24} /> },
    'account-privacy': { title: 'Account & Privacy', desc: 'Manage your verified identity, 2FA security, and data exports.', color: '#3b82f6', icon: <LockIcon size={24} /> },
    'politics-legislation': { title: 'Politics & Legislation', desc: 'Tracking bills, analyzing votes, and understanding political momentum.', color: '#ef4444', icon: <LandmarkIcon size={24} /> },
    'markets-finance': { title: 'Markets & Finance', desc: 'Link portfolios and track financial impact via AI sentiment tools.', color: '#10b981', icon: <ActivityIcon size={24} /> },
    'ai-tools': { title: 'AI Tools & Sentiment', desc: 'Deep dive into how our unbiased AI calculates mood and trends.', color: '#f59e0b', icon: <BotIcon size={24} /> },
    'community': { title: 'Community & Trust', desc: 'Our rules for respectful discourse and reporting deepfakes.', color: '#06b6d4', icon: <UsersIcon size={24} /> },
    'technical': { title: 'Technical Issues', desc: 'Troubleshoot websockets, notifications, and app performance.', color: '#8b5cf6', icon: <SettingsIcon size={24} /> },
    'billing': { title: 'Billing & Subscriptions', desc: 'Manage your Premium & Enterprise tiers and review charges.', color: '#ec4899', icon: <CreditCardIcon size={24} /> },
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = use(params);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'readTime'>('recent');

    const categoryId = resolvedParams.category;
    const catMeta = CATEGORIES[categoryId];

    if (!catMeta) {
        return (
            <div style={{ minHeight: '100vh', padding: 'clamp(50px, 10vw, 100px) clamp(20px, 5vw, 40px)', width: '100%', maxWidth: 1200, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 800, marginBottom: 24 }}>Category Not Found</h1>
                <Link href="/help" className="btn btn-primary">Return to Help Center</Link>
            </div>
        );
    }

    let articles = getArticlesByCategory(categoryId);

    // Filter by search
    if (searchQuery.length > 1) {
        const q = searchQuery.toLowerCase();
        articles = articles.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.tag.toLowerCase().includes(q)
        );
    }

    // Sort
    if (sortBy === 'recent') {
        articles = [...articles].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    } else {
        articles = [...articles].sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Breadcrumb */}
            <div style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, padding: '12px clamp(16px, 5vw, 40px)', fontSize: '0.82rem' }}>
                    <Link href="/help" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 500 }} className="hover-underline">Help Center</Link>
                    <ChevronRightIcon size={12} />
                    <span style={{ color: catMeta.color, fontWeight: 600 }}>{catMeta.title}</span>
                </div>
            </div>

            {/* Hero Header */}
            <div style={{
                padding: 'clamp(36px, 8vw, 56px) clamp(20px, 5vw, 40px)',
                background: `linear-gradient(135deg, ${catMeta.color}08, ${catMeta.color}03)`,
                borderBottom: '1px solid var(--border-light)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Help Center Branding */}
                    <Link href="/help" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20, fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.03em' }}>
                        <FileTextIcon size={13} /> Arizonalex Help Center
                    </Link>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${catMeta.color}15`, border: `2px solid ${catMeta.color}25`, color: catMeta.color, marginBottom: 20
                    }}>{catMeta.icon}</div>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        {catMeta.title}
                    </h1>
                    <p style={{ fontSize: 'clamp(0.92rem, 2vw, 1.05rem)', color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
                        {catMeta.desc}
                    </p>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileTextIcon size={14} /> {getArticlesByCategory(categoryId).length} articles in this category
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px clamp(16px, 5vw, 40px)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px',
                        padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)'
                    }}>
                        <SearchIcon size={16} className="text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => setSortBy('recent')}
                            style={{
                                padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                border: '1px solid var(--border)',
                                background: sortBy === 'recent' ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: sortBy === 'recent' ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >Most Recent</button>
                        <button
                            onClick={() => setSortBy('readTime')}
                            style={{
                                padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                border: '1px solid var(--border)',
                                background: sortBy === 'readTime' ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: sortBy === 'readTime' ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >Quick Reads</button>
                    </div>
                </div>
            </div>

            {/* Articles List */}
            <div style={{ padding: '0 clamp(16px, 5vw, 40px) clamp(40px, 8vw, 60px)', maxWidth: 1000, margin: '0 auto' }}>
                {articles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
                            {searchQuery ? `No articles matching "${searchQuery}"` : 'No articles published in this category yet.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {articles.map((article, i) => (
                            <Link
                                key={article.id}
                                href={`/help/article/${article.id}`}
                                className="info-card info-card-hover"
                                style={{
                                    textDecoration: 'none', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 'clamp(18px, 4vw, 24px)', gap: 14, animationDelay: `${i * 50}ms`, overflowWrap: 'break-word'
                                }}
                            >
                                {/* Colored left accent */}
                                <div style={{ width: 4, height: 48, borderRadius: 4, background: catMeta.color, flexShrink: 0, alignSelf: 'stretch', display: 'none' }} />

                                <div style={{ flex: '1 1 min(400px, 100%)', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
                                            letterSpacing: '0.05em', background: `${article.tagColor}15`, color: article.tagColor
                                        }}>{article.tag}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <ClockIcon size={11} /> {article.readTime}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                                            {article.lastUpdated}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.35 }}>
                                        {article.title}
                                    </h3>
                                    <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.88rem)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                        {article.description}
                                    </p>
                                </div>
                                <div style={{ color: catMeta.color, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
                                    Read <ArrowRightIcon size={14} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
