'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  GlobeIcon, SearchIcon, UsersIcon, LandmarkIcon, TrendingUpIcon, StarIcon,
  ChevronRightIcon, BarChartIcon, ActivityIcon, ShieldIcon, ZapIcon, ArrowUpRightIcon
} from '@/components/ui/Icons';

interface TrendingCountry {
  slug: string;
  name: string;
  flag: string;
  interestScore: number;
  reason: string;
}

interface RisingPolitician {
  name: string;
  photo: string;
  party: string;
  position: string;
  popularity: number;
  prediction: string;
  countryName: string;
  countrySlug: string;
  countryFlag: string;
  region: string;
}

function Flag({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' | 'lg' }) {
  const width = size === 'sm' ? 40 : size === 'md' ? 80 : 160;
  return (
    <div className="gp-card-flag-wrap" style={{ width: size === 'sm' ? 24 : size === 'md' ? 32 : 48, height: size === 'sm' ? 24 : size === 'md' ? 32 : 48 }}>
      <img 
        src={`https://flagcdn.com/w${width}/${code.toLowerCase()}.png`}
        alt={code}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover'
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerText = code.toUpperCase();
            parent.style.fontSize = '0.65rem';
            parent.style.fontWeight = '800';
            parent.style.color = 'var(--text-tertiary)';
          }
        }}
      />
    </div>
  );
}

function TrendingCard({ country }: { country: TrendingCountry }) {
  return (
    <Link href={`/global-politics/country/${country.slug}`} className="gp-trending-card">
      <Flag code={country.flag} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{country.name}</span>
          <span className="gp-trending-score">{country.interestScore}</span>
        </div>
        <div className="gp-trending-reason-label">
          <span style={{ opacity: 0.8, display: 'inline-flex' }}><ActivityIcon size={10} /></span>
          {country.reason}
        </div>
      </div>
    </Link>
  );
}

/** Convert hex like #f59e0b + opacity 0-1 to rgba string */
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function RisingPoliticianCard({ politician, rank }: { politician: RisingPolitician; rank: number }) {
  const accentColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
  const accent = accentColors[rank % accentColors.length];

  return (
    <Link href={`/global-politics/country/${politician.countrySlug}`} className="gp-fwl-card" style={{ '--fwl-accent': accent } as React.CSSProperties}>
      {/* Gradient accent top bar */}
      <div className="gp-fwl-accent-bar" />

      {/* Country flag + badge */}
      <div className="gp-fwl-country-row">
        <div className="gp-fwl-flag-badge">
          <img
            src={`https://flagcdn.com/w40/${politician.countryFlag.toLowerCase()}.png`}
            alt={politician.countryName}
            style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 2 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span>{politician.countryName}</span>
        </div>
        <span className="gp-fwl-rank">#{rank + 1}</span>
      </div>

      {/* Avatar */}
      <div className="gp-fwl-avatar-wrap">
        <img
          src={politician.photo}
          alt={politician.name}
          className="gp-fwl-avatar"
          onError={(e) => {
            const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.name)}&size=200&background=random&bold=true`;
            if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
          }}
        />
        {/* Popularity ring */}
        <svg className="gp-fwl-ring" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="44" cy="44" r="40" fill="none" stroke={accent} strokeWidth="3"
            strokeDasharray={`${(politician.popularity / 100) * 251.3} 251.3`}
            strokeLinecap="round" transform="rotate(-90 44 44)"
            style={{ filter: `drop-shadow(0 0 4px ${hexToRgba(accent, 0.4)})` }}
          />
        </svg>
      </div>

      {/* Popularity % badge (below avatar, not overlapping) */}
      <div className="gp-fwl-pop-badge" style={{ background: hexToRgba(accent, 0.12), color: accent, borderColor: hexToRgba(accent, 0.3) }}>
        {politician.popularity}% Popularity
      </div>

      {/* Name & Position */}
      <div className="gp-fwl-name">{politician.name}</div>
      <div className="gp-fwl-position">{politician.position}</div>

      {/* Party chip */}
      <div className="gp-fwl-party" style={{ background: hexToRgba(accent, 0.08), color: accent, borderColor: hexToRgba(accent, 0.2) }}>
        {politician.party}
      </div>

      {/* Divider */}
      <div className="gp-fwl-divider" />

      {/* Prediction */}
      <div className="gp-fwl-prediction">
        <div className="gp-fwl-pred-label">
          <ZapIcon size={9} />
          AI Prediction
        </div>
        <p className="gp-fwl-pred-text">{politician.prediction}</p>
      </div>

      {/* Arrow */}
      <div className="gp-fwl-arrow"><ArrowUpRightIcon size={13} /></div>
    </Link>
  );
}

interface CountrySummary {
  name: string; slug: string; flag: string; capital: string;
  population: number; region: string; politicalSystem: string; democracyIndex: number;
  headOfState: { name: string; position: string; photo: string; };
  headOfGovernment: { name: string; position: string; photo: string; } | null;
  famousLeader: string; risingPolitician: string | null;
  aiScores: { influence: number; popularity: number; stability: number; };
}

function formatPop(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toString();
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

function DemocracyBadge({ value }: { value: number }) {
  const level = value >= 8 ? { label: 'Full Democracy', color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
    : value >= 6 ? { label: 'Flawed Democracy', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
    : value >= 4 ? { label: 'Hybrid Regime', color: '#f97316', bg: 'rgba(249,115,22,0.12)' }
    : { label: 'Authoritarian', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  return (
    <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: level.bg, color: level.color, letterSpacing: '0.03em' }}>
      {value.toFixed(1)} · {level.label}
    </span>
  );
}

function LeaderAvatar({ src, name, className }: { src: string, name: string, className?: string }) {
  return (
    <img 
      src={src} 
      alt={name} 
      className={className}
      onError={(e) => {
        const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random&bold=true`;
        if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
      }}
    />
  );
}

export default function GlobalPoliticsPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [trending, setTrending] = useState<TrendingCountry[]>([]);
  const [risingPoliticians, setRisingPoliticians] = useState<RisingPolitician[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [democracyFilter, setDemocracyFilter] = useState(0);
  const [risingRegionFilter, setRisingRegionFilter] = useState('All');
  const [showAllRising, setShowAllRising] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch('/api/global-politics/trending');
      const data = await res.json();
      if (data.trending) setTrending(data.trending);
    } catch (err) {
      console.error('Failed to fetch trending countries', err);
    }
  }, []);

  const fetchRising = useCallback(async () => {
    try {
      const res = await fetch('/api/global-politics/rising');
      const data = await res.json();
      if (data.risingPoliticians) setRisingPoliticians(data.risingPoliticians);
    } catch (err) {
      console.error('Failed to fetch rising politicians', err);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (regionFilter) params.set('region', regionFilter);
      if (democracyFilter > 0) params.set('democracy', democracyFilter.toString());
      if (sortBy) params.set('sort', sortBy);
      const res = await fetch(`/api/global-politics/countries?${params}`);
      const data = await res.json();
      if (data.countries) setCountries(data.countries);
      if (data.regions) setRegions(data.regions);
    } catch (err) {
      console.error('Failed to fetch countries', err);
    } finally {
      setLoading(false);
    }
  }, [search, regionFilter, sortBy, democracyFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchCountries, 300);
    return () => clearTimeout(debounce);
  }, [fetchCountries]);

  useEffect(() => {
    fetchTrending();
    fetchRising();
    const interval = setInterval(fetchTrending, 60000);
    return () => clearInterval(interval);
  }, [fetchTrending, fetchRising]);

  const totalPop = countries.reduce((a, c) => a + c.population, 0);

  // Get unique regions from rising politicians
  const risingRegions = ['All', ...Array.from(new Set(risingPoliticians.map(r => r.region))).sort()];

  const filteredRising = risingPoliticians.filter(r =>
    risingRegionFilter === 'All' || r.region === risingRegionFilter
  );

  const displayedRising = showAllRising ? filteredRising : filteredRising.slice(0, 4);
  const displayedTrending = showAllTrending ? trending : trending.slice(0, 4);

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'block', minHeight: 'auto' }}>

      {/* ─── HERO HEADER ─── */}
      <div className="gp-hero">
        <div className="gp-hero-inner">
          {/* Decorative background circles */}
          <div className="gp-hero-deco gp-hero-deco-1" />
          <div className="gp-hero-deco gp-hero-deco-2" />
          <div className="gp-hero-deco gp-hero-deco-3" />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div className="gp-hero-icon">
                <GlobeIcon size={28} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: '#fff' }}>
                  Global Political Leaders
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: '2px 0 0', fontWeight: 500 }}>
                  Explore political leadership across the world
                </p>
              </div>
            </div>

            {/* Live Stats Ribbon */}
            <div className="gp-stats-ribbon">
              {[
                { icon: <GlobeIcon size={13} />, label: 'Countries', value: countries.length.toString(), color: '#60a5fa' },
                { icon: <UsersIcon size={13} />, label: 'Population', value: formatPop(totalPop), color: '#34d399' },
                { icon: <LandmarkIcon size={13} />, label: 'Regions', value: regions.length.toString(), color: '#a78bfa' },
                { icon: <TrendingUpIcon size={13} />, label: 'Rising Stars', value: risingPoliticians.length.toString(), color: '#fbbf24' },
              ].map((s, i) => (
                <div key={i} className="gp-stat-chip">
                  <span style={{ color: s.color, display: 'flex' }}>{s.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{s.value}</span>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── TRENDING SECTION ─── */}
      <div className="gp-trending-section">
        <div className="gp-trending-header">
          <div className="gp-trending-title">
            <span style={{ color: '#ef4444', display: 'flex' }}><TrendingUpIcon size={16} /></span>
            Trending Countries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            <div className="gp-live-pulse" />
            Live Updates
          </div>
        </div>
        <div className="gp-trending-grid">
          {trending.length > 0 ? (
            displayedTrending.map((c) => (
              <TrendingCard key={c.slug} country={c} />
            ))
          ) : (
            [...Array(4)].map((_, i) => (
              <div key={i} className="gp-trending-card" style={{ opacity: 0.5 }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg-tertiary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 10, width: 60, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 4 }} />
                  <div style={{ height: 8, width: 100, background: 'var(--bg-tertiary)', borderRadius: 2 }} />
                </div>
              </div>
            ))
          )}
        </div>
        {trending.length > 4 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              className="gp-fwl-show-more"
              onClick={() => setShowAllTrending(!showAllTrending)}
            >
              {showAllTrending ? 'Show Less' : `View All Trending Countries`}
              <span style={{ display: 'inline-flex', transform: showAllTrending ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }}><ChevronRightIcon size={14} /></span>
            </button>
          </div>
        )}
      </div>

      {/* ─── FUTURE WORLD LEADERS ─── */}
      {risingPoliticians.length > 0 && (
        <div className="gp-fwl-section">
          {/* Header */}
          <div className="gp-fwl-section-header">
            <div className="gp-fwl-section-title-row">
              <div className="gp-fwl-icon-wrap">
                <StarIcon size={18} />
              </div>
              <div>
                <h2 className="gp-fwl-h2">Future World Leaders</h2>
                <p className="gp-fwl-sub">Politicians predicted to rise to power across the globe</p>
              </div>
            </div>
            <div className="gp-fwl-ai-badge">
              <ZapIcon size={10} />
              AI POWERED
            </div>
          </div>

          {/* Region Filter */}
          <div className="gp-fwl-filters">
            {risingRegions.map(region => (
              <button
                key={region}
                className={`gp-fwl-filter-btn ${risingRegionFilter === region ? 'active' : ''}`}
                onClick={() => { setRisingRegionFilter(region); setShowAllRising(false); }}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="gp-fwl-grid">
            {displayedRising.map((politician, idx) => (
              <RisingPoliticianCard
                key={`${politician.countrySlug}-${politician.name}`}
                politician={politician}
                rank={risingPoliticians.indexOf(politician)}
              />
            ))}
          </div>

          {/* Show More */}
          {filteredRising.length > 8 && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button
                className="gp-fwl-show-more"
                onClick={() => setShowAllRising(!showAllRising)}
              >
                {showAllRising ? 'Show Less' : `View All ${filteredRising.length} Rising Politicians`}
                <span style={{ display: 'inline-flex', transform: showAllRising ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }}><ChevronRightIcon size={14} /></span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── SEARCH & FILTERS BAR ─── */}
      <div className="gp-filter-bar">
        <div className="gp-search-wrapper">
          <SearchIcon size={15} />
          <input
            placeholder="Search country, leader, or capital..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="global-politics-search"
            className="gp-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>✕</button>
          )}
        </div>
        <div className="gp-filter-group">
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="gp-filter-select" id="region-filter">
            <option value="">Global Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="gp-filter-select" id="sort-select">
            <option value="name">A → Z</option>
            <option value="population">Population ↓</option>
            <option value="democracy">Democracy ↓</option>
          </select>
          <select value={democracyFilter} onChange={e => setDemocracyFilter(Number(e.target.value))} className="gp-filter-select" id="democracy-filter">
            <option value="0">All Levels</option>
            <option value="8">Full (8+)</option>
            <option value="6">Flawed (6+)</option>
            <option value="4">Hybrid (4+)</option>
          </select>
        </div>
      </div>

      {/* ─── COUNTRY CARDS ─── */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="gp-loader" />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: 18 }}>Loading countries...</p>
        </div>
      ) : countries.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.5 }}><SearchIcon size={48} /></div>
          <h3 style={{ fontWeight: 800, marginBottom: 6 }}>No countries found</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="gp-cards-grid">
          {countries.map((country, idx) => (
            <Link
              key={country.slug}
              href={`/global-politics/country/${country.slug}`}
              className="gp-country-card"
              style={{ animationDelay: `${Math.min(idx * 30, 600)}ms` }}
              id={`card-${country.slug}`}
            >
              {/* Card Top: Flag + Country */}
              <div className="gp-card-header">
                <div className="gp-card-flag-wrap">
                  <Flag code={country.flag} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="gp-card-name">{country.name}</h3>
                  <div className="gp-card-meta">
                    {country.capital} · {formatPop(country.population)} · {country.region}
                  </div>
                </div>
                <div className="gp-card-arrow"><ArrowUpRightIcon size={14} /></div>
              </div>

              {/* Leaders Row */}
              <div className="gp-card-leaders">
                <div className="gp-leader-chip">
                  <LeaderAvatar src={country.headOfState.photo} name={country.headOfState.name} className="gp-leader-avatar" />
                  <div>
                    <div className="gp-leader-role">Head of State</div>
                    <div className="gp-leader-name">{country.headOfState.name}</div>
                  </div>
                </div>
                {country.headOfGovernment && (
                  <div className="gp-leader-chip">
                    <LeaderAvatar src={country.headOfGovernment.photo} name={country.headOfGovernment.name} className="gp-leader-avatar" />
                    <div>
                      <div className="gp-leader-role">Head of Gov.</div>
                      <div className="gp-leader-name">{country.headOfGovernment.name}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Famous & Rising */}
              <div className="gp-card-notable">
                <div className="gp-notable-item">
                  <span className="gp-notable-icon" style={{ color: '#f59e0b' }}><StarIcon size={12} /></span>
                  <span className="gp-notable-text">{typeof country.famousLeader === 'string' ? country.famousLeader : ''}</span>
                </div>
                {country.risingPolitician && typeof country.risingPolitician === 'string' && (
                  <div className="gp-notable-item">
                    <span className="gp-notable-icon" style={{ color: '#34d399' }}><TrendingUpIcon size={12} /></span>
                    <span className="gp-notable-text">{country.risingPolitician}</span>
                  </div>
                )}
              </div>

              {/* Bottom: AI + Democracy */}
              <div className="gp-card-footer">
                <div className="gp-card-scores">
                  <div className="gp-score-item">
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>INF</span>
                    <MiniBar value={country.aiScores.influence} color="#3b82f6" />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#60a5fa' }}>{country.aiScores.influence}</span>
                  </div>
                  <div className="gp-score-item">
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>STB</span>
                    <MiniBar value={country.aiScores.stability} color="#10b981" />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#34d399' }}>{country.aiScores.stability}</span>
                  </div>
                </div>
                <DemocracyBadge value={country.democracyIndex} />
              </div>

              {/* System badge */}
              <div className="gp-card-system">{country.politicalSystem}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
