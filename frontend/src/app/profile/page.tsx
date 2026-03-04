'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { postsApi, usersApi, type ApiPost, type ApiUser, timeAgo } from '@/lib/api';
import { formatNumber } from '@/lib/mock-data';
import { PhoneIcon, MailIcon, VerifiedIcon, CalendarIcon, LandmarkIcon, MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon, BookmarkIcon, PenIcon, XIcon, CameraIcon, MapPinIcon, GlobeIcon } from '@/components/ui/Icons';
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
                        <textarea className="edit-field-input edit-field-textarea" value={bio} onChange={e => setBio(e.target.value)} maxLength={280} rows={3} placeholder="Tell people about yourself" />
                        <span className="edit-field-count">{bio.length}/280</span>
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
    const { requireAuth } = useAuthGate();
    const [profileUser, setProfileUser] = useState<ApiUser | null>(null);
    const [userPosts, setUserPosts] = useState<ApiPost[]>([]);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const tabs = ['Posts', 'Replies', 'Media', 'Likes'];

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            // Use logged-in user's profile, or default to first API user
            const targetUsername = loggedInUser?.username || 'alexjordan';
            const [userRes, postsRes] = await Promise.all([
                usersApi.getByUsername(targetUsername),
                postsApi.getAll({ author: loggedInUser?._id }),
            ]);
            setProfileUser(userRes.user);
            setUserPosts(postsRes.posts);
        } catch (_e) {
            // Fall back gracefully
        } finally {
            setLoading(false);
        }
    }, [loggedInUser]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleLike = (postId: string) => {
        requireAuth(async () => {
            try {
                const res = await postsApi.like(postId);
                setLikedIds(prev => { const s = new Set(prev); res.liked ? s.add(postId) : s.delete(postId); return s; });
            } catch (_e) { /* ignore */ }
        });
    };

    const handleEditSave = async (data: { name: string; bio: string; location: string; website: string }) => {
        if (loggedInUser) {
            try {
                const res = await usersApi.update(loggedInUser._id, data);
                updateProfile(res.user);
                setProfileUser(res.user);
            } catch (_e) { /* ignore */ }
        }
    };

    const displayUser = profileUser;
    const displayName = displayUser?.name || 'Profile';

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
                    <UserAvatar name={displayName} avatar={displayUser?.avatar || ''} size="xxl" />
                    <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
                        {isLoggedIn && loggedInUser?._id === displayUser?._id ? (
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
                                <button className="btn btn-primary btn-sm" onClick={() => requireAuth(async () => {
                                    if (displayUser) await usersApi.follow(displayUser._id);
                                })}>Follow</button>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading profile...</div>
                ) : displayUser ? (
                    <>
                        <div className="profile-info">
                            <div className="profile-name">
                                {displayUser.name}
                                {displayUser.verified && <VerifiedIcon size={16} />}
                                <span className={`role-badge role-${displayUser.role}`}>{displayUser.role}</span>
                            </div>
                            <div className="profile-handle">@{displayUser.username}</div>
                            <div className="profile-meta">
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <CalendarIcon size={13} /> Joined {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                                </span>
                                {displayUser.party && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><LandmarkIcon size={13} /> {displayUser.party}</span>}
                                {displayUser.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={13} /> {displayUser.location}</span>}
                                {displayUser.website && <a href={displayUser.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}><GlobeIcon size={13} /> {displayUser.website.replace(/^https?:\/\//, '')}</a>}
                            </div>
                        </div>
                        <div className="profile-bio">{displayUser.bio}</div>
                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="profile-stat-value">{formatNumber(Array.isArray(displayUser.following) ? displayUser.following.length : (displayUser.followingCount || 0))}</div>
                                <div className="profile-stat-label">Following</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{formatNumber(Array.isArray(displayUser.followers) ? displayUser.followers.length : (displayUser.followersCount || 0))}</div>
                                <div className="profile-stat-label">Followers</div>
                            </div>
                        </div>
                    </>
                ) : null}

                <div className="tabs">
                    {tabs.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`} onClick={() => setActiveTab(tab.toLowerCase())}>{tab}</button>
                    ))}
                </div>

                {userPosts.map(post => (
                    <article key={post._id} className="post-card fade-in">
                        <div className="post-header">
                            <UserAvatar name={post.author.name} avatar={post.author.avatar} />
                            <div className="post-meta">
                                <div className="post-author-row">
                                    <span className="post-author">{post.author.name}</span>
                                    {post.author.verified && <VerifiedIcon size={14} />}
                                    <span className="post-handle">@{post.author.username}</span>
                                    <span className="post-time">{timeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <PostContent content={post.content} />
                        <div className="post-actions">
                            <button className="post-action"><span className="action-icon"><MessageCircleIcon size={16} /></span><span>{formatNumber(post.commentsCount)}</span></button>
                            <button className="post-action"><span className="action-icon"><RepeatIcon size={16} /></span><span>{formatNumber(post.repostsCount)}</span></button>
                            <button className={`post-action ${likedIds.has(post._id) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                                <span className="action-icon">{likedIds.has(post._id) ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}</span>
                                <span>{formatNumber(post.likesCount)}</span>
                            </button>
                            <button className="post-action"><span className="action-icon"><BookmarkIcon size={16} /></span></button>
                        </div>
                    </article>
                ))}
            </div>

            {showEditModal && isLoggedIn && loggedInUser && (
                <EditProfileModal
                    user={{ name: loggedInUser.name, username: loggedInUser.username, bio: loggedInUser.bio || '', location: loggedInUser.location || '', website: loggedInUser.website || '', avatar: loggedInUser.avatar }}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
}
