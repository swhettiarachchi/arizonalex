'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { exploreApi, usersApi, postsApi, type ApiPost, type ApiUser, timeAgo } from '@/lib/api';
import { SearchIcon, TrendingUpIcon, VerifiedIcon, MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon } from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { useAuth } from '@/components/providers/AuthProvider';

function fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

const categories = ['All', 'Politics', 'Policy', 'Legislation', 'Government', 'Economy', 'Healthcare', 'Environment'];

function ExploreContent() {
    const { requireAuth } = useAuthGate();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [searchQuery, setSearchQuery] = useState(query || '');
    const [activeCategory, setActiveCategory] = useState('All');
    const [trending, setTrending] = useState<{ tag: string; posts: number }[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<ApiUser[]>([]);
    const [posts, setPosts] = useState<ApiPost[]>([]);
    const [searchResults, setSearchResults] = useState<ApiPost[]>([]);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);

    useEffect(() => {
        exploreApi.getTrending().then(res => {
            setTrending(res.trending.hashtags);
            setSuggestedUsers(res.trending.suggestedUsers);
            setPosts(res.trending.posts as ApiPost[]);
        }).catch(() => { }).finally(() => setLoadingTrending(false));
    }, []);

    useEffect(() => {
        if (query) setSearchQuery(query);
    }, [query]);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setLoadingSearch(true);
            try {
                const res = await exploreApi.search(searchQuery, 'posts');
                setSearchResults(res.results.posts || []);
            } catch (_e) { /* ignore */ }
            finally { setLoadingSearch(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleLike = (postId: string) => {
        requireAuth(async () => {
            try {
                const res = await postsApi.like(postId);
                setLikedIds(prev => { const s = new Set(prev); res.liked ? s.add(postId) : s.delete(postId); return s; });
            } catch (_e) { /* ignore */ }
        });
    };

    const handleFollow = (userId: string) => {
        requireAuth(async () => {
            try {
                await usersApi.follow(userId);
            } catch (_e) { /* ignore */ }
        });
    };

    const displayPosts = searchQuery.trim() ? searchResults : posts;

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <div className="search-box" style={{ marginBottom: 0 }}>
                        <span className="search-icon"><SearchIcon size={16} /></span>
                        <input type="text" placeholder="Search topics, people, hashtags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                <div className="tabs">
                    {categories.map(cat => (
                        <button key={cat} className={`tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                    ))}
                </div>

                {/* Trending hashtags */}
                {!searchQuery && (
                    <div style={{ padding: 16 }}>
                        <h3 className="section-title"><TrendingUpIcon size={18} /> Trending Now</h3>
                        {loadingTrending ? (
                            <div style={{ color: 'var(--text-tertiary)', padding: 16 }}>Loading trending...</div>
                        ) : (
                            <div className="grid-2">
                                {trending.slice(0, 10).map((t, i) => (
                                    <div key={i} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setSearchQuery(`#${t.tag}`)}>
                                        <div className="trending-tag" style={{ fontSize: '1.1rem' }}>#{t.tag}</div>
                                        <div className="trending-count">{fmt(t.posts)} posts</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Suggested users */}
                {!searchQuery && suggestedUsers.length > 0 && (
                    <div style={{ padding: '0 16px 16px' }}>
                        <h3 className="section-title">Popular Figures</h3>
                        {suggestedUsers.map(u => (
                            <div key={u._id} className="card" style={{ padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <UserAvatar name={u.name} avatar={u.avatar} size="lg" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {u.name}{u.verified && <VerifiedIcon size={14} />}
                                        <span className={`role-badge role-${u.role}`}>{u.role}</span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>@{u.username}</div>
                                    {u.bio && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{u.bio}</div>}
                                </div>
                                {user?._id !== u._id && (
                                    <button className="btn btn-outline btn-sm" onClick={() => handleFollow(u._id)}>Follow</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Posts */}
                <div style={{ padding: '0 16px 16px' }}>
                    <h3 className="section-title">{searchQuery ? `Results for "${searchQuery}"` : 'Discover'}</h3>
                    {loadingSearch ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Searching...</div>
                    ) : displayPosts.length > 0 ? displayPosts.map(post => (
                        <article key={post._id} className="post-card fade-in">
                            <div className="post-header">
                                <UserAvatar name={post.author.name} avatar={post.author.avatar} />
                                <div className="post-meta">
                                    <div className="post-author-row">
                                        <span className="post-author">{post.author.name}</span>
                                        {post.author.verified && <VerifiedIcon size={14} />}
                                        <span className="post-handle">@{post.author.username}</span>
                                        <span className="post-time">{timeAgo(post.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <PostContent content={post.content} />
                            <div className="post-actions">
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={16} /></span>{fmt(post.commentsCount)}</button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={16} /></span>{fmt(post.repostsCount)}</button>
                                <button className={`post-action ${likedIds.has(post._id) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                                    <span className="action-icon">{likedIds.has(post._id) ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}</span>
                                    {fmt(post.likesCount)}
                                </button>
                            </div>
                        </article>
                    )) : searchQuery ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No results found for &quot;{searchQuery}&quot;</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
            <ExploreContent />
        </Suspense>
    );
}
