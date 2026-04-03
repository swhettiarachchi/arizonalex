'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatNumber, checkUserHasStory } from '@/lib/utils';
import {
    MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon, BookmarkIcon,
    ShareIcon, VerifiedIcon, SearchIcon, FilterIcon, LayersIcon, LandmarkIcon,
    BriefcaseIcon, TrendingUpIcon, FileTextIcon, GlobeIcon, ChevronRightIcon
} from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';

const ROLE_LABELS: Record<string, string> = {
    politician: 'Politician', official: 'Gov. Official', journalist: 'Journalist',
    citizen: 'Citizen', admin: 'Admin', businessman: 'Businessman',
    entrepreneur: 'Entrepreneur', crypto_trader: 'Crypto Trader',
    stock_trader: 'Stock Trader', banker: 'Banker', doctor: 'Doctor',
    researcher: 'Researcher', academic: 'Academic', lawyer: 'Lawyer',
    judge: 'Judge', activist: 'Activist', celebrity: 'Celebrity', other: 'Other',
};

const filterTabs = [
    { id: 'all', label: 'All Bookmarks', icon: <LayersIcon size={13} /> },
    { id: 'politics', label: 'Politics', icon: <LandmarkIcon size={13} /> },
    { id: 'business', label: 'Business', icon: <BriefcaseIcon size={13} /> },
    { id: 'policy', label: 'Policy', icon: <FileTextIcon size={13} /> },
    { id: 'analysis', label: 'Analysis', icon: <TrendingUpIcon size={13} /> },
];

export default function BookmarksPage() {
    const { requireAuth } = useAuthGate();
    const [activeFilter, setActiveFilter] = useState('all');
     
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/posts?bookmarked=true')
            .then(r => r.json())
            .then(data => {
                if (data.posts) {
                    setFeedPosts(data.posts);
                    setSavedPosts(new Set(data.posts.map((p: any) => p.id)));
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const toggleLike = (id: string) => requireAuth(async () => {
        const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
        const data = await res.json();
        if (data.post) setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.post.likes, liked: data.post.liked } : p));
    });

    const toggleSave = (id: string) => requireAuth(async () => {
        const res = await fetch(`/api/posts/${id}/bookmark`, { method: 'POST' });
        const data = await res.json();
        if (!data.post?.bookmarked) {
            setFeedPosts(prev => prev.filter(p => p.id !== id));
            setSavedPosts(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    });

    const filtered = feedPosts.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchQuery = !q || p.content.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q);
        const matchFilter = activeFilter === 'all' ||
            (activeFilter === 'politics' && ['politician', 'official'].includes(p.author.role)) ||
            (activeFilter === 'business' && ['businessman', 'entrepreneur'].includes(p.author.role)) ||
            (activeFilter === 'policy' && p.type === 'policy') ||
            (activeFilter === 'analysis' && p.type === 'thread');
        return matchQuery && matchFilter;
    });

    return (
        <div className="page-container home-3col">

            {/* LEFT — Collections sidebar */}
            <aside className="home-left-panel">
                <div className="hp-card">
                    <div className="hp-card-title"><BookmarkIcon size={15} /> My Collections</div>
                    {[
                        { label: 'All Bookmarks', count: feedPosts.length, active: true },
                        { label: 'Politics & Policy', count: feedPosts.filter((p: any) => ['politician', 'official'].includes(p.author.role)).length },
                        { label: 'Business & Finance', count: feedPosts.filter((p: any) => ['businessman', 'entrepreneur'].includes(p.author.role)).length },
                        { label: 'Research & Analysis', count: feedPosts.filter((p: any) => p.type === 'thread').length },
                        { label: 'Policy Proposals', count: feedPosts.filter((p: any) => p.type === 'policy').length },
                    ].map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: i === 0 ? 700 : 500, color: i === 0 ? 'var(--primary)' : 'inherit' }}>{c.label}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--bg-tertiary)', borderRadius: 20, padding: '2px 8px', color: 'var(--text-tertiary)' }}>{c.count}</span>
                        </div>
                    ))}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><GlobeIcon size={15} /> Quick Stats</div>
                    {[
                        { label: 'Total Saved', val: feedPosts.length, color: 'var(--primary)' },
                        { label: 'Total Likes', val: feedPosts.reduce((a: number, p: any) => a + (p.likes || 0), 0).toLocaleString(), color: '#ef4444' },
                        { label: 'Total Comments', val: feedPosts.reduce((a: number, p: any) => a + (p.comments || 0), 0).toLocaleString(), color: '#3b82f6' },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><ChevronRightIcon size={15} /> Explore More</div>
                    {[
                        { label: 'Trending Topics', href: '/explore' },
                        { label: 'Politics Hub', href: '/politics' },
                        { label: 'AI Tools', href: '/ai-tools' },
                    ].map(link => (
                        <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem', fontWeight: 500 }}>
                            {link.label} <ChevronRightIcon size={14} />
                        </Link>
                    ))}
                </div>
            </aside>

            {/* CENTER — Bookmarked posts */}
            <div className="feed-column" style={{ minWidth: 0 }}>
                {/* Header + Search */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10, backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookmarkIcon size={20} />
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Bookmarks</h1>
                            <span style={{ background: 'var(--bg-tertiary)', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, padding: '2px 10px', color: 'var(--text-tertiary)' }}>{filtered.length}</span>
                        </div>
                    </div>
                    <div className="search-box">
                        <span className="search-icon"><SearchIcon size={15} /></span>
                        <input type="text" placeholder="Search your bookmarks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {filterTabs.map(tab => (
                        <button key={tab.id} className={`tab ${activeFilter === tab.id ? 'active' : ''}`} onClick={() => setActiveFilter(tab.id)}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Posts */}
                {filtered.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <BookmarkIcon size={40} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 12, color: 'var(--text-secondary)' }}>
                            {searchQuery ? `No bookmarks matching "${searchQuery}"` : 'No bookmarks yet'}
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Start saving posts to read later</div>
                        <Link href="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>Browse Feed</Link>
                    </div>
                ) : filtered.map(post => (
                    <article key={post.id} className="post-card fade-in">
                        <div className="post-header">
                            <Link href={`/profile/${post.author.username}`}><UserAvatar name={post.author.name} avatar={post.author.avatar} hasStory={checkUserHasStory(post.author.id)} /></Link>
                            <div className="post-meta">
                                <div className="post-author-row">
                                    <Link href={`/profile/${post.author.username}`} className="post-author">{post.author.name}</Link>
                                    {post.author.verified && <VerifiedIcon size={15} />}
                                    <Link href={`/profile/${post.author.username}`} className="post-handle">@{post.author.username}</Link>
                                    <span className="post-time">{post.timestamp}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                    <span className={`role-badge role-${post.author.role}`}>{ROLE_LABELS[post.author.role] ?? post.author.role}</span>
                                </div>
                            </div>
                        </div>
                        <PostContent content={post.content} type={post.type} policyTitle={post.policyTitle} policyCategory={post.policyCategory} />
                        <div className="post-actions">
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={17} /></span><span>{formatNumber(post.comments)}</span></button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={17} /></span><span>{formatNumber(post.reposts)}</span></button>
                            <button className={`post-action ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                                <span className="action-icon">{post.liked ? <HeartFilledIcon size={17} /> : <HeartIcon size={17} />}</span>
                                <span>{formatNumber(post.likes)}</span>
                            </button>
                            <button className={`post-action ${savedPosts.has(post.id) ? 'bookmarked' : ''}`} onClick={() => toggleSave(post.id)}>
                                <span className="action-icon"><BookmarkIcon size={17} /></span>
                            </button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><ShareIcon size={17} /></span></button>
                        </div>
                    </article>
                ))}
            </div>

            {/* RIGHT — Reading tips */}
            <aside className="right-panel">
                <div className="hp-card">
                    <div className="hp-card-title"><FilterIcon size={15} /> Bookmark Tips</div>
                    {[
                        'Save posts with the bookmark icon on any post.',
                        'Use the filter tabs to quickly find bookmarks by topic.',
                        'Search your bookmarks by keyword or author name.',
                        'Bookmarks sync across all your devices.',
                    ].map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                            {tip}
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
