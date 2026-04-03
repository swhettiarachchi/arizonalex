'use client';
import { useState, useEffect, useRef, use } from 'react';
import { getArticleById, helpArticles } from '@/lib/help-articles';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, FileTextIcon, SearchIcon, ChevronRightIcon, CheckCircleIcon, ShareIcon, BookmarkIcon, ChevronDownIcon, ArrowRightIcon, ThumbsUpIcon, ThumbsDownIcon } from '@/components/ui/Icons';

const CATEGORIES: Record<string, { title: string; color: string }> = {
    'getting-started': { title: 'Getting Started', color: '#7C3AED' },
    'account-privacy': { title: 'Account & Privacy', color: '#3b82f6' },
    'politics-legislation': { title: 'Politics & Legislation', color: '#ef4444' },
    'markets-finance': { title: 'Markets & Finance', color: '#10b981' },
    'ai-tools': { title: 'AI Tools & Sentiment', color: '#f59e0b' },
    'community': { title: 'Community & Trust', color: '#06b6d4' },
    'technical': { title: 'Technical Issues', color: '#8b5cf6' },
    'billing': { title: 'Billing & Subscriptions', color: '#ec4899' },
};

/* ─── Markdown Renderer ────────────────────────────────────── */
function renderContent(rawContent: string) {
    // Normalize: replace literal \n with actual newlines
    const content = rawContent.replace(/\\n/g, '\n');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const elements: React.ReactNode[] = [];
    let sectionIdx = 0;

    const formatInline = (text: string) =>
        text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;font-size:0.88em">$1</code>');

    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();

        // H3 heading
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={`h-${sectionIdx}`} id={`section-${sectionIdx}`} style={{
                    fontSize: '1.1rem', fontWeight: 700, marginTop: 32, marginBottom: 10,
                    color: 'var(--text-primary)', lineHeight: 1.35, scrollMarginTop: 80, textAlign: 'center'
                }}>
                    {line.replace('### ', '')}
                </h3>
            );
            sectionIdx++;
            i++;
            continue;
        }

        // Collect consecutive bullet list items
        if (line.startsWith('* ')) {
            const items: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('* ')) {
                items.push(lines[i].trim().replace(/^\*\s*/, ''));
                i++;
            }
            elements.push(
                <ul key={`ul-${i}`} style={{ listStyle: 'none', padding: 0, marginBottom: 18, maxWidth: 650, margin: '0 auto 18px' }}>
                    {items.map((item, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left' }}>
                            <span style={{ color: 'var(--primary)', flexShrink: 0 }}>•</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Collect consecutive numbered list items
        if (/^\d+\.\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
                i++;
            }
            elements.push(
                <ol key={`ol-${i}`} style={{ listStyle: 'none', padding: 0, marginBottom: 18, maxWidth: 650, margin: '0 auto 18px' }}>
                    {items.map((item, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left' }}>
                            <span style={{
                                width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                                fontWeight: 700, flexShrink: 0
                            }}>{j + 1}</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        // Regular paragraph
        elements.push(
            <p key={`p-${i}`} style={{
                marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.88rem',
                lineHeight: 1.75, textAlign: 'center', maxWidth: 650, margin: '0 auto 16px',
                fontWeight: 400
            }}
               dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
        i++;
    }

    return elements;
}


/* ─── Extract Headings for TOC ──────────────────────────────── */
function extractHeadings(rawContent: string) {
    const content = rawContent.replace(/\\n/g, '\n');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const headings: { text: string; idx: number }[] = [];
    let sectionIdx = 0;
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
            headings.push({ text: trimmed.replace('### ', ''), idx: sectionIdx });
            sectionIdx++;
        }
    });
    return headings;
}


export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [article, setArticle] = useState<ReturnType<typeof getArticleById>>(undefined);
    const [related, setRelated] = useState<typeof helpArticles>([]);
    const [activeSection, setActiveSection] = useState<number | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
    const [copied, setCopied] = useState(false);
    const [headings, setHeadings] = useState<{ text: string; idx: number }[]>([]);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const found = getArticleById(id);
        setArticle(found);
        if (found) {
            const rel = helpArticles
                .filter(a => a.categoryId === found.categoryId && a.id !== found.id)
                .slice(0, 3);
            if (rel.length === 0) {
                rel.push(...helpArticles.filter(a => a.id !== found.id).slice(0, 3));
            }
            setRelated(rel);
            setHeadings(extractHeadings(found.content));
        }
    }, [id]);

    // IntersectionObserver for TOC highlight
    useEffect(() => {
        if (!contentRef.current || headings.length === 0) return;
        const sections = contentRef.current.querySelectorAll('h3[id]');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    if (id) {
                        const idx = parseInt(id.replace('section-', ''));
                        setActiveSection(idx);
                    }
                }
            });
        }, { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 });
        sections.forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [headings]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!article) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="auth-spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    const catMeta = CATEGORIES[article.categoryId] || { title: 'Help', color: '#8b5cf6' };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

            {/* Arizonalex Help Center Hero — Title & Subtitle */}
            <div style={{
                background: `linear-gradient(135deg, ${catMeta.color}10, ${catMeta.color}04)`,
                borderBottom: '1px solid var(--border-light)',
                padding: 'clamp(32px, 6vw, 56px) clamp(16px, 5vw, 40px) clamp(28px, 5vw, 48px)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {/* Help Center Branding */}
                    <Link href="/help" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20, fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.03em' }}>
                        <FileTextIcon size={13} /> Arizonalex Help Center
                    </Link>

                    {/* Tag & Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                            letterSpacing: '0.05em', background: `${article.tagColor}15`, color: article.tagColor
                        }}>{article.tag}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClockIcon size={12} /> {article.readTime} read
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                            Updated {article.lastUpdated}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)', fontWeight: 800,
                        color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.2,
                        letterSpacing: '-0.02em'
                    }}>
                        {article.title}
                    </h1>

                    {/* Subtitle / Description */}
                    <p style={{
                        fontSize: 'clamp(0.92rem, 2vw, 1.08rem)', color: 'var(--text-secondary)',
                        lineHeight: 1.6, margin: '0 auto', maxWidth: 640
                    }}>
                        {article.description}
                    </p>
                </div>
            </div>

            {/* Breadcrumb Bar */}
            <div style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
                <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, padding: 'clamp(10px, 2vw, 14px) clamp(16px, 5vw, 40px)', fontSize: '0.82rem' }}>
                    <Link href="/help" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 500 }} className="hover-underline">Help Center</Link>
                    <ChevronRightIcon size={12} className="text-tertiary" />
                    <Link href={`/help/${article.categoryId}`} style={{ color: catMeta.color, textDecoration: 'none', fontWeight: 600 }} className="hover-underline">{catMeta.title}</Link>
                    <ChevronRightIcon size={12} className="text-tertiary" />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{article.title}</span>
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 4vw, 40px)', padding: 'clamp(20px, 5vw, 40px)', alignItems: 'flex-start' }}>

                {/* Main Article Content */}
                <article ref={contentRef} style={{ flex: '1 1 min(600px, 100%)', background: 'var(--bg-primary)', padding: 'clamp(24px, 5vw, 48px)', borderRadius: 20, border: '1px solid var(--border-light)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', textAlign: 'center' }}>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 28, borderBottom: '1px solid var(--border-light)', marginBottom: 32, flexWrap: 'wrap' }}>
                        <button onClick={handleCopyLink} className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShareIcon size={14} /> {copied ? 'Copied!' : 'Share'}
                        </button>
                        <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BookmarkIcon size={14} /> Save
                        </button>
                    </div>

                    {/* Article Body — CENTERED */}
                    <div className="article-body" style={{ color: 'var(--text-primary)', overflowWrap: 'break-word', textAlign: 'center' }}>
                        {renderContent(article.content)}
                    </div>

                    {/* Feedback Section */}
                    <div style={{ marginTop: 48, padding: 'clamp(20px, 4vw, 32px)', borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                        {feedbackGiven ? (
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircleIcon size={28} />
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>Thanks for your feedback!</p>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Your input helps us improve our documentation.</p>
                            </div>
                        ) : (
                            <>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>Was this article helpful?</h4>
                                <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Your feedback improves our documentation.</p>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button onClick={() => setFeedbackGiven('yes')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ThumbsUpIcon size={14} /> Yes, helpful</button>
                                    <button onClick={() => setFeedbackGiven('no')} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ThumbsDownIcon size={14} /> Needs improvement</button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Prev/Next Navigation */}
                    {(() => {
                        const sameCat = helpArticles.filter(a => a.categoryId === article.categoryId);
                        const idx = sameCat.findIndex(a => a.id === article.id);
                        const prev = idx > 0 ? sameCat[idx - 1] : null;
                        const next = idx < sameCat.length - 1 ? sameCat[idx + 1] : null;
                        if (!prev && !next) return null;
                        return (
                            <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {prev && (
                                    <Link href={`/help/article/${prev.id}`} className="info-card info-card-hover" style={{ flex: 1, textDecoration: 'none', padding: 20, minWidth: 200, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>← Previous</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{prev.title}</div>
                                    </Link>
                                )}
                                {next && (
                                    <Link href={`/help/article/${next.id}`} className="info-card info-card-hover" style={{ flex: 1, textDecoration: 'none', padding: 20, textAlign: 'center', minWidth: 200 }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>Next →</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{next.title}</div>
                                    </Link>
                                )}
                            </div>
                        );
                    })()}
                </article>

                {/* Sidebar */}
                <aside style={{ flex: '0 0 min(300px, 100%)', position: 'sticky', top: 70 }}>

                    {/* Table of Contents */}
                    {headings.length > 0 && (
                        <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 16, border: '1px solid var(--border-light)', marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                On This Page
                            </h3>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {headings.map((h) => (
                                    <a
                                        key={h.idx}
                                        href={`#section-${h.idx}`}
                                        style={{
                                            textDecoration: 'none', fontSize: '0.82rem', padding: '6px 12px',
                                            borderRadius: 6, fontWeight: activeSection === h.idx ? 700 : 500,
                                            color: activeSection === h.idx ? 'var(--primary)' : 'var(--text-secondary)',
                                            background: activeSection === h.idx ? 'rgba(139,92,246,0.08)' : 'transparent',
                                            borderLeft: `2px solid ${activeSection === h.idx ? 'var(--primary)' : 'transparent'}`,
                                            transition: 'all 0.2s', lineHeight: 1.4
                                        }}
                                    >{h.text}</a>
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Related Articles */}
                    <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 16, border: '1px solid var(--border-light)', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Related Articles
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {related.map(rel => (
                                <Link key={rel.id} href={`/help/article/${rel.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 10, background: 'var(--bg-secondary)', transition: 'background 0.15s' }} className="hover-opacity">
                                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${rel.tagColor}15`, color: rel.tagColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                        <ArrowRightIcon size={12} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 4 }}>{rel.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{rel.readTime} read</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.06))', padding: 24, borderRadius: 16, border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Can&apos;t find what you&apos;re looking for?</div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>Our support team is available 24/7</p>
                        <Link href="/contact" className="btn btn-primary" style={{ width: '100%', fontSize: '0.82rem', padding: '10px 0', borderRadius: 10 }}>Contact Support</Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}
