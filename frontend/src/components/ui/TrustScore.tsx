'use client';
import { useEffect, useState } from 'react';

interface TrustScoreProps {
    score: number;  // 0–100
    size?: number;
    showLabel?: boolean;
    animate?: boolean;
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#00e676';
    if (score >= 60) return '#ffd740';
    if (score >= 40) return '#ff9100';
    return '#ff5252';
}

function getScoreLevel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'High';
    if (score >= 50) return 'Moderate';
    if (score >= 25) return 'Low';
    return 'Unverified';
}

export default function TrustScore({ score, size = 80, showLabel = true, animate = true }: TrustScoreProps) {
    const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const color = getScoreColor(score);
    const level = getScoreLevel(score);

    useEffect(() => {
        if (!animate) {
            setTimeout(() => setDisplayScore(score), 0);
            return;
        }
        let frame: number;
        const start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplayScore(Math.round(eased * score));
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [score, animate]);

    const dashOffset = circumference - (displayScore / 100) * circumference;

    return (
        <div className="trust-score" style={{ '--ts-size': `${size}px`, '--ts-color': color } as React.CSSProperties}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="trust-score__ring"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="6"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    className="trust-score__arc"
                />
                <text
                    x={size / 2}
                    y={size / 2 - 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={size * 0.28}
                    fontWeight="700"
                >
                    {displayScore}
                </text>
            </svg>
            {showLabel && (
                <div className="trust-score__label">
                    <span className="trust-score__level" style={{ color }}>{level}</span>
                    <span className="trust-score__text">Trust Score</span>
                </div>
            )}
        </div>
    );
}
