'use client';
import { useState, useEffect, useCallback } from 'react';
import { postsApi, type ApiPost, timeAgo } from '@/lib/api';
import { MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon, BookmarkIcon, VerifiedIcon } from '@/components/ui/Icons';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';

// Re-export the formatNumber helper from api.ts or use the mock-data one
function fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

export default function BookmarksPage() {
    const { isLoggedIn, user } = useAuth();
    const { requireAuth } = useAuthGate();
    const [posts, setPosts] = useState<ApiPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    const loadBookmarks = useCallback(async () => {
        if (!isLoggedIn) { setLoading(false); return; }
        try {
            const res = await postsApi.getBookmarks();
            setPosts(res.posts);
            // Pre-compute which ones user already liked
            if (user) {
                const liked = new Set(res.posts.filter(p => p.likes.includes(user._id)).map(p => p._id));
                setLikedIds(liked);
            }
        } catch (_e) { /* silently fail */ }
        finally { setLoading(false); }
    }, [isLoggedIn, user]);

    useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

    const handleLike = (postId: string) => {
        requireAuth(async () => {
            try {
                const res = await postsApi.like(postId);
                setLikedIds(prev => {
                    const s = new Set(prev);
                    res.liked ? s.add(postId) : s.delete(postId);
                    return s;
                });
            } catch (_e) { /* ignore */ }
        });
    };

    const handleUnbookmark = (postId: string) => {
        requireAuth(async () => {
            try {
                await postsApi.bookmark(postId);
                setPosts(prev => prev.filter(p => p._id !== postId));
            } catch (_e) { /* ignore */ }
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="page-container">
                <div className="feed-column">
                    <div className="page-header"><h1>Bookmarks</h1></div>
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <BookmarkIcon size={40} />
                        <p style={{ marginTop: 12 }}>Sign in to see your bookmarks</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <h1>Bookmarks</h1>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{posts.length} saved posts</div>
                </div>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                ) : posts.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <BookmarkIcon size={40} />
                        <p style={{ marginTop: 12 }}>No bookmarks yet. Save posts to read later.</p>
                    </div>
                ) : posts.map(post => (
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
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={16} /></span><span>{fmt(post.commentsCount)}</span></button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={16} /></span><span>{fmt(post.repostsCount)}</span></button>
                            <button className={`post-action ${likedIds.has(post._id) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                                <span className="action-icon">{likedIds.has(post._id) ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}</span>
                                <span>{fmt(post.likesCount + (likedIds.has(post._id) ? 1 : 0))}</span>
                            </button>
                            <button className="post-action bookmarked" onClick={() => handleUnbookmark(post._id)} title="Remove bookmark">
                                <span className="action-icon"><BookmarkIcon size={16} /></span>
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
