'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { getUserByUsername, getPostsByUser, users, formatNumber, checkUserHasStory } from '@/lib/mock-data';
import { PhoneIcon, MailIcon, VerifiedIcon, CalendarIcon, LandmarkIcon, MessageCircleIcon, RepeatIcon, HeartIcon, BookmarkIcon, ArrowLeftIcon, PenIcon, XIcon, CameraIcon, MapPinIcon, GlobeIcon } from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';


function EditProfileModal({ user, onClose, onSave }: {
    user: { name: string; username: string; bio: string; location: string; website: string; avatar?: string };
    onClose: () => void;
    onSave: (data: { name: string; bio: string; location: string; website: string }) => void;
}) {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [location, setLocation] = useState(user.location);
    const [website, setWebsite] = useState(user.website);

    const handleSave = () => {
        onSave({ name, bio, location, website });
        onClose();
    };

    return (
        <div className="edit-profile-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="edit-profile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-icon" onClick={onClose} aria-label="Close"><XIcon size={20} /></button>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Profile</h2>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                </div>

                {/* Banner area with camera overlay */}
                <div className="edit-profile-banner">
                    <div className="edit-banner-overlay">
                        <CameraIcon size={22} />
                    </div>
                </div>

                {/* Avatar with camera overlay */}
                <div className="edit-profile-avatar-wrap">
                    <UserAvatar name={name} avatar={user.avatar} size="xxl" />
                    <div className="edit-avatar-overlay">
                        <CameraIcon size={18} />
                    </div>
                </div>

                {/* Form fields */}
                <div className="edit-profile-form">
                    <div className="edit-field">
                        <label className="edit-field-label">Name</label>
                        <input
                            className="edit-field-input"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={50}
                            placeholder="Your display name"
                        />
                        <span className="edit-field-count">{name.length}/50</span>
                    </div>

                    <div className="edit-field">
                        <label className="edit-field-label">Bio</label>
                        <textarea
                            className="edit-field-input edit-field-textarea"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            maxLength={160}
                            rows={3}
                            placeholder="Tell people about yourself"
                        />
                        <span className="edit-field-count">{bio.length}/160</span>
                    </div>

                    <div className="edit-field">
                        <label className="edit-field-label">
                            <MapPinIcon size={14} /> Location
                        </label>
                        <input
                            className="edit-field-input"
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            maxLength={30}
                            placeholder="Where are you based?"
                        />
                    </div>

                    <div className="edit-field">
                        <label className="edit-field-label">
                            <GlobeIcon size={14} /> Website
                        </label>
                        <input
                            className="edit-field-input"
                            type="url"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            placeholder="https://your-website.com"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    const tabs = ['Posts', 'Replies', 'Media', 'Likes'];

    // Check if viewing own profile
    const isOwnProfile = isLoggedIn && loggedInUser?.username === username;

    // If user edits their profile, override the mock data with live data
    const displayName = isOwnProfile && loggedInUser ? loggedInUser.name : user?.name || '';
    const displayBio = isOwnProfile && loggedInUser ? loggedInUser.bio : user?.bio || '';
    const displayLocation = isOwnProfile && loggedInUser ? loggedInUser.location : '';
    const displayWebsite = isOwnProfile && loggedInUser ? loggedInUser.website : '';

    if (!user) {
        return (
            <div className="page-container">
                <div className="feed-column">
                    <div className="page-header">
                        <div className="page-header-row">
                            <Link href="/" className="btn btn-icon"><ArrowLeftIcon size={18} /></Link>
                            <h1>User not found</h1>
                        </div>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-title">@{username} doesn&apos;t exist</span>
                        <span className="empty-state-text">This user may have been removed or the username is incorrect.</span>
                        <Link href="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Users</Link>
                    </div>
                </div>
            </div>
        );
    }

    const mutuals = users.filter(u => u.id !== user.id && u.verified).slice(0, 3);

    const handleEditSave = (data: { name: string; bio: string; location: string; website: string }) => {
        updateProfile(data);
    };

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <div className="page-header-row">
                        <Link href="/" className="btn btn-icon"><ArrowLeftIcon size={18} /></Link>
                        <div>
                            <h1 style={{ fontSize: '1.1rem' }}>{displayName}</h1>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{userPosts.length} posts</div>
                        </div>
                    </div>
                </div>

                {/* Banner */}
                <div className="profile-banner" style={{ background: user.banner || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />

                {/* Avatar + Actions */}
                <div className="profile-avatar-section">
                    <UserAvatar name={displayName} avatar={user.avatar} size="xxl" hasStory={checkUserHasStory(user.id)} />
                    <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
                        {isOwnProfile ? (
                            <button
                                className="btn btn-outline btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}
                                onClick={() => setShowEditModal(true)}
                            >
                                <PenIcon size={14} /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}><PhoneIcon size={14} /> Call</button>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => requireAuth(() => { })}>
                                    <MailIcon size={14} /> Message
                                </button>
                                <button
                                    className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => requireAuth(() => setIsFollowing(!isFollowing))}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="profile-info">
                    <div className="profile-name">
                        {displayName}
                        {user.verified && <VerifiedIcon size={16} />}
                        <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </div>
                    <div className="profile-handle">@{user.username}</div>
                    <div className="profile-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={13} /> Joined {user.joined}</span>
                        {user.party && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><LandmarkIcon size={13} /> {user.party}</span>}
                        {displayLocation && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={13} /> {displayLocation}</span>}
                        {displayWebsite && <a href={displayWebsite} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}><GlobeIcon size={13} /> {displayWebsite.replace(/^https?:\/\//, '')}</a>}
                    </div>
                </div>
                <div className="profile-bio">{displayBio}</div>

                {/* Stats */}
                <div className="profile-stats">
                    <div className="profile-stat">
                        <div className="profile-stat-value">{formatNumber(user.following)}</div>
                        <div className="profile-stat-label">Following</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-value">{formatNumber(user.followers)}</div>
                        <div className="profile-stat-label">Followers</div>
                    </div>
                </div>

                {/* Followed by */}
                {mutuals.length > 0 && (
                    <div style={{ padding: '0 20px 12px', fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex' }}>
                            {mutuals.map((m, i) => (
                                <UserAvatar
                                    key={m.id}
                                    name={m.name}
                                    avatar={m.avatar}
                                    size="sm"
                                    style={{
                                        marginLeft: i > 0 ? -8 : 0,
                                        border: '2px solid var(--bg-primary)',
                                        zIndex: 3 - i
                                    }}
                                />
                            ))}
                        </div>
                        Followed by {mutuals.map(m => m.name.split(' ')[0]).join(', ')}
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs">
                    {tabs.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`} onClick={() => setActiveTab(tab.toLowerCase())}>{tab}</button>
                    ))}
                </div>

                {/* Posts */}
                {activeTab === 'posts' && userPosts.length > 0 ? (
                    userPosts.map(post => (
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
                                    {post.author.party && <span className="role-badge role-politician">{post.author.party}</span>}
                                </div>
                            </div>
                            <PostContent content={post.content} />
                            <div className="post-actions">
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><MessageCircleIcon size={16} /></span><span>{formatNumber(post.comments)}</span></button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><RepeatIcon size={16} /></span><span>{formatNumber(post.reposts)}</span></button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><HeartIcon size={16} /></span><span>{formatNumber(post.likes)}</span></button>
                                <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><BookmarkIcon size={16} /></span></button>
                            </div>
                        </article>
                    ))
                ) : activeTab === 'posts' ? (
                    <div className="empty-state">
                        <span className="empty-state-title">No posts yet</span>
                        <span className="empty-state-text">When @{user.username} posts, they&apos;ll show up here.</span>
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-title">Nothing here yet</span>
                        <span className="empty-state-text">This section is coming soon.</span>
                    </div>
                )}
            </div>

            {/* Right Panel - Similar Profiles */}
            <div className="right-panel">
                <div className="card" style={{ padding: 16 }}>
                    <h3 className="section-title">Similar Profiles</h3>
                    {users.filter(u => u.id !== user.id && u.role === user.role).slice(0, 4).map(u => (
                        <Link key={u.id} href={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit' }}>
                            <UserAvatar name={u.name} avatar={u.avatar} size="sm" hasStory={checkUserHasStory(u.id)} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {u.name} {u.verified && <VerifiedIcon size={13} />}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>@{u.username}</div>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={(e) => { e.preventDefault(); requireAuth(() => { }); }}>Follow</button>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && isOwnProfile && loggedInUser && (
                <EditProfileModal
                    user={loggedInUser}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
}
