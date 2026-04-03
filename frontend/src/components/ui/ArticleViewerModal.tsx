'use client';

import { FileTextIcon, ClockIcon } from '@/components/ui/Icons';

export interface Article {
    id: string;
    title: string;
    tag?: string;
    tagColor?: string;
    readTime?: string;
    content: string;
}

interface ArticleViewerModalProps {
    article: Article;
    onClose: () => void;
}

export function ArticleViewerModal({ article, onClose }: ArticleViewerModalProps) {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, backdropFilter: 'blur(5px)'
        }}
        onClick={onClose}
        >
            <div style={{
                background: 'var(--bg-primary)', borderRadius: 20, width: '100%', maxWidth: 700,
                maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                border: '1px solid var(--border-light)',
                animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={e => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <FileTextIcon size={16} /> Support Article
                    </div>
                    <button onClick={onClose} style={{
                        background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background-color 0.2s, color 0.2s'
                    }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1, marginTop: -2 }}>&times;</span>
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: '32px 40px', overflowY: 'auto' }}>
                    {article.tag && (
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ 
                                display: 'inline-block', padding: '4px 10px', borderRadius: 6, 
                                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
                                background: `${article.tagColor}15`, color: article.tagColor 
                            }}>
                                {article.tag}
                            </span>
                        </div>
                    )}
                    
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                        {article.title}
                    </h1>

                    {article.readTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 32 }}>
                            <ClockIcon size={14} /> {article.readTime} read
                        </div>
                    )}

                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
                        {article.content.split('\n\n').map((paragraph, i) => (
                            <p key={i} style={{ marginBottom: 20 }}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '20px 40px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Was this article helpful?</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-outline btn-sm">Yes</button>
                        <button className="btn btn-outline btn-sm">No</button>
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
