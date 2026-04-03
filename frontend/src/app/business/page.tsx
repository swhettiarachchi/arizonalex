'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import {
    BriefcaseIcon, TrendingUpIcon, BarChartIcon, DollarSignIcon, GlobeIcon,
    ActivityIcon, CalendarIcon, LayersIcon, ZapIcon, CheckCircleIcon, ClockIcon,
    UsersIcon, FileTextIcon, ArrowUpRightIcon, ArrowDownRightIcon, ChevronRightIcon,
    SearchIcon, ScaleIcon, BuildingIcon, ShieldIcon, FlameIcon, XIcon
} from '@/components/ui/Icons';
import { formatNumber } from '@/lib/utils';
import { useAuthGate } from '@/components/providers/AuthGuard';

const TABS = [
    { id: 'overview', label: 'Overview', icon: <LayersIcon size={13} /> },
    { id: 'markets', label: 'Markets', icon: <BarChartIcon size={13} /> },
    { id: 'deals', label: 'Deals & M&A', icon: <ScaleIcon size={13} /> },
    { id: 'events', label: 'Events', icon: <CalendarIcon size={13} /> },
    { id: 'polls', label: 'Polls', icon: <ActivityIcon size={13} /> },
    { id: 'analytics', label: 'Analytics', icon: <ZapIcon size={13} /> },
];

const EVENT_COLORS: Record<string, string> = {
    summit: '#8b5cf6', conference: '#3b82f6', ipo: '#10b981',
    earnings: '#f59e0b', merger: '#ef4444', launch: '#06b6d4',
};

const DEAL_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    announced: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
};

const DEAL_TYPE_COLORS: Record<string, string> = {
    merger: '#ef4444', acquisition: '#8b5cf6', ipo: '#10b981',
    partnership: '#3b82f6', funding: '#f59e0b', launch: '#06b6d4',
};

export default function BusinessPage() {
    const { requireAuth } = useAuthGate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Static Data State
    const marketStats = [
        { label: 'S&P 500', val: '5,234.18', change: '+1.2%', up: true },
        { label: 'NASDAQ', val: '16,399.52', change: '+1.5%', up: true },
        { label: 'DOW JONES', val: '39,475.90', change: '+0.8%', up: true },
        { label: 'US 10Y', val: '4.21%', change: '-0.05', up: false }
    ];
    const liveMarketData = [
        { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, change: 1.2, current_price: 173.50, price_change_percentage_24h: 1.2 },
        { id: 'msft', symbol: 'MSFT', name: 'Microsoft Corp.', price: 425.22, change: 0.8, current_price: 425.22, price_change_percentage_24h: 0.8 },
        { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 895.14, change: 3.4, current_price: 895.14, price_change_percentage_24h: 3.4 },
        { id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', price: 175.34, change: -1.5, current_price: 175.34, price_change_percentage_24h: -1.5 },
        { id: 'amzn', symbol: 'AMZN', name: 'Amazon.com', price: 178.22, change: 0.5, current_price: 178.22, price_change_percentage_24h: 0.5 }
    ];
    const [sectors, setSectors] = useState<any[]>([]);
    const [econIndicators, setEconIndicators] = useState<any[]>([]);
    const [news, setNews] = useState<any[]>([]);
    const [dealsList, setDealsList] = useState<any[]>([]);
    const [companiesList, setCompaniesList] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [pollsList, setPollsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newsIsLive, setNewsIsLive] = useState(false);

    // Fetch all business data from APIs
    useEffect(() => {
        fetch('/api/business/companies').then(r => r.json()).then(d => { if (d.companies) setCompaniesList(d.companies); }).catch(() => { });
        fetch('/api/business/deals').then(r => r.json()).then(d => { if (d.deals) setDealsList(d.deals); }).catch(() => { });
        fetch('/api/business/sectors').then(r => r.json()).then(d => { if (d.sectors) setSectors(d.sectors); }).catch(() => { });
        fetch('/api/business/stats').then(r => r.json()).then(d => { if (d.economicIndicators) setEconIndicators(d.economicIndicators); }).catch(() => { });
        fetch('/api/business/events').then(r => r.json()).then(d => { if (d.events) setEvents(d.events); }).catch(() => { });
        fetch('/api/business/polls').then(r => r.json()).then(d => { if (d.polls) setPollsList(d.polls); }).catch(() => { });
    }, []);

    const fetchBusinessData = useCallback(async () => {
        try {
            const res = await fetch('/api/business/news');
            if (res.ok) {
                const data = await res.json();
                setNews(data.news || []);
                setNewsIsLive(data.isLive === true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBusinessData();
        const int = setInterval(fetchBusinessData, 60000); // 60s background poll
        return () => clearInterval(int);
    }, [fetchBusinessData]);

    const [selectedNews, setSelectedNews] = useState<any>(null);
    const [selectedMarket, setSelectedMarket] = useState<any>(null);
    const [selectedEcon, setSelectedEcon] = useState<any>(null);

    // --- Interactive Deals & M&A State ---
    const [toast, setToast] = useState<string | null>(null);
    const [analyzingDeal, setAnalyzingDeal] = useState<any | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{
        rationale: string; financials: string; regulatory: string;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFollowDeal = (deal: any) => requireAuth(() => {
        setToast(`Successfully followed: ${deal.title}. You will receive immediate alerts regarding this deal.`);
        setTimeout(() => setToast(null), 4000);
    });

    const handleAIAnalysis = (deal: any) => requireAuth(async () => {
        setAnalyzingDeal(deal);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolId: 'market', input: `Analyze this deal:\nTitle: ${deal.title}\nType: ${deal.type}\nParties: ${deal.parties}\nValue: ${deal.value}\nSector: ${deal.sector}\nStatus: ${deal.status}\n\nProvide analysis in exactly 3 sections: 1) STRATEGIC RATIONALE 2) FINANCIAL OUTLOOK 3) REGULATORY ENVIRONMENT. Keep each section to 2-3 sentences.` }),
            });
            const data = await res.json();
            if (data.success && data.output) {
                const sections = data.output.split(/\d+\)\s*|#{1,3}\s*/i).filter(Boolean);
                setAnalysisResult({
                    rationale: sections[0]?.replace(/strategic rationale:?/i, '').trim() || data.output.substring(0, data.output.length / 3),
                    financials: sections[1]?.replace(/financial outlook:?/i, '').trim() || data.output.substring(data.output.length / 3, (data.output.length / 3) * 2),
                    regulatory: sections[2]?.replace(/regulatory environment:?/i, '').trim() || data.output.substring((data.output.length / 3) * 2),
                });
            } else {
                setAnalysisResult({ rationale: 'Analysis unavailable. Please try again.', financials: '', regulatory: '' });
            }
        } catch {
            setAnalysisResult({ rationale: 'Failed to connect to AI service. Please try again.', financials: '', regulatory: '' });
        }
        setIsAnalyzing(false);
    });

    // --- Interactive Company Tracker State ---
    const [analyzingCompany, setAnalyzingCompany] = useState<any | null>(null);
    const [companyAnalysisResult, setCompanyAnalysisResult] = useState<{
        health: string; position: string; outlook: string;
    } | null>(null);
    const [isAnalyzingCompany, setIsAnalyzingCompany] = useState(false);

    const handleTrackCompany = (company: any) => requireAuth(() => {
        setToast(`Now tracking ${company.name} (${company.ticker}). Market updates will appear in your feed.`);
        setTimeout(() => setToast(null), 4000);
    });

    const handleCompanyAnalysis = (company: any) => requireAuth(async () => {
        setAnalyzingCompany(company);
        setIsAnalyzingCompany(true);
        setCompanyAnalysisResult(null);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolId: 'business', input: `Analyze this company:\nName: ${company.name}\nTicker: ${company.ticker}\nSector: ${company.sector}\nMarket Cap: ${company.marketCap}\nRevenue: ${company.revenue}\nCEO: ${company.ceo}\nPrice: ${company.price} (${company.change})\n\nProvide analysis in exactly 3 sections: 1) FINANCIAL HEALTH 2) COMPETITIVE POSITION 3) FORWARD OUTLOOK. Keep each section to 2-3 sentences.` }),
            });
            const data = await res.json();
            if (data.success && data.output) {
                const sections = data.output.split(/\d+\)\s*|#{1,3}\s*/i).filter(Boolean);
                setCompanyAnalysisResult({
                    health: sections[0]?.replace(/financial health:?/i, '').trim() || data.output.substring(0, data.output.length / 3),
                    position: sections[1]?.replace(/competitive position:?/i, '').trim() || data.output.substring(data.output.length / 3, (data.output.length / 3) * 2),
                    outlook: sections[2]?.replace(/forward outlook:?/i, '').trim() || data.output.substring((data.output.length / 3) * 2),
                });
            } else {
                setCompanyAnalysisResult({ health: 'Analysis unavailable. Please try again.', position: '', outlook: '' });
            }
        } catch {
            setCompanyAnalysisResult({ health: 'Failed to connect to AI service. Please try again.', position: '', outlook: '' });
        }
        setIsAnalyzingCompany(false);
    });

    // --- Interactive Sector State ---
    const [selectedSector, setSelectedSector] = useState<any | null>(null);
    const [sectorDetails, setSectorDetails] = useState<any | null>(null);
    const [isFetchingSector, setIsFetchingSector] = useState(false);

    const handleSectorClick = async (sectorObj: any) => {
        if (loading) return;
        setSelectedSector(sectorObj);
        setIsFetchingSector(true);
        setSectorDetails(null);

        try {
            const res = await fetch(`/api/business/sectors?sector=${encodeURIComponent(sectorObj.sector)}`);
            if (res.ok) {
                const data = await res.json();
                setSectorDetails(data);
            }
        } catch (error) {
            console.error('Failed to fetch sector details', error);
        } finally {
            setIsFetchingSector(false);
        }
    };

    // Static mode initialized

    const vote = (pollId: string, optIdx: number) =>
        requireAuth(() => {
            setPollsList(prev => prev.map(p => {
                if (p.id === pollId && p.voted === undefined) {
                    const newOpts = [...p.options];
                    newOpts[optIdx] = { ...newOpts[optIdx], votes: newOpts[optIdx].votes + 1 };
                    return { ...p, options: newOpts, voted: optIdx, totalVotes: (p.totalVotes || 0) + 1 };
                }
                return p;
            }));
        });

    const filteredCompanies = companiesList.filter(c =>
        !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="page-container home-3col">

                {/* ── LEFT SIDEBAR ── */}
                <aside className="home-left-panel">

                    {/* Sector mini snapshot */}
                    <div className="hp-card">
                        <div className="hp-card-title"><TrendingUpIcon size={15} /> Sector Performance</div>
                        {sectors.slice(0, 5).map((s, i) => (
                            <div key={i} onClick={() => handleSectorClick(s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} className="hover-highlight">
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.sector}</div>
                                    <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)' }}>{s.marketCap}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: s.positive ? '#10b981' : '#ef4444' }}>{s.ytd}</div>
                                    <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)' }}>YTD</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Economic indicators */}
                    <div className="hp-card">
                        <div className="hp-card-title"><ActivityIcon size={15} /> Economic Indicators</div>
                        {econIndicators.slice(0, 4).map(ec => (
                            <div key={ec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setSelectedEcon(ec)}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{ec.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{ec.period}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{ec.value}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: ec.positive ? '#10b981' : '#ef4444' }}>{ec.change}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── CENTER ── */}
                <div className="feed-column" style={{ minWidth: 0 }}>

                    {/* Breaking business news ticker */}
                    <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', overflowX: 'hidden', position: 'relative' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, whiteSpace: 'nowrap', background: newsIsLive ? '#ef4444' : 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em', zIndex: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {newsIsLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />}
                            LIVE
                        </span>
                        <div className="ticker-scroll" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                            {news.slice(0, 4).map(n => (
                                <span key={n.id} style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    onClick={() => setSelectedNews(n)}>
                                    <span style={{ color: n.urgency === 'high' ? '#ef4444' : 'var(--text-tertiary)', fontWeight: 700, marginRight: 4 }}>{n.category}</span>
                                    {n.headline}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Page header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BriefcaseIcon size={20} />
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Business Hub</h1>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: newsIsLive ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: newsIsLive ? '#10b981' : '#f59e0b', padding: '3px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {newsIsLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />}
                            {newsIsLive ? 'Live Updates' : 'Markets Open'}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
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
                                {/* Key metrics */}
                                <div className="stats-grid" style={{ marginBottom: 20 }}>
                                    {marketStats.map((s: any, i: number) => (
                                        <div key={i} className="stat-card">
                                            {/* Dynamic Icon rendering or fallback */}
                                            <span className="stat-icon" style={{ color: 'var(--primary)' }}><DollarSignIcon size={20} /></span>
                                            <span className="stat-value">{s.val}</span>
                                            <span className="stat-label">{s.label}</span>
                                            <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Top companies */}
                                <div className="hp-card" style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <h4 style={{ fontWeight: 700, margin: 0 }}>Top Companies</h4>
                                        <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('markets')}>View all</button>
                                    </div>
                                    {companiesList.slice(0, 4).map((c: any) => (
                                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color: 'white', flexShrink: 0 }}>{c.ticker}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{c.sector} · CEO: {c.ceo}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.price}</div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {c.positive ? <ArrowUpRightIcon size={11} /> : <ArrowDownRightIcon size={11} />}{c.change}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Upcoming events */}
                                <div className="hp-card" style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <h4 style={{ fontWeight: 700, margin: 0 }}>Upcoming Events</h4>
                                        <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('events')}>See all</button>
                                    </div>
                                    {events.slice(0, 3).map((ev: any) => (
                                        <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'flex-start' }}>
                                            <div style={{ width: 42, height: 42, borderRadius: 8, background: `${EVENT_COLORS[ev.type] || '#6366f1'}18`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${EVENT_COLORS[ev.type] || '#6366f1'}30` }}>
                                                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: EVENT_COLORS[ev.type] || '#6366f1', textTransform: 'uppercase' }}>{ev.type}</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ev.title}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{ev.date} · {ev.location}</div>
                                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: ev.impact === 'High' ? '#ef4444' : ev.impact === 'Medium' ? '#f59e0b' : '#10b981', marginTop: 4, display: 'inline-block' }}>{ev.impact} Impact</span>
                                            </div>
                                            <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => requireAuth(() => { })}>RSVP</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Latest deals */}
                                <div className="hp-card">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <h4 style={{ fontWeight: 700, margin: 0 }}>Latest Deals</h4>
                                        <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('deals')}>See all</button>
                                    </div>
                                    {dealsList.slice(0, 3).map((deal: any) => (
                                        <div key={deal.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{deal.title}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{deal.parties}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>{deal.value}</div>
                                                <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: 10, ...DEAL_STATUS_STYLE[deal.status] }}>{deal.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── MARKETS ── */}
                        {activeTab === 'markets' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                                    <h3 className="section-title" style={{ margin: 0 }}>Company Tracker</h3>
                                    <div className="search-box" style={{ maxWidth: 240 }}>
                                        <span className="search-icon"><SearchIcon size={14} /></span>
                                        <input placeholder="Search company or sector…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                    </div>
                                </div>
                                {filteredCompanies?.map((c: any) => (
                                    <div key={c?.id} className="hp-card" style={{ marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: 'white', flexShrink: 0 }}>{c?.ticker}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c?.name}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{c?.sector}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{c?.price || '--'}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: c?.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                                    {c?.positive ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}{c?.change || '--'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid-4" style={{ gap: 8 }}>
                                            {[
                                                { l: 'Market Cap', v: c?.marketCap },
                                                { l: 'Revenue', v: c?.revenue },
                                                { l: 'Employees', v: c?.employees },
                                                { l: 'CEO', v: c?.ceo },
                                            ].map((d, i) => (
                                                <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 2 }}>{d.l}</div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{d.v}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleTrackCompany(c)}>Track</button>
                                            <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleCompanyAnalysis(c)}>
                                                <ZapIcon size={14} /> Analyze
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="hp-card" style={{ marginTop: 16 }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Sector Performance Overview</h4>
                                    {sectors.map((s, i) => (
                                        <div key={i} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => handleSectorClick(s)} className="hover-scale">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>{s.sector}</span>
                                                <span style={{ display: 'flex', gap: 12 }}>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>{s.marketCap}</span>
                                                    <span style={{ fontWeight: 700, color: s.positive ? '#10b981' : '#ef4444' }}>{s.ytd} YTD</span>
                                                </span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(Math.abs(parseFloat(s.ytd)) * 2.5, 100)}%`, height: '100%', background: s.positive ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: 3 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── DEALS & M&A ── */}
                        {activeTab === 'deals' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <ScaleIcon size={18} />
                                    <h3 className="section-title" style={{ margin: 0 }}>Deals & M&A Tracker</h3>
                                </div>
                                {dealsList.map((deal: any) => (
                                    <div key={deal.id} className="hp-card" style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <div>
                                                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', background: `${DEAL_TYPE_COLORS[deal.type] || '#6366f1'}18`, color: DEAL_TYPE_COLORS[deal.type] || '#6366f1' }}>{deal.type}</span>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, ...DEAL_STATUS_STYLE[deal.status] }}>{deal.status}</span>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 10 }}>{deal.sector}</span>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{deal.title}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{deal.parties}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{deal.value}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{deal.date}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleFollowDeal(deal)}>Follow Deal</button>
                                            <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleAIAnalysis(deal)}>
                                                <ZapIcon size={14} /> AI Analysis
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* ── EVENTS ── */}
                        {activeTab === 'events' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <CalendarIcon size={18} />
                                    <h3 className="section-title" style={{ margin: 0 }}>Business Calendar</h3>
                                </div>
                                {events.map((ev: any) => (
                                    <div key={ev.id} className="hp-card" style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
                                                <div style={{ background: `${EVENT_COLORS[ev.type] || '#6366f1'}18`, border: `1px solid ${EVENT_COLORS[ev.type] || '#6366f1'}30`, borderRadius: 10, padding: '6px 4px' }}>
                                                    <div style={{ fontSize: '0.55rem', fontWeight: 800, color: EVENT_COLORS[ev.type] || '#6366f1', textTransform: 'uppercase' }}>{ev.date.split(' ')[0]}</div>
                                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1, marginTop: 2 }}>{ev.date.split(' ')[1]?.replace(',', '')}</div>
                                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{ev.date.split(' ')[2]}</div>
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', background: `${EVENT_COLORS[ev.type] || '#6366f1'}18`, color: EVENT_COLORS[ev.type] || '#6366f1' }}>{ev.type}</span>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: ev.impact === 'High' ? 'rgba(239,68,68,0.1)' : ev.impact === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: ev.impact === 'High' ? '#ef4444' : ev.impact === 'Medium' ? '#f59e0b' : '#10b981' }}>{ev.impact} Impact</span>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{ev.title}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>{ev.description}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', gap: 12 }}>
                                                    <span><CalendarIcon size={11} /> {ev.location}</span>
                                                    {ev.company && <span><BuildingIcon size={11} /> {ev.company}</span>}
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => { })}>RSVP</button>
                                                    <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Add to Calendar</button>
                                                    <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Share</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* ── POLLS ── */}
                        {activeTab === 'polls' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <ActivityIcon size={18} />
                                    <h3 className="section-title" style={{ margin: 0 }}>Business Pulse Polls</h3>
                                </div>
                                {pollsList.map((poll: any) => {
                                    const voted = poll.voted;
                                    const hasVoted = voted !== undefined;
                                    const total = poll.options.reduce((a: number, o: any) => a + o.votes, 0);
                                    return (
                                        <div key={poll.id} className="hp-card" style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>{poll.question}</div>
                                            {poll.options.map((opt: any, idx: number) => {
                                                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                                                const isWinner = opt.votes === Math.max(...poll.options.map((o: any) => o.votes));
                                                return (
                                                    <div key={idx} style={{ marginBottom: 8 }}>
                                                        {hasVoted ? (
                                                            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1px solid ${voted === idx ? 'var(--primary)' : 'var(--border)'}` }}>
                                                                <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: voted === idx ? 'rgba(59,130,246,0.15)' : 'var(--bg-tertiary)', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                                                                <div style={{ position: 'relative', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                                    <span style={{ fontWeight: isWinner ? 700 : 500 }}>{opt.label} {isWinner && '🏆'}</span>
                                                                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: voted === idx ? 'var(--primary)' : 'inherit' }}>{pct}%</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => vote(poll.id, idx)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', color: 'inherit' }}>
                                                                {opt.label}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                                                <span><UsersIcon size={11} /> {formatNumber(poll.totalVotes)} votes</span>
                                                <span><ClockIcon size={11} /> Ends {poll.endDate}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {/* ── ANALYTICS ── */}
                        {activeTab === 'analytics' && (
                            <>
                                <h3 className="section-title">Business Analytics</h3>
                                <div className="stats-grid" style={{ marginBottom: 20 }}>
                                    {[
                                        { icon: <DollarSignIcon size={20} />, val: '$38.5T', label: 'Global Market Cap', change: '+2.1%', up: true },
                                        { icon: <TrendingUpIcon size={20} />, val: '41.2%', label: 'Best Sector (Crypto)', change: '+YTD', up: true },
                                        { icon: <ScaleIcon size={20} />, val: '5', label: 'Active M&A Deals', change: '+2 this month', up: true },
                                        { icon: <ActivityIcon size={20} />, val: '2.8%', label: 'GDP Growth Q4', change: '+0.3%', up: true },
                                    ].map((s, i) => (
                                        <div key={i} className="stat-card">
                                            <span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span>
                                            <span className="stat-value">{s.val}</span>
                                            <span className="stat-label">{s.label}</span>
                                            <span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="hp-card" style={{ marginBottom: 16 }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Sector Returns — YTD 2026</h4>
                                    {sectors.map((s, i) => (
                                        <div key={i} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>{s.sector}</span>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Monthly: <strong style={{ color: s.positive ? '#10b981' : '#ef4444' }}>{s.monthly}</strong></span>
                                                    <span style={{ fontWeight: 700, color: s.positive ? '#10b981' : '#ef4444' }}>{s.ytd} YTD</span>
                                                </div>
                                            </div>
                                            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(Math.abs(parseFloat(s.ytd)) * 2.2, 100)}%`, height: '100%', borderRadius: 4, background: s.positive ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)', transition: 'width 1s' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="hp-card">
                                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Key Economic Indicators</h4>
                                    {econIndicators.map((ec: any) => (
                                        <div key={ec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setSelectedEcon(ec)}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ec.label}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{ec.period}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{ec.value}</div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ec.positive ? '#10b981' : '#ef4444' }}>{ec.change}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <aside className="right-panel">
                    <div className="hp-card" style={{ marginBottom: 16 }}>
                        <div className="hp-card-title"><ZapIcon size={15} /> Business News</div>
                        {news.map((n: any) => (
                            <div key={n.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setSelectedNews(n)}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: n.urgency === 'high' ? 'rgba(239,68,68,0.12)' : 'var(--bg-tertiary)', color: n.urgency === 'high' ? '#ef4444' : 'var(--text-tertiary)' }}>{n.category}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{n.time}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.4, fontWeight: 500 }}>{n.headline}</div>
                            </div>
                        ))}
                    </div>

                    <div className="hp-card">
                        <div className="hp-card-title"><TrendingUpIcon size={15} /> Market Movers</div>
                        {liveMarketData.map((m: any) => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                onClick={() => setSelectedMarket(m)}>
                                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{m.symbol}</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{m.price}</div>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: m.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {m.positive ? <ArrowUpRightIcon size={10} /> : <ArrowDownRightIcon size={10} />}{m.change}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* News Detail Modal */}
            {selectedNews && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, width: '95%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Breaking News</h2>
                            <button className="btn btn-icon" onClick={() => setSelectedNews(null)}><ZapIcon size={18} /></button>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{
                                fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                                background: selectedNews.urgency === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                color: selectedNews.urgency === 'high' ? '#ef4444' : '#f59e0b'
                            }}>{selectedNews.category}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: 8 }}>{selectedNews.time}</span>
                        </div>
                        <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 16, color: 'var(--text-primary)' }}>{selectedNews.headline}</p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            This story is developing. Our editorial team is gathering more information and will provide a full analysis shortly.
                            Stay tuned to Arizonalex for live updates on this and other breaking business news.
                        </p>
                    </div>
                </div>,
                document.body
            )}

            {/* Market Detail Modal */}
            {selectedMarket && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedMarket(null)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '95%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedMarket.symbol}</h2>
                            <button className="btn btn-icon" onClick={() => setSelectedMarket(null)}><ZapIcon size={18} /></button>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 4 }}>{selectedMarket.price}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedMarket.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                {selectedMarket.positive ? <ArrowUpRightIcon size={18} /> : <ArrowDownRightIcon size={18} />}
                                {selectedMarket.change} today
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>MARKET CONTEXT</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                {selectedMarket.positive
                                    ? `${selectedMarket.symbol} is trending upward driven by positive policy outlooks and strong earnings. Analysts remain cautiously optimistic heading into the next quarter.`
                                    : `${selectedMarket.symbol} faces selling pressure amid macro uncertainty. Key support levels are being tested as investors await Fed guidance.`}
                            </p>
                        </div>
                        <a href={selectedMarket.url || `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(selectedMarket.symbol)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                            View on TradingView
                        </a>
                    </div>
                </div>,
                document.body
            )}

            {/* Econ Indicator Detail Modal */}
            {selectedEcon && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedEcon(null)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '95%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Economic Indicator</h2>
                            <button className="btn btn-icon" onClick={() => setSelectedEcon(null)}><ZapIcon size={18} /></button>
                        </div>
                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{selectedEcon.label}</h3>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{selectedEcon.period}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{selectedEcon.value}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedEcon.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 4 }}>
                                {selectedEcon.positive ? <ArrowUpRightIcon size={20} /> : <ArrowDownRightIcon size={20} />}
                                {selectedEcon.change}
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>INDICATOR CONTEXT</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                {selectedEcon.description}
                            </p>
                        </div>

                        <a href={selectedEcon.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }} onClick={() => setSelectedEcon(null)}>
                            View on TradingView
                        </a>
                    </div>
                </div>,
                document.body
            )}

            {/* AI Deal Analysis Modal */}
            {analyzingDeal && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => !isAnalyzing && setAnalyzingDeal(null)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <ZapIcon size={18} />
                                </div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>AI Deal Analysis</h2>
                            </div>
                            {!isAnalyzing && <button className="btn btn-icon" onClick={() => setAnalyzingDeal(null)}><XIcon size={20} /></button>}
                        </div>

                        <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{analyzingDeal.title}</h3>
                            <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span><strong>Value:</strong> {analyzingDeal.value}</span>
                                <span><strong>Sector:</strong> {analyzingDeal.sector}</span>
                            </div>
                        </div>

                        {isAnalyzing ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Consulting AI Financial Models...</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Analyzing market conditions, regulatory history, and sector trends.</p>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : analysisResult ? (
                            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}><BriefcaseIcon size={14} /> Strategic Rationale</h4>
                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{analysisResult.rationale}</p>
                                </div>
                                <div style={{ height: 1, background: 'var(--border-light)' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}><DollarSignIcon size={14} /> Financial Outlook</h4>
                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{analysisResult.financials}</p>
                                </div>
                                <div style={{ height: 1, background: 'var(--border-light)' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}><ShieldIcon size={14} /> Regulatory Environment</h4>
                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{analysisResult.regulatory}</p>
                                </div>
                                <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => setAnalyzingDeal(null)}>Close Overview</button>
                            </div>
                        ) : null}

                    </div>
                </div>,
                document.body
            )}

            {/* Sector Detail Modal */}
            {selectedSector && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => !isFetchingSector && setSelectedSector(null)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <TrendingUpIcon size={16} />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{selectedSector.sector}</h2>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live Sector Performance Analysis</div>
                            </div>
                            {!isFetchingSector && <button className="btn btn-icon" onClick={() => setSelectedSector(null)}><XIcon size={20} /></button>}
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginBottom: 20, background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8 }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Market Cap</div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedSector.marketCap}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>YTD Return</div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedSector.positive ? '#10b981' : '#ef4444' }}>{selectedSector.ytd}</div>
                            </div>
                        </div>

                        {isFetchingSector ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Fetching Live Market Data...</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Polling latest quotes and generating AI sector hypothesis.</p>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : sectorDetails ? (
                            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}><ZapIcon size={14} /> AI Sector Insight</h4>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{sectorDetails.insight}</p>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}><ActivityIcon size={14} /> Top Movers (Live ETF Holdings)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {sectorDetails.topMovers?.map((mover: any, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{mover.symbol}</div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{mover.price}</div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: mover.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                                        {mover.positive ? <ArrowUpRightIcon size={10} /> : <ArrowDownRightIcon size={10} />}{mover.change}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => setSelectedSector(null)}>Close Tracker</button>
                            </div>
                        ) : (
                            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Failed to load live data.</div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* AI Company Analysis Modal */}
            {analyzingCompany && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => !isAnalyzingCompany && setAnalyzingCompany(null)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <ZapIcon size={18} />
                                </div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>AI Company Intelligence</h2>
                            </div>
                            {!isAnalyzingCompany && <button className="btn btn-icon" onClick={() => setAnalyzingCompany(null)}><XIcon size={20} /></button>}
                        </div>

                        <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{analyzingCompany.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>({analyzingCompany.ticker})</span></h3>
                            <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span><strong>Sector:</strong> {analyzingCompany.sector}</span>
                                <span><strong>CEO:</strong> {analyzingCompany.ceo}</span>
                            </div>
                        </div>

                        {isAnalyzingCompany ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Aggregating 10-K Filings & Sentiment Data...</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Analyzing market volume, institutional holdings, and debt-to-equity ratios.</p>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : companyAnalysisResult ? (
                            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}><DollarSignIcon size={14} /> Financial Health</h4>
                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{companyAnalysisResult.health}</p>
                                </div>
                                <div style={{ height: 1, background: 'var(--border-light)' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}><TrendingUpIcon size={14} /> Market Position</h4>
                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{companyAnalysisResult.position}</p>
                                </div>
                                <div style={{ height: 1, background: 'var(--border-light)' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}><GlobeIcon size={14} /> Future Outlook</h4>
                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{companyAnalysisResult.outlook}</p>
                                </div>
                                <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => setAnalyzingCompany(null)}>Close Overview</button>
                            </div>
                        ) : null}

                    </div>
                </div>,
                document.body
            )}

            {/* Global Toast Notification */}
            {toast && typeof document !== 'undefined' && createPortal(
                <div className="fade-in" style={{
                    position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    padding: '12px 24px', borderRadius: 30, display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 9999
                }}>
                    <span style={{ color: '#10b981', display: 'flex' }}><CheckCircleIcon size={18} /></span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast}</span>
                </div>,
                document.body
            )}
        </>
    );
}
