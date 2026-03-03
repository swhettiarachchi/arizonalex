'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { users, posts, formatNumber } from '@/lib/mock-data';
import { PhoneIcon, MailIcon, VerifiedIcon, CalendarIcon, LandmarkIcon, MessageCircleIcon, RepeatIcon, HeartIcon, BookmarkIcon, PenIcon, XIcon, CameraIcon, MapPinIcon, GlobeIcon } from '@/components/ui/Icons';
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
                <div className="edit-profile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-icon" onClick={onClose} aria-label="Close"><XIcon size={20} /></button>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Profile</h2>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                </div>
                <div className="edit-profile-banner">
                    <div className="edit-banner-overlay"><CameraIcon size={22} /></div>
                </div>
                <div className="edit-profile-avatar-wrap">
                    <UserAvatar name={name} avatar={user.avatar} size="xxl" />
                    <div className="edit-avatar-overlay"><CameraIcon size={18} /></div>
                </div>
                <div className="edit-profile-form">
                    <div className="edit-field">
                        <label className="edit-field-label">Name</label>
                        <input className="edit-field-input" type="text" value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="Your display name" />
                        <span className="edit-field-count">{name.length}/50</span>
                    </div>
                    <div className="edit-field">
                        <label className="edit-field-label">Bio</label>
                        <textarea className="edit-field-input edit-field-textarea" value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3} placeholder="Tell people about yourself" />
                        <span className="edit-field-count">{bio.length}/160</span>
                    </div>
                    <div className="edit-field">
                        <label className="edit-field-label"><MapPinIcon size={14} /> Location</label>
                        <input className="edit-field-input" type="text" value={location} onChange={e => setLocation(e.target.value)} maxLength={30} placeholder="Where are you based?" />
                    </div>
                    <div className="edit-field">
                        <label className="edit-field-label"><GlobeIcon size={14} /> Website</label>
                        <input className="edit-field-input" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://your-website.com" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { isLoggedIn, user: loggedInUser, updateProfile } = useAuth();
    const user = users[4]; // Alex Jordan (default profile)
    const userPosts = posts.filter(p => p.author.username === user.username);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const tabs = ['Posts', 'Replies', 'Media', 'Likes'];

    // Use live auth data if logged in (so edits persist), otherwise use mock data
    const displayName = isLoggedIn && loggedInUser ? loggedInUser.name : user.name;
    const displayBio = isLoggedIn && loggedInUser ? loggedInUser.bio : user.bio;
    const displayLocation = isLoggedIn && loggedInUser ? loggedInUser.location : '';
    const displayWebsite = isLoggedIn && loggedInUser ? loggedInUser.website : '';

    const handleEditSave = (data: { name: string; bio: string; location: string; website: string }) => {
        updateProfile(data);
    };

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <div className="page-header-row">
                        <h1 style={{ fontSize: '1.1rem' }}>{displayName}</h1>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{userPosts.length} posts</div>
                    </div>
                </div>
                <div className="profile-banner" />
                <div className="profile-avatar-section">
                    <UserAvatar name={displayName} avatar={user.avatar} size="xxl" />
                    <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
                        {isLoggedIn ? (
                            <button
                                className="btn btn-outline btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}
                                onClick={() => setShowEditModal(true)}
                            >
                                <PenIcon size={14} /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PhoneIcon size={14} /> Call</button>
                                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MailIcon size={14} /> Message</button>
                                <button className="btn btn-primary btn-sm">Follow</button>
                            </>
                        )}
                    </div>
                </div>
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
                <div className="profile-stats">
                    <div className="profile-stat"><div className="profile-stat-value">{formatNumber(user.following)}</div><div className="profile-stat-label">Following</div></div>
                    <div className="profile-stat"><div className="profile-stat-value">{formatNumber(user.followers)}</div><div className="profile-stat-label">Followers</div></div>
                </div>

                {/* Browse all profiles */}
                <div style={{ padding: '0 16px 16px' }}>
                    <h3 className="section-title">All Profiles</h3>
                    <div className="grid-2">
                        {users.map(u => (
                            <Link key={u.id} href={`/profile/${u.username}`} className="card" style={{ padding: 16, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
                                <UserAvatar name={u.name} avatar={u.avatar} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {u.name} {u.verified && <VerifiedIcon size={12} />}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>@{u.username}</div>
                                    <span className={`role-badge role-${u.role}`} style={{ marginTop: 4 }}>{u.role}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="tabs">
                    {tabs.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`} onClick={() => setActiveTab(tab.toLowerCase())}>{tab}</button>
                    ))}
                </div>
                {userPosts.map(post => (
                    <article key={post.id} className="post-card fade-in">
                        <div className="post-header">
                            <UserAvatar name={post.author.name} avatar={post.author.avatar} />
                            <div className="post-meta">
                                <div className="post-author-row">
                                    <span className="post-author">{post.author.name}</span>
                                    {post.author.verified && <VerifiedIcon size={14} />}
                                    <span className="post-handle">@{post.author.username}</span>
                                    <span className="post-time">{post.timestamp}</span>
                                </div>
                            </div>
                        </div>
                        <PostContent content={post.content} />
                        <div className="post-actions">
                            <button className="post-action"><span className="action-icon"><MessageCircleIcon size={16} /></span><span>{formatNumber(post.comments)}</span></button>
                            <button className="post-action"><span className="action-icon"><RepeatIcon size={16} /></span><span>{formatNumber(post.reposts)}</span></button>
                            <button className="post-action"><span className="action-icon"><HeartIcon size={16} /></span><span>{formatNumber(post.likes)}</span></button>
                            <button className="post-action"><span className="action-icon"><BookmarkIcon size={16} /></span></button>
                        </div>
                    </article>
                ))}
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && isLoggedIn && loggedInUser && (
                <EditProfileModal
                    user={loggedInUser}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
}
