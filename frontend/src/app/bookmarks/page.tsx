'use client';
import { posts, formatNumber } from '@/lib/mock-data';
import { MessageCircleIcon, RepeatIcon, HeartIcon, BookmarkIcon, VerifiedIcon } from '@/components/ui/Icons';
import { useAuthGate } from '@/components/providers/AuthGuard';

export default function BookmarksPage() {
    const { requireAuth } = useAuthGate();
    const bookmarked = posts.slice(0, 5);

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <h1>Bookmarks</h1>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{bookmarked.length} saved posts</div>
                </div>
                {bookmarked.map(post => (
                    <article key={post.id} className="post-card fade-in">
                        <div className="post-header">
                            <div className="avatar avatar-md" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{post.author.name.split(' ').map(n => n[0]).join('')}</div>
                            <div className="post-meta">
                                <div className="post-author-row">
                                    <span className="post-author">{post.author.name}</span>
                                    {post.author.verified && <VerifiedIcon size={14} />}
                                    <span className="post-handle">@{post.author.username}</span>
                                    <span className="post-time">{post.timestamp}</span>
                                </div>
                            </div>
                        </div>
                        <div className="post-content">{post.content}</div>
                        <div className="post-actions">
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={16} /></span><span>{formatNumber(post.comments)}</span></button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={16} /></span><span>{formatNumber(post.reposts)}</span></button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><HeartIcon size={16} /></span><span>{formatNumber(post.likes)}</span></button>
                            <button className="post-action bookmarked" onClick={() => requireAuth(() => { })}><span className="action-icon"><BookmarkIcon size={16} /></span></button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
