'use client';
import Link from 'next/link';

interface PostContentProps {
    content: string;
}

export function PostContent({ content }: PostContentProps) {
    // Regex to find hashtags: starts with # followed by alphanumeric characters
    const parts = content.split(/(#\w+)/g);

    return (
        <div className="post-content">
            {parts.map((part, i) => {
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
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
}
