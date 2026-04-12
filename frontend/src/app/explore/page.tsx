'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatNumber, checkUserHasStory } from '@/lib/utils';
import {
    SearchIcon, TrendingUpIcon, VerifiedIcon, MessageCircleIcon, RepeatIcon,
    HeartIcon, HeartFilledIcon, BookmarkIcon, ShareIcon, FlameIcon, GlobeIcon,
    ArrowUpRightIcon, ArrowDownRightIcon, BarChartIcon, UsersIcon, ActivityIcon,
    BriefcaseIcon, LandmarkIcon, DollarSignIcon, ChevronRightIcon, FilterIcon
} from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { useAuth } from '@/components/providers/AuthProvider';

const ROLE_LABELS: Record<string, string> = {
    politician: 'Politician', official: 'Gov. Official', journalist: 'Journalist',
    citizen: 'Citizen', admin: 'Admin', businessman: 'Businessman',
    entrepreneur: 'Entrepreneur', crypto_trader: 'Crypto Trader',
    stock_trader: 'Stock Trader', banker: 'Banker', doctor: 'Doctor',
    researcher: 'Researcher', academic: 'Academic', lawyer: 'Lawyer',
    judge: 'Judge', activist: 'Activist', celebrity: 'Celebrity', other: 'Other',
};

const SECTOR_COLORS: Record<string, string> = {
    Finance: '#f59e0b', Healthcare: '#10b981', Energy: '#3b82f6',
    Technology: '#8b5cf6', Policy: '#ef4444', Economy: '#06b6d4',
};

const CAT_ICONS: Record<string, React.ReactNode> = {
    All: <GlobeIcon size={13} />,
    Politics: <LandmarkIcon size={13} />,
    Business: <BriefcaseIcon size={13} />,
    Markets: <TrendingUpIcon size={13} />,
    Policy: <BarChartIcon size={13} />,
    Economy: <DollarSignIcon size={13} />,
    Healthcare: <ActivityIcon size={13} />,
    Environment: <GlobeIcon size={13} />,
};

const categories = ['All', 'Politics', 'Business', 'Markets', 'Policy', 'Economy', 'Healthcare', 'Environment'];

function ExploreContent() {
    const { requireAuth } = useAuthGate();
    const { user: currentUser } = useAuth();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
     
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [liveMarketData, setLiveMarketData] = useState<any[]>([]);
    const [liveTrends, setLiveTrends] = useState<any[]>([]);
    const [notableUsers, setNotableUsers] = useState<any[]>([]);
    const [hashtagList, setHashtagList] = useState<any[]>([]);
    const [econIndicators, setEconIndicators] = useState<any[]>([]);
    
    // Fetch Notable Figures from API
    useEffect(() => {
        fetch('/api/users?limit=6')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.users && data.users.length > 0) {
                    const backendUsers = data.users.map((u: any) => ({
                        ...u, 
                        id: u._id || u.id,
                        followers: u.followers || [],
                        following: u.following || []
                    }));
                    setNotableUsers(backendUsers);
                }
            })
            .catch(() => { });
        // Fetch trending hashtags from search API
        fetch('/api/search?type=trending')
            .then(r => r.json())
            .then(data => { if (data.hashtags) setHashtagList(data.hashtags); })
            .catch(() => {
                // Inline default trending topics
                setHashtagList([
                    { tag: 'DigitalPrivacyAct', posts: 124000, category: 'Legislation' },
                    { tag: 'Election2026', posts: 890000, category: 'Politics' },
                    { tag: 'ClimateAction', posts: 456000, category: 'Policy' },
                    { tag: 'InfrastructureBill', posts: 234000, category: 'Government' },
                    { tag: 'TransparentGov', posts: 178000, category: 'Governance' },
                    { tag: 'EducationReform', posts: 345000, category: 'Policy' },
                ]);
            });
        // Fetch economic indicators
        fetch('/api/politics/stats')
            .then(r => r.json())
            .then(data => {
                if (data.economicIndicators) setEconIndicators(data.economicIndicators);
                if (data.sectorTrends) setLiveTrends(data.sectorTrends);
            })
            .catch(() => {
                setLiveTrends([
                    { sector: 'Finance', tag: 'CapitalGainsTax', posts: 87400, change: '+142%', hot: true },
                    { sector: 'Healthcare', tag: 'AffordableCareAct', posts: 64200, change: '+89%', hot: true },
                    { sector: 'Energy', tag: 'CleanEnergyFund', posts: 52100, change: '+67%', hot: false },
                    { sector: 'Technology', tag: 'BroadbandBill', posts: 41800, change: '+54%', hot: false },
                    { sector: 'Policy', tag: 'ElectionReform2026', posts: 98700, change: '+201%', hot: true },
                    { sector: 'Economy', tag: 'FedRatecut', posts: 73600, change: '+118%', hot: true },
                ]);
            });
    }, []);

    // Live sentiment polling for Sector Trends
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveTrends(prev => prev.map(trend => {
                const postsInc = Math.floor(Math.random() * 45) + 5;
                const currentChangeNum = parseInt(trend.change.replace(/[^0-9-]/g, '')) || 0;
                const changeInc = Math.floor(Math.random() * 5) - 1;
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

    // eslint-disable-next-line
    useEffect(() => { if (query) setSearchQuery(decodeURIComponent(query.replace(/^#/, ''))); }, [query]);

    // Fetch posts from API
    useEffect(() => {
        const tab = activeCategory === 'All' ? 'foryou' :
            activeCategory === 'Politics' ? 'politics' :
                activeCategory === 'Business' ? 'business' :
                    activeCategory === 'Markets' ? 'markets' :
                        activeCategory === 'Policy' ? 'policy' : 'foryou';
        const url = searchQuery
            ? `/api/posts?q=${encodeURIComponent(searchQuery)}`
            : `/api/posts?tab=${tab}`;
        // eslint-disable-next-line
        setPostsLoading(true);
        fetch(url)
            .then(r => r.json())
            .then(data => { if (data.posts) setFeedPosts(data.posts); })
            .catch(() => { })
            .finally(() => setPostsLoading(false));
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const res = await fetch('/api/market-data');
                const data = await res.json();
                if (data.marketData) setLiveMarketData(data.marketData);
            } catch (err) { }
        };
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleLike = (id: string) => requireAuth(async () => {
        const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
        const data = await res.json();
        if (data.post) setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.post.likes, liked: data.post.liked } : p));
    });
    const toggleSave = (id: string) => requireAuth(async () => {
        const res = await fetch(`/api/posts/${id}/bookmark`, { method: 'POST' });
        const data = await res.json();
        if (data.post) setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: data.post.bookmarked } : p));
    });

    const handleFollow = (targetUser: any) => requireAuth(async () => {
        if (!currentUser) return;
        const isFollowing = targetUser.followers.includes(currentUser.id);
        const endpoint = isFollowing ? 'unfollow' : 'follow';
        
        // Optimistic update
        setNotableUsers(prev => prev.map(u => {
            if (u.id === targetUser.id) {
                const newFollowers = isFollowing 
                    ? u.followers.filter((fid: string) => fid !== currentUser.id)
                    : [...u.followers, currentUser.id];
                return { ...u, followers: newFollowers };
            }
            return u;
        }));

        try {
            await fetch('/api/users/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: targetUser.id, action: isFollowing ? 'unfollow' : 'follow' }),
            });
        } catch (error) {
            console.error('Failed to follow/unfollow automatically reverted state');
            // Revert on failure
            setNotableUsers(prev => prev.map(u => {
                if (u.id === targetUser.id) {
                    const originalFollowers = isFollowing 
                        ? [...u.followers, currentUser.id]
                        : u.followers.filter((fid: string) => fid !== currentUser.id);
                    return { ...u, followers: originalFollowers };
                }
                return u;
            }));
        }
    });

    const displayPosts = feedPosts;

    return (
        <div className="page-container home-3col">
            {/* LEFT – Trending + Sectors */}
            <aside className="home-left-panel">
                {/* Trending Hashtags */}
                <div className="hp-card">
                    <div className="hp-card-title"><TrendingUpIcon size={15} /> Trending Topics</div>
                    {hashtagList.slice(0, 6).map((t, i) => (
                        <button key={i} onClick={() => setSearchQuery(t.tag)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: i < 5 ? '1px solid var(--border-light)' : 'none' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', color: 'var(--primary)', flexShrink: 0 }}>#{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 1 }}>#{t.tag}</div>
                                <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)' }}>{t.category} · {formatNumber(t.posts)} posts</div>
                            </div>
                            {i < 3 && <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.62rem', fontWeight: 800, color: '#ef4444' }}><FlameIcon size={10} /></span>}
                        </button>
                    ))}
                    <Link href="/explore" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, textDecoration: 'none' }}>
                        Show more <ChevronRightIcon size={13} />
                    </Link>
                </div>

                {/* Market Snapshot */}
                <div className="hp-card">
                    <div className="hp-card-title"><DollarSignIcon size={15} /> Market Snapshot</div>
                    {liveMarketData.slice(0, 4).map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{m.symbol}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{m.price}</div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: m.positive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                                {m.positive ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}{m.change}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Sector Trends */}
                <div className="hp-card">
                    <div className="hp-card-title"><ActivityIcon size={15} /> Sector Activity</div>
                    {liveTrends.map(s => (
                        <button key={s.tag} onClick={() => setSearchQuery(s.tag)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                            <div>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: `${SECTOR_COLORS[s.sector] || '#94a3b8'}20`, color: SECTOR_COLORS[s.sector] || '#94a3b8' }}>{s.sector}</span>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: 3 }}>#{s.tag}</div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ArrowUpRightIcon size={12} />{s.change}
                            </span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* CENTER – Search + Feed */}
            <div className="feed-column" style={{ minWidth: 0 }}>
                {/* Search bar */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10, backdropFilter: 'blur(12px)' }}>
                    <div className="search-box">
                        <span className="search-icon"><SearchIcon size={16} /></span>
                        <input type="text" placeholder="Search topics, people, hashtags, policies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {categories.map(cat => (
                        <button key={cat} className={`tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {CAT_ICONS[cat]}{cat}
                        </button>
                    ))}
                </div>

                {/* Results header */}
                {searchQuery && (
                    <div style={{ padding: '10px 16px', fontSize: '0.82rem', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SearchIcon size={13} />
                        {displayPosts.length} result{displayPosts.length !== 1 ? 's' : ''} for <strong style={{ color: 'var(--text-primary)' }}>&quot;{searchQuery}&quot;</strong>
                    </div>
                )}

                {/* Posts */}
                {displayPosts.length > 0 ? displayPosts.map((post: any) => (
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
                                </div>
                            </div>
                        </div>
                        <PostContent content={post.content} type={post.type} policyTitle={post.policyTitle} policyCategory={post.policyCategory} />
                        <div className="post-actions">
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={17} /></span><span>{formatNumber(post.comments)}</span></button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={17} /></span><span>{formatNumber(post.reposts)}</span></button>
                            <button className={`post-action ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                                <span className="action-icon">{post.liked ? <HeartFilledIcon size={17} /> : <HeartIcon size={17} />}</span>
                                <span>{formatNumber(post.likes)}</span>
                            </button>
                            <button className={`post-action ${post.bookmarked ? 'bookmarked' : ''}`} onClick={() => toggleSave(post.id)}><span className="action-icon"><BookmarkIcon size={17} /></span></button>
                            <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><ShareIcon size={17} /></span></button>
                        </div>
                    </article>
                )) : (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <SearchIcon size={40} />
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 12, color: 'var(--text-secondary)' }}>No results for &quot;{searchQuery}&quot;</div>
                        <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Try searching for politicians, policies, or hashtags</div>
                    </div>
                )}
            </div>

            {/* RIGHT – Popular People */}
            <aside className="right-panel">
                <div className="hp-card">
                    <div className="hp-card-title"><UsersIcon size={15} /> Notable Figures</div>
                    <div className="user-tile-grid">
                        {notableUsers.map(user => {
                            const followerCount = Array.isArray(user.followers) ? user.followers.length : user.followers;
                            const isFollowing = currentUser && Array.isArray(user.followers) && user.followers.includes(currentUser.id);
                            
                            return (
                                <div key={user.id} className="user-tile" onClick={() => window.location.href = `/profile/${user.username}`}>
                                    <div className="user-tile-avatar">
                                        <UserAvatar name={user.name} avatar={user.avatar} size="lg" hasStory={checkUserHasStory(user.id)} />
                                    </div>
                                    <div className="user-tile-name">
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                                        {user.verified && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><VerifiedIcon size={12} /></span>}
                                    </div>
                                    <div className="user-tile-handle">@{user.username}</div>
                                    <div className="user-tile-role">
                                        <span className={`role-badge role-${user.role}`} style={{ display: 'inline-block' }}>{ROLE_LABELS[user.role] ?? user.role}</span>
                                    </div>
                                    <div className="user-tile-stats">
                                        <strong style={{ color: 'var(--text-primary)' }}>{formatNumber(followerCount)}</strong> followers
                                    </div>
                                    <button 
                                        className={`btn btn-sm user-tile-btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            handleFollow(user); 
                                        }}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Key Economic Data */}
                <div className="hp-card" style={{ marginTop: 16 }}>
                    <div className="hp-card-title"><BarChartIcon size={15} /> Economic Snapshot</div>
                    {econIndicators.slice(0, 4).map(ind => (
                        <div key={ind.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ind.label}</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{ind.value}</div>
                                <div style={{ fontSize: '0.67rem', color: ind.positive ? '#10b981' : '#ef4444', fontWeight: 600 }}>{ind.change}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div style={{ padding: 20, color: 'var(--text-tertiary)' }}>Loading...</div>}>
            <ExploreContent />
        </Suspense>
    );
}
