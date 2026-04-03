import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import {
    LandmarkIcon, GlobeIcon, MapPinIcon, CalendarIcon, MailIcon,
    ShieldIcon, CheckCircleIcon, ZapIcon, BarChartIcon, ActivityIcon,
    TrendingUpIcon, StarIcon, BriefcaseIcon, TargetIcon, EyeIcon,
    UsersIcon, BotIcon, ThumbsUpIcon, FileTextIcon, ClockIcon, FlagIcon,
    XIcon, LinkIcon, TwitterIcon, FacebookIcon, WhatsAppIcon, CopyIcon, QrCodeIcon
} from '@/components/ui/Icons';

// ── Politician Section ──────────────────────────────────────────────────
export function PoliticianSection({ user }: { user: User }) {
    if (!user.position && !user.party) return null;
    return (
        <div className="prof-section-card prof-politician">
            <div className="prof-section-header">
                <LandmarkIcon size={16} />
                <span>Political Profile</span>
                {user.verified && <span className="prof-verified-badge prof-badge-politician">✓ Verified Politician</span>}
            </div>
            <div className="prof-detail-grid">
                {user.position && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Position</span>
                        <span className="prof-detail-value">{user.position}</span>
                    </div>
                )}
                {user.party && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Party</span>
                        <span className="prof-detail-value">{user.party}</span>
                    </div>
                )}
                {user.ideology && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Ideology</span>
                        <span className="prof-detail-value">{user.ideology}</span>
                    </div>
                )}
                {user.country && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Country</span>
                        <span className="prof-detail-value">{user.country}</span>
                    </div>
                )}
                {user.yearsActive && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Years Active</span>
                        <span className="prof-detail-value">{user.yearsActive}</span>
                    </div>
                )}
                {user.supportPercentage !== undefined && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Public Support</span>
                        <span className="prof-detail-value prof-support">{user.supportPercentage}%</span>
                    </div>
                )}
            </div>

            {/* Campaign Promises */}
            {user.campaignPromises && user.campaignPromises.length > 0 && (
                <div className="prof-sub-section">
                    <div className="prof-sub-title"><TargetIcon size={13} /> Campaign Promises</div>
                    <div className="prof-promise-list">
                        {user.campaignPromises.map((promise, i) => (
                            <div key={i} className="prof-promise-item">
                                <div className="prof-promise-dot" />
                                <span>{promise}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {user.achievements && user.achievements.length > 0 && (
                <div className="prof-sub-section">
                    <div className="prof-sub-title"><StarIcon size={13} /> Achievements</div>
                    <div className="prof-achievement-list">
                        {user.achievements.map((ach, i) => (
                            <div key={i} className="prof-achievement-item">
                                <CheckCircleIcon size={14} />
                                <span>{ach}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Support Bar */}
            {user.supportPercentage !== undefined && (
                <div className="prof-support-bar-wrap">
                    <div className="prof-support-header">
                        <span>Public Approval</span>
                        <span className="prof-support-pct">{user.supportPercentage}%</span>
                    </div>
                    <div className="prof-support-track">
                        <div className="prof-support-fill" style={{ width: `${user.supportPercentage}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Business / Professional Section ──────────────────────────────────────
export function BusinessSection({ user }: { user: User }) {
    if (!user.company && !user.industry) return null;
    return (
        <div className="prof-section-card prof-business">
            <div className="prof-section-header">
                <BriefcaseIcon size={16} />
                <span>Professional Profile</span>
            </div>
            <div className="prof-detail-grid">
                {user.company && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Organization</span>
                        <span className="prof-detail-value">{user.company}</span>
                    </div>
                )}
                {user.industry && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Industry</span>
                        <span className="prof-detail-value">{user.industry}</span>
                    </div>
                )}
                {user.services && user.services.length > 0 && (
                    <div className="prof-detail-item" style={{ gridColumn: '1 / -1' }}>
                        <span className="prof-detail-label">Services</span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                            {user.services.map((s, i) => (
                                <span key={i} className="prof-service-tag">{s}</span>
                            ))}
                        </div>
                    </div>
                )}
                {user.portfolioUrl && (
                    <div className="prof-detail-item">
                        <span className="prof-detail-label">Portfolio</span>
                        <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="prof-detail-link">
                            <GlobeIcon size={12} /> View Portfolio
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Trust & Verification Card ──────────────────────────────────────────
export function TrustVerificationCard({ user, trustScore }: { user: User; trustScore?: number }) {
    const score = trustScore ?? (user.verified ? 92 : 45);
    const level = user.verified
        ? (user.role === 'politician' || user.role === 'official' ? 'Verified Politician' : 'Verified Account')
        : 'Standard Account';
    const levelColor = user.verified
        ? (user.role === 'politician' || user.role === 'official' ? '#3b82f6' : '#10b981')
        : '#64748b';
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="prof-section-card prof-trust">
            <div className="prof-section-header">
                <ShieldIcon size={16} />
                <span>Trust & Verification</span>
            </div>
            <div className="prof-trust-content">
                <div className="prof-trust-gauge">
                    <svg width="88" height="88" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle cx="40" cy="40" r="36" fill="none" stroke={levelColor} strokeWidth="6"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" transform="rotate(-90 40 40)"
                            style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div className="prof-trust-score">
                        <span className="prof-trust-number">{score}</span>
                        <span className="prof-trust-label">Trust</span>
                    </div>
                </div>
                <div className="prof-trust-info">
                    <div className="prof-trust-level" style={{ color: levelColor }}>{level}</div>
                    <div className="prof-trust-badges">
                        {user.verified && (
                            <div className="prof-badge-item"><CheckCircleIcon size={12} /> Identity Verified</div>
                        )}
                        <div className="prof-badge-item"><ShieldIcon size={12} /> Active Account</div>
                        <div className="prof-badge-item"><ActivityIcon size={12} /> Consistent Activity</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── AI Insights Card ──────────────────────────────────────────────────
export function AIInsightsCard({ user, postsCount }: { user: User; postsCount: number }) {
    const profileStrength = Math.min(100, 40 + (user.bio ? 15 : 0) + (user.verified ? 20 : 0) +
        (user.position ? 10 : 0) + (user.company ? 10 : 0) + (postsCount > 0 ? 15 : 0));

    const tips = [];
    if (!user.bio || user.bio.length < 50) tips.push('Add a more detailed bio to increase engagement');
    if (!user.verified) tips.push('Complete identity verification for a trust badge');
    if (postsCount < 5) tips.push('Post more frequently to grow your audience');
    if (!user.company && !user.position) tips.push('Add your profession details for better discoverability');
    if (tips.length === 0) tips.push('Your profile is well optimized! Keep engaging.');

    const bioSuggestions = [
        user.role === 'politician' ? 'Public servant committed to transparent governance and community progress.' :
        user.role === 'journalist' ? 'Award-winning journalist covering policy, politics, and the stories that matter.' :
        user.role === 'businessman' || user.role === 'entrepreneur' ? 'Building innovative solutions that drive economic growth and opportunity.' :
        'Engaged citizen passionate about democracy, transparency, and civic participation.',
    ];

    return (
        <div className="prof-section-card prof-ai">
            <div className="prof-section-header">
                <BotIcon size={16} />
                <span>AI Profile Insights</span>
                <span className="prof-ai-badge">AI</span>
            </div>

            {/* Profile Strength */}
            <div className="prof-ai-strength">
                <div className="prof-ai-strength-header">
                    <span>Profile Strength</span>
                    <span className="prof-ai-strength-pct">{profileStrength}%</span>
                </div>
                <div className="prof-ai-strength-track">
                    <div className="prof-ai-strength-fill" style={{
                        width: `${profileStrength}%`,
                        background: profileStrength > 80 ? '#10b981' : profileStrength > 50 ? '#f59e0b' : '#ef4444'
                    }} />
                </div>
            </div>

            {/* Tips */}
            <div className="prof-ai-tips">
                <div className="prof-sub-title"><ZapIcon size={13} /> Improvement Tips</div>
                {tips.map((tip, i) => (
                    <div key={i} className="prof-ai-tip-item">
                        <div className="prof-ai-tip-dot" />
                        <span>{tip}</span>
                    </div>
                ))}
            </div>

            {/* Bio Suggestion */}
            <div className="prof-ai-bio">
                <div className="prof-sub-title"><FileTextIcon size={13} /> AI Bio Suggestion</div>
                <div className="prof-ai-bio-text">
                    &ldquo;{bioSuggestions[0]}&rdquo;
                </div>
            </div>

            {/* Activity Insight */}
            <div className="prof-ai-activity">
                <div className="prof-ai-activity-row">
                    <div className="prof-ai-activity-item">
                        <EyeIcon size={14} />
                        <span>{formatNumber(user.profileViews ?? 0)}</span>
                        <small>Profile Views</small>
                    </div>
                    <div className="prof-ai-activity-item">
                        <TrendingUpIcon size={14} />
                        <span>{formatNumber(user.followers)}</span>
                        <small>Followers</small>
                    </div>
                    <div className="prof-ai-activity-item">
                        <UsersIcon size={14} />
                        <span>{formatNumber(user.following)}</span>
                        <small>Following</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Profile Analytics Dashboard ──────────────────────────────────────────
export function ProfileAnalytics({ user, postsCount, totalLikes, totalReposts, engagementRate }: {
    user: User; postsCount: number; totalLikes: number; totalReposts: number; engagementRate: string;
}) {
    return (
        <div className="prof-analytics fade-in">
            <div className="prof-analytics-grid">
                {[
                    { val: formatNumber(user.profileViews ?? 0), label: 'Profile Views', icon: <EyeIcon size={18} />, change: '+12.4%', color: '#3b82f6' },
                    { val: `${engagementRate}%`, label: 'Engagement Rate', icon: <TrendingUpIcon size={18} />, change: '+0.8pp', color: '#10b981' },
                    { val: formatNumber(user.followers), label: 'Followers', icon: <UsersIcon size={18} />, change: '+4.2%', color: '#8b5cf6' },
                    { val: formatNumber(totalLikes), label: 'Total Likes', icon: <ThumbsUpIcon size={18} />, change: '+18%', color: '#ef4444' },
                ].map((s, i) => (
                    <div key={i} className="prof-analytics-card">
                        <div className="prof-analytics-icon" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
                        <div className="prof-analytics-data">
                            <div className="prof-analytics-value">{s.val}</div>
                            <div className="prof-analytics-label">{s.label}</div>
                        </div>
                        <div className="prof-analytics-change" style={{ color: '#10b981' }}>{s.change}</div>
                    </div>
                ))}
            </div>

            {/* Activity Chart */}
            <div className="prof-section-card" style={{ marginTop: 16 }}>
                <div className="prof-section-header"><BarChartIcon size={16} /><span>Post Activity (12 months)</span></div>
                <div className="prof-chart">
                    {[20, 35, 28, 42, 38, 55, 47, 61, 53, 70, 65, Math.min(postsCount * 8, 100)].map((h, i) => (
                        <div key={i} className="prof-chart-col">
                            <div className="prof-chart-bar" style={{ height: `${Math.min(h, 100)}%` }} />
                            <span className="prof-chart-label">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Engagement Breakdown */}
            <div className="prof-section-card" style={{ marginTop: 16 }}>
                <div className="prof-section-header"><ActivityIcon size={16} /><span>Engagement Breakdown</span></div>
                <div className="prof-engagement-grid">
                    {[
                        { label: 'Total Posts', val: postsCount, color: '#3b82f6' },
                        { label: 'Total Likes', val: totalLikes, color: '#ef4444' },
                        { label: 'Total Reposts', val: totalReposts, color: '#10b981' },
                        { label: 'Avg Likes/Post', val: Math.round(totalLikes / Math.max(postsCount, 1)), color: '#f59e0b' },
                    ].map((s, i) => (
                        <div key={i} className="prof-engagement-item">
                            <div className="prof-engagement-val" style={{ color: s.color }}>{formatNumber(s.val)}</div>
                            <div className="prof-engagement-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Voter Engagement (Politicians) */}
            {(user.role === 'politician' || user.role === 'official') && (
                <div className="prof-section-card" style={{ marginTop: 16 }}>
                    <div className="prof-section-header"><FlagIcon size={16} /><span>Voter Engagement</span></div>
                    <div className="prof-voter-grid">
                        {[
                            { label: 'Town Halls', val: '12', sub: 'This Year' },
                            { label: 'Bills Sponsored', val: '8', sub: 'Active' },
                            { label: 'Voter Reach', val: formatNumber((user.followers || 0) * 3), sub: 'Estimated' },
                            { label: 'Approval', val: `${user.supportPercentage ?? 0}%`, sub: 'Current' },
                        ].map((s, i) => (
                            <div key={i} className="prof-voter-item">
                                <div className="prof-voter-val">{s.val}</div>
                                <div className="prof-voter-label">{s.label}</div>
                                <div className="prof-voter-sub">{s.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── About Tab Content ──────────────────────────────────────────────────
export function ProfileAboutTab({ user, displayBio, displayLocation, displayWebsite, displayEmail, displayParty, isOwn }: {
    user: User; displayBio: string; displayLocation: string; displayWebsite: string;
    displayEmail: string; displayParty: string; isOwn: boolean;
}) {
    const [privacyMsg, setPrivacyMsg] = useState('Everyone');
    const [privacyVis, setPrivacyVis] = useState('Everyone');
    const [privacyCall, setPrivacyCall] = useState('Followers Only');
    const [privacyStatus, setPrivacyStatus] = useState('On');

    const cycle = (current: string, options: string[], setter: (v: string) => void) => {
        const idx = options.indexOf(current);
        setter(options[(idx + 1) % options.length]);
    };

    return (
        <div className="prof-about fade-in">
            {/* Bio */}
            {displayBio && (
                <div className="prof-section-card">
                    <div className="prof-section-header"><FileTextIcon size={16} /><span>About</span></div>
                    <p className="prof-about-bio">{displayBio}</p>
                </div>
            )}

            {/* Details */}
            <div className="prof-section-card">
                <div className="prof-section-header"><UsersIcon size={16} /><span>Details</span></div>
                <div className="prof-about-details">
                    <div className="prof-about-row"><CalendarIcon size={14} /><span>Joined {user.joined}</span></div>
                    {displayLocation && <div className="prof-about-row"><MapPinIcon size={14} /><span>{displayLocation}</span></div>}
                    {user.country && <div className="prof-about-row"><GlobeIcon size={14} /><span>{user.country}</span></div>}
                    {displayWebsite && (
                        <div className="prof-about-row">
                            <GlobeIcon size={14} />
                            <a href={displayWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                {displayWebsite.replace(/^https?:\/\//, '')}
                            </a>
                        </div>
                    )}
                    {displayParty && <div className="prof-about-row"><LandmarkIcon size={14} /><span>{displayParty}</span></div>}
                    {displayEmail && isOwn && <div className="prof-about-row"><MailIcon size={14} /><span>{displayEmail}</span></div>}
                </div>
            </div>

            {/* Role-specific sections */}
            {(user.role === 'politician' || user.role === 'official') && <PoliticianSection user={user} />}
            {(user.role === 'journalist' || user.role === 'businessman' || user.role === 'entrepreneur') && <BusinessSection user={user} />}

            {/* Privacy Controls (own profile only) */}
            {isOwn && (
                <div className="prof-section-card">
                    <div className="prof-section-header"><ShieldIcon size={16} /><span>Privacy & Settings</span></div>
                    <div className="prof-privacy-list">
                        <div className="prof-privacy-row">
                            <span className="prof-privacy-label">Who can message me</span>
                            <button className="prof-privacy-value" style={{ cursor: 'pointer', border: 'none' }} onClick={() => cycle(privacyMsg, ['Everyone', 'Followers Only', 'Nobody'], setPrivacyMsg)}>{privacyMsg}</button>
                        </div>
                        <div className="prof-privacy-row">
                            <span className="prof-privacy-label">Who can see my profile</span>
                            <button className="prof-privacy-value" style={{ cursor: 'pointer', border: 'none' }} onClick={() => cycle(privacyVis, ['Everyone', 'Followers Only', 'Private'], setPrivacyVis)}>{privacyVis}</button>
                        </div>
                        <div className="prof-privacy-row">
                            <span className="prof-privacy-label">Who can call me</span>
                            <button className="prof-privacy-value" style={{ cursor: 'pointer', border: 'none' }} onClick={() => cycle(privacyCall, ['Everyone', 'Followers Only', 'Nobody'], setPrivacyCall)}>{privacyCall}</button>
                        </div>
                        <div className="prof-privacy-row">
                            <span className="prof-privacy-label">Show activity status</span>
                            <button className="prof-privacy-value" style={{ cursor: 'pointer', border: 'none' }} onClick={() => cycle(privacyStatus, ['On', 'Off'], setPrivacyStatus)}>{privacyStatus}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Timeline Activity ──────────────────────────────────────────────────
export function TimelineSection() {
    const activities = [
        { type: 'post', text: 'Published a new post about governance reform', time: '2h ago', icon: <FileTextIcon size={14} /> },
        { type: 'achievement', text: 'Reached 100K followers milestone', time: '1d ago', icon: <StarIcon size={14} /> },
        { type: 'comment', text: 'Commented on Digital Privacy Act discussion', time: '2d ago', icon: <ActivityIcon size={14} /> },
        { type: 'update', text: 'Updated profile information and bio', time: '3d ago', icon: <ClockIcon size={14} /> },
        { type: 'post', text: 'Shared insights on infrastructure development', time: '5d ago', icon: <FileTextIcon size={14} /> },
        { type: 'follow', text: 'Started following 5 new policy analysts', time: '1w ago', icon: <UsersIcon size={14} /> },
    ];

    return (
        <div className="prof-timeline fade-in">
            <div className="prof-section-card">
                <div className="prof-section-header"><ClockIcon size={16} /><span>Activity Timeline</span></div>
                <div className="prof-timeline-list">
                    {activities.map((a, i) => (
                        <div key={i} className="prof-timeline-item">
                            <div className="prof-timeline-line" />
                            <div className="prof-timeline-dot">{a.icon}</div>
                            <div className="prof-timeline-content">
                                <div className="prof-timeline-text">{a.text}</div>
                                <div className="prof-timeline-time">{a.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Share Profile Modal ──────────────────────────────────────────────────
export function ShareProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    // Fallback if window is not defined (SSR)
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${user.username}` : `https://arizonalex.com/profile/${user.username}`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        { name: 'X (Twitter)', icon: <TwitterIcon size={20} />, color: '#000000', bg: '#e2e8f0', darkBg: '#333333', darkColor: '#ffffff', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`Check out ${user.name}'s profile on Arizonalex`)}` },
        { name: 'WhatsApp', icon: <WhatsAppIcon size={20} />, color: '#25D366', bg: 'rgba(37,211,102,0.15)', darkBg: 'rgba(37,211,102,0.15)', darkColor: '#25D366', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${user.name}'s profile on Arizonalex: ${profileUrl}`)}` },
        { name: 'Facebook', icon: <FacebookIcon size={20} />, color: '#1877F2', bg: 'rgba(24,119,242,0.15)', darkBg: 'rgba(24,119,242,0.15)', darkColor: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}` },
        { name: 'Email', icon: <MailIcon size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', darkBg: 'rgba(239,68,68,0.15)', darkColor: '#ef4444', url: `mailto:?subject=Check out this profile&body=${encodeURIComponent(`Check out ${user.name}'s profile on Arizonalex: ${profileUrl}`)}` },
    ];

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="modal-content scale-in" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 24, width: '90%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border)' }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LinkIcon size={18} />
                        </div>
                        Share Profile
                    </h3>
                    <button onClick={onClose} className="btn btn-icon" style={{ background: 'var(--bg-secondary)' }}><XIcon size={18} /></button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {/* User Preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                        <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bg-card)' }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {user.name} 
                                {user.verified && <span style={{ color: 'var(--primary)', display: 'flex' }}><CheckCircleIcon size={15} /></span>}
                            </div>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>@{user.username}</div>
                        </div>
                    </div>

                    {showQR ? (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
                            <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid var(--border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                                <QRCodeSVG 
                                    value={profileUrl} 
                                    size={180} 
                                    bgColor={"#ffffff"} 
                                    fgColor={"#000000"} 
                                    level={"L"} 
                                    includeMargin={false} 
                                />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 16 }}>
                                Scan this code with any camera to open the profile
                            </div>
                            <button 
                                className="btn btn-outline" 
                                style={{ borderRadius: 12, padding: '8px 16px', fontWeight: 600, fontSize: '0.85rem' }}
                                onClick={() => setShowQR(false)}
                            >
                                Back to Sharing Options
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Social Options Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                                {shareOptions.map((opt, i) => (
                                    <a 
                                        key={i} 
                                        href={opt.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                                        className="share-btn-hover"
                                    >
                                        <div style={{ 
                                            width: 52, height: 52, borderRadius: '50%', 
                                            background: opt.bg, 
                                            color: opt.color, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'transform 0.2s',
                                        }}>
                                            {opt.icon}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{opt.name}</span>
                                    </a>
                                ))}
                            </div>

                            <style>{`
                                .share-btn-hover:hover div { transform: scale(1.1); }
                                .share-btn-hover:active div { transform: scale(0.95); }
                            `}</style>
                        </>
                    )}

                    {/* Copy Link Input */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Page Link</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                {profileUrl}
                            </div>
                            <button 
                                onClick={handleCopy}
                                className="btn btn-primary"
                                style={{ borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                            >
                                {copied ? <CheckCircleIcon size={16} /> : <CopyIcon size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* QR Code pseudo-button */}
                    {!showQR && (
                        <button 
                            className="btn btn-outline" 
                            style={{ width: '100%', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, borderStyle: 'dashed', borderWidth: 2 }}
                            onClick={() => setShowQR(true)}
                        >
                            <QrCodeIcon size={18} /> Show QR Code
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
