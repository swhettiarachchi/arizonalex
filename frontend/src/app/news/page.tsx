'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { NewsViewerModal } from '@/components/ui/NewsViewerModal';

import {
    NewspaperIcon, GlobeIcon, SearchIcon, XIcon, FlameIcon, BookmarkIcon,
    BarChartIcon, ActivityIcon, ShieldIcon, TrendingUpIcon, ZapIcon,
    ArrowUpRightIcon, ChevronRightIcon, ClockIcon, LayersIcon, UserIcon,
    FilterIcon, StarIcon, ExternalLinkIcon, AlertTriangleIcon, HeartIcon,
    MessageCircleIcon, ShareIcon, ThumbsUpIcon, LandmarkIcon, BriefcaseIcon,
    BitcoinIcon, VoteIcon, UsersIcon, FileTextIcon, CpuIcon, BuildingIcon
} from '@/components/ui/Icons';

// ─── Helpers ─────────────────────────────────────────────────────────
const SENT_CFG: Record<string, { color: string; bg: string; label: string }> = {
    positive: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Positive' },
    negative: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Negative' },
    neutral: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Neutral' },
};
const BIAS_CFG: Record<string, { color: string; label: string }> = {
    'left': { color: '#3b82f6', label: 'Left' },
    'center-left': { color: '#6366f1', label: 'Center-Left' },
    'center': { color: '#8b5cf6', label: 'Center' },
    'center-right': { color: '#f59e0b', label: 'Center-Right' },
    'right': { color: '#ef4444', label: 'Right' },
};
const CAT_CFG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    politics: { color: '#8b5cf6', icon: <LandmarkIcon size={12} />, label: 'Politics' },
    business: { color: '#10b981', icon: <BriefcaseIcon size={12} />, label: 'Business' },
    crypto: { color: '#f7931a', icon: <BitcoinIcon size={12} />, label: 'Crypto' },
};
const TOPIC_ICONS: Record<string, React.ReactNode> = {
    'Elections': <VoteIcon size={14} />, 'War & Conflict': <ShieldIcon size={14} />, 'Economy': <BarChartIcon size={14} />, 'Climate': <GlobeIcon size={14} />,
    'Diplomacy': <UsersIcon size={14} />, 'Policy': <FileTextIcon size={14} />, 'Healthcare': <ActivityIcon size={14} />, 'Technology': <CpuIcon size={14} />,
    'Cryptocurrency': <BitcoinIcon size={14} />, 'Energy': <ZapIcon size={14} />, 'Finance': <BuildingIcon size={14} />, 'General': <NewspaperIcon size={14} />,
};
const COUNTRY_FLAGS: Record<string, string> = {
    'United States': 'us', 'China': 'cn', 'Russia': 'ru', 'Ukraine': 'ua',
    'Iran': 'ir', 'Israel': 'il', 'India': 'in', 'United Kingdom': 'gb',
    'France': 'fr', 'Germany': 'de', 'Japan': 'jp', 'South Korea': 'kr',
    'North Korea': 'kp', 'Pakistan': 'pk', 'Saudi Arabia': 'sa', 'Turkey': 'tr',
    'Brazil': 'br', 'European Union': 'eu', 'Hong Kong': 'hk', 'Global': 'un',
};

function credColor(v: number) {
    if (v >= 90) return '#10b981';
    if (v >= 80) return '#22c55e';
    if (v >= 70) return '#f59e0b';
    return '#ef4444';
}
function urgencyBadge(level: string) {
    if (level === 'breaking') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'BREAKING' };
    if (level === 'high') return { bg: 'rgba(249,115,22,0.12)', color: '#f97316', label: 'HIGH' };
    if (level === 'medium') return { bg: 'rgba(234,179,8,0.12)', color: '#eab308', label: 'MEDIUM' };
    return { bg: 'rgba(107,114,128,0.08)', color: '#6b7280', label: 'LOW' };
}
function impactClass(score: number) {
    if (score >= 70) return 'news-impact-high';
    if (score >= 50) return 'news-impact-med';
    return 'news-impact-low';
}
function formatPopularity(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
}

const TABS = [
    { id: 'all', label: 'All Stories', icon: <ZapIcon size={13} /> },
    { id: 'politics', label: 'Politics', icon: <LandmarkIcon size={13} /> },
    { id: 'business', label: 'Business', icon: <BriefcaseIcon size={13} /> },
    { id: 'crypto', label: 'Crypto', icon: <BitcoinIcon size={13} /> },
    { id: 'country', label: 'By Country', icon: <GlobeIcon size={13} /> },
    { id: 'topic', label: 'By Topic', icon: <LayersIcon size={13} /> },
    { id: 'leaders', label: 'Leaders', icon: <UserIcon size={13} /> },
    { id: 'saved', label: 'Saved', icon: <BookmarkIcon size={13} /> },
];

// ─── Poll Component ──────────────────────────────────────────────────
function PollCard({ poll, onVote }: { poll: any; onVote: (pollId: string, optIdx: number) => void }) {
    const [voted, setVoted] = useState<number | null>(null);
    const total = poll.totalVotes + (voted !== null ? 1 : 0);
    return (
        <div className="hp-card" style={{ marginBottom: 12 }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.4, marginBottom: 10 }}>{poll.question}</h4>
            {poll.options.map((opt: any, i: number) => {
                const votes = opt.votes + (voted === i ? 1 : 0);
                const pct = total > 0 ? (votes / total) * 100 : 0;
                return (
                    <button key={i} onClick={() => { if (voted === null) { setVoted(i); onVote(poll.id, i); } }}
                        disabled={voted !== null} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'var(--bg-tertiary)', border: voted === i ? '1.5px solid var(--primary)' : '1px solid var(--border-light)', borderRadius: 8, padding: '8px 12px', marginBottom: 5, cursor: voted === null ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', transition: 'all 0.2s', color: 'inherit' }}>
                        {voted !== null && <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: voted === i ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)', transition: 'width 0.5s' }} />}
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: voted === i ? 700 : 500 }}>{opt.label}</span>
                            {voted !== null && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{pct.toFixed(1)}%</span>}
                        </div>
                    </button>
                );
            })}
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 6 }}>{total.toLocaleString()} votes</div>
        </div>
    );
}

// ─── News Card ───────────────────────────────────────────────────────
function NewsCard({ article, onClick, onBookmark, isBookmarked, onLike, isLiked }: any) {
    const sent = SENT_CFG[article.sentiment] || SENT_CFG.neutral;
    const urg = urgencyBadge(article.urgencyLevel);
    const cat = CAT_CFG[article.globalCategory] || CAT_CFG.politics;
    return (
        <div className="news-card" onClick={onClick}>
            <div className="news-card-body">
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                    {(article.urgencyLevel === 'breaking' || article.urgencyLevel === 'high') && (
                        <span className="news-breaking-badge" style={{ position: 'relative', top: 0, left: 0, padding: '2px 6px', fontSize: '0.55rem', borderRadius: 10, display: 'inline-flex', background: urg.bg, color: urg.color }}><span className="news-pulse-dot" style={{ width: 4, height: 4, marginRight: 3 }} /> {urg.label}</span>
                    )}
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: `${cat.color}18`, color: cat.color }}>{cat.label}</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: sent.bg, color: sent.color }}>{sent.label}</span>
                    <span className={`news-impact-badge ${impactClass(article.impactScore)}`} style={{display: 'inline-flex', alignItems: 'center', gap: 2}}><ZapIcon size={10}/>{article.impactScore}</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', color: BIAS_CFG[article.bias]?.color || '#8b5cf6' }}>
                        {BIAS_CFG[article.bias]?.label || 'Center'}
                    </span>
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{article.source}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.62rem', fontWeight: 600, color: credColor(article.credibilityScore) }}>
                        <ShieldIcon size={10} />{article.credibilityScore}
                    </span>
                    <span className="news-popularity"><TrendingUpIcon size={10} /> {formatPopularity(article.popularityScore)}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{article.timeAgo}</span>
                </div>
                {/* Interaction bar */}
                <div className="news-interact-bar">
                    <button className={`news-interact-btn ${isLiked ? 'liked' : ''}`} onClick={e => { e.stopPropagation(); onLike(article.id); }}>
                        <HeartIcon size={12} /> Like
                    </button>
                    <button className={`news-interact-btn ${isBookmarked ? 'saved' : ''}`} onClick={e => { e.stopPropagation(); onBookmark(article.id); }}>
                        <BookmarkIcon size={12} /> Save
                    </button>
                    <button className="news-interact-btn" onClick={e => { e.stopPropagation(); if (navigator.share) navigator.share({ title: article.title, url: article.url }).catch(() => {}); else navigator.clipboard.writeText(article.url || ''); }}>
                        <ShareIcon size={12} /> Share
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function GlobalNewsHub() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [articles, setArticles] = useState<any[]>([]);
    const [polls, setPolls] = useState<any[]>([
        { id: 'np1', question: 'Should the UN have binding authority over national climate policy?', options: [{ label: 'Yes, binding authority needed', votes: 42300 }, { label: 'Advisory role only', votes: 31200 }, { label: 'No UN involvement', votes: 18500 }, { label: 'Undecided', votes: 8900 }], totalVotes: 100900 },
        { id: 'np2', question: 'Which global issue deserves the most attention right now?', options: [{ label: 'Climate Change', votes: 38100 }, { label: 'Armed Conflicts', votes: 34800 }, { label: 'Economic Inequality', votes: 22600 }, { label: 'AI Regulation', votes: 19400 }, { label: 'Healthcare Access', votes: 15200 }], totalVotes: 130100 }
    ]);
    const [topics, setTopics] = useState<string[]>(['Policy', 'Economy', 'Global']);
    const [countries, setCountries] = useState<string[]>(['United States', 'Global']);
    const [stats, setStats] = useState<any>({ totalArticles: 0, breakingCount: 0, avgCredibility: 90, sentimentBreakdown: {}, topSources: [] });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/news/unified');
            if (!res.ok) return;
            const data = await res.json();
            if (data.articles) setArticles(data.articles);
            if (data.polls) setPolls(data.polls);
            if (data.topics) setTopics(data.topics);
            if (data.countries) setCountries(data.countries);
            if (data.stats) setStats(data.stats);
            setLastUpdated(Date.now());
            setLoading(false);
        } catch (e) {
            console.error('Failed to fetch live news', e);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 60s background polling
        return () => clearInterval(interval);
    }, [fetchData]);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
    const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
    const [comments, setComments] = useState<Record<string, string[]>>({});
    const [filterCountry, setFilterCountry] = useState<string | null>(null);
    const [filterTopic, setFilterTopic] = useState<string | null>(null);
    const [filterSentiment, setFilterSentiment] = useState<string | null>(null);

    // Static mode enabled

    const toggleBookmark = (id: string) => requireAuth(() => {
        setSavedArticles(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    });
    const toggleLike = (id: string) => requireAuth(() => {
        setLikedArticles(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    });
    const addComment = (id: string, text: string) => requireAuth(() => {
        setComments(prev => ({ ...prev, [id]: [...(prev[id] || []), text] }));
    });

    const filtered = useMemo(() => {
        let result = articles;
        // Tab-based category filter
        if (['politics', 'business', 'crypto'].includes(activeTab)) {
            result = result.filter(a => a.globalCategory === activeTab);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => a.title.toLowerCase().includes(q) || a.source.toLowerCase().includes(q) || a.country?.toLowerCase().includes(q));
        }
        if (filterCountry) result = result.filter(a => a.country === filterCountry);
        if (filterTopic) result = result.filter(a => a.topic === filterTopic);
        if (filterSentiment) result = result.filter(a => a.sentiment === filterSentiment);
        return result;
    }, [articles, activeTab, searchQuery, filterCountry, filterTopic, filterSentiment]);

    const breakingNews = articles.filter(a => a.urgencyLevel === 'breaking' || a.urgencyLevel === 'high').slice(0, 8);
    const leaders = useMemo(() => {
        const map: Record<string, any[]> = {};
        articles.forEach(a => { if (a.relatedLeader) { if (!map[a.relatedLeader]) map[a.relatedLeader] = []; map[a.relatedLeader].push(a); } });
        return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
    }, [articles]);

    // eslint-disable-next-line
    const secAgo = Math.floor((Date.now() - lastUpdated) / 1000);

    if (loading) {
        return (
            <div className="page-container home-3col">
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <span className="auth-spinner" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-container home-3col">

                {/* ── LEFT SIDEBAR ── */}
                <aside className="home-left-panel">
                    {/* Breaking News */}
                    <div className="hp-card">
                        <div className="hp-card-title" style={{ color: '#ef4444' }}>
                            <span className="news-live-dot" /> Breaking News
                        </div>
                        {breakingNews.slice(0, 5).map(a => (
                            <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                onClick={() => setSelectedArticle(a)}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: 8, background: `${(CAT_CFG[a.globalCategory] || CAT_CFG.politics).color}18`, color: (CAT_CFG[a.globalCategory] || CAT_CFG.politics).color }}>{(CAT_CFG[a.globalCategory] || CAT_CFG.politics).label}</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.35, marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{a.source}</span>
                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>{a.timeAgo}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Topic Filters */}
                    <div className="hp-card">
                        <div className="hp-card-title"><FilterIcon size={15} /> Filter by Topic</div>
                        <button className={`news-filter-btn ${!filterTopic ? 'active' : ''}`} onClick={() => setFilterTopic(null)}>All Topics</button>
                        {topics.map(t => (
                            <button key={t} className={`news-filter-btn ${filterTopic === t ? 'active' : ''}`} onClick={() => setFilterTopic(filterTopic === t ? null : t)}>
                                <span>{TOPIC_ICONS[t] || '📰'}</span> {t}
                            </button>
                        ))}
                    </div>

                    {/* Sentiment Filter */}
                    <div className="hp-card">
                        <div className="hp-card-title"><ActivityIcon size={15} /> Sentiment</div>
                        {(['positive', 'negative', 'neutral'] as const).map(s => {
                            const cfg = SENT_CFG[s];
                            const count = articles.filter(a => a.sentiment === s).length;
                            return (
                                <button key={s} className={`news-filter-btn ${filterSentiment === s ? 'active' : ''}`}
                                    onClick={() => setFilterSentiment(filterSentiment === s ? null : s)}
                                    style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Poll */}
                    {polls.length > 0 && (
                        <div>
                            <div className="hp-card-title" style={{ padding: '0 0 8px' }}><BarChartIcon size={15} /> Public Opinion</div>
                            <PollCard poll={polls[0]} onVote={() => { }} />
                        </div>
                    )}
                </aside>

                {/* ── CENTER ── */}
                <div className="feed-column" style={{ minWidth: 0 }}>
                    {/* Breaking Ticker */}
                    <div className="news-ticker-wrap">
                        <div className="news-ticker-label"><span className="news-live-dot" /> BREAKING</div>
                        <div className="news-ticker-track">
                            <div className="news-ticker-inner">
                                {[...breakingNews, ...breakingNews].map((a, i) => (
                                    <span key={`${a.id}-${i}`} className="news-ticker-item" onClick={() => setSelectedArticle(a)}>
                                        <span className={`ticker-cat ticker-cat-${a.urgencyLevel === 'breaking' ? 'high' : a.urgencyLevel}`}>{(CAT_CFG[a.globalCategory] || CAT_CFG.politics).label}</span>
                                        {a.title}
                                        <span className="ticker-time">{a.timeAgo}</span>
                                        <span className="ticker-sep">│</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <NewspaperIcon size={20} />
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Global News Hub</h1>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(124,58,237,0.12)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20 }}>AI-POWERED</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="news-live-dot" /> LIVE
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClockIcon size={11} /> {secAgo < 60 ? `${secAgo}s ago` : `${Math.floor(secAgo / 60)}m ago`}
                        </span>
                    </div>

                    {/* Search */}
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div className="search-box">
                            <span className="search-icon"><SearchIcon size={14} /></span>
                            <input placeholder="Search news, sources, countries…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                        {TABS.map(tab => (
                            <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => { setActiveTab(tab.id); setFilterCountry(null); setFilterTopic(null); }}
                                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: 16 }} className="fade-in">

                        {/* ── ALL / CATEGORY STORIES ── */}
                        {['all', 'politics', 'business', 'crypto'].includes(activeTab) && (
                            <>
                                {/* Stats */}
                                <div className="stats-grid" style={{ marginBottom: 18 }}>
                                    {[
                                        { icon: <NewspaperIcon size={18} />, val: stats.totalArticles, label: 'Articles', change: 'Today' },
                                        { icon: <FlameIcon size={18} />, val: stats.breakingCount, label: 'Breaking', change: 'Live' },
                                        { icon: <ShieldIcon size={18} />, val: `${stats.avgCredibility}/100`, label: 'Avg Credibility', change: 'Sources' },
                                        { icon: <GlobeIcon size={18} />, val: countries.length, label: 'Countries', change: 'Covered' },
                                    ].map((s, i) => (
                                        <div key={i} className="stat-card">
                                            <span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span>
                                            <span className="stat-value">{s.val}</span>
                                            <span className="stat-label">{s.label}</span>
                                            <span className="stat-change up">{s.change}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Category Chips (only on All tab) */}
                                {activeTab === 'all' && (
                                    <div className="news-cat-chips">
                                        {Object.entries(CAT_CFG).map(([key, cfg]) => (
                                            <span key={key} className="news-cat-chip" style={{ background: `${cfg.color}15`, borderColor: `${cfg.color}40`, color: cfg.color }}>
                                                {cfg.icon} {cfg.label}
                                                <span style={{ fontWeight: 800, marginLeft: 4 }}>{stats.categoryBreakdown?.[key] || 0}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Active filters */}
                                {(filterTopic || filterSentiment || filterCountry) && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Filters:</span>
                                        {filterTopic && <button className="btn btn-outline btn-sm" onClick={() => setFilterTopic(null)}>Topic: {filterTopic} ✕</button>}
                                        {filterSentiment && <button className="btn btn-outline btn-sm" onClick={() => setFilterSentiment(null)}>Sentiment: {filterSentiment} ✕</button>}
                                        {filterCountry && <button className="btn btn-outline btn-sm" onClick={() => setFilterCountry(null)}>Country: {filterCountry} ✕</button>}
                                    </div>
                                )}

                                {/* Article Cards */}
                                <div className="news-grid">
                                    {filtered.map(a => (
                                        <NewsCard key={a.id} article={a} onClick={() => setSelectedArticle(a)}
                                            onBookmark={toggleBookmark} isBookmarked={savedArticles.has(a.id)}
                                            onLike={toggleLike} isLiked={likedArticles.has(a.id)} />
                                    ))}
                                </div>
                                {filtered.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No articles match your filters</div>
                                )}
                            </>
                        )}

                        {/* ── BY COUNTRY ── */}
                        {activeTab === 'country' && (
                            <>
                                <h3 className="section-title">News by Country</h3>
                                {!filterCountry ? (
                                    <div className="news-country-grid">
                                        {countries.map(c => {
                                            const count = articles.filter(a => a.country === c).length;
                                            const flag = COUNTRY_FLAGS[c] || 'un';
                                            return (
                                                <div key={c} className="news-country-card" onClick={() => setFilterCountry(c)}>
                                                    <img src={`https://flagcdn.com/48x36/${flag.toLowerCase()}.png`} alt="" style={{ borderRadius: 3, width: 36, height: 27 }} />
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c}</div>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{count} article{count !== 1 ? 's' : ''}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                            <img src={`https://flagcdn.com/32x24/${(COUNTRY_FLAGS[filterCountry] || 'un').toLowerCase()}.png`} alt="" style={{ borderRadius: 3 }} />
                                            <h3 style={{ fontWeight: 700, margin: 0 }}>{filterCountry}</h3>
                                            <button className="btn btn-outline btn-sm" onClick={() => setFilterCountry(null)}>Show all countries</button>
                                        </div>
                                        <div className="news-grid">
                                            {filtered.map(a => (
                                                <NewsCard key={a.id} article={a} onClick={() => setSelectedArticle(a)}
                                                    onBookmark={toggleBookmark} isBookmarked={savedArticles.has(a.id)}
                                                    onLike={toggleLike} isLiked={likedArticles.has(a.id)} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* ── BY TOPIC ── */}
                        {activeTab === 'topic' && (
                            <>
                                <h3 className="section-title">News by Topic</h3>
                                {!filterTopic ? (
                                    <div className="news-topic-grid">
                                        {topics.map(t => {
                                            const count = articles.filter(a => a.topic === t).length;
                                            return (
                                                <div key={t} className="news-topic-card" onClick={() => setFilterTopic(t)}>
                                                    <span style={{ fontSize: '1.8rem' }}>{TOPIC_ICONS[t] || '📰'}</span>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t}</div>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{count} article{count !== 1 ? 's' : ''}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                            <span style={{ fontSize: '1.4rem' }}>{TOPIC_ICONS[filterTopic] || '📰'}</span>
                                            <h3 style={{ fontWeight: 700, margin: 0 }}>{filterTopic}</h3>
                                            <button className="btn btn-outline btn-sm" onClick={() => setFilterTopic(null)}>Show all topics</button>
                                        </div>
                                        <div className="news-grid">
                                            {filtered.map(a => (
                                                <NewsCard key={a.id} article={a} onClick={() => setSelectedArticle(a)}
                                                    onBookmark={toggleBookmark} isBookmarked={savedArticles.has(a.id)}
                                                    onLike={toggleLike} isLiked={likedArticles.has(a.id)} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* ── LEADERS ── */}
                        {activeTab === 'leaders' && (
                            <>
                                <h3 className="section-title">Leader-Based News Feed</h3>
                                {leaders.map(([name, arts]) => (
                                    <div key={name} className="hp-card" style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{arts.length} related article{arts.length !== 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                        {arts.slice(0, 3).map(a => (
                                            <div key={a.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                                onClick={() => setSelectedArticle(a)}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.35, marginBottom: 3 }}>{a.title}</div>
                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: 8, background: `${(CAT_CFG[a.globalCategory] || CAT_CFG.politics).color}18`, color: (CAT_CFG[a.globalCategory] || CAT_CFG.politics).color }}>{(CAT_CFG[a.globalCategory] || CAT_CFG.politics).label}</span>
                                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: SENT_CFG[a.sentiment]?.bg, color: SENT_CFG[a.sentiment]?.color }}>{SENT_CFG[a.sentiment]?.label}</span>
                                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>{a.source} · {a.timeAgo}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                {leaders.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No leader-linked articles found</div>}
                            </>
                        )}

                        {/* ── SAVED ── */}
                        {activeTab === 'saved' && (
                            <>
                                <h3 className="section-title">Saved Articles</h3>
                                {savedArticles.size > 0 ? (
                                    <div className="news-grid">
                                        {articles.filter(a => savedArticles.has(a.id)).map(a => (
                                            <NewsCard key={a.id} article={a} onClick={() => setSelectedArticle(a)}
                                                onBookmark={toggleBookmark} isBookmarked={true}
                                                onLike={toggleLike} isLiked={likedArticles.has(a.id)} />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
                                        <BookmarkIcon size={40} />
                                        <div style={{ marginTop: 12, fontSize: '0.92rem', fontWeight: 600 }}>No saved articles yet</div>
                                        <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Bookmark articles to read them later</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <aside className="right-panel">
                    {/* AI Insights */}
                    <div className="hp-card" style={{ marginBottom: 12 }}>
                        <div className="hp-card-title"><ActivityIcon size={15} /> AI Insights</div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>SENTIMENT OVERVIEW</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {(['positive', 'negative', 'neutral'] as const).map(s => {
                                    const count = stats.sentimentBreakdown?.[s] || 0;
                                    const pct = stats.totalArticles ? Math.round((count / stats.totalArticles) * 100) : 0;
                                    return (
                                        <div key={s} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '8px 4px' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: SENT_CFG[s].color }}>{pct}%</div>
                                            <div style={{ fontSize: '0.58rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{SENT_CFG[s].label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>CATEGORY MIX</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {Object.entries(CAT_CFG).map(([key, cfg]) => (
                                    <div key={key} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '8px 4px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: cfg.color }}>{stats.categoryBreakdown?.[key] || 0}</div>
                                        <div style={{ fontSize: '0.58rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{cfg.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>TOP TOPICS</div>
                            {topics.slice(0, 5).map(t => {
                                const count = articles.filter(a => a.topic === t).length;
                                return (
                                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                                        <span style={{ fontSize: '0.82rem' }}>{TOPIC_ICONS[t] || '📰'}</span>
                                        <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600 }}>{t}</span>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Impact Scores */}
                    <div className="hp-card" style={{ marginBottom: 12 }}>
                        <div className="hp-card-title"><TrendingUpIcon size={15} /> Top Impact Stories</div>
                        {articles.slice(0, 5).map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                onClick={() => setSelectedArticle(a)}>
                                <div style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0, background: a.impactScore >= 70 ? 'rgba(239,68,68,0.12)' : 'rgba(249,115,22,0.12)', color: a.impactScore >= 70 ? '#ef4444' : '#f97316' }}>
                                    {a.impactScore}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
                                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{a.source} · {(CAT_CFG[a.globalCategory] || CAT_CFG.politics).label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Source Credibility */}
                    <div className="hp-card" style={{ marginBottom: 12 }}>
                        <div className="hp-card-title"><ShieldIcon size={15} /> Source Credibility</div>
                        {stats.topSources?.slice(0, 8).map((s: string) => {
                            const arts = articles.filter(a => a.source === s);
                            const cred = arts[0]?.credibilityScore || 70;
                            return (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>{s}</span>
                                    <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                        <div style={{ width: `${cred}%`, height: '100%', borderRadius: 3, background: credColor(cred) }} />
                                    </div>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: credColor(cred), width: 28, textAlign: 'right' }}>{cred}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Fact Check */}
                    <div className="hp-card">
                        <div className="hp-card-title"><AlertTriangleIcon size={15} /> Fact Check</div>
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '12px', textAlign: 'center', borderLeft: '3px solid #f59e0b' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>AI VERIFICATION ACTIVE</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                All articles are analyzed for credibility, source reputation, and cross-referenced with trusted outlets.
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Article Modal */}
            {selectedArticle && (
                <NewsViewerModal article={selectedArticle} onClose={() => setSelectedArticle(null)}
                    onBookmark={toggleBookmark} isBookmarked={savedArticles.has(selectedArticle.id)}
                    likes={likedArticles} onLike={toggleLike}
                    comments={comments} onComment={addComment} />
            )}
        </>
    );
}
