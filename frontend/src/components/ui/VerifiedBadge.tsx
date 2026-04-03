'use client';
import React from 'react';

export type IdentityLevel = 'normal' | 'verified_citizen' | 'verified_politician' | 'official_government';

interface VerifiedBadgeProps {
    level: IdentityLevel;
    size?: number;
    showLabel?: boolean;
}

const BADGE_CONFIG: Record<IdentityLevel, { label: string; color: string; icon: React.ReactNode }> = {
    normal: {
        label: 'User',
        color: 'transparent',
        icon: <></>,
    },
    verified_citizen: {
        label: 'Verified',
        color: '#00e676',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
    verified_politician: {
        label: 'Verified Politician',
        color: '#448aff',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 16l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
            </svg>
        ),
    },
    official_government: {
        label: 'Official',
        color: '#ffd740',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M12 6l1.5 3.5L17 11l-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5z" />
            </svg>
        ),
    },
};

export default function VerifiedBadge({ level, size = 16, showLabel = false }: VerifiedBadgeProps) {
    if (level === 'normal') return null;

    const config = BADGE_CONFIG[level];

    return (
        <span
            className={`verified-badge verified-badge--${level}`}
            title={config.label}
            style={{ '--badge-color': config.color, '--badge-size': `${size}px` } as React.CSSProperties}
        >
            <span className="verified-badge__icon" style={{ width: size, height: size, color: config.color }}>
                {config.icon}
            </span>
            {showLabel && <span className="verified-badge__label">{config.label}</span>}
        </span>
    );
}
