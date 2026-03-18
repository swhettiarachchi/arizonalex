'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { getUserByUsername, getPostsByUser, users, formatNumber, checkUserHasStory } from '@/lib/mock-data';
import {
    PhoneIcon, MailIcon, VerifiedIcon, CalendarIcon, LandmarkIcon,
    MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon, BookmarkIcon,
    ShareIcon, ArrowLeftIcon, PenIcon, XIcon, CameraIcon, MapPinIcon,
    GlobeIcon, TrendingUpIcon, BarChartIcon, UsersIcon, ActivityIcon,
    LayersIcon, FileTextIcon, ZapIcon, ChevronRightIcon, CheckCircleIcon,
    ShieldIcon, UserIcon, BriefcaseIcon, ScaleIcon
} from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';

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

// ── Full Edit Profile Modal ──────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }: {
    user: { name: string; username: string; bio: string; location: string; website: string; role: UserRole; party?: string; phone?: string; email?: string; avatar?: string };
    onClose: () => void;
    onSave: (data: Partial<typeof user & { role: UserRole }>) => void;
}) {
    const [step, setStep] = useState<'info' | 'role'>('info');
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [location, setLocation] = useState(user.location);
    const [website, setWebsite] = useState(user.website);
    const [party, setParty] = useState(user.party || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState<UserRole>(user.role);
    const [roleSearch, setRoleSearch] = useState('');

    const filteredRoles = ALL_ROLES.filter(r =>
        !roleSearch || r.label.toLowerCase().includes(roleSearch.toLowerCase()) ||
        r.desc.toLowerCase().includes(roleSearch.toLowerCase())
    );

    const handleSave = () => {
        onSave({ name, bio, location, website, role, party, phone, email });
        onClose();
    };

    const selectedRole = ALL_ROLES.find(r => r.value === role)!;

    return (
        <div className="edit-profile-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', maxWidth: 520, width: '100%' }}>

                {/* Header */}
                <div className="edit-profile-header" style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-icon" onClick={onClose}><XIcon size={20} /></button>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            {step === 'info' ? 'Edit Profile' : 'Change Role'}
                        </h2>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>Save changes</button>
                </div>

                {/* Step tabs */}
                <div className="tabs" style={{ flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
                    <button className={`tab ${step === 'info' ? 'active' : ''}`} onClick={() => setStep('info')} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <UserIcon size={13} /> Profile Info
                    </button>
                    <button className={`tab ${step === 'role' ? 'active' : ''}`} onClick={() => setStep('role')} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ShieldIcon size={13} /> Change Role
                        <span style={{ marginLeft: 4, fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: `${selectedRole?.color}20`, color: selectedRole?.color }}>{selectedRole?.label}</span>
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {/* ── PROFILE INFO STEP ── */}
                    {step === 'info' && (
                        <>
                            {/* Banner with camera */}
                            <div className="edit-profile-banner" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                                <div className="edit-banner-overlay"><CameraIcon size={22} /></div>
                            </div>

                            {/* Avatar with camera */}
                            <div className="edit-profile-avatar-wrap">
                                <UserAvatar name={name} avatar={user.avatar} size="xxl" />
                                <div className="edit-avatar-overlay"><CameraIcon size={18} /></div>
                            </div>

                            {/* Role badge preview (clickable to switch to role tab) */}
                            <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`role-badge role-${role}`}>{ROLE_LABELS[role]}</span>
                                <button onClick={() => setStep('role')} style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                    Change role →
                                </button>
                            </div>

                            <div className="edit-profile-form">
                                {/* Name */}
                                <div className="edit-field">
                                    <label className="edit-field-label">Display Name</label>
                                    <input className="edit-field-input" type="text" value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="Your display name" />
                                    <span className="edit-field-count">{name.length}/50</span>
                                </div>

                                {/* Bio */}
                                <div className="edit-field">
                                    <label className="edit-field-label">Bio</label>
                                    <textarea className="edit-field-input edit-field-textarea" value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3} placeholder="Tell people about yourself…" />
                                    <span className="edit-field-count">{bio.length}/160</span>
                                </div>

                                {/* Location */}
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPinIcon size={13} /> Location</label>
                                    <input className="edit-field-input" type="text" value={location} onChange={e => setLocation(e.target.value)} maxLength={40} placeholder="City, State or Country" />
                                </div>

                                {/* Website */}
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><GlobeIcon size={13} /> Website</label>
                                    <input className="edit-field-input" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://your-website.com" />
                                </div>

                                {/* Party (political roles) */}
                                {(role === 'politician' || role === 'official') && (
                                    <div className="edit-field">
                                        <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><LandmarkIcon size={13} /> Party / Affiliation</label>
                                        <input className="edit-field-input" type="text" value={party} onChange={e => setParty(e.target.value)} maxLength={50} placeholder="e.g. Democratic, Republican, Independent…" />
                                    </div>
                                )}

                                {/* Email */}
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MailIcon size={13} /> Email</label>
                                    <input className="edit-field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                                </div>

                                {/* Phone */}
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PhoneIcon size={13} /> Phone (optional)</label>
                                    <input className="edit-field-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── ROLE SELECTION STEP ── */}
                    {step === 'role' && (
                        <div style={{ padding: '16px 20px' }}>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                                    Your role label appears on your profile and all your posts. You can change it at any time.
                                </div>
                                {/* Search */}
                                <div className="search-box" style={{ marginBottom: 12 }}>
                                    <span className="search-icon"><ZapIcon size={14} /></span>
                                    <input placeholder="Search roles…" value={roleSearch} onChange={e => setRoleSearch(e.target.value)} />
                                </div>
                            </div>

                            {/* Role grid */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {filteredRoles.map(r => (
                                    <button key={r.value} onClick={() => setRole(r.value)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                            border: `2px solid ${role === r.value ? r.color : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-md)', background: role === r.value ? `${r.color}10` : 'var(--bg-secondary)',
                                            cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                                        }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${r.color}30` }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.62rem', color: r.color, textTransform: 'uppercase' }}>{r.label.slice(0, 3)}</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === r.value ? r.color : 'inherit' }}>{r.label}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{r.desc}</div>
                                        </div>
                                        {role === r.value && (
                                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircleIcon size={12} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer save */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Profile Page ────────────────────────────────────────────────────
export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { isLoggedIn, user: loggedInUser, updateProfile } = useAuth();
    const { requireAuth } = useAuthGate();
    const user = getUserByUsername(username);
    const userPosts = getPostsByUser(username);
    const [activeTab, setActiveTab] = useState('posts');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

    const isOwnProfile = isLoggedIn && loggedInUser?.username === username;

    // Live display values — use loggedInUser when viewing own profile
    const displayName = isOwnProfile && loggedInUser ? loggedInUser.name : user?.name || '';
    const displayBio = isOwnProfile && loggedInUser ? loggedInUser.bio : user?.bio || '';
    const displayLocation = isOwnProfile && loggedInUser ? loggedInUser.location : '';
    const displayWebsite = isOwnProfile && loggedInUser ? loggedInUser.website : '';
    const displayRole = (isOwnProfile && loggedInUser ? loggedInUser.role : user?.role) ?? 'citizen';
    const displayParty = isOwnProfile && loggedInUser ? (loggedInUser.party ?? '') : (user?.party ?? '');
    const displayEmail = isOwnProfile && loggedInUser ? (loggedInUser.email ?? '') : '';

    const toggleLike = (id: string) => requireAuth(() => setLikedPosts(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }));
    const toggleSave = (id: string) => requireAuth(() => setSavedPosts(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }));

    const TABS = [
        { id: 'posts', label: 'Posts', icon: <FileTextIcon size={13} /> },
        { id: 'replies', label: 'Replies', icon: <MessageCircleIcon size={13} /> },
        { id: 'media', label: 'Media', icon: <LayersIcon size={13} /> },
        { id: 'likes', label: 'Likes', icon: <HeartIcon size={13} /> },
        { id: 'activity', label: 'Analytics', icon: <BarChartIcon size={13} /> },
    ];

    if (!user) {
        return (
            <div className="page-container">
                <div className="feed-column">
                    <div className="page-header"><div className="page-header-row">
                        <Link href="/" className="btn btn-icon"><ArrowLeftIcon size={18} /></Link>
                        <h1>User not found</h1>
                    </div></div>
                    <div className="empty-state">
                        <span className="empty-state-title">@{username} doesn&apos;t exist</span>
                        <span className="empty-state-text">This user may have been removed or the username is incorrect.</span>
                        <Link href="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Users</Link>
                    </div>
                </div>
            </div>
        );
    }

    const similarUsers = users.filter(u => u.id !== user.id && u.role === (isOwnProfile ? displayRole : user.role)).slice(0, 4);
    const mutuals = users.filter(u => u.id !== user.id && u.verified).slice(0, 3);

    const totalLikes = userPosts.reduce((a, p) => a + p.likes, 0);
    const totalReposts = userPosts.reduce((a, p) => a + p.reposts, 0);
    const avgLikes = Math.round(totalLikes / Math.max(userPosts.length, 1));
    const engagementRate = ((Math.abs(parseInt(user.id)) * 7 % 9) + 2.4).toFixed(1);
    const roleInfo = ALL_ROLES.find(r => r.value === displayRole);

    return (
        <div className="page-container home-3col">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="home-left-panel">

                {/* Profile summary card */}
                <div className="ai-insights-card" style={{ marginBottom: 16 }}>
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                        <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 10 }}>
                            <UserAvatar name={displayName} avatar={user.avatar} size="xl" hasStory={checkUserHasStory(user.id)} />
                            {isOwnProfile && (
                                <button onClick={() => setShowEditModal(true)}
                                    style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <CameraIcon size={12} />
                                </button>
                            )}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{displayName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>@{user.username}</div>
                        {user.verified && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                                <VerifiedIcon size={12} /> Verified Account
                            </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                            <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole]}</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                            { label: 'Followers', val: formatNumber(user.followers) },
                            { label: 'Following', val: formatNumber(user.following) },
                            { label: 'Posts', val: String(userPosts.length) },
                            { label: 'Engagement', val: `${engagementRate}%` },
                        ].map(s => (
                            <div key={s.label} className="ai-insight-tile">
                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{s.val}</div>
                                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    {isOwnProfile && (
                        <button onClick={() => setShowEditModal(true)} className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <PenIcon size={13} /> Edit Profile
                        </button>
                    )}
                </div>

                {/* About panel */}
                <div className="hp-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div className="hp-card-title" style={{ marginBottom: 0 }}><ZapIcon size={15} /> About</div>
                        {isOwnProfile && (
                            <button onClick={() => setShowEditModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600 }}>Edit</button>
                        )}
                    </div>
                    {displayBio && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{displayBio}</p>}

                    {/* Role info card */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <CalendarIcon size={13} /> Joined {user.joined}
                        </div>
                        {displayParty && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <LandmarkIcon size={13} /> {displayParty}
                            </div>
                        )}
                        {displayLocation && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <MapPinIcon size={13} /> {displayLocation}
                            </div>
                        )}
                        {displayWebsite && (
                            <a href={displayWebsite} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                                <GlobeIcon size={13} /> {displayWebsite.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        {displayEmail && isOwnProfile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <MailIcon size={13} /> {displayEmail}
                            </div>
                        )}
                    </div>
                </div>

                {/* Post stats */}
                <div className="hp-card">
                    <div className="hp-card-title"><ActivityIcon size={15} /> Post Stats</div>
                    {[
                        { label: 'Total Likes', val: formatNumber(totalLikes), color: '#ef4444' },
                        { label: 'Total Reposts', val: formatNumber(totalReposts), color: '#10b981' },
                        { label: 'Avg Likes/Post', val: formatNumber(avgLikes), color: 'var(--primary)' },
                        { label: 'Total Posts', val: String(userPosts.length), color: '#f59e0b' },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ── CENTER ── */}
            <div className="feed-column" style={{ minWidth: 0 }}>

                {/* Sticky header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10, backdropFilter: 'blur(12px)' }}>
                    <Link href="/" className="btn btn-icon"><ArrowLeftIcon size={18} /></Link>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{displayName}</h1>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{userPosts.length} posts</div>
                    </div>
                    {isOwnProfile && (
                        <button onClick={() => setShowEditModal(true)} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <PenIcon size={13} /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Banner */}
                <div style={{ position: 'relative' }}>
                    <div className="profile-banner" style={{ background: user.banner || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
                    {isOwnProfile && (
                        <button onClick={() => setShowEditModal(true)}
                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
                            <CameraIcon size={13} /> Change Banner
                        </button>
                    )}
                </div>

                {/* Avatar + Actions */}
                <div className="profile-avatar-section">
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                        <UserAvatar name={displayName} avatar={user.avatar} size="xxl" hasStory={checkUserHasStory(user.id)} />
                        {isOwnProfile && (
                            <button onClick={() => setShowEditModal(true)}
                                style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <CameraIcon size={13} />
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, paddingBottom: 8, flexWrap: 'wrap' }}>
                        {isOwnProfile ? (
                            <>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setShowEditModal(true)}>
                                    <PenIcon size={14} /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}><PhoneIcon size={14} /> Call</button>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}><MailIcon size={14} /> Message</button>
                                <button className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`} onClick={() => requireAuth(() => setIsFollowing(!isFollowing))}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Profile info */}
                <div className="profile-info">
                    <div className="profile-name">{displayName}{user.verified && <VerifiedIcon size={16} />}</div>
                    <div className="profile-handle">@{user.username}</div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole]}</span>
                        {displayParty && <span className="role-badge role-politician">{displayParty}</span>}
                        {isOwnProfile && (
                            <button onClick={() => { setShowEditModal(true); }} style={{ fontSize: '0.68rem', color: 'var(--primary)', background: 'rgba(var(--primary-rgb),0.08)', border: '1px solid rgba(var(--primary-rgb),0.2)', borderRadius: 20, padding: '2px 8px', cursor: 'pointer', fontWeight: 600 }}>
                                Change role
                            </button>
                        )}
                    </div>
                    <div className="profile-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={13} /> Joined {user.joined}</span>
                        {displayLocation && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={13} /> {displayLocation}</span>}
                        {displayWebsite && <a href={displayWebsite} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}><GlobeIcon size={13} /> {displayWebsite.replace(/^https?:\/\//, '')}</a>}
                    </div>
                </div>
                {displayBio && <div className="profile-bio">{displayBio}</div>}

                {/* Stats row */}
                <div className="profile-stats">
                    <div className="profile-stat"><div className="profile-stat-value">{formatNumber(user.following)}</div><div className="profile-stat-label">Following</div></div>
                    <div className="profile-stat"><div className="profile-stat-value">{formatNumber(user.followers)}</div><div className="profile-stat-label">Followers</div></div>
                    <div className="profile-stat"><div className="profile-stat-value">{userPosts.length}</div><div className="profile-stat-label">Posts</div></div>
                    <div className="profile-stat"><div className="profile-stat-value">{formatNumber(totalLikes)}</div><div className="profile-stat-label">Total Likes</div></div>
                </div>

                {/* Mutuals */}
                {mutuals.length > 0 && (
                    <div style={{ padding: '0 20px 12px', fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex' }}>
                            {mutuals.map((m, i) => (
                                <UserAvatar key={m.id} name={m.name} avatar={m.avatar} size="sm" style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--bg-primary)', zIndex: 3 - i }} />
                            ))}
                        </div>
                        Followed by {mutuals.map(m => m.name.split(' ')[0]).join(', ')}
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {TABS.map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* POSTS tab */}
                {activeTab === 'posts' && (
                    userPosts.length > 0 ? userPosts.map(post => (
                        <article key={post.id} className="post-card fade-in">
                            <div className="post-header">
                                <UserAvatar name={post.author.name} avatar={post.author.avatar} hasStory={checkUserHasStory(post.author.id)} />
                                <div className="post-meta">
                                    <div className="post-author-row">
                                        <span className="post-author">{post.author.name}</span>
                                        {post.author.verified && <VerifiedIcon size={14} />}
                                        <span className="post-handle">@{post.author.username}</span>
                                        <span className="post-time">{post.timestamp}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                                        <span className={`role-badge role-${isOwnProfile ? displayRole : post.author.role}`}>{ROLE_LABELS[isOwnProfile ? displayRole : post.author.role]}</span>
                                        {post.author.party && <span className="role-badge role-politician">{post.author.party}</span>}
                                    </div>
                                </div>
                            </div>
                            <PostContent content={post.content} />
                            <div className="post-actions">
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={17} /></span><span>{formatNumber(post.comments)}</span></button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={17} /></span><span>{formatNumber(post.reposts)}</span></button>
                                <button className={`post-action ${likedPosts.has(post.id) ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                                    <span className="action-icon">{likedPosts.has(post.id) ? <HeartFilledIcon size={17} /> : <HeartIcon size={17} />}</span>
                                    <span>{formatNumber(post.likes + (likedPosts.has(post.id) ? 1 : 0))}</span>
                                </button>
                                <button className={`post-action ${savedPosts.has(post.id) ? 'bookmarked' : ''}`} onClick={() => toggleSave(post.id)}>
                                    <span className="action-icon"><BookmarkIcon size={17} /></span>
                                </button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><ShareIcon size={17} /></span></button>
                            </div>
                        </article>
                    )) : (
                        <div className="empty-state">
                            <span className="empty-state-title">No posts yet</span>
                            <span className="empty-state-text">When @{user.username} posts, they&apos;ll appear here.</span>
                        </div>
                    )
                )}

                {/* ANALYTICS tab */}
                {activeTab === 'activity' && (
                    <div style={{ padding: 16 }} className="fade-in">
                        <div className="stats-grid" style={{ marginBottom: 20 }}>
                            {[
                                { val: formatNumber(user.followers), label: 'Followers', change: '+4.2%' },
                                { val: `${engagementRate}%`, label: 'Engagement Rate', change: '+0.8pp' },
                                { val: formatNumber(totalLikes), label: 'Total Likes', change: '+12%' },
                                { val: formatNumber(totalReposts), label: 'Reposts', change: '+6%' },
                            ].map((s, i) => (
                                <div key={i} className="stat-card">
                                    <span className="stat-value">{s.val}</span>
                                    <span className="stat-label">{s.label}</span>
                                    <span className="stat-change up">{s.change}</span>
                                </div>
                            ))}
                        </div>
                        <div className="hp-card" style={{ marginBottom: 16 }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Post Activity (12 months)</h4>
                            <div className="chart-placeholder" style={{ height: 100 }}>
                                {[20, 35, 28, 42, 38, 55, 47, 61, 53, 70, 65, userPosts.length * 8].map((h, i) => (
                                    <div key={i} className="chart-bar" style={{ height: `${Math.min(h, 100)}%` }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                            </div>
                        </div>
                        <div className="hp-card">
                            <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Top Performing Posts</h4>
                            {userPosts.sort((a, b) => b.likes - a.likes).slice(0, 3).map((post, i) => (
                                <div key={post.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                                    <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content.slice(0, 60)}…</div>
                                    <div style={{ flexShrink: 0, textAlign: 'right', fontSize: '0.75rem' }}>
                                        <div style={{ fontWeight: 700, color: '#ef4444' }}>{formatNumber(post.likes)} likes</div>
                                        <div style={{ color: 'var(--text-tertiary)' }}>{post.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other tabs */}
                {(activeTab === 'replies' || activeTab === 'media' || activeTab === 'likes') && (
                    <div className="empty-state">
                        <span className="empty-state-title">Nothing here yet</span>
                        <span className="empty-state-text">This section is coming soon.</span>
                    </div>
                )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <aside className="right-panel">
                {isOwnProfile && (
                    <div className="hp-card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.08), rgba(var(--accent-rgb),0.08))', border: '1px solid rgba(var(--primary-rgb),0.2)' }}>
                        <div className="hp-card-title" style={{ color: 'var(--primary)' }}><PenIcon size={15} /> Your Profile</div>
                        {[
                            { label: 'Edit profile info', action: 'info' },
                            { label: 'Change your role', action: 'role' },
                            { label: 'Update bio & links', action: 'info' },
                            { label: 'Change banner photo', action: 'info' },
                            { label: 'Update contact info', action: 'info' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => setShowEditModal(true)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.82rem', color: 'inherit', textAlign: 'left', fontWeight: 500 }}>
                                {item.label} <ChevronRightIcon size={13} />
                            </button>
                        ))}
                    </div>
                )}

                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><UsersIcon size={15} /> Similar Profiles</div>
                    {similarUsers.length > 0 ? similarUsers.map(u => (
                        <Link key={u.id} href={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit' }}>
                            <UserAvatar name={u.name} avatar={u.avatar} size="sm" hasStory={checkUserHasStory(u.id)} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>{u.name} {u.verified && <VerifiedIcon size={13} />}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>@{u.username} · {formatNumber(u.followers)} followers</div>
                            </div>
                            <button className="btn btn-outline btn-sm" style={{ flexShrink: 0, fontSize: '0.7rem', padding: '3px 8px' }}
                                onClick={e => { e.preventDefault(); requireAuth(() => { }); }}>Follow</button>
                        </Link>
                    )) : (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', padding: '10px 0' }}>No similar profiles found.</div>
                    )}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><TrendingUpIcon size={15} /> Who to Follow</div>
                    {users.filter(u => u.id !== user.id).slice(0, 4).map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <Link href={`/profile/${u.username}`}><UserAvatar name={u.name} avatar={u.avatar} size="sm" /></Link>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>{u.name} {u.verified && <VerifiedIcon size={12} />}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{ROLE_LABELS[u.role] ?? u.role}</div>
                            </div>
                            <button className="btn btn-outline btn-sm" style={{ flexShrink: 0, fontSize: '0.7rem', padding: '3px 8px' }} onClick={() => requireAuth(() => { })}>Follow</button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Edit Profile Modal */}
            {showEditModal && isOwnProfile && loggedInUser && (
                <EditProfileModal
                    user={{ ...loggedInUser, role: loggedInUser.role ?? 'citizen' }}
                    onClose={() => setShowEditModal(false)}
                    onSave={data => updateProfile(data)}
                />
            )}
        </div>
    );
}
