'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/components/providers/SocketProvider';
import {
    SwordsIcon, PlusIcon, SearchIcon, UsersIcon, EyeIcon, ClockIcon,
    DollarSignIcon, TrophyIcon, FilterIcon, ZapIcon, TimerIcon, GlobeIcon,
    XIcon, CrownIcon, FlameIcon, MapPinIcon, ChevronDownIcon, LanguageIcon, MapIcon,
    RadioIcon, GiftIcon,
} from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { Debate, CountryLeaderEntry } from '@/lib/types';
import { COUNTRIES, LANGUAGES, DEBATE_TYPES, searchCountries, getCountryFlag, getCountryByName, GLOBAL_OPTION } from '@/lib/countries';
import type { CountryInfo } from '@/lib/countries';

const CATEGORIES = ['all', 'politics', 'crypto', 'business', 'tech', 'social', 'science', 'sports'] as const;
const STATUSES = ['all', 'waiting', 'live', 'voting', 'completed'] as const;
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced', 'pro'] as const;
const FEE_TYPES = ['all', 'free', 'paid'] as const;

const CATEGORY_COLORS: Record<string, string> = {
    politics: '#ef4444', crypto: '#f59e0b', business: '#3b82f6', tech: '#8b5cf6',
    social: '#ec4899', science: '#10b981', sports: '#f97316', other: '#6b7280',
};

function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function DebateCard({ debate }: { debate: Debate }) {
    const statusColors: Record<string, string> = {
        waiting: '#f59e0b', live: '#ef4444', voting: '#8b5cf6', completed: '#10b981', cancelled: '#6b7280',
    };
    const countryFlag = debate.country ? getCountryFlag(debate.country) : '';

    return (
        <Link href={`/debates/${debate._id}`} className="debate-card" id={`debate-${debate._id}`}>
            <div className="debate-card-top-row">
                <div className="debate-card-status" style={{ background: statusColors[debate.status] || '#6b7280' }}>
                    {debate.status === 'live' && <span className="live-pulse" />}
                    {debate.status.toUpperCase()}
                </div>
                <div className="debate-card-country-badge">
                    {countryFlag ? <span className="country-flag-sm">{countryFlag}</span> : <GlobeIcon size={14} />}
                    <span>{debate.country || 'Global'}</span>
                </div>
            </div>

            <div className="debate-card-category" style={{ color: CATEGORY_COLORS[debate.category] || '#6b7280' }}>
                {debate.category}
            </div>

            <h3 className="debate-card-title">{debate.title}</h3>
            <p className="debate-card-topic">{debate.topic}</p>

            <div className="debate-card-participants">
                <div className="debate-participant">
                    <UserAvatar name={debate.creator?.name || 'Creator'} avatar={debate.creator?.avatar} size="sm" />
                    <span className="debate-participant-name">{debate.creator?.name || 'Unknown'}</span>
                </div>
                <div className="debate-vs">
                    <SwordsIcon size={16} />
                    <span>VS</span>
                </div>
                <div className="debate-participant">
                    {debate.opponent ? (
                        <>
                            <UserAvatar name={debate.opponent.name} avatar={debate.opponent.avatar} size="sm" />
                            <span className="debate-participant-name">{debate.opponent.name}</span>
                        </>
                    ) : (
                        <div className="debate-waiting-opponent">
                            <div className="waiting-avatar">?</div>
                            <span>Waiting...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="debate-card-meta">
                <span className="debate-meta-item"><DollarSignIcon size={14} />${debate.entryFee}</span>
                <span className="debate-meta-item"><TrophyIcon size={14} />${debate.prizePool}</span>
                <span className="debate-meta-item"><TimerIcon size={14} />{debate.duration}m</span>
                <span className="debate-meta-item"><EyeIcon size={14} />{debate.spectatorCount || 0}</span>
            </div>

            {debate.tags && debate.tags.length > 0 && (
                <div className="debate-card-tags">
                    {debate.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="debate-tag">#{tag}</span>
                    ))}
                </div>
            )}

            <div className="debate-card-footer">
                <span className="debate-difficulty" data-diff={debate.difficulty}>{debate.difficulty}</span>
                <span className="debate-card-lang">{debate.language || 'English'}</span>
                <span className="debate-time">{formatTimeAgo(debate.createdAt)}</span>
            </div>

            {debate.status === 'completed' && debate.winner && (
                <div className="debate-winner-badge">
                    <TrophyIcon size={14} /> {debate.winner.name} won
                </div>
            )}

            {debate.isGlobal && (
                <div className="debate-global-badge">
                    <GlobeIcon size={12} /> Global
                </div>
            )}
        </Link>
    );
}

function CountryLeaderboard({ country, leaderboard }: { country: string; leaderboard: CountryLeaderEntry[] }) {
    if (leaderboard.length === 0) return null;
    const flag = getCountryFlag(country);

    return (
        <div className="country-leaderboard-panel">
            <div className="country-leaderboard-header">
                <CrownIcon size={18} />
                <h3>Top Debaters {flag ? <span className="country-flag-sm">{flag}</span> : <GlobeIcon size={16} />} {country}</h3>
            </div>
            <div className="country-leaderboard-list">
                {leaderboard.slice(0, 5).map((entry, i) => (
                    <div key={entry.user._id || i} className="country-leader-item">
                        <span className="leader-rank" data-rank={i + 1}>{i + 1}</span>
                        <UserAvatar name={entry.user.name} avatar={entry.user.avatar} size="sm" />
                        <div className="leader-info">
                            <span className="leader-name">{entry.user.name}</span>
                            <span className="leader-stats">{entry.wins}W · ${entry.earnings}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrendingSection({ debates, country }: { debates: Debate[]; country: string }) {
    if (debates.length === 0) return null;
    const flag = getCountryFlag(country);

    return (
        <div className="country-trending-panel">
            <div className="country-trending-header">
                <FlameIcon size={18} />
                <h3>Trending in {flag ? <span className="country-flag-sm">{flag}</span> : <GlobeIcon size={16} />} {country}</h3>
            </div>
            <div className="country-trending-list">
                {debates.slice(0, 5).map((d, i) => (
                    <Link key={d._id} href={`/debates/${d._id}`} className="trending-debate-item">
                        <span className="trending-rank">#{i + 1}</span>
                        <div className="trending-info">
                            <span className="trending-title">{d.title}</span>
                            <span className="trending-meta">
                                <EyeIcon size={12} /> {d.viewCount || 0}
                                {d.status === 'live' && <span className="trending-live">LIVE</span>}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function DebatesPage() {
    const { isLoggedIn } = useAuth();
    const { socket } = useSocket();
    const [debates, setDebates] = useState<Debate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [category, setCategory] = useState<string>('all');
    const [difficulty, setDifficulty] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Country state
    const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(GLOBAL_OPTION);
    const [countrySearch, setCountrySearch] = useState('');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [isLocalMode, setIsLocalMode] = useState(false);
    const [language, setLanguage] = useState('');
    const [debateType, setDebateType] = useState('');
    const [feeType, setFeeType] = useState('all');
    const [detectedCountry, setDetectedCountry] = useState<CountryInfo | null>(null);
    const [leaderboard, setLeaderboard] = useState<CountryLeaderEntry[]>([]);
    const [trending, setTrending] = useState<Debate[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<Debate[]>([]);
    const countryPickerRef = useRef<HTMLDivElement>(null);

    // Detect user country on mount
    useEffect(() => {
        const saved = localStorage.getItem('arizonalex_debate_country');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as CountryInfo;
                setSelectedCountry(parsed);
                setDetectedCountry(parsed);
                setIsLocalMode(parsed.code !== 'GLOBAL');
                return;
            } catch { /* ignore */ }
        }

        fetch('/api/country-data')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.country_name) {
                    const found = getCountryByName(data.country_name);
                    if (found) {
                        setDetectedCountry(found);
                        setSelectedCountry(found);
                        setIsLocalMode(true);
                        localStorage.setItem('arizonalex_debate_country', JSON.stringify(found));
                    }
                }
            })
            .catch(() => { /* fallback to global */ });
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('arizonalex_debate_country', JSON.stringify(selectedCountry));
    }, [selectedCountry]);

    // Close country picker on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (countryPickerRef.current && !countryPickerRef.current.contains(e.target as Node)) {
                setShowCountryPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchDebates = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all') params.set('status', activeTab);
            if (category !== 'all') params.set('category', category);
            if (difficulty !== 'all') params.set('difficulty', difficulty);
            if (search) params.set('search', search);
            if (language) params.set('language', language);
            if (debateType) params.set('debateType', debateType);
            if (feeType !== 'all') params.set('entryFeeType', feeType);

            // Country filter
            if (isLocalMode && selectedCountry.code !== 'GLOBAL') {
                params.set('country', selectedCountry.name);
                params.set('isGlobal', 'true'); // include global debates too
            }

            params.set('limit', '50');

            const res = await fetch(`/api/debates?${params}`);
            const data = await res.json();
            if (data.success) {
                setDebates(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch debates:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, category, difficulty, search, selectedCountry, isLocalMode, language, debateType, feeType]);

    // Fetch leaderboard & trending when country changes
    useEffect(() => {
        const countryParam = isLocalMode && selectedCountry.code !== 'GLOBAL' ? selectedCountry.name : 'GLOBAL';

        fetch(`/api/debates/leaderboard/${encodeURIComponent(countryParam)}`)
            .then(r => r.json())
            .then(data => { if (data.success) setLeaderboard(data.data); })
            .catch(() => {});

        fetch(`/api/debates/trending/${encodeURIComponent(countryParam)}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setTrending(data.data);
                    // Use trending as AI suggestions (simple algorithm)
                    setAiSuggestions(data.data.slice(0, 3));
                }
            })
            .catch(() => {});
    }, [selectedCountry, isLocalMode]);

    useEffect(() => { fetchDebates(); }, [fetchDebates]);

    useEffect(() => {
        if (!socket) return;
        const handleCreated = (debate: Debate) => {
            setDebates(prev => [debate, ...prev]);
        };
        const handleUpdated = (debate: Debate) => {
            setDebates(prev => prev.map(d => d._id === debate._id ? debate : d));
        };
        const handleCancelled = ({ debateId }: { debateId: string }) => {
            setDebates(prev => prev.map(d => d._id === debateId ? { ...d, status: 'cancelled' as const } : d));
        };
        socket.on('debate:created', handleCreated);
        socket.on('debate:joined', handleUpdated);
        socket.on('debate:started', handleUpdated);
        socket.on('debate:completed', handleUpdated);
        socket.on('debate:cancelled', handleCancelled);
        return () => {
            socket.off('debate:created', handleCreated);
            socket.off('debate:joined', handleUpdated);
            socket.off('debate:started', handleUpdated);
            socket.off('debate:completed', handleUpdated);
            socket.off('debate:cancelled', handleCancelled);
        };
    }, [socket]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchDebates(), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, fetchDebates]);

    const selectCountry = (c: CountryInfo) => {
        setSelectedCountry(c);
        setCountrySearch('');
        setShowCountryPicker(false);
        if (c.code === 'GLOBAL') {
            setIsLocalMode(false);
        } else {
            setIsLocalMode(true);
        }
    };

    const toggleMode = () => {
        if (isLocalMode) {
            setIsLocalMode(false);
        } else {
            setIsLocalMode(true);
            if (selectedCountry.code === 'GLOBAL' && detectedCountry) {
                setSelectedCountry(detectedCountry);
            }
        }
    };

    const clearAllFilters = () => {
        setCategory('all');
        setDifficulty('all');
        setLanguage('');
        setDebateType('');
        setFeeType('all');
        setSearch('');
    };

    const activeFilterCount = [
        category !== 'all',
        difficulty !== 'all',
        language !== '',
        debateType !== '',
        feeType !== 'all',
    ].filter(Boolean).length;

    const filteredCountries = searchCountries(countrySearch);
    const liveCount = debates.filter(d => d.status === 'live').length;
    const waitingCount = debates.filter(d => d.status === 'waiting').length;

    return (
        <div className="page-container">
            <div className="feed-column">
                {/* Header */}
                <div className="page-header debate-page-header">
                    <div className="debate-header-left">
                        <SwordsIcon size={24} />
                        <h1>Debate Arena</h1>
                    </div>
                    <div className="debate-header-right">
                        {liveCount > 0 && (
                            <div className="debate-live-count">
                                <span className="live-pulse" />
                                {liveCount} Live
                            </div>
                        )}
                        <Link href="/debates/create" className="btn btn-primary btn-sm debate-create-btn" id="create-debate-btn">
                            <PlusIcon size={16} /> Create
                        </Link>
                    </div>
                </div>

                {/* Country Selector Bar */}
                <div className="country-filter-bar">
                    <div className="country-selector-section" ref={countryPickerRef}>
                        <button
                            className="country-main-btn"
                            onClick={() => setShowCountryPicker(!showCountryPicker)}
                            id="country-selector"
                        >
                            {selectedCountry.flag ? <span className="country-flag-lg">{selectedCountry.flag}</span> : <GlobeIcon size={18} />}
                            <span className="country-main-name">{selectedCountry.name}</span>
                            <ChevronDownIcon size={14} />
                        </button>

                        {showCountryPicker && (
                            <div className="country-picker-dropdown fade-in">
                                <div className="country-picker-search">
                                    <SearchIcon size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        autoFocus
                                        id="country-search-input"
                                    />
                                </div>
                                {detectedCountry && (
                                    <div className="country-detected-hint">
                                        <MapPinIcon size={14} />
                                        <span>Detected: {detectedCountry.flag} {detectedCountry.name}</span>
                                        <button onClick={() => selectCountry(detectedCountry)} className="country-use-detected">Use</button>
                                    </div>
                                )}
                                <div className="country-picker-list">
                                    <button
                                        className={`country-picker-item ${selectedCountry.code === 'GLOBAL' ? 'active' : ''}`}
                                        onClick={() => selectCountry(GLOBAL_OPTION)}
                                    >
                                        <GlobeIcon size={14} />
                                        <span>Global (All Countries)</span>
                                    </button>
                                    {filteredCountries.map(c => (
                                        <button
                                            key={c.code}
                                            className={`country-picker-item ${selectedCountry.code === c.code ? 'active' : ''}`}
                                            onClick={() => selectCountry(c)}
                                        >
                                            <span className="country-flag-sm">{c.flag}</span>
                                            <span>{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Local / Global Toggle */}
                    <div className="mode-toggle-wrap">
                        <button
                            className={`mode-toggle-btn ${!isLocalMode ? 'active' : ''}`}
                            onClick={() => setIsLocalMode(false)}
                            id="mode-global"
                        >
                            <GlobeIcon size={14} /> Global
                        </button>
                        <button
                            className={`mode-toggle-btn ${isLocalMode ? 'active' : ''}`}
                            onClick={toggleMode}
                            id="mode-local"
                        >
                            <MapPinIcon size={14} /> Local
                        </button>
                    </div>
                </div>

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                    <div className="ai-suggestions-bar">
                        <div className="ai-suggestions-label">
                            <ZapIcon size={14} />
                            <span>Recommended for you</span>
                        </div>
                        <div className="ai-suggestions-scroll">
                            {aiSuggestions.map(d => (
                                <Link key={d._id} href={`/debates/${d._id}`} className="ai-suggestion-chip">
                                    <span className="ai-sug-flag">{getCountryFlag(d.country) || <GlobeIcon size={12} />}</span>
                                    <span className="ai-sug-title">{d.title}</span>
                                    {d.status === 'live' && <span className="ai-sug-live">LIVE</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search & Filter Toggle */}
                <div className="debate-search-bar">
                    <div className="debate-search-input-wrap">
                        <SearchIcon size={18} />
                        <input type="text" placeholder="Search debates by topic, title, or tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="debate-search-input" id="debate-search" />
                    </div>
                    <button className={`debate-filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)} id="debate-filter-toggle">
                        <FilterIcon size={18} />
                        {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                    </button>
                </div>

                {/* Status Tabs */}
                <div className="tabs debate-tabs">
                    {STATUSES.map(s => (
                        <button key={s} className={`tab ${activeTab === s ? 'active' : ''}`} onClick={() => setActiveTab(s)} id={`tab-${s}`}>
                            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            {s === 'live' && liveCount > 0 && <span className="tab-badge live">{liveCount}</span>}
                            {s === 'waiting' && waitingCount > 0 && <span className="tab-badge">{waitingCount}</span>}
                        </button>
                    ))}
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="debate-filters-panel country-filters-panel fade-in">
                        <div className="filters-panel-header">
                            <h4><FilterIcon size={16} /> Advanced Filters</h4>
                            {activeFilterCount > 0 && (
                                <button className="clear-filters-btn" onClick={clearAllFilters}>Clear All</button>
                            )}
                        </div>

                        <div className="debate-filter-group">
                            <label className="debate-filter-label">Category</label>
                            <div className="debate-filter-chips">
                                {CATEGORIES.map(c => (
                                    <button key={c} className={`debate-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}
                                        style={category === c && c !== 'all' ? { borderColor: CATEGORY_COLORS[c], color: CATEGORY_COLORS[c] } : {}}>
                                        {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="debate-filter-group">
                            <label className="debate-filter-label">Difficulty</label>
                            <div className="debate-filter-chips">
                                {DIFFICULTIES.map(d => (
                                    <button key={d} className={`debate-chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                                        {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="debate-filter-group">
                            <label className="debate-filter-label"><LanguageIcon size={14} /> Language</label>
                            <select className="debate-filter-select" value={language} onChange={(e) => setLanguage(e.target.value)} id="filter-language">
                                <option value="">All Languages</option>
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <div className="debate-filter-group">
                            <label className="debate-filter-label">Debate Type</label>
                            <div className="debate-filter-chips">
                                <button className={`debate-chip ${debateType === '' ? 'active' : ''}`} onClick={() => setDebateType('')}>All</button>
                                {DEBATE_TYPES.map(dt => (
                                    <button key={dt.value} className={`debate-chip ${debateType === dt.value ? 'active' : ''}`} onClick={() => setDebateType(dt.value)}>
                                        {dt.iconName === 'swords' && <SwordsIcon size={14} />}
                                        {dt.iconName === 'users' && <UsersIcon size={14} />}
                                        {dt.iconName === 'radio' && <RadioIcon size={14} />}
                                        {dt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="debate-filter-group">
                            <label className="debate-filter-label"><DollarSignIcon size={14} /> Entry Fee</label>
                            <div className="debate-filter-chips">
                                {FEE_TYPES.map(f => (
                                    <button key={f} className={`debate-chip ${feeType === f ? 'active' : ''}`} onClick={() => setFeeType(f)}>
                                        {f === 'all' ? 'All' : f === 'free' ? <><GiftIcon size={14} /> Free</> : <><DollarSignIcon size={14} /> Paid</>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filter Chips */}
                {activeFilterCount > 0 && (
                    <div className="active-filters-bar">
                        {category !== 'all' && (
                            <span className="active-filter-chip" style={{ borderColor: CATEGORY_COLORS[category] }}>
                                {category} <button onClick={() => setCategory('all')}><XIcon size={12} /></button>
                            </span>
                        )}
                        {difficulty !== 'all' && (
                            <span className="active-filter-chip">
                                {difficulty} <button onClick={() => setDifficulty('all')}><XIcon size={12} /></button>
                            </span>
                        )}
                        {language && (
                            <span className="active-filter-chip">
                                {language} <button onClick={() => setLanguage('')}><XIcon size={12} /></button>
                            </span>
                        )}
                        {debateType && (
                            <span className="active-filter-chip">
                                {debateType} <button onClick={() => setDebateType('')}><XIcon size={12} /></button>
                            </span>
                        )}
                        {feeType !== 'all' && (
                            <span className="active-filter-chip">
                                {feeType} <button onClick={() => setFeeType('all')}><XIcon size={12} /></button>
                            </span>
                        )}
                    </div>
                )}

                {/* Stats Bar */}
                <div className="debate-stats-bar">
                    <div className="debate-stat-pill">
                        {selectedCountry.flag ? <span className="country-flag-sm">{selectedCountry.flag}</span> : <GlobeIcon size={14} />}
                        <span>{isLocalMode ? selectedCountry.name : 'Worldwide'}</span>
                    </div>
                    <div className="debate-stat-pill"><ZapIcon size={14} /><span>{debates.length} debates</span></div>
                    <div className="debate-stat-pill live-pill"><span className="live-dot" /><span>{liveCount} live now</span></div>
                    <div className="debate-stat-pill"><UsersIcon size={14} /><span>{waitingCount} waiting</span></div>
                </div>

                {/* Trending Section (inline) */}
                {trending.length > 0 && (
                    <TrendingSection debates={trending} country={isLocalMode ? selectedCountry.name : 'Global'} />
                )}

                {/* Debate Grid */}
                <div className="debate-grid">
                    {loading ? (
                        <div className="debate-loading">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="debate-card-skeleton">
                                    <div className="skeleton-line w-40" />
                                    <div className="skeleton-line w-80" />
                                    <div className="skeleton-line w-60" />
                                    <div className="skeleton-row"><div className="skeleton-circle" /><div className="skeleton-line w-30" /></div>
                                </div>
                            ))}
                        </div>
                    ) : debates.length === 0 ? (
                        <div className="debate-empty">
                            <SwordsIcon size={48} />
                            <h3>No debates found</h3>
                            <p>
                                {isLocalMode
                                    ? `No debates in ${selectedCountry.name} yet. Be the first to create one!`
                                    : 'Be the first to create a debate and start earning!'}
                            </p>
                            <Link href="/debates/create" className="btn btn-primary"><PlusIcon size={18} /> Create Debate</Link>
                        </div>
                    ) : debates.map(debate => <DebateCard key={debate._id} debate={debate} />)}
                </div>

                {/* Leaderboard */}
                <CountryLeaderboard
                    country={isLocalMode ? selectedCountry.name : 'Global'}
                    leaderboard={leaderboard}
                />
            </div>
        </div>
    );
}
