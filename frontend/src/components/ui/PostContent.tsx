'use client';
import Link from 'next/link';

interface PostContentProps {
    content: string;
}

// Category tag color mapping
const TAG_STYLES: Record<string, { bg: string; color: string }> = {
    LEGISLATION: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    RESEARCH: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
    INFRASTRUCTURE: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    EDUCATION: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    BREAKING: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    POLICY: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
    DONE: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    'IN PROGRESS': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    PENDING: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
};

export function PostContent({ content }: PostContentProps) {
    // Split on hashtags and [TAG] markers
    const parts = content.split(/(#\w+|\[[A-Z ]+\])/g);

    return (
        <div className="post-content">
            {parts.map((part, i) => {
                // Hashtag
                if (part.startsWith('#')) {
                    const hashtag = part.slice(1);
                    return (
                        <Link
                            key={i}
                            href={`/explore?q=%23${hashtag}`}
                            className="hashtag-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }
                // [TAG] — render as a professional inline badge
                if (part.startsWith('[') && part.endsWith(']')) {
                    const tag = part.slice(1, -1);
                    const style = TAG_STYLES[tag] || { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' };
                    return (
                        <span
                            key={i}
                            style={{
                                display: 'inline-block',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                padding: '2px 8px',
                                borderRadius: 20,
                                background: style.bg,
                                color: style.color,
                                marginRight: 6,
                                verticalAlign: 'middle',
                                textTransform: 'uppercase',
                            }}
                        >
                            {tag}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
}
