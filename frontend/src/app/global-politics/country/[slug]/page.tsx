'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GlobeIcon, UsersIcon, LandmarkIcon, CalendarIcon, ShieldIcon, ZapIcon, StarIcon,
  TrendingUpIcon, BarChartIcon, ActivityIcon, ChevronRightIcon, ArrowUpRightIcon, SearchIcon
} from '@/components/ui/Icons';
import type { CountryData, Leader, RisingPolitician, TimelineEvent } from '@/lib/countries-data';

function Flag({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const width = size === 'sm' ? 40 : size === 'md' ? 80 : size === 'lg' ? 160 : 320;
  const displaySize = size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 48 : 80;
  return (
    <div style={{ 
      width: displaySize, 
      height: displaySize * 0.7, 
      flexShrink: 0, 
      borderRadius: size === 'sm' ? 4 : 10, 
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      background: 'rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src={`https://flagcdn.com/w${width}/${code.toLowerCase()}.png`}
        alt={code}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerText = code.toUpperCase();
            parent.style.fontSize = '0.7rem';
            parent.style.fontWeight = '900';
            parent.style.color = 'rgba(255,255,255,0.4)';
          }
        }}
      />
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: <GlobeIcon size={14} /> },
  { id: 'leaders', label: 'Leaders', icon: <UsersIcon size={14} /> },
  { id: 'timeline', label: 'Timeline', icon: <CalendarIcon size={14} /> },
  { id: 'rising', label: 'Rising Stars', icon: <TrendingUpIcon size={14} /> },
  { id: 'economy', label: 'Economy', icon: <BarChartIcon size={14} /> },
  { id: 'ai', label: 'AI Insights', icon: <ZapIcon size={14} /> },
];

function formatPop(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' Billion';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' Million';
  return n.toLocaleString();
}

function AIScoreRing({ value, label, color, size = 100 }: { value: number; label: string; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#grad-${label})`} strokeWidth="7"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size > 90 ? '1.5rem' : '1.1rem', fontWeight: 900, color }}>{value}</span>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>/100</span>
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 6, letterSpacing: '0.02em' }}>{label}</div>
    </div>
  );
}

function LeaderAvatar({ src, name, className, style }: { src: string, name: string, className?: string, style?: React.CSSProperties }) {
  return (
    <img 
      src={src} 
      alt={name} 
      className={className}
      style={style}
      onError={(e) => {
        const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random&bold=true`;
        if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
      }}
    />
  );
}

function TradingViewWidget({ symbol }: { symbol: string }) {
  const encodedSymbol = encodeURIComponent(symbol);
  const src = `https://s.tradingview.com/widgetembed/?symbol=${encodedSymbol}&interval=D&theme=dark&style=1&locale=en&allow_symbol_change=1&calendar=0&show_popup_button=1&popup_width=1000&popup_height=650`;

  return (
    <div className="gp-economy-chart-wrap" style={{ height: 450 }}>
      <iframe
        src={src}
        style={{ width: '100%', height: 450, border: 'none' }}
        title={`${symbol} Live Chart`}
        frameBorder="0"
        scrolling="no"
        allowFullScreen
      />
    </div>
  );
}

// ─── World Bank Live Chart (fallback for countries without TradingView data) ───

interface WBDataPoint { year: number; gdpGrowth: number | null; inflation: number | null; }

function WorldBankChart({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  const [data, setData] = useState<WBDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<'gdp' | 'inflation'>('gdp');

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const iso = countryCode.toLowerCase();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const [gdpRes, infRes] = await Promise.all([
        fetch(`/api/worldbank?country=${iso}&indicator=NY.GDP.MKTP.KD.ZG`, { signal: controller.signal }),
        fetch(`/api/worldbank?country=${iso}&indicator=FP.CPI.TOTL.ZG`, { signal: controller.signal }),
      ]);
      clearTimeout(timeout);

      const [gdpJson, infJson] = await Promise.all([gdpRes.json(), infRes.json()]);

      const gdpArr: any[] = Array.isArray(gdpJson) ? (gdpJson[1] || []) : [];
      const infArr: any[] = Array.isArray(infJson) ? (infJson[1] || []) : [];

      const map: Record<number, WBDataPoint> = {};
      gdpArr.forEach((d: any) => {
        const yr = parseInt(d.date);
        if (d.value !== null && !isNaN(yr)) {
          if (!map[yr]) map[yr] = { year: yr, gdpGrowth: null, inflation: null };
          map[yr].gdpGrowth = d.value;
        }
      });
      infArr.forEach((d: any) => {
        const yr = parseInt(d.date);
        if (d.value !== null && !isNaN(yr)) {
          if (!map[yr]) map[yr] = { year: yr, gdpGrowth: null, inflation: null };
          map[yr].inflation = d.value;
        }
      });

      const sorted = Object.values(map).sort((a, b) => a.year - b.year);
      setData(sorted);
      setLastUpdated(new Date());
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('WorldBank fetch failed:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [countryCode]);

  // SVG chart drawing
  const W = 800, H = 320, PAD = { top: 24, right: 24, bottom: 44, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const metric = activeMetric === 'gdp' ? 'gdpGrowth' : 'inflation';
  const metricColor = activeMetric === 'gdp' ? '#10b981' : '#f59e0b';
  const metricLabel = activeMetric === 'gdp' ? 'GDP Growth (%)' : 'Inflation Rate (%)';

  const validPoints = data.filter(d => d[metric] !== null);
  const values = validPoints.map(d => d[metric] as number);
  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 1);
  const range = maxV - minV || 1;

  const toX = (i: number) => PAD.left + (i / Math.max(validPoints.length - 1, 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minV) / range) * chartH;
  const zeroY = toY(0);

  const pathD = validPoints.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d[metric] as number).toFixed(1)}`).join(' ');
  const areaD = validPoints.length > 0
    ? `${pathD} L${toX(validPoints.length - 1).toFixed(1)},${Math.min(zeroY, PAD.top + chartH).toFixed(1)} L${toX(0).toFixed(1)},${Math.min(zeroY, PAD.top + chartH).toFixed(1)} Z`
    : '';

  const xTicks = validPoints.filter((_, i) => validPoints.length <= 8 || i % Math.ceil(validPoints.length / 8) === 0);
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => minV + (range * i) / (yTickCount - 1));

  return (
    <div className="gp-economy-chart-wrap" style={{ height: 'auto', minHeight: 450, background: 'var(--bg-tertiary)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>World Bank — Live Intelligence</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>{countryName} · {metricLabel}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Metric Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {(['gdp', 'inflation'] as const).map(m => (
              <button key={m} onClick={() => setActiveMetric(m)} style={{
                padding: '5px 12px', fontSize: '0.68rem', fontWeight: 800,
                background: activeMetric === m ? (m === 'gdp' ? '#10b981' : '#f59e0b') : 'transparent',
                color: activeMetric === m ? '#000' : 'var(--text-tertiary)',
                border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all 0.2s'
              }}>
                {m === 'gdp' ? 'GDP Growth' : 'Inflation'}
              </button>
            ))}
          </div>
          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.6rem', fontWeight: 800, color: '#10b981', background: '#10b98115', padding: '4px 8px', borderRadius: 6, border: '1px solid #10b98130' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              LIVE · WB Data
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 12 }}>
          <div className="gp-loader" />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Loading economic data...</div>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: '2rem', opacity: 0.3 }}>⚠</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Failed to load economic data</div>
          <button onClick={fetchData} style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      ) : validPoints.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 12 }}>
          <BarChartIcon size={40} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 700 }}>No data available for this indicator</div>
        </div>
      ) : (
        <div style={{ position: 'relative', padding: '0 4px 4px' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id={`wbGrad-${countryCode}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricColor} stopOpacity="0.35" />
                <stop offset="100%" stopColor={metricColor} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((v, i) => (
              <g key={i}>
                <line x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)}
                  stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 0 && v === 0 ? 'none' : '4,4'} />
                <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                  {v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}%
                </text>
              </g>
            ))}

            {/* Zero line */}
            {minV < 0 && (
              <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY}
                stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            )}

            {/* Area fill */}
            {areaD && (
              <path d={areaD} fill={`url(#wbGrad-${countryCode})`} />
            )}

            {/* Line */}
            {pathD && (
              <path d={pathD} fill="none" stroke={metricColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px ${metricColor}80)` }} />
            )}

            {/* X-axis labels */}
            {xTicks.map((d) => {
              const idx = validPoints.indexOf(d);
              return (
                <text key={d.year} x={toX(idx)} y={H - 10} textAnchor="middle"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                  {d.year}
                </text>
              );
            })}

            {/* Dots + hover */}
            {validPoints.map((d, i) => {
              const cx = toX(i);
              const cy = toY(d[metric] as number);
              const isH = hovered === i;
              const val = d[metric] as number;
              return (
                <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                  <circle cx={cx} cy={cy} r={isH ? 7 : 4} fill={metricColor}
                    stroke={isH ? '#fff' : 'var(--bg-tertiary)'} strokeWidth={isH ? 2 : 1.5}
                    style={{ transition: 'r 0.15s', filter: isH ? `drop-shadow(0 0 8px ${metricColor})` : 'none' }} />
                  {isH && (
                    <g>
                      <rect x={cx - 42} y={cy - 36} width={84} height={28} rx={7}
                        fill="rgba(15,20,40,0.92)" stroke={metricColor} strokeWidth="1" />
                      <text x={cx} y={cy - 18} textAnchor="middle"
                        style={{ fontSize: 11, fill: '#fff', fontWeight: 900 }}>
                        {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}%
                      </text>
                      <text x={cx} y={cy - 36 + 20} textAnchor="middle"
                        style={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                        {d.year}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Latest value callout */}
          {validPoints.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '8px 16px 16px', flexWrap: 'wrap' }}>
              {(['gdp', 'inflation'] as const).map(m => {
                const key = m === 'gdp' ? 'gdpGrowth' : 'inflation';
                const last = data.filter(d => d[key] !== null).reverse()[0];
                if (!last) return null;
                const v = last[key] as number;
                const c = m === 'gdp' ? '#10b981' : '#f59e0b';
                return (
                  <div key={m} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {m === 'gdp' ? 'Latest GDP Growth' : 'Latest Inflation'} · {last.year}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: c }}>
                      {v >= 0 ? '+' : ''}{v.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>World Bank Open Data</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function EconomySection({ economy, countryCode, countryName }: { economy: CountryData['economy']; countryCode: string; countryName: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="gp-economy-grid">
        <div className="gp-economy-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <LandmarkIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Economic Outlook</h3>
              <p className="text-xs text-slate-400 font-medium">Updated 24H Live</p>
            </div>
          </div>
          
          <div className="gp-economy-kpi-grid">
            <div className="gp-economy-kpi">
              <div className="gp-economy-kpi-label">Nominal GDP</div>
              <div className="gp-economy-kpi-value">{economy.gdp}</div>
            </div>
            <div className="gp-economy-kpi">
              <div className="gp-economy-kpi-label">Annual Growth</div>
              <div className="gp-economy-kpi-value text-emerald-400">{economy.growth}</div>
            </div>
            <div className="gp-economy-kpi">
              <div className="gp-economy-kpi-label">Inflation Rate</div>
              <div className="gp-economy-kpi-value text-amber-400">{economy.inflation}</div>
            </div>
            <div className="gp-economy-kpi">
              <div className="gp-economy-kpi-label">Unemployment</div>
              <div className="gp-economy-kpi-value">{economy.unemployment}</div>
            </div>
          </div>
          
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
            <div className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Intelligence Summary
            </div>
            <p className="text-[0.85rem] leading-relaxed text-slate-300 font-medium italic">
              &quot;{economy.summary}&quot;
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[0.68rem] font-bold text-slate-500">Official Currency:</span>
              <span className="text-[0.68rem] font-extrabold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/20">
                {economy.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="gp-economy-chart-container">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ActivityIcon size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Market Live Performance</span>
            </div>
            <div className="text-[0.6rem] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full animate-pulse border border-emerald-400/20">
              {economy.tradingViewSymbol ? 'LIVE DATA' : 'WORLD BANK LIVE'}
            </div>
          </div>
          {economy.tradingViewSymbol ? (
            <TradingViewWidget symbol={economy.tradingViewSymbol} />
          ) : (
            <WorldBankChart countryCode={countryCode} countryName={countryName} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StarIcon size={14} className="text-amber-400" />
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Live Economic Indicators</h3>
      </div>
      
      <div className="gp-indicators-board">
        {economy.indicators.map((ind, idx) => (
          <div key={idx} className="gp-indicator-card">
            <div className="gp-indicator-label">{ind.label}</div>
            <div className="gp-indicator-value-wrap">
              <div className="gp-indicator-value">{ind.value}</div>
              <div className={`gp-indicator-change gp-indicator-${ind.trend}`}>
                {ind.trend === 'up' && '+'}
                {ind.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderCard({ leader, role, accentColor }: { leader: Leader; role: string; accentColor: string }) {
  return (
    <div className="gp-profile-leader-card" style={{ '--leader-accent': accentColor } as React.CSSProperties}>
      <div className="gp-leader-card-top">
        <div className="gp-leader-card-photo-wrap" style={{ borderColor: accentColor }}>
          <LeaderAvatar src={leader.photo} name={leader.name} className="gp-leader-card-photo" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gp-leader-card-role" style={{ color: accentColor }}>{role}</div>
          <h3 className="gp-leader-card-name">{leader.name}</h3>
          <div className="gp-leader-card-position">{leader.position}</div>
        </div>
      </div>
      <div className="gp-leader-card-grid">
        {[
          { label: 'Party', value: leader.party, span: false },
          { label: 'Age', value: leader.age.toString(), span: false },
          { label: 'Ideology', value: leader.ideology, span: false },
          { label: 'Years in Power', value: leader.yearsInPower.toString(), span: false },
          { label: 'Education', value: leader.education, span: true },
        ].map((item, i) => (
          <div key={i} className="gp-leader-card-detail" style={item.span ? { gridColumn: '1 / -1' } : undefined}>
            <div className="gp-leader-card-detail-label">{item.label}</div>
            <div className="gp-leader-card-detail-value">{item.value}</div>
          </div>
        ))}
      </div>
      {leader.social?.twitter && (
        <a href={`https://twitter.com/${leader.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="gp-leader-card-social">
          𝕏 {leader.social.twitter} <ArrowUpRightIcon size={10} />
        </a>
      )}
    </div>
  );
}

function OverviewTab({ country }: { country: CountryData }) {
  return (
    <div className="gp-overview-grid">
      <div className="gp-overview-card gp-overview-card-leader">
        <div className="gp-oc-badge" style={{ color: '#3b82f6' }}>HEAD OF STATE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <LeaderAvatar src={country.headOfState.photo} name={country.headOfState.name} className="gp-oc-avatar" style={{ borderColor: '#3b82f6' }} />
          <div>
            <div className="gp-oc-name">{country.headOfState.name}</div>
            <div className="gp-oc-party">{country.headOfState.party}</div>
            <div className="gp-oc-ideology">{country.headOfState.ideology}</div>
          </div>
        </div>
      </div>
      {country.headOfGovernment && (
        <div className="gp-overview-card gp-overview-card-leader">
          <div className="gp-oc-badge" style={{ color: '#10b981' }}>HEAD OF GOVERNMENT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
            <LeaderAvatar src={country.headOfGovernment.photo} name={country.headOfGovernment.name} className="gp-oc-avatar" style={{ borderColor: '#10b981' }} />
            <div>
              <div className="gp-oc-name">{country.headOfGovernment.name}</div>
              <div className="gp-oc-party">{country.headOfGovernment.party}</div>
              <div className="gp-oc-ideology">{country.headOfGovernment.ideology}</div>
            </div>
          </div>
        </div>
      )}
      <div className="gp-overview-card" style={{ gridColumn: '1 / -1' }}>
        <div className="gp-oc-badge" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarIcon size={12} /> MOST FAMOUS POLITICAL LEADER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          {country.famousLeader.photo && (
            <LeaderAvatar src={country.famousLeader.photo} name={country.famousLeader.name} className="gp-oc-avatar" style={{ borderColor: '#f59e0b', width: 64, height: 64 }} />
          )}
          <div>
            <div className="gp-oc-name">{country.famousLeader.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{country.famousLeader.era}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>{country.famousLeader.description}</p>
      </div>
      <div className="gp-overview-card gp-ai-summary-card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZapIcon size={14} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary)' }}>AI Political Summary</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{country.aiSummary}</p>
      </div>

      {/* Economy Overview Card */}
      <div className="gp-overview-card" style={{ gridColumn: '1 / -1', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)' }}>
        <div className="gp-oc-badge" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <BarChartIcon size={12} /> ECONOMY OVERVIEW
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Nominal GDP</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{country.economy.gdp}</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Annual Growth</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{country.economy.growth}</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Inflation Rate</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>{country.economy.inflation}</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Currency</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6' }}>{country.economy.currency}</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', marginRight: 6 }}>Intelligence:</span>
          {country.economy.summary}
        </p>
      </div>

    </div>
  );
}

function LeadersTab({ country }: { country: CountryData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <LeaderCard leader={country.headOfState} role="Head of State" accentColor="#3b82f6" />
      {country.headOfGovernment && <LeaderCard leader={country.headOfGovernment} role="Head of Government" accentColor="#10b981" />}
      {country.oppositionLeader && <LeaderCard leader={country.oppositionLeader} role="Opposition Leader" accentColor="#ef4444" />}
    </div>
  );
}

function TimelineTab({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <div className="gp-timeline-container">
      <h3 style={{ fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <CalendarIcon size={20} /> Political Timeline
      </h3>
      {timeline.map((ev, i) => {
        const typeColor = ev.type === 'election' ? '#3b82f6' : ev.type === 'leader' ? '#8b5cf6' : '#f59e0b';
        return (
          <div key={i} className="gp-timeline-item">
            <div className="gp-timeline-line-col">
              <div className="gp-timeline-dot" style={{ background: `${typeColor}20`, color: typeColor, borderColor: `${typeColor}40` }}>
                {ev.year}
              </div>
              {i < timeline.length - 1 && <div className="gp-timeline-connector" />}
            </div>
            <div className="gp-timeline-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="gp-timeline-title">{ev.title}</span>
                <span className="gp-timeline-type-badge" style={{ background: `${typeColor}15`, color: typeColor }}>{ev.type}</span>
              </div>
              <p className="gp-timeline-desc">{ev.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RisingTab({ rising, countryName }: { rising: RisingPolitician[], countryName: string }) {
  return (
    <>
      {rising.length === 0 ? (
        <div className="gp-empty-state">
          <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.4 }}><UsersIcon size={48} /></div>
          <h3>No Rising Politicians Data</h3>
          <p>Data for rising politicians in {countryName} is being compiled.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rising.map((rp, i) => (
            <div key={i} className="gp-rising-card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ position: 'relative' }}>
                  <LeaderAvatar src={rp.photo} name={rp.name} style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'cover', border: '3px solid #f59e0b' }} />
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '2px solid var(--bg-secondary)' }}>
                    <TrendingUpIcon size={12} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{rp.name}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rp.position}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{rp.party}</div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Popularity Index</span>
                      <span style={{ fontWeight: 900, color: '#f59e0b', fontSize: '0.82rem' }}>{rp.popularity}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${rp.popularity}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: 4, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                  </div>
                  <div className="gp-prediction-box">
                    <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ZapIcon size={10} /> AI Prediction
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rp.prediction}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AITab({ scores, summary, democracyIndex, democracyLevel, rising, countryName }: { 
  scores: CountryData['aiScores'], 
  summary: string, 
  democracyIndex: number, 
  democracyLevel: { label: string, color: string },
  rising: RisingPolitician[],
  countryName: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="gp-ai-scores-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZapIcon size={16} />
          </div>
          <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.05rem' }}>AI Political Analysis</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          <AIScoreRing value={scores.influence} label="Influence" color="#3b82f6" />
          <AIScoreRing value={scores.popularity > 0 ? scores.popularity : 50} label="Popularity" color="#10b981" />
          <AIScoreRing value={scores.stability} label="Stability" color="#f59e0b" />
        </div>
      </div>
      <div className="gp-ai-detail-card">
        <h4 style={{ fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ActivityIcon size={16} /> Political Situation Summary
        </h4>
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>{summary}</p>
      </div>
      <div className="gp-ai-detail-card">
        <h4 style={{ fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChartIcon size={16} /> AI Predicted Next Leader
        </h4>
        {rising.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--bg-tertiary)', borderRadius: 14, border: '1px solid var(--border-light)' }}>
            <LeaderAvatar src={rising[0].photo} name={rising[0].name} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid #f59e0b' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{rising[0].name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{rising[0].prediction}</div>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, marginTop: 4 }}>Popularity: {rising[0].popularity}%</div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Insufficient data for prediction in {countryName}.</p>
        )}
      </div>
      <div className="gp-ai-detail-card">
        <h4 style={{ fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldIcon size={16} /> Democracy & Governance
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: democracyLevel.color }}>{democracyIndex}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: democracyLevel.color }}>{democracyLevel.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>The Economist Intelligence Unit Index</div>
          </div>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
          <div style={{
            width: `${democracyIndex * 10}%`, height: '100%', borderRadius: 5,
            background: `linear-gradient(90deg, ${democracyLevel.color}, ${democracyLevel.color}80)`,
            transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)'
          }} />
        </div>
      </div>
    </div>
  );
}

export default function CountryProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [country, setCountry] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!slug) return;
    // eslint-disable-next-line
    setLoading(true);
    fetch(`/api/global-politics/country/${slug}`)
      .then(r => r.json())
      .then(data => { if (data.country) setCountry(data.country); })
      .catch(err => console.error('Failed to fetch country', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <div className="gp-loader" />
        <p style={{ color: 'var(--text-tertiary)', marginTop: 18 }}>Loading country profile...</p>
      </div>
    );
  }

  if (!country) {
    return (
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.5 }}><GlobeIcon size={64} /></div>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Country Not Found</h2>
        <Link href="/global-politics" className="btn btn-primary" style={{ marginTop: 12 }}>← Back to All Countries</Link>
      </div>
    );
  }

  const democracyLevel = country.democracyIndex >= 8 ? { label: 'Full Democracy', color: '#10b981' }
    : country.democracyIndex >= 6 ? { label: 'Flawed Democracy', color: '#f59e0b' }
    : country.democracyIndex >= 4 ? { label: 'Hybrid Regime', color: '#f97316' }
    : { label: 'Authoritarian', color: '#ef4444' };

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 16px 60px' }}>
      <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
        <Link href="/global-politics" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <GlobeIcon size={13} /> Global Politics
        </Link>
        <ChevronRightIcon size={12} />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{country.name}</span>
      </div>

      <div className="gp-country-hero">
        <div className="gp-country-hero-inner">
          <div className="gp-hero-deco gp-hero-deco-1" />
          <div className="gp-hero-deco gp-hero-deco-2" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, flexWrap: 'wrap' }}>
              <Flag code={country.flag} size="xl" />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {country.name}
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                  {country.politicalSystem}
                </p>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: 12, background: `${democracyLevel.color}20`, border: `1px solid ${democracyLevel.color}40`, backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: 2 }}>DEMOCRACY INDEX</div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: democracyLevel.color }}>{country.democracyIndex}</div>
                <div style={{ fontSize: '0.62rem', color: democracyLevel.color, fontWeight: 700 }}>{democracyLevel.label}</div>
              </div>
            </div>
            <div className="gp-country-info-chips">
              {[
                { icon: <LandmarkIcon size={13} />, label: 'Capital', value: country.capital },
                { icon: <UsersIcon size={13} />, label: 'Population', value: formatPop(country.population) },
                { icon: <CalendarIcon size={13} />, label: 'Constitution', value: country.constitutionYear.toString() },
                { icon: <ShieldIcon size={13} />, label: 'Next Election', value: country.nextElection },
              ].map((s, i) => (
                <div key={i} className="gp-info-chip">
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="gp-tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`gp-tab ${activeTab === tab.id ? 'gp-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="fade-in" style={{ marginTop: 20 }}>
        {activeTab === 'overview' && <OverviewTab country={country} />}
        {activeTab === 'leaders' && <LeadersTab country={country} />}
        {activeTab === 'timeline' && <TimelineTab timeline={country.timeline} />}
        {activeTab === 'rising' && <RisingTab rising={country.risingPoliticians} countryName={country.name} />}
        {activeTab === 'economy' && <EconomySection economy={country.economy} countryCode={country.flag} countryName={country.name} />}
        {activeTab === 'ai' && (
          <AITab 
            scores={country.aiScores} 
            summary={country.aiSummary} 
            democracyIndex={country.democracyIndex} 
            democracyLevel={democracyLevel}
            rising={country.risingPoliticians}
            countryName={country.name}
          />
        )}
      </div>
    </div>
  );
}
