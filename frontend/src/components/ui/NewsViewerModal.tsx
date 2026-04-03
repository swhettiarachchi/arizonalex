'use client';

import { useState } from 'react';
import { BookmarkIcon, HeartIcon, ShareIcon, XIcon, ShieldIcon, ZapIcon, GlobeIcon } from '@/components/ui/Icons';

export function NewsViewerModal({ article, onClose, onBookmark, isBookmarked, likes, onLike, comments, onComment }: any) {
    const [commentText, setCommentText] = useState('');
    const articleComments = comments[article.id] || [];
    const isLiked = likes.has(article.id);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            onComment(article.id, commentText.trim());
            setCommentText('');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(5px)' }} onClick={onClose}>
            <div style={{ background: 'var(--bg-primary)', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)', animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                {/* Header Actions */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <GlobeIcon size={16} /> Global News Hub
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XIcon size={16} />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1 }}>
                    {article.image && (
                        <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden' }}>
                            <img src={article.image} alt={article.title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                        </div>
                    )}
                    
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>
                        {article.title}
                    </h1>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 20, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GlobeIcon size={12} /> {article.source}</span>
                        <span>{article.timeAgo}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: 10 }}>
                            <ShieldIcon size={12} /> {article.credibilityScore} Credibility
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '2px 8px', borderRadius: 10 }}>
                            <ZapIcon size={12} /> {article.impactScore} Impact
                        </span>
                    </div>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 24 }}>
                        {article.description}
                    </div>

                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', marginBottom: 32 }}>
                        Read full article on {article.source}
                    </a>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '20px 0' }} />

                    {/* Comments Section */}
                    <div style={{ marginTop: 20 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Comments ({articleComments.length})</h3>
                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                            <input 
                                type="text" 
                                value={commentText} 
                                onChange={(e) => setCommentText(e.target.value)} 
                                placeholder="Add a comment..." 
                                style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            />
                            <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>Post</button>
                        </form>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {articleComments.map((c: string, i: number) => (
                                <div key={i} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 12, fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 4 }}>User</div>
                                    <div>{c}</div>
                                </div>
                            ))}
                            {articleComments.length === 0 && (
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center', padding: '10px 0' }}>No comments yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 40px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <div className="news-interact-bar" style={{ background: 'transparent', padding: 0, marginTop: 0 }}>
                        <button className={`news-interact-btn ${isLiked ? 'liked' : ''}`} onClick={() => onLike(article.id)} style={{ border: 'none', background: 'none' }}>
                            <HeartIcon size={16} /> Like
                        </button>
                        <button className={`news-interact-btn ${isBookmarked ? 'saved' : ''}`} onClick={() => onBookmark(article.id)} style={{ border: 'none', background: 'none' }}>
                            <BookmarkIcon size={16} /> Save
                        </button>
                        <button className="news-interact-btn" onClick={() => { if (navigator.share) navigator.share({ title: article.title, url: article.url }).catch(() => {}); else navigator.clipboard.writeText(article.url || ''); }} style={{ border: 'none', background: 'none' }}>
                            <ShareIcon size={16} /> Share
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes modalSlideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        </div>
    );
}
