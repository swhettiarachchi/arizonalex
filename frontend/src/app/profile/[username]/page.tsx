'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { User } from '@/lib/types';
import { formatNumber, checkUserHasStory } from '@/lib/utils';
import {
    PhoneIcon, MailIcon, VerifiedIcon, CalendarIcon, LandmarkIcon,
    MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon,
    BookmarkIcon, ShareIcon, MapPinIcon, GlobeIcon, TrendingUpIcon,
    BarChartIcon, UsersIcon, ActivityIcon, LayersIcon, FileTextIcon,
    ZapIcon, UserIcon, ClockIcon, ShieldIcon, CheckCircleIcon,
    VideoIcon, EyeIcon
} from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
    PoliticianSection, BusinessSection, TrustVerificationCard,
    AIInsightsCard, ProfileAnalytics, ProfileAboutTab, TimelineSection,
    ShareProfileModal
} from '@/components/ui/ProfileComponents';
import { CommunicationModal } from '@/components/ui/CommunicationModal';

const ALL_ROLES: { value: UserRole; label: string; desc: string; color: string }[] = [
    { value: 'citizen', label: 'Citizen', desc: 'Community member & voter', color: '#6b7280' },
    { value: 'politician', label: 'Politician', desc: 'Elected representative', color: '#3b82f6' },
    { value: 'official', label: 'Gov. Official', desc: 'Government / public servant', color: '#8b5cf6' },
    { value: 'journalist', label: 'Journalist', desc: 'Reporter / media professional', color: '#f59e0b' },
    { value: 'businessman', label: 'Businessman', desc: 'Business owner / executive', color: '#10b981' },
    { value: 'entrepreneur', label: 'Entrepreneur', desc: 'Startup founder / innovator', color: '#06b6d4' },
    { value: 'banker', label: 'Banker', desc: 'Finance & banking professional', color: '#14b8a6' },
    { value: 'stock_trader', label: 'Stock Trader', desc: 'Equity & securities trader', color: '#22c55e' },
    { value: 'crypto_trader', label: 'Crypto Trader', desc: 'Digital asset trader', color: '#f97316' },
    { value: 'lawyer', label: 'Lawyer', desc: 'Legal professional / attorney', color: '#a855f7' },
    { value: 'judge', label: 'Judge', desc: 'Judiciary / court official', color: '#ec4899' },
    { value: 'doctor', label: 'Doctor', desc: 'Medical / healthcare professional', color: '#ef4444' },
    { value: 'researcher', label: 'Researcher', desc: 'Academic / scientific researcher', color: '#84cc16' },
    { value: 'academic', label: 'Academic', desc: 'Professor / educator', color: '#64748b' },
    { value: 'activist', label: 'Activist', desc: 'Social / political activist', color: '#e11d48' },
    { value: 'celebrity', label: 'Celebrity', desc: 'Public figure / influencer', color: '#d97706' },
    { value: 'other', label: 'Other', desc: 'Other / prefer not to say', color: '#94a3b8' },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(ALL_ROLES.map(r => [r.value, r.label]));

export default function DynamicProfilePage() {
    const params = useParams();
    const username = params?.username as string;
    const { isLoggedIn } = useAuth();
    const { requireAuth } = useAuthGate();

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [isFollowing, setIsFollowing] = useState(false);
     
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const [activeCommType, setActiveCommType] = useState<null | 'message' | 'call' | 'video'>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        setLoading(true);
        // Fetch user profile
        fetch(`/api/users?username=${username}`)
            .then(r => r.json())
            .then(data => {
                const u = data.users?.[0] || data.user || null;
                setProfileUser(u);
            })
            .catch(() => setProfileUser(null))
            .finally(() => setLoading(false));
        // Fetch user's posts
        fetch(`/api/posts?author=${username}`)
            .then(r => r.json())
            .then(data => {
                if (data.posts) setFeedPosts(data.posts.map((p: any) => ({ ...p, liked: p.liked || false, bookmarked: p.bookmarked || false })));
            })
            .catch(() => { });
        // Fetch all users for sidebar
        fetch('/api/users?limit=8')
            .then(r => r.json())
            .then(data => { if (data.users) setAllUsers(data.users); })
            .catch(() => { });
    }, [username]);

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="page-container" style={{ padding: 40, textAlign: 'center' }}>
                <h2>User not found</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>@{username} does not exist.</p>
                <Link href="/explore" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Explore</Link>
            </div>
        );
    }

    const displayRole = profileUser.role as UserRole;
    const roleInfo = ALL_ROLES.find(r => r.value === displayRole);
    const totalLikes = feedPosts.reduce((a, p) => a + (p.likes || 0), 0);
    const totalReposts = feedPosts.reduce((a, p) => a + (p.reposts || 0), 0);
    const engagementRate = '4.8';

    const mutuals = allUsers.filter(u => u.id !== profileUser.id && u.verified).slice(0, 3);
    const similarUsers = allUsers.filter(u => u.id !== profileUser.id && u.role === profileUser.role).slice(0, 4);

    const toggleLike = (id: string) => requireAuth(async () => {
        setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
        try {
            const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
            const data = await res.json();
            if (data.post) setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.post.likes, liked: data.post.liked } : p));
        } catch { /* optimistic stays */ }
    });
    const toggleSave = (id: string) => requireAuth(async () => {
        setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
        try {
            const res = await fetch(`/api/posts/${id}/bookmark`, { method: 'POST' });
            const data = await res.json();
            if (data.post) setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: data.post.bookmarked } : p));
        } catch { /* optimistic stays */ }
    });
    const handleFollow = () => requireAuth(async () => {
        const newState = !isFollowing;
        setIsFollowing(newState);
        try {
            const res = await fetch('/api/users/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, action: newState ? 'follow' : 'unfollow' }),
            });
            const data = await res.json();
            if (!data.success) setIsFollowing(!newState);
        } catch {
            setIsFollowing(!newState);
        }
    });

    const toggleFollowUser = (userId: string) => requireAuth(async () => {
        const isCurrentlyFollowing = followingIds.has(userId);
        setFollowingIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
        try {
            const res = await fetch('/api/users/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: isCurrentlyFollowing ? 'unfollow' : 'follow' }),
            });
            const data = await res.json();
            if (!data.success) throw new Error();
        } catch {
            setFollowingIds(prev => {
                const next = new Set(prev);
                if (isCurrentlyFollowing) next.add(userId);
                else next.delete(userId);
                return next;
            });
        }
    });

    const TABS = [
        { id: 'posts', label: 'Posts', icon: <FileTextIcon size={13} /> },
        { id: 'about', label: 'About', icon: <UserIcon size={13} /> },
        { id: 'media', label: 'Media', icon: <LayersIcon size={13} /> },
        { id: 'activity', label: 'Analytics', icon: <BarChartIcon size={13} /> },
        { id: 'timeline', label: 'Timeline', icon: <ClockIcon size={13} /> },
    ];

    return (
        <div className="page-container home-3col">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="home-left-panel">
                {/* Profile Hero Card */}
                <div className="prof-hero-card">
                    {/* Gradient banner with shimmer – show uploaded image if present */}
                    <div className="prof-hero-banner"
                        style={profileUser.banner
                            ? { backgroundImage: `url(${profileUser.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : undefined
                        }
                    />

                    {/* Avatar overlapping banner */}
                    <div className="prof-hero-avatar-wrap">
                        <div className="prof-hero-avatar-ring">
                            <UserAvatar name={profileUser.name} avatar={profileUser.avatar} size="xl" hasStory={checkUserHasStory(profileUser.id)} />
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="prof-hero-identity">
                        <div className="prof-hero-name">{profileUser.name}</div>
                        <div className="prof-hero-handle">@{profileUser.username}</div>
                        {profileUser.verified && (
                            <div className="prof-hero-verified">
                                <CheckCircleIcon size={12} /> Verified Account
                            </div>
                        )}
                        <div className="prof-hero-role-wrap">
                            <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole] ?? displayRole}</span>
                        </div>
                    </div>

                    {/* Stat tiles */}
                    <div className="prof-hero-stats">
                        <div className="prof-hero-stat prof-hero-stat--followers">
                            <div className="prof-hero-stat-icon"><UsersIcon size={14} /></div>
                            <div className="prof-hero-stat-val">{formatNumber(profileUser.followers)}</div>
                            <div className="prof-hero-stat-label">Followers</div>
                        </div>
                        <div className="prof-hero-stat prof-hero-stat--following">
                            <div className="prof-hero-stat-icon"><UsersIcon size={14} /></div>
                            <div className="prof-hero-stat-val">{formatNumber(profileUser.following)}</div>
                            <div className="prof-hero-stat-label">Following</div>
                        </div>
                        <div className="prof-hero-stat prof-hero-stat--posts">
                            <div className="prof-hero-stat-icon"><FileTextIcon size={14} /></div>
                            <div className="prof-hero-stat-val">{feedPosts.length}</div>
                            <div className="prof-hero-stat-label">Posts</div>
                        </div>
                        <div className="prof-hero-stat prof-hero-stat--engagement">
                            <div className="prof-hero-stat-icon"><TrendingUpIcon size={14} /></div>
                            <div className="prof-hero-stat-val">{engagementRate}%</div>
                            <div className="prof-hero-stat-label">Engagement</div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, padding: '16px 16px 20px' }}>
                        <button className={isFollowing ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                            onClick={handleFollow}>
                            {isFollowing ? '✓ Following' : 'Follow'}
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}>
                            <MailIcon size={14} />
                        </button>
                    </div>
                </div>

                {/* Trust */}
                <TrustVerificationCard user={profileUser} />

                {/* About */}
                <div className="hp-card">
                    <div className="hp-card-title"><ZapIcon size={15} /> About</div>
                    {profileUser.bio && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{profileUser.bio}</p>}

                    {roleInfo && (
                        <div style={{ background: `${roleInfo.color}10`, border: `1px solid ${roleInfo.color}25`, borderRadius: 8, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${roleInfo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: roleInfo.color }}>{roleInfo.label.slice(0, 3).toUpperCase()}</span>
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: roleInfo.color }}>{roleInfo.label}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{roleInfo.desc}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><CalendarIcon size={13} /> Joined {profileUser.joined}</div>
                        {profileUser.party && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><LandmarkIcon size={13} /> {profileUser.party}</div>}
                        {profileUser.country && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><GlobeIcon size={13} /> {profileUser.country}</div>}
                        {profileUser.profileViews && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><EyeIcon size={13} /> {formatNumber(profileUser.profileViews)} views</div>}
                    </div>
                </div>

                {/* Post Stats */}
                <div className="hp-card">
                    <div className="hp-card-title"><ActivityIcon size={15} /> Post Stats</div>
                    {[
                        { label: 'Total Likes', val: formatNumber(totalLikes), color: '#ef4444' },
                        { label: 'Total Reposts', val: formatNumber(totalReposts), color: '#10b981' },
                        { label: 'Avg Likes/Post', val: formatNumber(Math.round(totalLikes / Math.max(feedPosts.length, 1))), color: 'var(--primary)' },
                        { label: 'Profile Views', val: formatNumber(profileUser.profileViews ?? 0), color: '#8b5cf6' },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ── CENTER FEED ── */}
            <div className="feed-column" style={{ minWidth: 0 }}>

                {/* Profile Center Tile */}
                <div className="prof-tile" style={{ marginBottom: 16 }}>
                    {/* Banner */}
                    <div className="profile-banner"
                        style={{ background: profileUser.banner || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />

                    {/* Avatar + actions */}
                    <div className="profile-avatar-section">
                        <UserAvatar name={profileUser.name} avatar={profileUser.avatar} size="xxl" hasStory={checkUserHasStory(profileUser.id)} />
                        <div style={{ display: 'flex', gap: 8, paddingBottom: 8, flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                            <button className={isFollowing ? 'profile-action-btn' : 'profile-action-btn primary'}
                                onClick={handleFollow}>
                                {isFollowing ? (
                                    <>
                                        <CheckCircleIcon size={14} /> <span className="btn-text">Following</span>
                                    </>
                                ) : <span className="btn-text">Follow</span>}
                            </button>
                            <button className="profile-action-btn" onClick={() => requireAuth(() => setActiveCommType('message'))}>
                                <MailIcon size={14} /> <span className="btn-text">Message</span>
                            </button>
                            <button className="profile-action-btn" onClick={() => requireAuth(() => setActiveCommType('call'))}>
                                <PhoneIcon size={14} /> <span className="btn-text">Call</span>
                            </button>
                            <button className="profile-action-btn" onClick={() => requireAuth(() => setActiveCommType('video'))}>
                                <VideoIcon size={14} /> <span className="btn-text">Video</span>
                            </button>
                            <button className="profile-action-btn" onClick={() => setIsShareModalOpen(true)}>
                                <ShareIcon size={14} /> <span className="btn-text">Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile info */}
                    <div className="profile-info">
                        <div className="profile-name">
                            {profileUser.name}
                            {profileUser.verified && <VerifiedIcon size={16} />}
                        </div>
                        <div className="profile-handle">@{profileUser.username}</div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole] ?? displayRole}</span>
                            {profileUser.party && <span className="role-badge role-politician">{profileUser.party}</span>}
                            {profileUser.position && <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', color: 'var(--primary)', fontWeight: 600 }}>{profileUser.position}</span>}
                        </div>
                        <div className="profile-meta">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={13} /> Joined {profileUser.joined}</span>
                            {profileUser.country && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GlobeIcon size={13} /> {profileUser.country}</span>}
                            {profileUser.profileViews && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><EyeIcon size={13} /> {formatNumber(profileUser.profileViews)} views</span>}
                        </div>
                    </div>
                    {profileUser.bio && <div className="profile-bio">{profileUser.bio}</div>}

                    {/* Stats row */}
                    <div className="profile-stats">
                        <div className="profile-stat"><div className="profile-stat-value">{formatNumber(profileUser.following)}</div><div className="profile-stat-label">Following</div></div>
                        <div className="profile-stat"><div className="profile-stat-value">{formatNumber(profileUser.followers)}</div><div className="profile-stat-label">Followers</div></div>
                        <div className="profile-stat"><div className="profile-stat-value">{feedPosts.length}</div><div className="profile-stat-label">Posts</div></div>
                        <div className="profile-stat"><div className="profile-stat-value">{formatNumber(totalLikes)}</div><div className="profile-stat-label">Total Likes</div></div>
                    </div>
                </div>

                {/* Mutuals */}
                {mutuals.length > 0 && (
                    <div style={{ padding: '0 20px 12px', fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex' }}>
                            {mutuals.map((m, i) => <UserAvatar key={m.id} name={m.name} avatar={m.avatar} size="sm" style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--bg-primary)', zIndex: 3 - i }} />)}
                        </div>
                        Followed by {mutuals.map(m => m.name.split(' ')[0]).join(', ')}
                    </div>
                )}

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

                <div className="prof-tab-container">
                {/* Posts tab */}
                {activeTab === 'posts' && (
                    feedPosts.length > 0 ? feedPosts.map((post: any) => (
                        <div key={post.id} className="prof-tile" style={{ marginBottom: 16 }}>
                            <article className="post-card fade-in">
                                <div className="post-header">
                                    <UserAvatar name={profileUser.name} avatar={profileUser.avatar} hasStory={checkUserHasStory(profileUser.id)} />
                                    <div className="post-meta">
                                        <div className="post-author-row">
                                            <span className="post-author">{profileUser.name}</span>
                                            {profileUser.verified && <VerifiedIcon size={14} />}
                                            <span className="post-handle">@{profileUser.username}</span>
                                            <span className="post-time">{post.timestamp}</span>
                                        </div>
                                        <div style={{ marginTop: 2 }}>
                                            <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole] ?? displayRole}</span>
                                        </div>
                                    </div>
                                </div>
                                <PostContent content={post.content} />
                                <div className="post-actions">
                                    <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={17} /></span><span>{formatNumber(post.comments)}</span></button>
                                    <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={17} /></span><span>{formatNumber(post.reposts)}</span></button>
                                    <button className={`post-action ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                                        <span className="action-icon">{post.liked ? <HeartFilledIcon size={17} /> : <HeartIcon size={17} />}</span>
                                        <span>{formatNumber(post.likes)}</span>
                                    </button>
                                    <button className={`post-action ${post.bookmarked ? 'bookmarked' : ''}`} onClick={() => toggleSave(post.id)}>
                                        <span className="action-icon"><BookmarkIcon size={17} /></span>
                                    </button>
                                    <button className="post-action" onClick={() => setIsShareModalOpen(true)}><span className="action-icon"><ShareIcon size={17} /></span></button>
                                </div>
                            </article>
                        </div>
                    )) : (
                        <div className="empty-state">
                            <span className="empty-state-title">No posts yet</span>
                            <span className="empty-state-text">{profileUser.name} hasn&apos;t posted anything yet.</span>
                        </div>
                    )
                )}

                {/* About tab */}
                {activeTab === 'about' && (
                    <ProfileAboutTab user={profileUser} displayBio={profileUser.bio} displayLocation=""
                        displayWebsite="" displayEmail="" displayParty={profileUser.party ?? ''} isOwn={false} />
                )}

                {/* Analytics tab */}
                {activeTab === 'activity' && (
                    <ProfileAnalytics user={profileUser} postsCount={feedPosts.length}
                        totalLikes={totalLikes} totalReposts={totalReposts} engagementRate={engagementRate} />
                )}

                {/* Timeline tab */}
                {activeTab === 'timeline' && <TimelineSection />}

                {/* Media tab */}
                {activeTab === 'media' && (
                    <div className="empty-state">
                        <span className="empty-state-title">No media yet</span>
                        <span className="empty-state-text">Photos and videos will appear here.</span>
                    </div>
                )}
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <aside className="right-panel">
                {/* AI Insights */}
                <AIInsightsCard user={profileUser} postsCount={feedPosts.length} />

                {/* Role-Specific Section in Right Panel */}
                {(displayRole === 'politician' || displayRole === 'official') && <PoliticianSection user={profileUser} />}
                {(displayRole === 'journalist' || displayRole === 'businessman' || displayRole === 'entrepreneur') && <BusinessSection user={profileUser} />}

                {/* Similar Profiles */}
                <div className="hp-card" style={{ marginTop: 16 }}>
                    <div className="hp-card-title"><UsersIcon size={15} /> Similar Profiles</div>
                    {similarUsers.length > 0 ? (
                        <div className="user-tile-grid">
                            {similarUsers.map(u => (
                                <Link key={u.id} href={`/profile/${u.username}`} className="user-tile">
                                    <div className="user-tile-avatar">
                                        <UserAvatar name={u.name} avatar={u.avatar} size="lg" hasStory={checkUserHasStory(u.id)} />
                                    </div>
                                    <div className="user-tile-name">
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
                                        {u.verified && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><VerifiedIcon size={12} /></span>}
                                    </div>
                                    <div className="user-tile-handle">@{u.username}</div>
                                    <div className="user-tile-role">
                                        <span className={`role-badge role-${u.role}`} style={{ display: 'inline-block' }}>{ROLE_LABELS[u.role] ?? u.role}</span>
                                    </div>
                                    <div className="user-tile-stats">
                                        <strong style={{ color: 'var(--text-primary)' }}>{formatNumber(u.followers)}</strong> followers
                                    </div>
                                    <button 
                                        className={followingIds.has(u.id) ? "btn btn-outline btn-sm user-tile-btn" : "btn btn-primary btn-sm user-tile-btn"} 
                                        onClick={(e) => { e.preventDefault(); toggleFollowUser(u.id); }}>
                                        {followingIds.has(u.id) ? 'Following' : 'Follow'}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', padding: '12px 0' }}>No similar profiles found</p>
                    )}
                </div>

                {/* Browse Profiles */}
                <div className="hp-card" style={{ marginTop: 16 }}>
                    <div className="hp-card-title"><TrendingUpIcon size={15} /> Browse Profiles</div>
                    <div className="user-tile-grid">
                        {allUsers.filter(u => u.id !== profileUser.id).slice(0, 4).map(u => (
                            <Link key={u.id} href={`/profile/${u.username}`} className="user-tile">
                                <div className="user-tile-avatar">
                                    <UserAvatar name={u.name} avatar={u.avatar} size="lg" />
                                </div>
                                <div className="user-tile-name">
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
                                    {u.verified && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><VerifiedIcon size={12} /></span>}
                                </div>
                                <div className="user-tile-handle">@{u.username}</div>
                                <div className="user-tile-role">
                                    <span className={`role-badge role-${u.role}`} style={{ display: 'inline-block' }}>{ROLE_LABELS[u.role] ?? u.role}</span>
                                </div>
                                <div className="user-tile-stats">
                                    <strong style={{ color: 'var(--text-primary)' }}>{formatNumber(u.followers)}</strong> followers
                                </div>
                                <button 
                                    className={followingIds.has(u.id) ? "btn btn-outline btn-sm user-tile-btn" : "btn btn-primary btn-sm user-tile-btn"} 
                                    onClick={(e) => { e.preventDefault(); toggleFollowUser(u.id); }}>
                                    {followingIds.has(u.id) ? 'Following' : 'Follow'}
                                </button>
                            </Link>
                        ))}
                    </div>
                    <Link href="/explore" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 12, textAlign: 'center', display: 'block' }}>
                        View All Profiles
                    </Link>
                </div>
            </aside>

            {activeCommType && profileUser && (
                <CommunicationModal
                    user={profileUser}
                    type={activeCommType}
                    onClose={() => setActiveCommType(null)}
                />
            )}
            
            {/* Share Profile Modal */}
            {isShareModalOpen && (
                <ShareProfileModal 
                    user={profileUser} 
                    onClose={() => setIsShareModalOpen(false)} 
                />
            )}
        </div>
    );
}
