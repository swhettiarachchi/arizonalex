'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import {
  stories, users, formatNumber,
  checkUserHasStory, breakingNews, marketData, activeBills,
  economicIndicators, sectorTrends, polls, events, promises
} from '@/lib/mock-data';
import {
  ImageIcon, VideoIcon, BarChartIcon, ThreadIcon, FileTextIcon, BotIcon,
  MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon, BookmarkIcon,
  ShareIcon, PlusIcon, SearchIcon, VerifiedIcon, TrendingUpIcon, XIcon, ZapIcon,
  LandmarkIcon, CalendarIcon, CheckCircleIcon, GlobeIcon, ClockIcon, ActivityIcon,
  TrendingDownIcon, BriefcaseIcon, DollarSignIcon, BuildingIcon, ChevronRightIcon,
  ArrowUpRightIcon, ArrowDownRightIcon, FlameIcon, CpuIcon, NewspaperIcon,
  LayersIcon, MapPinIcon, UsersIcon, ShieldIcon
} from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface UploadedFile { id: string; file: File; preview: string; type: 'image' | 'video'; }

const ROLE_LABELS: Record<string, string> = {
  politician: 'Politician', official: 'Gov. Official', journalist: 'Journalist',
  citizen: 'Citizen', admin: 'Admin', businessman: 'Businessman',
  entrepreneur: 'Entrepreneur', crypto_trader: 'Crypto Trader',
  stock_trader: 'Stock Trader', banker: 'Banker', doctor: 'Doctor',
  researcher: 'Researcher', academic: 'Academic', lawyer: 'Lawyer',
  judge: 'Judge', activist: 'Activist', celebrity: 'Celebrity', other: 'Other',
};

const BILL_STATUS: Record<string, { label: string; color: string }> = {
  floor_vote: { label: 'Floor Vote', color: '#ef4444' },
  committee: { label: 'In Committee', color: '#6366f1' },
  debate: { label: 'Under Debate', color: '#f59e0b' },
  passed: { label: 'Passed', color: '#10b981' },
};

const PROMISE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  kept: { label: 'Kept', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  broken: { label: 'Broken', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  pending: { label: 'Pending', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const SECTOR_COLORS: Record<string, string> = {
  Finance: '#f59e0b', Healthcare: '#10b981', Energy: '#3b82f6',
  Technology: '#8b5cf6', Policy: '#ef4444', Economy: '#06b6d4',
};

// ---- DETAIL MODAL (reusable) ----
function DetailModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, width: '95%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h2>
          <button className="btn btn-icon" onClick={onClose}><XIcon size={18} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ---- STORY UPLOAD ----
function StoryUploadModal({ onClose }: { onClose: () => void }) {
  const [storyFile, setStoryFile] = useState<UploadedFile | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    if (f.type.startsWith('image/') || f.type.startsWith('video/'))
      setStoryFile({ id: Date.now().toString(), file: f, preview: URL.createObjectURL(f), type: f.type.startsWith('image/') ? 'image' : 'video' });
  };

  return (
    <DetailModal title="Create Story" onClose={onClose}>
      {!storyFile ? (
        <div className="upload-dropzone" onClick={() => ref.current?.click()} style={{ marginTop: 0 }}>
          <div className="upload-dropzone-icon"><ImageIcon size={36} /></div>
          <div className="upload-dropzone-title">Upload a photo or video</div>
          <div className="upload-dropzone-subtitle">JPG, PNG, GIF, MP4 • Click to browse</div>
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12 }}>
          {storyFile.type === 'image'
            ? <img src={storyFile.preview} alt="Preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
            : <video src={storyFile.preview} controls style={{ width: '100%', maxHeight: 320 }} />}
          <button className="upload-preview-remove" onClick={() => { URL.revokeObjectURL(storyFile.preview); setStoryFile(null); }}><XIcon size={14} /></button>
        </div>
      )}
      {storyFile && (
        <>
          <textarea className="compose-textarea" placeholder="Add a caption..." value={caption} onChange={e => setCaption(e.target.value)} style={{ minHeight: 60, marginBottom: 12, fontSize: '0.9rem' }} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setPosting(true); setTimeout(() => { setPosted(true); setTimeout(onClose, 1200); }, 1000); }} disabled={posting}>
            {posted ? '✓ Story Posted!' : posting ? 'Posting...' : 'Share to Story'}
          </button>
        </>
      )}
      <input ref={ref} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => { handleFile(e.target.files); e.target.value = ''; }} />
    </DetailModal>
  );
}

// ---- MARKET DETAIL MODAL ----
function MarketModal({ item, onClose }: { item: typeof marketData[0]; onClose: () => void }) {
  if (!item) return null;
  return (
    <DetailModal title={item.symbol || 'Loading...'} onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 4 }}>{item.price || '--'}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {item.positive ? <ArrowUpRightIcon size={18} /> : <ArrowDownRightIcon size={18} />}
          {item.change || '--'} today
        </div>
      </div>
      <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>MARKET CONTEXT</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {item.positive
            ? `${item.symbol} is trending upward driven by positive policy outlooks and strong earnings. Analysts remain cautiously optimistic heading into the next quarter.`
            : `${item.symbol} faces selling pressure amid macro uncertainty. Key support levels are being tested as investors await Fed guidance.`}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[['Open', item.price || '--'], ['High', item.price || '--'], ['Volume', '2.4B']].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 4 }}>{k}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{v}</div>
          </div>
        ))}
      </div>
      <a href={item.url || `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(item.symbol)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }} onClick={onClose}>
        View on TradingView
      </a>
    </DetailModal>
  );
}


// ---- BILL DETAIL MODAL ----
function BillModal({ bill, onClose }: { bill: typeof activeBills[0]; onClose: () => void }) {
  const st = BILL_STATUS[bill.status] || { label: bill.status, color: '#94a3b8' };
  const total = bill.forVotes + bill.againstVotes;
  const forPct = total > 0 ? Math.round((bill.forVotes / total) * 100) : 50;
  return (
    <DetailModal title={bill.code} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${st.color}20`, color: st.color, marginRight: 8 }}>{st.label}</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{bill.category} · {bill.impact}</span>
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10, lineHeight: 1.4 }}>{bill.title}</h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{bill.description}</p>
      {total > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 8 }}>Current Vote Count</div>
          <div style={{ height: 10, borderRadius: 5, display: 'flex', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${forPct}%`, background: 'linear-gradient(90deg,#10b981,#059669)' }} />
            <div style={{ width: `${100 - forPct}%`, background: 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>For: {bill.forVotes} ({forPct}%)</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Against: {bill.againstVotes} ({100 - forPct}%)</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
        <CalendarIcon size={14} /> Vote expected: <strong style={{ color: 'var(--text-primary)' }}>{bill.date}</strong>
        <span style={{ marginLeft: 'auto' }}>{bill.daysActive} days active</span>
      </div>
      <a href={(bill as any).url || `https://www.congress.gov/search?q=%7B"source":"legislation","search":"${encodeURIComponent(bill.code)}"%7D`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 14 }} onClick={onClose} target="_blank" rel="noopener noreferrer">
        View Full Bill Text
      </a>
    </DetailModal>
  );
}

// ---- ECON INDICATOR MODAL ----
function EconIndicatorModal({ item, onClose }: { item: typeof economicIndicators[0]; onClose: () => void }) {
  return (
    <DetailModal title="Economic Indicator" onClose={onClose}>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{item.label}</h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.period}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{item.value}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 4 }}>
          {item.positive ? <ArrowUpRightIcon size={20} /> : <ArrowDownRightIcon size={20} />}
          {item.change}
        </div>
      </div>

      <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>INDICATOR CONTEXT</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {item.description}
        </p>
      </div>

      <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }} onClick={onClose}>
        View on TradingView
      </a>
    </DetailModal>
  );
}

// ---- NEWS DETAIL MODAL ----
function NewsModal({ item, onClose }: { item: typeof breakingNews[0]; onClose: () => void }) {
  return (
    <DetailModal title="Breaking News" onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: item.urgency === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
          color: item.urgency === 'high' ? '#ef4444' : '#f59e0b'
        }}>{item.category}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: 8 }}>{item.time}</span>
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 16, color: 'var(--text-primary)' }}>{item.headline}</p>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        This story is developing. Our editorial team is gathering more information and will provide a full analysis shortly.
        Stay tuned to Arizonalex for live updates on this and other breaking political and business news.
      </p>
      <Link href="/explore" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }} onClick={onClose}>
        Explore Related Stories
      </Link>
    </DetailModal>
  );
}

// ---- LEFT SIDEBAR ----
function LeftSidebar({ requireAuth }: { requireAuth: (cb: () => void) => void }) {
  const [selectedBill, setSelectedBill] = useState<typeof activeBills[0] | null>(null);
  const [selectedEcon, setSelectedEcon] = useState<typeof economicIndicators[0] | null>(null);
  const [activePoll, setActivePoll] = useState(polls[1]);
  const [voted, setVoted] = useState<number | null>(null);

  // Auto-increment live poll votes
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePoll(prev => {
        // Randomly decide which option gets a few new votes
        const optIndexToIncrement = Math.floor(Math.random() * prev.options.length);
        const newVotes = Math.floor(Math.random() * 8) + 1; // 1 to 8 new votes

        return {
          ...prev,
          options: prev.options.map((opt, i) =>
            i === optIndexToIncrement ? { ...opt, votes: opt.votes + newVotes } : opt
          )
        };
      });
    }, 3500); // Update every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  const pollTotal = activePoll.options.reduce((s, o) => s + o.votes, 0);

  // Icons for each economic indicator
  const econIcons = [
    <TrendingUpIcon key="gdp" size={16} />,
    <DollarSignIcon key="cpi" size={16} />,
    <UsersIcon key="unemp" size={16} />,
    <BuildingIcon key="rate" size={16} />,
    <GlobeIcon key="trade" size={16} />,
    <ActivityIcon key="conf" size={16} />,
  ];

  return (
    <aside className="home-left-panel">
      {/* Economic Indicators */}
      <div className="hp-card">
        <div className="hp-card-title"><ActivityIcon size={15} /> Economic Indicators</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {economicIndicators.slice(0, 4).map((ind, i) => (
            <div key={ind.id} className="econ-tile" onClick={() => setSelectedEcon(ind)} style={{ cursor: 'pointer' }}>
              <div style={{ color: 'var(--primary)', marginBottom: 4 }}>{econIcons[i]}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 2, fontWeight: 600 }}>{ind.label}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{ind.value}</div>
              <div style={{ fontSize: '0.67rem', fontWeight: 700, color: ind.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                {ind.positive ? <ArrowUpRightIcon size={11} /> : <ArrowDownRightIcon size={11} />}
                {ind.change}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{ind.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Legislation */}
      <div className="hp-card">
        <div className="hp-card-title"><LandmarkIcon size={15} /> Active Legislation</div>
        {activeBills.slice(0, 3).map(bill => {
          const st = BILL_STATUS[bill.status] || { label: bill.status, color: '#94a3b8' };
          const total = bill.forVotes + bill.againstVotes;
          const forPct = total > 0 ? (bill.forVotes / total) * 100 : 50;
          return (
            <button key={bill.id} className="bill-item bill-item-btn" onClick={() => setSelectedBill(bill)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${st.color}20`, color: st.color }}>{st.label}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{bill.code}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4, lineHeight: 1.3 }}>{bill.title}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{bill.description}</div>
              {total > 0 && (
                <div>
                  <div className="bill-vote-bar">
                    <div style={{ width: `${forPct}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '3px 0 0 3px', transition: 'width 0.8s ease' }} />
                    <div style={{ width: `${100 - forPct}%`, height: '100%', background: 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: '0 3px 3px 0' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: '0.63rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>For: {bill.forVotes}</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>Against: {bill.againstVotes}</span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.62rem', background: 'var(--bg-tertiary)', borderRadius: 20, padding: '2px 7px', color: 'var(--text-secondary)', fontWeight: 600 }}>{bill.impact}</span>
                <ChevronRightIcon size={12} />
              </div>
            </button>
          );
        })}
        <Link href="/politics" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, textDecoration: 'none' }}>
          View all legislation <ChevronRightIcon size={13} />
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="hp-card">
        <div className="hp-card-title"><CalendarIcon size={15} /> Upcoming Events</div>
        {events.slice(0, 3).map(ev => (
          <Link key={ev.id} href="/politics" style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ minWidth: 40, textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '4px 0', flexShrink: 0 }}>
              <div style={{ fontSize: '0.56rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{ev.date.split(' ')[0]}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>{ev.date.split(' ')[1]?.replace(',', '')}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 2 }}>{ev.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPinIcon size={11} /> {ev.location}</div>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}><UsersIcon size={11} /> {formatNumber(ev.attendees)} attending</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Promise Tracker */}
      <div className="hp-card">
        <div className="hp-card-title"><CheckCircleIcon size={15} /> Promise Tracker</div>
        {promises.slice(0, 4).map(p => {
          const st = PROMISE_STATUS[p.status];
          return (
            <Link key={p.id} href="/politics" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: st.bg, color: st.color, whiteSpace: 'nowrap', marginTop: 1, flexShrink: 0 }}>{st.label}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{p.politician.name} · {p.category}</div>
              </div>
            </Link>
          );
        })}
        <Link href="/politics" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, textDecoration: 'none' }}>
          View all promises <ChevronRightIcon size={13} />
        </Link>
      </div>

      {/* Live Poll */}
      <div className="hp-card">
        <div className="hp-card-title"><BarChartIcon size={15} /> Live Poll</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>{activePoll.question}</div>
        {activePoll.options.map((opt, i) => {
          const pct = Math.round((opt.votes / pollTotal) * 100);
          const isVoted = voted === i;
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <button onClick={() => requireAuth(() => setVoted(i))} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${isVoted ? 'var(--primary)' : 'var(--border)'}`, background: 'var(--bg-tertiary)', transition: 'border-color 0.2s' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: voted !== null ? `${pct}%` : '0%', background: isVoted ? 'rgba(59,130,246,0.18)' : 'rgba(100,116,139,0.1)', transition: 'width 0.6s ease' }} />
                  <div style={{ position: 'relative', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: isVoted ? 700 : 500 }}>{opt.label}</span>
                    {voted !== null && <span style={{ fontWeight: 700, color: isVoted ? 'var(--primary)' : 'var(--text-secondary)' }}>{pct}%</span>}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><UsersIcon size={11} /> {formatNumber(pollTotal)} votes</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><ClockIcon size={11} /> Ends {activePoll.endDate}</span>
        </div>
      </div>

      {selectedBill && <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />}
      {selectedEcon && <EconIndicatorModal item={selectedEcon} onClose={() => setSelectedEcon(null)} />}
    </aside>
  );
}

// ---- RIGHT PANEL ----
function RightPanel({ requireAuth }: { requireAuth: (cb: () => void) => void }) {
  const [sentiment, setSentiment] = useState([
    { label: 'Bullish', pct: 58, color: '#10b981', Icon: TrendingUpIcon },
    { label: 'Neutral', pct: 24, color: '#f59e0b', Icon: ActivityIcon },
    { label: 'Bearish', pct: 18, color: '#ef4444', Icon: TrendingDownIcon }
  ]);
  const [liveTrends, setLiveTrends] = useState(sectorTrends);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live sentiment fluctuation
      setSentiment(prev => {
        let b = prev[0].pct;
        let n = prev[1].pct;

        // Random shift between -2 and +2
        const shift = Math.floor(Math.random() * 5) - 2;
        b = Math.max(20, Math.min(80, b + shift));

        // Adjust neutral slightly, bearish takes the rest
        n = Math.max(10, Math.min(100 - b - 10, n + (Math.floor(Math.random() * 3) - 1)));
        const r = 100 - b - n;

        return [
          { ...prev[0], pct: b },
          { ...prev[1], pct: n },
          { ...prev[2], pct: r }
        ];
      });

      // Simulate live post counts and trend changes
      setLiveTrends(prev => prev.map(trend => {
        const postsInc = Math.floor(Math.random() * 45) + 5; // 5 to 50 new posts
        const currentChangeNum = parseInt(trend.change.replace(/[^0-9-]/g, '')) || 0;
        const changeInc = Math.floor(Math.random() * 5) - 1; // Bias slightly upwards (-1 to +3)
        const newChange = currentChangeNum + changeInc;
        return {
          ...trend,
          posts: trend.posts + postsInc,
          change: newChange >= 0 ? `+${newChange}%` : `${newChange}%`
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="right-panel">
      <div className="search-box" style={{ marginBottom: 16 }}>
        <span className="search-icon"><SearchIcon size={16} /></span>
        <input type="text" placeholder="Search Arizonalex" />
      </div>

      {/* Market Sentiment */}
      <Link href="/business" className="hp-card" style={{ marginBottom: 16, display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="hp-card-title"><ActivityIcon size={15} /> Market Sentiment</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {sentiment.map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: 2 }}><s.Icon size={14} /></div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color, transition: 'all 0.3s ease' }}>{s.pct}%</div>
              <div style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 2 }}>
          <div style={{ width: `${sentiment[0].pct}%`, background: sentiment[0].color, borderRadius: '3px 0 0 3px', transition: 'width 0.5s ease-in-out' }} />
          <div style={{ width: `${sentiment[1].pct}%`, background: sentiment[1].color, transition: 'width 0.5s ease-in-out' }} />
          <div style={{ width: `${sentiment[2].pct}%`, background: sentiment[2].color, borderRadius: '0 3px 3px 0', transition: 'width 0.5s ease-in-out' }} />
        </div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
          <ActivityIcon size={10} /> Based on 2.4M signals · Updated live
        </div>
      </Link>

      {/* Sector Trends */}
      <div className="hp-card" style={{ marginBottom: 16 }}>
        <div className="hp-card-title"><TrendingUpIcon size={15} /> Sector Trends</div>
        {liveTrends.map(s => (
          <Link key={s.tag} href={`/explore?q=%23${s.tag}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: `${SECTOR_COLORS[s.sector] || '#94a3b8'}20`, color: SECTOR_COLORS[s.sector] || '#94a3b8' }}>{s.sector}</span>
                {s.hot && <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.58rem', fontWeight: 800, color: '#ef4444' }}><FlameIcon size={10} /> HOT</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: 3 }}>#{s.tag}</div>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)' }}>{formatNumber(s.posts)} posts</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
              <ArrowUpRightIcon size={13} />{s.change}
            </div>
          </Link>
        ))}
      </div>

      {/* Who to Follow */}
      <div className="hp-card">
        <h3 className="section-title" style={{ marginBottom: 12, fontSize: '0.93rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <UsersIcon size={15} /> Who to Follow
        </h3>
        {users.slice(0, 4).map(user => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
            <Link href={`/profile/${user.username}`}><UserAvatar name={user.name} avatar={user.avatar} size="sm" hasStory={checkUserHasStory(user.id)} /></Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/profile/${user.username}`} style={{ fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4, color: 'inherit', textDecoration: 'none' }}>
                {user.name} {user.verified && <VerifiedIcon size={12} />}
              </Link>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>@{user.username}</div>
              <span className={`role-badge role-${user.role}`} style={{ fontSize: '0.6rem', marginTop: 2, display: 'inline-block' }}>{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
            <button className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', flexShrink: 0 }} onClick={() => requireAuth(() => { })}>Follow</button>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ====================================================
// MAIN PAGE
// ====================================================
export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const { requireAuth } = useAuthGate();
  const [activeTab, setActiveTab] = useState('foryou');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [composeText, setComposeText] = useState('');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [composeFiles, setComposeFiles] = useState<UploadedFile[]>([]);
  const [postStatus, setPostStatus] = useState<'idle' | 'posting' | 'posted'>('idle');
  const [showPoll, setShowPoll] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [pollData, setPollData] = useState({ question: '', options: ['', ''], duration: '1 day' });
  const [threadPosts, setThreadPosts] = useState<string[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<typeof marketData[0] | null>(null);
  const [selectedNews, setSelectedNews] = useState<typeof breakingNews[0] | null>(null);
  const [liveMarketData, setLiveMarketData] = useState<typeof marketData>(marketData);
  const composeFileRef = useRef<HTMLInputElement>(null);

  const fetchMarketData = useCallback(() => {
    fetch('/api/market-data')
      .then(r => r.json())
      .then(data => { if (data.marketData) setLiveMarketData(data.marketData); })
      .catch((err) => console.error('Failed to load live market data', err));
  }, []);

  useEffect(() => {
    fetchMarketData();
    // Refresh market data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const fetchPosts = useCallback(() => {
    setPostsLoading(true);
    fetch(`/api/posts?tab=${activeTab}`)
      .then(r => r.json())
      .then(data => { if (data.posts) setFeedPosts(data.posts); })
      .catch(() => { })
      .finally(() => setPostsLoading(false));
  }, [activeTab]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const toggleLike = (id: string) => requireAuth(async () => {
    const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
    const data = await res.json();
    if (data.post) {
      setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.post.likes, liked: data.post.liked } : p));
    }
  });

  const toggleSave = (id: string) => requireAuth(async () => {
    const res = await fetch(`/api/posts/${id}/bookmark`, { method: 'POST' });
    const data = await res.json();
    if (data.post) {
      setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: data.post.bookmarked } : p));
    }
  });

  const handleComposeFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/'))
        newFiles.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, preview: URL.createObjectURL(file), type: file.type.startsWith('image/') ? 'image' : 'video' });
    });
    setComposeFiles(prev => [...prev, ...newFiles]);
  };

  const removeComposeFile = (id: string) => setComposeFiles(prev => { const f = prev.find(f => f.id === id); if (f) URL.revokeObjectURL(f.preview); return prev.filter(f => f.id !== id); });

  const handlePost = async () => {
    if (!composeText.trim() && composeFiles.length === 0) return;
    setPostStatus('posting');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: composeText, type: 'text' }),
      });
      const data = await res.json();
      if (data.post) {
        setFeedPosts(prev => [data.post, ...prev]);
      }
      setPostStatus('posted');
      setTimeout(() => {
        setComposeText(''); setComposeFiles([]); setShowPoll(false); setShowThread(false);
        setThreadPosts([]); setPollData({ question: '', options: ['', ''], duration: '1 day' });
        setPostStatus('idle');
      }, 1500);
    } catch {
      setPostStatus('idle');
    }
  };

  const handleAIAssist = () => {
    if (!composeText.trim()) return;
    setIsAILoading(true);
    setTimeout(() => { setComposeText(composeText + ' #PolicyInsight #Arizonalex'); setIsAILoading(false); }, 1200);
  };

  const tabs = [
    { id: 'foryou', label: 'For You', icon: <LayersIcon size={13} /> },
    { id: 'politics', label: 'Politics', icon: <LandmarkIcon size={13} /> },
    { id: 'business', label: 'Business', icon: <BriefcaseIcon size={13} /> },
    { id: 'markets', label: 'Markets', icon: <TrendingUpIcon size={13} /> },
    { id: 'policy', label: 'Policy', icon: <FileTextIcon size={13} /> },
    { id: 'trending', label: 'Trending', icon: <FlameIcon size={13} /> },
  ];

  const displayPosts = feedPosts;

  // AI insight tiles config (no emojis)
  const aiTiles = [
    { icon: <LandmarkIcon size={16} />, label: 'Legislative Activity', value: '12 Bills Active', sub: '3 heading to floor vote', href: '/politics' },
    { icon: <TrendingUpIcon size={16} />, label: 'Market Pulse', value: 'Risk-On Sentiment', sub: 'S&P up 1.24% today', href: '/business' },
    { icon: <ShieldIcon size={16} />, label: 'Policy Impact', value: 'High Volatility', sub: 'Capital Gains bill key risk', href: '/explore' },
    { icon: <GlobeIcon size={16} />, label: 'Global Signals', value: 'Trade Deal Optimism', sub: 'USD weakening vs EUR', href: '/explore' },
  ];

  return (
    <div className="page-container home-3col">
      {/* LEFT */}
      <LeftSidebar requireAuth={requireAuth} />

      {/* CENTER */}
      <div className="feed-column" style={{ minWidth: 0 }}>

        {/* Breaking News Ticker */}
        <div className="news-ticker-wrap">
          <div className="news-ticker-label"><NewspaperIcon size={11} /> LIVE</div>
          <div className="news-ticker-track">
            <div className="news-ticker-inner">
              {[...breakingNews, ...breakingNews].map((n, i) => (
                <button key={i} className="news-ticker-item" onClick={() => setSelectedNews(n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className={`ticker-cat ticker-cat-${n.urgency}`}>{n.category}</span>
                  {n.headline}
                  <span className="ticker-time">{n.time}</span>
                  <span className="ticker-sep">•</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Market Data Bar */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', overflowX: 'hidden' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, whiteSpace: 'nowrap', background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>MARKETS</span>
          <div className="ticker-scroll" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {liveMarketData?.map(m => (
              <span key={m?.id} style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}
                onClick={() => setSelectedMarket(m)}>
                <span style={{ fontWeight: 700 }}>{m?.symbol || '--'}</span>
                <span>{m?.price || '--'}</span>
                <span style={{ color: m?.positive ? '#10b981' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {m?.positive ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}
                  {m?.change || '--'}
                </span>
              </span>
            ))}
          </div>
        </div>
        {/* Tabs */}
        <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Story Bar */}
        <div className="story-bar">
          <div className="story-item" onClick={() => requireAuth(() => setShowStoryModal(true))} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar name="Alex Jordan" avatar="/avatars/alex-jordan.png" size="lg" hasStory storyViewed />
              <div className="story-plus-overlay"><PlusIcon size={12} /></div>
            </div>
            <span className="story-name">Your Story</span>
          </div>
          {stories.map(story => (
            <div key={story.id} className="story-item" style={{ cursor: 'pointer' }}>
              <UserAvatar name={story.author.name} avatar={story.author.avatar} size="lg" hasStory storyViewed={story.viewed} />
              <span className="story-name">{story.author.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* AI Insights Card */}
        <div className="ai-insights-card" role="region" aria-label="AI Policy & Market Intelligence">
          <div className="ai-insights-header">
            <div className="ai-insights-badge">
              <CpuIcon size={10} /> AI ANALYSIS
            </div>
            <span className="ai-insights-title">Today&apos;s Policy &amp; Market Intelligence</span>
            <span className="ai-insights-time"><ClockIcon size={10} /> 5 min ago</span>
          </div>
          <div className="ai-insights-grid">
            {aiTiles.map(tile => (
              <Link href={tile.href} key={tile.label} className="ai-insight-tile" style={{ textDecoration: 'none' }}>
                <div className="ai-tile-icon">{tile.icon}</div>
                <div className="ai-tile-label">{tile.label}</div>
                <div className="ai-tile-value">{tile.value}</div>
                <div className="ai-tile-sub">{tile.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Compose / Guest CTA */}
        {isLoggedIn ? (
          <div className="compose-box">
            <UserAvatar name="Alex Jordan" avatar="/avatars/alex-jordan.png" />
            <div className="compose-input">
              <textarea className="compose-textarea" placeholder="Share a policy insight, market analysis, or breaking news..." value={composeText} onChange={e => setComposeText(e.target.value)} />

              {showPoll && (
                <div className="poll-editor card" style={{ padding: 12, marginBottom: 10, border: '1px solid var(--primary-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create Poll</span>
                    <button className="btn btn-icon btn-sm" onClick={() => setShowPoll(false)}><XIcon size={14} /></button>
                  </div>
                  {pollData.options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <input className="edit-field-input" style={{ padding: '8px 12px', fontSize: '0.85rem' }} placeholder={`Option ${idx + 1}`} value={opt}
                        onChange={e => { const o = [...pollData.options]; o[idx] = e.target.value; setPollData(p => ({ ...p, options: o })); }} />
                      {pollData.options.length > 2 && <button className="btn btn-icon btn-sm" onClick={() => setPollData(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }))}><XIcon size={14} /></button>}
                    </div>
                  ))}
                  {pollData.options.length < 4 && <button className="btn btn-link btn-sm" style={{ padding: 0 }} onClick={() => setPollData(p => ({ ...p, options: [...p.options, ''] }))}><PlusIcon size={14} /> Add option</button>}
                </div>
              )}

              {showThread && (
                <div style={{ marginTop: 10 }}>
                  {threadPosts.map((text, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 12, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <UserAvatar name="Alex Jordan" avatar="/avatars/alex-jordan.png" size="sm" />
                        <div style={{ width: 2, flex: 1, backgroundColor: 'var(--border-light)', margin: '4px 0' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <textarea className="compose-textarea" style={{ minHeight: 60, fontSize: '0.9rem', padding: '8px 0' }} placeholder="Add to thread..."
                          value={text} onChange={e => { const t = [...threadPosts]; t[idx] = e.target.value; setThreadPosts(t); }} />
                        <button className="btn btn-icon btn-sm" style={{ position: 'absolute', right: 0, top: 0 }} onClick={() => setThreadPosts(p => p.filter((_, i) => i !== idx))}><XIcon size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-link btn-sm" style={{ padding: 0 }} onClick={() => setThreadPosts(p => [...p, ''])}><PlusIcon size={14} /> Add another post</button>
                </div>
              )}

              {composeFiles.length > 0 && (
                <div className="upload-preview-grid" style={{ marginBottom: 10 }}>
                  {composeFiles.map(f => (
                    <div key={f.id} className="upload-preview-item">
                      {f.type === 'image' ? <img src={f.preview} alt="Preview" className="upload-preview-media" /> : <video src={f.preview} className="upload-preview-media" />}
                      <button className="upload-preview-remove" onClick={() => removeComposeFile(f.id)}><XIcon size={14} /></button>
                    </div>
                  ))}
                  <button className="upload-add-more" onClick={() => composeFileRef.current?.click()}><PlusIcon size={20} /><span>Add</span></button>
                </div>
              )}

              <div className="compose-actions-row">
                <div className="compose-tools">
                  <button className="compose-tool" title="Photo" onClick={() => { if (composeFileRef.current) { composeFileRef.current.accept = 'image/*'; composeFileRef.current.click(); } }}><ImageIcon size={18} /></button>
                  <button className="compose-tool" title="Video" onClick={() => { if (composeFileRef.current) { composeFileRef.current.accept = 'video/*'; composeFileRef.current.click(); } }}><VideoIcon size={18} /></button>
                  <button className={`compose-tool ${showPoll ? 'active' : ''}`} title="Poll" onClick={() => setShowPoll(!showPoll)}><BarChartIcon size={18} /></button>
                  <button className={`compose-tool ${showThread ? 'active' : ''}`} title="Thread" onClick={() => { if (!showThread && threadPosts.length === 0) setThreadPosts(['']); setShowThread(!showThread); }}><ThreadIcon size={18} /></button>
                  <button className="compose-tool" title="Policy Proposal"><FileTextIcon size={18} /></button>
                  <button className={`compose-tool ${isAILoading ? 'ai-loading' : ''}`} title="AI Assist" onClick={handleAIAssist} disabled={isAILoading || !composeText.trim()}><BotIcon size={18} /></button>
                </div>
                <button className="btn btn-primary btn-sm" disabled={!composeText.trim() && composeFiles.length === 0 || postStatus !== 'idle'} onClick={handlePost} style={{ minWidth: 70 }}>
                  {postStatus === 'posting' ? 'Posting...' : postStatus === 'posted' ? 'Done!' : 'Post'}
                </button>
              </div>
              <input ref={composeFileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={e => { handleComposeFileSelect(e.target.files); e.target.value = ''; }} />
            </div>
          </div>
        ) : (
          <div className="guest-cta-card" onClick={() => requireAuth(() => { })}>
            <div className="guest-cta-glow" />
            <div className="guest-cta-content">
              <div className="guest-cta-left">
                <div className="guest-cta-icon-ring"><ZapIcon size={22} /></div>
                <div>
                  <div className="guest-cta-headline">Your voice matters in politics &amp; business</div>
                  <div className="guest-cta-sub">Join thousands of policy makers, traders, and entrepreneurs shaping the future.</div>
                </div>
              </div>
              <div className="guest-cta-actions">
                <Link href="/login" className="guest-cta-btn-primary" onClick={e => e.stopPropagation()}>Sign in</Link>
                <Link href="/register" className="guest-cta-btn-secondary" onClick={e => e.stopPropagation()}>Create account</Link>
              </div>
            </div>
          </div>
        )}


        {/* Posts Feed */}
        <div>
          {postsLoading && feedPosts.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading posts...</div>
          )}
          {displayPosts.map(post => (
            <article key={post.id} className="post-card fade-in">
              <div className="post-header">
                <Link href={`/profile/${post.author.username}`}><UserAvatar name={post.author.name} avatar={post.author.avatar} hasStory={checkUserHasStory(post.author.id)} /></Link>
                <div className="post-meta">
                  <div className="post-author-row">
                    <Link href={`/profile/${post.author.username}`} className="post-author">{post.author.name}</Link>
                    {post.author.verified && <VerifiedIcon size={15} />}
                    <Link href={`/profile/${post.author.username}`} className="post-handle">@{post.author.username}</Link>
                    <span className="post-time">{post.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                    <span className={`role-badge role-${post.author.role}`}>{ROLE_LABELS[post.author.role] ?? post.author.role}</span>
                    {post.author.party && <span className="role-badge role-politician">{post.author.party}</span>}
                    {post.type === 'policy' && <span className="post-type-badge badge-policy"><FileTextIcon size={11} /> Policy</span>}
                    {post.type === 'thread' && <span className="post-type-badge badge-thread"><ThreadIcon size={11} /> Thread</span>}
                  </div>
                </div>
              </div>
              <PostContent content={post.content} />
              <div className="post-actions">
                <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''}`} onClick={() => requireAuth(() => { })}>
                  <span className="action-icon"><MessageCircleIcon size={17} /></span><span>{formatNumber(post.comments)}</span>
                </button>
                <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''}`} onClick={async () => requireAuth(async () => {
                  const res = await fetch(`/api/posts/${post.id}/repost`, { method: 'POST' });
                  const data = await res.json();
                  if (data.post) setFeedPosts(prev => prev.map(p => p.id === post.id ? { ...p, reposts: data.post.reposts, reposted: data.post.reposted } : p));
                })}>
                  <span className="action-icon"><RepeatIcon size={17} /></span><span>{formatNumber(post.reposts)}</span>
                </button>
                <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''} ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                  <span className="action-icon">{post.liked ? <HeartFilledIcon size={17} /> : <HeartIcon size={17} />}</span>
                  <span>{formatNumber(post.likes)}</span>
                </button>
                <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''} ${post.bookmarked ? 'bookmarked' : ''}`} onClick={() => toggleSave(post.id)}>
                  <span className="action-icon"><BookmarkIcon size={17} /></span>
                </button>
                <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''}`} onClick={() => requireAuth(() => { })}>
                  <span className="action-icon"><ShareIcon size={17} /></span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <RightPanel requireAuth={requireAuth} />

      {/* Modals */}
      {showStoryModal && <StoryUploadModal onClose={() => setShowStoryModal(false)} />}
      {selectedMarket && <MarketModal item={selectedMarket} onClose={() => setSelectedMarket(null)} />}
      {selectedNews && <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />}
    </div>
  );
}
