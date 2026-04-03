'use client';
import { useState } from 'react';

interface PostOptionsProps {
    postId: string;
    authorUsername: string;
    currentUsername?: string;
    initialContent: string;
    isPolicy?: boolean;
    initialPolicyTitle?: string;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, newContent: string) => void;
}

export function PostOptions({ 
    postId, 
    authorUsername, 
    currentUsername, 
    initialContent, 
    isPolicy,
    initialPolicyTitle,
    onDelete, 
    onUpdate 
}: PostOptionsProps) {
    const isAuthor = currentUsername === authorUsername;
    const [isOpen, setIsOpen] = useState(false);
    
    // Modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    
    // States
    const [editContent, setEditContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                setShowDeleteModal(false);
                if (onDelete) onDelete(postId);
            } else {
                showToast('Failed to delete post');
            }
        } catch (e) {
            showToast('Error deleting post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent })
            });
            if (res.ok) {
                setShowEditModal(false);
                if (onUpdate) onUpdate(postId, editContent);
            } else {
                showToast('Failed to update post');
            }
        } catch (e) {
            showToast('Error updating post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        setIsOpen(false);
        const shareUrl = `${window.location.origin}/post/${postId}`;
        
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Arizonalex Post', url: shareUrl });
            } else {
                throw new Error('Share API not available');
            }
        } catch (err) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast('Post link securely copied to clipboard!');
            } catch (copyErr) {
                showToast('Failed to copy link.');
            }
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className="btn btn-icon"
                style={{ color: 'var(--text-tertiary)', padding: 6, borderRadius: '50%' }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setIsOpen(false)} />
                    <div style={{
                        position: 'absolute', right: 0, top: 36, background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', borderRadius: 12, padding: 6, 
                        boxShadow: 'var(--shadow-lg)', zIndex: 100, minWidth: 160,
                        display: 'flex', flexDirection: 'column', gap: 2,
                        animation: 'fade-in 0.15s ease-out'
                    }}>
                        {isAuthor ? (
                            <>
                                <button className="dropdown-item" onClick={() => { setIsOpen(false); setShowEditModal(true); }} style={itemStyle}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Edit Post
                                </button>
                                <button className="dropdown-item" onClick={() => { setIsOpen(false); setShowDeleteModal(true); }} style={{ ...itemStyle, color: 'var(--danger)' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    Delete Post
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="dropdown-item" onClick={() => { setIsOpen(false); setShowReportModal(true); }} style={{ ...itemStyle, color: 'var(--danger)' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                                    Report Post
                                </button>
                            </>
                        )}
                        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                        <button className="dropdown-item" onClick={handleShare} style={itemStyle}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Share Post
                        </button>
                    </div>
                </>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={modalOverlayStyle} onClick={() => !isSubmitting && setShowEditModal(false)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Edit Post</h3>
                        <textarea 
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)}
                            style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 12, border: '1px solid var(--primary-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: 20, outline: 'none' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="btn" style={cancelBtnStyle} onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancel</button>
                            <button className="btn btn-primary" style={{ borderRadius: 20, padding: '8px 24px', fontWeight: 700, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }} onClick={handleEdit} disabled={isSubmitting || !editContent.trim()}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={modalOverlayStyle} onClick={() => !isSubmitting && setShowDeleteModal(false)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </div>
                            <h3 style={modalTitleStyle}>Delete Post?</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.5 }}>
                            This can’t be undone and it will be permanently removed from your profile and from Arizonalex search results.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="btn" style={cancelBtnStyle} onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>Cancel</button>
                            <button className="btn btn-primary" style={{ borderRadius: 20, padding: '8px 24px', fontWeight: 700, background: 'var(--danger)', border: 'none', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }} onClick={handleDelete} disabled={isSubmitting}>
                                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div style={modalOverlayStyle} onClick={() => setShowReportModal(false)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Report Post</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Select a reason to securely report this post to moderation.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                            {['Spam or Fraudulent', 'Harassment or Hate Speech', 'Misinformation', 'Other'].map(rsn => (
                                <label key={rsn} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', background: 'var(--bg-secondary)' }}>
                                    <input type="radio" name="reportPost" style={{ accentColor: 'var(--primary)', transform: 'scale(1.1)' }} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rsn}</span>
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="btn" style={cancelBtnStyle} onClick={() => setShowReportModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ borderRadius: 20, padding: '8px 24px', fontWeight: 700, background: 'var(--danger)', border: 'none', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }} onClick={() => { showToast('Post reported successfully.'); setShowReportModal(false); }}>
                                Submit Official Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastMsg && (
                <div style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 24px', borderRadius: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '1px solid var(--primary)', zIndex: 100000, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: '0.9rem', animation: 'fade-in 0.3s ease-out' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {toastMsg}
                </div>
            )}
        </div>
    );
}

const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600,
    borderRadius: 8, textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)'
};
const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
};
const modalContentStyle: React.CSSProperties = {
    background: 'var(--bg-primary)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 460, 
    boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', animation: 'fade-in 0.2s ease-out'
};
const modalTitleStyle: React.CSSProperties = {
    fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)', marginBottom: 16
};
const cancelBtnStyle: React.CSSProperties = {
    padding: '8px 20px', background: 'var(--bg-tertiary)', borderRadius: 20, fontSize: '0.9rem', fontWeight: 600, border: 'none'
};
