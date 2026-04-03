'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface PostContentProps {
    content: string;
    type?: string;
    policyTitle?: string;
    policyCategory?: string;
}

// ── Rich Semantic Tag System ──
interface TagDef { bg: string; color: string; border: string; icon: string }
const TAG_STYLES: Record<string, TagDef> = {
    DONE:            { bg: 'rgba(16,185,129,0.10)',  color: '#10b981', border: 'rgba(16,185,129,0.25)',  icon: '<polyline points="20 6 9 17 4 12"/>' },
    'IN PROGRESS':   { bg: 'rgba(245,158,11,0.10)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)',  icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>' },
    PENDING:         { bg: 'rgba(148,163,184,0.10)',  color: '#94a3b8', border: 'rgba(148,163,184,0.25)',  icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    APPROVED:        { bg: 'rgba(16,185,129,0.10)',  color: '#059669', border: 'rgba(16,185,129,0.25)',  icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
    REJECTED:        { bg: 'rgba(239,68,68,0.10)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)',   icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' },
    REVIEW:          { bg: 'rgba(99,102,241,0.10)',  color: '#6366f1', border: 'rgba(99,102,241,0.25)',  icon: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' },
    LEGISLATION:     { bg: 'rgba(59,130,246,0.10)',  color: '#3b82f6', border: 'rgba(59,130,246,0.25)',  icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>' },
    RESEARCH:        { bg: 'rgba(139,92,246,0.10)',  color: '#8b5cf6', border: 'rgba(139,92,246,0.25)',  icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
    INFRASTRUCTURE:  { bg: 'rgba(245,158,11,0.10)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)',  icon: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/>' },
    EDUCATION:       { bg: 'rgba(16,185,129,0.10)',  color: '#10b981', border: 'rgba(16,185,129,0.25)',  icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
    BREAKING:        { bg: 'rgba(239,68,68,0.10)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)',   icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
    POLICY:          { bg: 'rgba(99,102,241,0.10)',  color: '#6366f1', border: 'rgba(99,102,241,0.25)',  icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
    ECONOMY:         { bg: 'rgba(6,182,212,0.10)',   color: '#06b6d4', border: 'rgba(6,182,212,0.25)',   icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    SECURITY:        { bg: 'rgba(239,68,68,0.10)',   color: '#dc2626', border: 'rgba(239,68,68,0.25)',   icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
    HEALTH:          { bg: 'rgba(236,72,153,0.10)',  color: '#ec4899', border: 'rgba(236,72,153,0.25)',  icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
    TECHNOLOGY:      { bg: 'rgba(139,92,246,0.10)',  color: '#7c3aed', border: 'rgba(139,92,246,0.25)',  icon: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>' },
    CLIMATE:         { bg: 'rgba(34,197,94,0.10)',   color: '#22c55e', border: 'rgba(34,197,94,0.25)',   icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    TRADE:           { bg: 'rgba(6,182,212,0.10)',   color: '#0891b2', border: 'rgba(6,182,212,0.25)',   icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    ALERT:           { bg: 'rgba(239,68,68,0.10)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)',   icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
    UPDATE:          { bg: 'rgba(59,130,246,0.10)',  color: '#2563eb', border: 'rgba(59,130,246,0.25)',  icon: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>' },
    ANNOUNCEMENT:    { bg: 'rgba(245,158,11,0.10)',  color: '#d97706', border: 'rgba(245,158,11,0.25)',  icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
};
const DEFAULT_TAG: TagDef = { bg: 'rgba(20,184,166,0.10)', color: '#14b8a6', border: 'rgba(20,184,166,0.25)', icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' };

export function PostContent({ content, type, policyTitle, policyCategory }: PostContentProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

    const parts = content.split(/(#\w+|\[[A-Za-z0-9 _\-\/]+\])/g);
    const isPolicy = type === 'policy' && !!policyTitle;

    // Modal rendered via portal to avoid DOM re-flow inside the post card
    const modal = (isViewerOpen && isPolicy && mounted) ? createPortal(
        <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setIsViewerOpen(false)}
        >
            <div
                style={{ background: 'var(--bg-primary)', width: '100%', maxWidth: 640, maxHeight: '85vh', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Policy Proposal</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{policyCategory}</div>
                        </div>
                    </div>
                    <button onClick={() => setIsViewerOpen(false)} style={{ background: 'var(--bg-tertiary)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 4, color: 'var(--text-primary)' }}>{policyTitle}</h2>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>{policyCategory}</div>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{content}</div>
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => window.print()} title="Print / PDF">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                        <button style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Share" onClick={async () => {
                            try { await navigator.clipboard.writeText(window.location.href); showToast('Link copied'); } catch { /* noop */ }
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        </button>
                    </div>
                    <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 18px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIsViewerOpen(false)}>Close</button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="post-content">
            {/* ── Inline policy badge (small, subtle) ── */}
            {isPolicy && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{policyTitle}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4 }}>{policyCategory}</span>
                </div>
            )}

            {/* ── Post text with tags ── */}
            {parts.map((part, i) => {
                if (part.startsWith('#')) {
                    return <Link key={i} href={`/explore?q=%23${part.slice(1)}`} className="hashtag-link" onClick={e => e.stopPropagation()}>{part}</Link>;
                }
                if (part.startsWith('[') && part.endsWith(']')) {
                    const tag = part.slice(1, -1).toUpperCase();
                    const s = TAG_STYLES[tag] || DEFAULT_TAG;
                    return (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em', padding: '3px 9px 3px 7px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, marginRight: 6, verticalAlign: 'middle', textTransform: 'uppercase', boxShadow: `0 1px 3px ${s.border}`, lineHeight: 1, whiteSpace: 'nowrap' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: s.icon }} />
                            {tag}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}

            {/* ── Read more link for policy ── */}
            {isPolicy && (
                <button
                    onClick={(e) => { e.stopPropagation(); setIsViewerOpen(true); }}
                    style={{ display: 'inline', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginLeft: 4 }}
                >
                    Read more
                </button>
            )}

            {/* Portal-rendered modal + toast */}
            {modal}
            {toastMessage && mounted && createPortal(
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid var(--border)', zIndex: 100000, fontWeight: 600, fontSize: '0.82rem' }}>
                    {toastMessage}
                </div>,
                document.body
            )}
        </div>
    );
}
