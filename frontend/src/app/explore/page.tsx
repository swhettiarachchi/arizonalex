'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { posts, trendingHashtags, users, formatNumber, checkUserHasStory } from '@/lib/mock-data';
import { SearchIcon, TrendingUpIcon, VerifiedIcon, MessageCircleIcon, RepeatIcon, HeartIcon } from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';

const categories = ['All', 'Politics', 'Policy', 'Legislation', 'Government', 'Economy', 'Healthcare', 'Environment'];


function ExploreContent() {
    const { requireAuth } = useAuthGate();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        if (query) {
            setSearchQuery(query);
        }
    }, [query]);

    const filteredPosts = posts.filter(post => {
        const matchesQuery = searchQuery === '' ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.username.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === 'All' ||
            post.type === activeCategory.toLowerCase() ||
            (activeCategory === 'Politics' && post.content.toLowerCase().includes('politic')); // Improved category matching

        return matchesQuery && matchesCategory;
    });

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
                <div style={{ padding: 16 }}>
                    <h3 className="section-title"><TrendingUpIcon size={18} /> Trending Now</h3>
                    <div className="grid-2">
                        {trendingHashtags.map((t, i) => (
                            <div key={i} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setSearchQuery(`#${t.tag}`)}>
                                <div className="trending-category">{t.category}</div>
                                <div className="trending-tag" style={{ fontSize: '1.1rem' }}>#{t.tag}</div>
                                <div className="trending-count">{formatNumber(t.posts)} posts</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                    <h3 className="section-title">Popular Figures</h3>
                    {users.filter(u => u.verified).map(user => (
                        <div key={user.id} className="card" style={{ padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <UserAvatar name={user.name} avatar={user.avatar} size="lg" hasStory={checkUserHasStory(user.id)} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {user.name}
                                    <VerifiedIcon size={14} />
                                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>@{user.username}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{user.bio}</div>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Follow</button>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                    <h3 className="section-title">Discover</h3>
                    {filteredPosts.length > 0 ? filteredPosts.map(post => (
                        <article key={post.id} className="post-card fade-in">
                            <div className="post-header">
                                <UserAvatar name={post.author.name} avatar={post.author.avatar} hasStory={checkUserHasStory(post.author.id)} />
                                <div className="post-meta">
                                    <div className="post-author-row">
                                        <span className="post-author">{post.author.name}</span>
                                        {post.author.verified && <VerifiedIcon size={14} />}
                                        <span className="post-handle">@{post.author.username}</span>
                                    </div>
                                </div>
                            </div>
                            <PostContent content={post.content} />
                            <div className="post-actions">
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={16} /></span>{formatNumber(post.comments)}</button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={16} /></span>{formatNumber(post.reposts)}</button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><HeartIcon size={16} /></span>{formatNumber(post.likes)}</button>
                            </div>
                        </article>
                    )) : (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            No posts found for "{searchQuery}"
                        </div>
                    )}
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
