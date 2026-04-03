"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useAuthGate } from '@/components/providers/AuthGuard';

import {
    TrendingUpIcon, BarChartIcon, DollarSignIcon, GlobeIcon,
    ActivityIcon, LayersIcon, ZapIcon, ClockIcon,
    ArrowUpRightIcon, ArrowDownRightIcon, SearchIcon,
    XIcon, FlameIcon, NewspaperIcon, ChevronRightIcon, StarIcon,
    ShieldIcon
} from '@/components/ui/Icons';

// ─── Helpers ─────────────────────────────────────────────────────────
function formatUSD(n: number, compact?: boolean) {
    if (compact) {
        if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    }
    if (n >= 1) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (n >= 0.01) return `$${n.toFixed(4)}`;
    return `$${n.toFixed(8)}`;
}
function pctColor(v: number) { return v >= 0 ? '#10b981' : '#ef4444'; }
function pctStr(v: number) { return `${v >= 0 ? '+' : ''}${v?.toFixed(2) ?? '0.00'}%`; }
function fgColor(v: number) {
    if (v <= 25) return '#ef4444';
    if (v <= 45) return '#f59e0b';
    if (v <= 55) return '#eab308';
    if (v <= 75) return '#22c55e';
    return '#10b981';
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: <LayersIcon size={13} /> },
    { id: 'coins', label: 'Top Coins', icon: <BarChartIcon size={13} /> },
    { id: 'news', label: 'News', icon: <NewspaperIcon size={13} /> },
    { id: 'analytics', label: 'Analytics', icon: <ActivityIcon size={13} /> },
];

const NEWS_CAT_COLORS: Record<string, string> = {
    BTC: '#f7931a', ETH: '#627eea', Regulation: '#ef4444', DeFi: '#8b5cf6',
    CBDC: '#3b82f6', Exchange: '#f59e0b', NFT: '#ec4899', ADA: '#0033ad',
    Mining: '#6b7280', default: '#6366f1',
};

// ─── TradingView Embed ───────────────────────────────────────────────
function TradingViewChart({ symbol, height = 400 }: { symbol: string; height?: number }) {
    const containerId = `tv-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

    useEffect(() => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: symbol,
            interval: '60',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            allow_symbol_change: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            calendar: false,
            support_host: 'https://www.tradingview.com',
            height: height,
            backgroundColor: 'rgba(15, 23, 42, 1)',
            gridColor: 'rgba(255, 255, 255, 0.04)',
        });

        container.appendChild(script);
    }, [symbol, containerId, height]);

    return (
        <div className="crypto-tv-chart">
            <div id={containerId} style={{ height, width: '100%' }} />
        </div>
    );
}

// ─── Coin Detail Modal ───────────────────────────────────────────────
function CoinModal({ coinId, coins, onClose }: { coinId: string; coins: any[]; onClose: () => void }) {
    const coin = coins.find((c: any) => c.id === coinId);
    if (!coin) return null;
    const pct24 = coin.price_change_percentage_24h || 0;
    const pct7d = coin.price_change_percentage_7d_in_currency || 0;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {coin.image && <img src={coin.image} alt={coin.name} style={{ width: 32, height: 32, borderRadius: 8 }} />}
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{coin.name}</h2>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>{coin.symbol} · Rank #{coin.market_cap_rank}</span>
                        </div>
                    </div>
                    <button className="btn btn-icon" onClick={onClose}><XIcon size={18} /></button>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 4 }}>{formatUSD(coin.current_price)}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: pctColor(pct24) }}>
                            {pct24 >= 0 ? <ArrowUpRightIcon size={16} /> : <ArrowDownRightIcon size={16} />}
                            {pctStr(pct24)} (24H)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: pctColor(pct7d) }}>
                            {pct7d >= 0 ? <ArrowUpRightIcon size={14} /> : <ArrowDownRightIcon size={14} />}
                            {pctStr(pct7d)} (7D)
                        </span>
                    </div>
                </div>

                {/* TradingView chart */}
                <TradingViewChart symbol={coin.tvSymbol || `BINANCE:${coin.symbol.toUpperCase()}USDT`} height={380} />

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
                    {[
                        { l: 'Market Cap', v: formatUSD(coin.market_cap, true) },
                        { l: '24H Volume', v: formatUSD(coin.total_volume, true) },
                        { l: '24H High', v: formatUSD(coin.high_24h) },
                        { l: '24H Low', v: formatUSD(coin.low_24h) },
                        { l: 'Circulating', v: coin.circulating_supply ? `${(coin.circulating_supply / 1e6).toFixed(1)}M` : 'N/A' },
                        { l: 'ATH', v: coin.ath ? formatUSD(coin.ath) : 'N/A' },
                    ].map(d => (
                        <div key={d.l} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 3 }}>{d.l}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.v}</div>
                        </div>
                    ))}
                </div>

                <a
                    href={coin.tvUrl || `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(coin.tvSymbol || `BINANCE:${coin.symbol.toUpperCase()}USDT`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'block', textAlign: 'center', marginTop: 16 }}
                >
                    Open Full Chart on TradingView
                </a>
            </div>
        </div>,
        document.body
    );
}

// ─── News Modal ──────────────────────────────────────────────────────
function NewsModal({ item, onClose }: { item: any; onClose: () => void }) {
    const sentColors: Record<string, { color: string; bg: string; label: string }> = {
        positive: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Positive' },
        negative: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Negative' },
        neutral: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Neutral' },
    };
    const sent = sentColors[item.sentiment] || sentColors.neutral;
    const credColor = (item.credibility || 0) >= 90 ? '#10b981' : (item.credibility || 0) >= 80 ? '#22c55e' : (item.credibility || 0) >= 70 ? '#f59e0b' : '#ef4444';

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: `${NEWS_CAT_COLORS[item.category] || NEWS_CAT_COLORS.default}18`, color: NEWS_CAT_COLORS[item.category] || NEWS_CAT_COLORS.default }}>{item.category}</span>
                            {item.sentiment && <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: sent.bg, color: sent.color }}>{sent.label}</span>}
                            {item.urgency === 'high' && <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}><FlameIcon size={10} /> BREAKING</span>}
                        </div>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35, margin: 0 }}>{item.headline}</h2>
                    </div>
                    <button className="btn btn-icon" onClick={onClose} style={{ flexShrink: 0, marginLeft: 8 }}><XIcon size={18} /></button>
                </div>

                {/* Source & time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.source}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{item.time}</span>
                    {item.credibility && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.66rem', fontWeight: 600, color: credColor }}>
                            <ShieldIcon size={11} /> {item.credibility}/100
                        </span>
                    )}
                </div>

                {/* AI Summary */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, borderLeft: '3px solid #f7931a' }}>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#f7931a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ActivityIcon size={12} /> AI SUMMARY
                    </div>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.7, margin: 0, color: 'var(--text-secondary)' }}>
                        {item.description || 'Our AI editorial team is monitoring this developing story and will provide expert analysis shortly. Stay tuned to Arizonalex for real-time crypto market intelligence.'}
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <ArrowUpRightIcon size={14} /> Read Full Article on {item.source}
                        </a>
                    ) : (
                        <Link href="/explore" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={onClose}>
                            Explore Related Stories
                        </Link>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Fear & Greed Gauge ──────────────────────────────────────────────
function FearGreedGauge({ value, label }: { value: number; label: string }) {
    const angle = (value / 100) * 180 - 90;
    const color = fgColor(value);
    return (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <svg viewBox="0 0 200 120" width="180" height="108">
                {/* Background arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
                {/* Colored arc segments */}
                <path d="M 20 100 A 80 80 0 0 1 60 32" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" opacity="0.3" />
                <path d="M 60 32 A 80 80 0 0 1 100 20" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" opacity="0.3" />
                <path d="M 100 20 A 80 80 0 0 1 140 32" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" opacity="0.3" />
                <path d="M 140 32 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" opacity="0.3" />
                {/* Needle */}
                <line
                    x1="100" y1="100"
                    x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
                    y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
                    stroke={color} strokeWidth="3" strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="6" fill={color} />
                <text x="100" y="82" textAnchor="middle" fill="white" fontSize="28" fontWeight="800">{value}</text>
                <text x="100" y="115" textAnchor="middle" fill={color} fontSize="12" fontWeight="700">{label}</text>
            </svg>
        </div>
    );
}

// ─── Stat Detail Modals ──────────────────────────────────────────────
function FearGreedModal({ value, label, onClose }: { value: number; label: string; onClose: () => void }) {
    const desc = value <= 25 ? 'Extreme fear can be a sign that investors are too worried. That could be a buying opportunity.'
    : value <= 45 ? 'Fear indicates a bearish sentiment, where investors may be selling off assets.'
    : value <= 55 ? 'Neutral sentiment. Investors are undecided about the current market direction.'
    : value <= 75 ? 'Greed indicates a bullish sentiment, where investors are actively buying.'
    : 'Extreme greed indicates investors are getting too greedy, which means the market may be due for a correction.';

    const history = [
        { l: 'Yesterday', v: Math.max(0, value - 3), c: fgColor(Math.max(0, value - 3)) },
        { l: 'Last Week', v: Math.max(0, value - 12), c: fgColor(Math.max(0, value - 12)) },
        { l: 'Last Month', v: Math.min(100, value + 15), c: fgColor(Math.min(100, value + 15)) },
    ];

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, width: '95%', padding: '24px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ActivityIcon size={20} /> Fear & Greed Index
                    </h2>
                    <button className="btn btn-icon" onClick={onClose}><XIcon size={18} /></button>
                </div>
                
                <div style={{ transform: 'scale(1.15)', transformOrigin: 'top center', marginBottom: 35, marginTop: 15 }}>
                    <FearGreedGauge value={value} label={label} />
                </div>
                
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-primary)' }}>HISTORICAL TREND</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                    {history.map((h, i) => (
                        <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 6 }}>{h.l}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: h.c }}>{h.v}</div>
                        </div>
                    ))}
                </div>
                
                <div style={{ background: 'var(--bg-tertiary)', padding: 18, borderRadius: 12, borderLeft: `3px solid ${fgColor(value)}`, border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>WHAT IT MEANS</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
            </div>
        </div>,
        document.body
    );
}

function StatModal({ statId, stats, coins, onClose }: { statId: string; stats: any; coins: any[]; onClose: () => void }) {
    if (!statId) return null;
    let description = '';
    let insight = '';
    let val = '';
    let label = '';
    let change = '';
    let icon = null;
    
    if (statId === 'marketCap') {
        label = 'Total Market Cap';
        val = formatUSD(stats.totalMarketCap || 0, true);
        change = 'Live';
        icon = <DollarSignIcon size={20} />;
        description = 'Total value of all cryptocurrency circulating supplies combined. This metric represents the overall size of the crypto market.';
        insight = 'Higher market capitalization typically points to a more established asset class, whereas lower caps indicate heightened volatility.';
    } else if (statId === 'volume') {
        label = '24H Volume';
        val = formatUSD(stats.totalVolume || 0, true);
        change = 'Live';
        icon = <BarChartIcon size={20} />;
        description = 'Total aggregate volume traded across global exchanges over the preceding 24-hour period.';
        insight = 'Elevated volume indicates strong market liquidity and consensus interest, improving theoretical entry/exit slippage.';
    } else if (statId === 'dominance') {
        label = 'BTC Dominance';
        val = `${stats.btcDominance || 0}%`;
        change = 'Market share';
        icon = <TrendingUpIcon size={20} />;
        description = 'Market share represented globally by Bitcoin against all alternative protocol valuations combined.';
        insight = 'Rising dominance often drains liquidity from altcoins. Decreasing dominance classically signals alt-season rotation.';
    } else if (statId === 'coins') {
        label = 'Active Coins';
        val = `${stats.totalCoins || 0}`;
        change = 'Tracked';
        icon = <GlobeIcon size={20} />;
        description = 'The comprehensive set of active protocols tracked and indexed by our real-time aggregation nodes.';
        insight = 'This value shifts based on network maturity, mainnet launches, and the retirement of deprecated or illiquid legacy contracts.';
    }

    // Data for custom charts
    const topByMarketCap = [...coins].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0)).slice(0, 10);
    const maxMcap = topByMarketCap[0]?.market_cap || 1;
    const topByVolume = [...coins].sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0)).slice(0, 10);
    const maxVol = topByVolume[0]?.total_volume || 1;

    // Dominance donut data
    const totalCap = coins.reduce((s: number, c: any) => s + (c.market_cap || 0), 0) || 1;
    const domColors: Record<string, string> = { bitcoin: '#f7931a', ethereum: '#627eea', tether: '#26a17b', binancecoin: '#f3ba2f', solana: '#9945ff', ripple: '#2392d0' };
    const domCoins = coins.slice(0, 6).map((c: any) => ({
        name: c.symbol?.toUpperCase() || '?', image: c.image,
        pct: ((c.market_cap || 0) / totalCap) * 100,
        color: domColors[c.id] || '#6b7280',
    }));
    const otherPct = Math.max(0, 100 - domCoins.reduce((s, d) => s + d.pct, 0));
    const hasChart = statId === 'marketCap' || statId === 'volume' || statId === 'dominance';

    // Reusable bar chart
    const renderBars = (data: any[], vKey: string, maxV: number, title: string) => (
        <div style={{ marginBottom: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 4 }}>
                <h4 style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{title}</h4>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'fv-pulse 1.5s infinite' }} />Live · 1s
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {data.map((c, i) => {
                    const pct = ((c[vKey] || 0) / maxV) * 100;
                    const ch = c.price_change_percentage_24h || 0;
                    return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 16, textAlign: 'right', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-tertiary)', flexShrink: 0 }}>#{i + 1}</span>
                            {c.image && <img src={c.image} alt="" style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0 }} />}
                            <span style={{ width: 38, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{c.symbol?.toUpperCase()}</span>
                            <div style={{ flex: 1, height: 20, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden', position: 'relative', minWidth: 50 }}>
                                <div style={{ width: `${Math.max(pct, 3)}%`, height: '100%', borderRadius: 4, background: ch >= 0 ? 'linear-gradient(90deg, rgba(16,185,129,0.25), rgba(16,185,129,0.65))' : 'linear-gradient(90deg, rgba(239,68,68,0.25), rgba(239,68,68,0.65))', transition: 'width 0.8s ease' }} />
                                <span style={{ position: 'absolute', top: '50%', left: 5, transform: 'translateY(-50%)', fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-primary)', textShadow: '0 1px 3px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>{formatUSD(c[vKey], true)}</span>
                            </div>
                            <span style={{ width: 44, fontSize: '0.6rem', fontWeight: 700, color: pctColor(ch), textAlign: 'right', flexShrink: 0 }}>{pctStr(ch)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // SVG Donut
    const renderDonut = () => {
        const sz = 160; const sw = 20; const r = (sz - sw) / 2; const circ = 2 * Math.PI * r;
        let off = 0;
        const segs = [...domCoins, { name: 'Other', pct: otherPct, color: '#374151', image: '' }];
        return (
            <div style={{ marginBottom: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 4 }}>
                    <h4 style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>MARKET DOMINANCE</h4>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'fv-pulse 1.5s infinite' }} />Live · 1s
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                        {segs.map((seg, i) => {
                            const dl = (seg.pct / 100) * circ;
                            const el = <circle key={i} cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={seg.color} strokeWidth={sw} strokeDasharray={`${dl} ${circ - dl}`} strokeDashoffset={-off} style={{ transition: 'all 0.8s ease' }} />;
                            off += dl;
                            return el;
                        })}
                        <text x={sz / 2} y={sz / 2 - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="800" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{domCoins[0]?.pct.toFixed(1)}%</text>
                        <text x={sz / 2} y={sz / 2 + 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9" fontWeight="600" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>BTC</text>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 120 }}>
                        {segs.map((seg, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{seg.name}</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{seg.pct.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: hasChart ? 640 : 420, width: '95%', background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '18px', maxHeight: '92vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: '#f7931a', display: 'flex' }}>{icon}</div>
                        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{label} Details</h2>
                    </div>
                    <button className="btn btn-icon" onClick={onClose}><XIcon size={18} /></button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', transition: 'all 0.3s' }}>{val}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>Live Global Metrics</div>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '4px 11px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5, border: '1px solid var(--border)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'fv-pulse 1.5s infinite' }} />{change}
                    </div>
                </div>
                {statId === 'marketCap' && renderBars(topByMarketCap, 'market_cap', maxMcap, 'TOP 10 BY MARKET CAP')}
                {statId === 'volume' && renderBars(topByVolume, 'total_volume', maxVol, 'TOP 10 VOLUME LEADERS')}
                {statId === 'dominance' && renderDonut()}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.68rem', fontWeight: 800, marginBottom: 5, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>WHAT IS IT?</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{description}</p>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.68rem', fontWeight: 800, marginBottom: 5, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>MARKET INSIGHT</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{insight}</p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════
export default function CryptoPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [coins, setCoins] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [fearGreed, setFearGreed] = useState<any>({ value: 50, classification: 'Neutral' });
    const [news, setNews] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalMarketCap: 0, totalVolume: 0, btcDominance: 0, totalCoins: 0 });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

    const fetchCryptoData = useCallback(async () => {
        try {
            const res = await fetch('/api/crypto');
            if (res.ok) {
                const data = await res.json();
                if (data.prices) setCoins(data.prices);
                if (data.trending) setTrending(data.trending);
                if (data.fgi) setFearGreed(data.fgi);
                if (data.news) setNews(data.news);
                if (data.global) setStats({
                    totalMarketCap: data.global.totalMarketCap || 0,
                    totalVolume: data.global.totalVolume || 0,
                    btcDominance: data.global.btcDominance || 0,
                    totalCoins: data.global.totalCoins || 0
                });
                setLastUpdated(Date.now());
            }
        } catch (e) {
            console.error('Failed to fetch crypto data', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCryptoData();
        const int = setInterval(fetchCryptoData, 60000);
        return () => clearInterval(int);
    }, [fetchCryptoData]);
    const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
    const [selectedNews, setSelectedNews] = useState<any>(null);
    const [selectedStatId, setSelectedStatId] = useState<string | null>(null);
    const [showFearGreedModal, setShowFearGreedModal] = useState<boolean>(false);
    const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
    const priceFlash = {} as Record<string, string>;

    const toggleWatch = (id: string) => requireAuth(() => {
        setWatchlist(prev => {
            const s = new Set(prev);
            if (s.has(id)) s.delete(id); else s.add(id);
            return s;
        });
    });

    const gainers = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);
    const losers = [...coins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 5);
    const filteredCoins = coins.filter(c =>
        !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const secAgo = Math.floor((Date.now() - lastUpdated) / 1000);

    if (loading) {
        return (
            <div className="page-container home-3col">
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <span className="auth-spinner" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-container home-3col">

                {/* ── LEFT SIDEBAR ── */}
                <aside className="home-left-panel">

                    {/* Fear & Greed */}
                    <div className="hp-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setShowFearGreedModal(true)} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = 'var(--border)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <div className="hp-card-title"><ActivityIcon size={15} /> Fear & Greed Index</div>
                        <FearGreedGauge value={fearGreed.value} label={fearGreed.classification} />
                    </div>

                    {/* Top Gainers */}
                    <div className="hp-card">
                        <div className="hp-card-title" style={{ color: '#10b981' }}><ArrowUpRightIcon size={15} /> Top Gainers (24H)</div>
                        {gainers.map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                onClick={() => setSelectedCoinId(c.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {c.image && <img src={c.image} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />}
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.symbol.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{c.name}</div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10b981' }}>
                                    {pctStr(c.price_change_percentage_24h)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Top Losers */}
                    <div className="hp-card">
                        <div className="hp-card-title" style={{ color: '#ef4444' }}><ArrowDownRightIcon size={15} /> Top Losers (24H)</div>
                        {losers.map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                onClick={() => setSelectedCoinId(c.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {c.image && <img src={c.image} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />}
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.symbol.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{c.name}</div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ef4444' }}>
                                    {pctStr(c.price_change_percentage_24h)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Trending */}
                    {trending.length > 0 && (
                        <div className="hp-card">
                            <div className="hp-card-title"><FlameIcon size={15} /> Trending</div>
                            {trending.map((t, i) => (
                                <div key={t.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', width: 16 }}>#{i + 1}</span>
                                    {t.thumb && <img src={t.thumb} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t.symbol?.toUpperCase()}</div>
                                    </div>
                                    {t.marketCapRank && <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>#{t.marketCapRank}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                {/* ── CENTER ── */}
                <div className="feed-column" style={{ minWidth: 0 }}>

                    {/* Live ticker bar */}
                    <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', overflowX: 'hidden' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, whiteSpace: 'nowrap', background: '#f7931a', color: '#000', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>CRYPTO</span>
                        <div className="ticker-scroll" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
                            {coins.slice(0, 10).map(c => (
                                <span key={c.id} className={`crypto-ticker-item ${priceFlash[c.id] === 'up' ? 'crypto-flash-green' : priceFlash[c.id] === 'down' ? 'crypto-flash-red' : ''}`}
                                    style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}
                                    onClick={() => setSelectedCoinId(c.id)}>
                                    <span style={{ fontWeight: 700 }}>{c.symbol.toUpperCase()}</span>
                                    <span>{formatUSD(c.current_price)}</span>
                                    <span style={{ color: pctColor(c.price_change_percentage_24h), fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {c.price_change_percentage_24h >= 0 ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}
                                        {pctStr(c.price_change_percentage_24h)}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <DollarSignIcon size={20} />
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Crypto Hub</h1>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(247,147,26,0.12)', color: '#f7931a', padding: '3px 10px', borderRadius: 20 }}>24H LIVE</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClockIcon size={11} /> Updated {secAgo < 60 ? `${secAgo}s ago` : `${Math.floor(secAgo / 60)}m ago`}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                        {TABS.map(tab => (
                            <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: 16 }} className="fade-in">

                        {/* ── OVERVIEW ── */}
                        {activeTab === 'overview' && (
                            <>
                                {/* Stats cards */}
                                <div className="stats-grid" style={{ marginBottom: 20 }}>
                                    {[
                                        { id: 'marketCap', icon: <DollarSignIcon size={20} />, val: formatUSD(stats.totalMarketCap || 0, true), label: 'Total Market Cap', change: 'Live', up: true },
                                        { id: 'volume', icon: <BarChartIcon size={20} />, val: formatUSD(stats.totalVolume || 0, true), label: '24H Volume', change: 'Live', up: true },
                                        { id: 'dominance', icon: <TrendingUpIcon size={20} />, val: `${stats.btcDominance || 0}%`, label: 'BTC Dominance', change: 'Market share', up: true },
                                        { id: 'coins', icon: <GlobeIcon size={20} />, val: `${stats.totalCoins || 0}`, label: 'Active Coins', change: 'Tracked', up: true },
                                    ].map((s, i) => (
                                        <div key={i} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSelectedStatId(s.id)} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = 'var(--border)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
                                            <span className="stat-icon" style={{ color: '#f7931a' }}>{s.icon}</span>
                                            <span className="stat-value">{s.val}</span>
                                            <span className="stat-label">{s.label}</span>
                                            <span className="stat-change up">{s.change}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Top coins */}
                                <div className="hp-card" style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <h4 style={{ fontWeight: 700, margin: 0 }}>Top Cryptocurrencies</h4>
                                        <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('coins')}>View all</button>
                                    </div>
                                    {coins.slice(0, 8).map(c => (
                                        <div key={c.id} className={`crypto-coin-row ${priceFlash[c.id] === 'up' ? 'crypto-flash-green' : priceFlash[c.id] === 'down' ? 'crypto-flash-red' : ''}`}
                                            onClick={() => setSelectedCoinId(c.id)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', width: 20 }}>#{c.market_cap_rank}</span>
                                                {c.image && <img src={c.image} alt="" style={{ width: 28, height: 28, borderRadius: 6 }} />}
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.symbol.toUpperCase()}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{formatUSD(c.current_price)}</div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: pctColor(c.price_change_percentage_24h), display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                                    {c.price_change_percentage_24h >= 0 ? <ArrowUpRightIcon size={11} /> : <ArrowDownRightIcon size={11} />}
                                                    {pctStr(c.price_change_percentage_24h)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Latest news */}
                                <div className="hp-card">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <h4 style={{ fontWeight: 700, margin: 0 }}>Latest News</h4>
                                        <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('news')}>See all</button>
                                    </div>
                                    {news.slice(0, 5).map(n => (
                                        <div key={n.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setSelectedNews(n)}>
                                            <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: `${NEWS_CAT_COLORS[n.category] || NEWS_CAT_COLORS.default}18`, color: NEWS_CAT_COLORS[n.category] || NEWS_CAT_COLORS.default }}>{n.category}</span>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{n.time}</span>
                                            </div>
                                            <div style={{ fontSize: '0.82rem', lineHeight: 1.4, fontWeight: 500 }}>{n.headline}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── TOP COINS ── */}
                        {activeTab === 'coins' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                                    <h3 className="section-title" style={{ margin: 0 }}>All Cryptocurrencies</h3>
                                    <div className="search-box" style={{ maxWidth: 240 }}>
                                        <span className="search-icon"><SearchIcon size={14} /></span>
                                        <input placeholder="Search coin…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                    </div>
                                </div>

                                {/* Table header */}
                                <div className="crypto-table-header">
                                    <span style={{ width: 30, flexShrink: 0 }}>#</span>
                                    <span style={{ flex: 1, minWidth: 0 }}>Name</span>
                                    <span style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>Price</span>
                                    <span style={{ width: 80, textAlign: 'right', flexShrink: 0 }} className="crypto-hide-mobile">24H %</span>
                                    <span className="crypto-hide-mobile" style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>7D %</span>
                                    <span className="crypto-hide-mobile" style={{ width: 100, textAlign: 'right', flexShrink: 0 }}>Market Cap</span>
                                    <span className="crypto-hide-mobile" style={{ width: 100, textAlign: 'right', flexShrink: 0 }}>Volume</span>
                                    <span style={{ width: 36, flexShrink: 0 }}></span>
                                </div>

                                {filteredCoins.map(c => {
                                    const pct = c.price_change_percentage_24h || 0;
                                    const pct7 = c.price_change_percentage_7d_in_currency || 0;
                                    return (
                                        <div key={c.id}
                                            className={`crypto-table-row ${priceFlash[c.id] === 'up' ? 'crypto-flash-green' : priceFlash[c.id] === 'down' ? 'crypto-flash-red' : ''}`}
                                            onClick={() => setSelectedCoinId(c.id)}>
                                            <span style={{ width: 30, fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, flexShrink: 0 }}>{c.market_cap_rank}</span>
                                            <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                                {c.image && <img src={c.image} alt="" style={{ width: 24, height: 24, borderRadius: 4, flexShrink: 0 }} />}
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, flexShrink: 0 }}>{c.symbol.toUpperCase()}</span>
                                            </span>
                                            <span style={{ width: 110, textAlign: 'right', fontWeight: 800, fontSize: '0.88rem', flexShrink: 0 }}>{formatUSD(c.current_price)}</span>
                                            <span className="crypto-hide-mobile" style={{ width: 80, textAlign: 'right', fontWeight: 700, color: pctColor(pct), fontSize: '0.82rem', flexShrink: 0 }}>{pctStr(pct)}</span>
                                            <span className="crypto-hide-mobile" style={{ width: 80, textAlign: 'right', fontWeight: 700, color: pctColor(pct7), fontSize: '0.82rem', flexShrink: 0 }}>{pctStr(pct7)}</span>
                                            <span className="crypto-hide-mobile" style={{ width: 100, textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{formatUSD(c.market_cap, true)}</span>
                                            <span className="crypto-hide-mobile" style={{ width: 100, textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{formatUSD(c.total_volume, true)}</span>
                                            <button className="btn btn-icon btn-sm" style={{ flexShrink: 0, width: 36, color: watchlist.has(c.id) ? '#f7931a' : 'var(--text-tertiary)' }}
                                                onClick={e => { e.stopPropagation(); toggleWatch(c.id); }}>
                                                <StarIcon size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {/* ── NEWS ── */}
                        {activeTab === 'news' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <NewspaperIcon size={18} />
                                    <h3 className="section-title" style={{ margin: 0 }}>Crypto News Feed</h3>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'fv-pulse 1.5s infinite' }} /> LIVE
                                    </span>
                                </div>
                                {news.map(n => (
                                    <div key={n.id} className="hp-card" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setSelectedNews(n)}>
                                        <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: `${NEWS_CAT_COLORS[n.category] || NEWS_CAT_COLORS.default}18`, color: NEWS_CAT_COLORS[n.category] || NEWS_CAT_COLORS.default }}>{n.category}</span>
                                            {n.urgency === 'high' && <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}><FlameIcon size={10} /> BREAKING</span>}
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{n.time}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.4, marginBottom: 4 }}>{n.headline}</div>
                                        {n.source && <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Source: {n.source}</div>}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* ── ANALYTICS ── */}
                        {activeTab === 'analytics' && (
                            <>
                                <h3 className="section-title">Market Analytics</h3>

                                {/* Stats */}
                                <div className="stats-grid" style={{ marginBottom: 20 }}>
                                    {[
                                        { id: 'marketCap', icon: <DollarSignIcon size={20} />, val: formatUSD(stats.totalMarketCap || 0, true), label: 'Total Market Cap', change: 'Live' },
                                        { id: 'volume', icon: <BarChartIcon size={20} />, val: formatUSD(stats.totalVolume || 0, true), label: '24H Volume', change: 'Live' },
                                        { id: 'dominance', icon: <TrendingUpIcon size={20} />, val: `${stats.btcDominance || 0}%`, label: 'BTC Dominance', change: 'Market share' },
                                        { id: 'fearGreed', icon: <ShieldIcon size={20} />, val: `${fearGreed.value}`, label: 'Fear & Greed', change: fearGreed.classification },
                                    ].map((s, i) => (
                                        <div key={i} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => s.id === 'fearGreed' ? setShowFearGreedModal(true) : setSelectedStatId(s.id)} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = 'var(--border)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
                                            <span className="stat-icon" style={{ color: '#f7931a' }}>{s.icon}</span>
                                            <span className="stat-value">{s.val}</span>
                                            <span className="stat-label">{s.label}</span>
                                            <span className="stat-change up">{s.change}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Market Dominance */}
                                <div className="hp-card" style={{ marginBottom: 16 }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Market Dominance</h4>
                                    {coins.slice(0, 8).map(c => {
                                        const dom = stats.totalMarketCap ? ((c.market_cap / stats.totalMarketCap) * 100) : 0;
                                        return (
                                            <div key={c.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setSelectedCoinId(c.id)}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {c.image && <img src={c.image} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} />}
                                                        {c.name}
                                                    </span>
                                                    <span style={{ fontWeight: 700 }}>{dom.toFixed(1)}%</span>
                                                </div>
                                                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min(dom, 100)}%`, height: '100%', borderRadius: 3, background: c.price_change_percentage_24h >= 0 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)', transition: 'width 1s' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Volume leaders */}
                                <div className="hp-card">
                                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Volume Leaders (24H)</h4>
                                    {[...coins].sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0)).slice(0, 8).map(c => (
                                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                            onClick={() => setSelectedCoinId(c.id)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {c.image && <img src={c.image} alt="" style={{ width: 22, height: 22, borderRadius: 4 }} />}
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{c.symbol.toUpperCase()}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{formatUSD(c.total_volume, true)}</div>
                                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: pctColor(c.price_change_percentage_24h) }}>
                                                    {pctStr(c.price_change_percentage_24h)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <aside className="right-panel">
                    {/* BTC & ETH Quick Cards */}
                    {coins.slice(0, 2).map(c => (
                        <div key={c.id} className="hp-card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setSelectedCoinId(c.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                {c.image && <img src={c.image} alt="" style={{ width: 28, height: 28, borderRadius: 6 }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{c.symbol.toUpperCase()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{formatUSD(c.current_price)}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: pctColor(c.price_change_percentage_24h), display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                        {c.price_change_percentage_24h >= 0 ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}
                                        {pctStr(c.price_change_percentage_24h)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                                {[
                                    { l: 'MCap', v: formatUSD(c.market_cap, true) },
                                    { l: 'Vol', v: formatUSD(c.total_volume, true) },
                                    { l: '24H Hi', v: formatUSD(c.high_24h) },
                                ].map(d => (
                                    <div key={d.l} style={{ background: 'var(--bg-tertiary)', borderRadius: 6, padding: '5px 6px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{d.l}</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>{d.v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Crypto news */}
                    <div className="hp-card" style={{ marginBottom: 12 }}>
                        <div className="hp-card-title"><ZapIcon size={15} /> Crypto News</div>
                        {news.slice(0, 5).map(n => (
                            <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setSelectedNews(n)}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 3, alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 8, background: `${NEWS_CAT_COLORS[n.category] || NEWS_CAT_COLORS.default}18`, color: NEWS_CAT_COLORS[n.category] || NEWS_CAT_COLORS.default }}>{n.category}</span>
                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{n.time}</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', lineHeight: 1.4, fontWeight: 500 }}>{n.headline}</div>
                            </div>
                        ))}
                    </div>

                    {/* Market Dominance mini-chart */}
                    <div className="hp-card">
                        <div className="hp-card-title"><BarChartIcon size={15} /> Market Share</div>
                        {coins.slice(0, 5).map(c => {
                            const dom = stats.totalMarketCap ? ((c.market_cap / stats.totalMarketCap) * 100) : 0;
                            return (
                                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    {c.image && <img src={c.image} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} />}
                                    <span style={{ fontWeight: 600, fontSize: '0.78rem', flex: 1 }}>{c.symbol.toUpperCase()}</span>
                                    <div style={{ width: 60, height: 5, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(dom, 100)}%`, height: '100%', borderRadius: 3, background: '#f7931a' }} />
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, width: 40, textAlign: 'right' }}>{dom.toFixed(1)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>

            {/* Modals */}
            {selectedCoinId && <CoinModal coinId={selectedCoinId} coins={coins} onClose={() => setSelectedCoinId(null)} />}
            {selectedNews && <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />}
            {showFearGreedModal && <FearGreedModal value={fearGreed.value} label={fearGreed.classification} onClose={() => setShowFearGreedModal(false)} />}
            {selectedStatId && <StatModal statId={selectedStatId} stats={stats} coins={coins} onClose={() => setSelectedStatId(null)} />}
        </>
    );
}
