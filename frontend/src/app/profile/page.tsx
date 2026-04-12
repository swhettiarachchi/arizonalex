'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { formatNumber, checkUserHasStory } from '@/lib/utils';
import {
    PhoneIcon, MailIcon, VerifiedIcon, CalendarIcon, LandmarkIcon,
    MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon,
    BookmarkIcon, ShareIcon, PenIcon, XIcon, CameraIcon, MapPinIcon,
    GlobeIcon, TrendingUpIcon, BarChartIcon, UsersIcon, ActivityIcon,
    LayersIcon, FileTextIcon, ZapIcon, ChevronRightIcon, CheckCircleIcon,
    ShieldIcon, UserIcon, ClockIcon, VideoIcon, BotIcon, EyeIcon
} from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
    PoliticianSection, BusinessSection, TrustVerificationCard,
    AIInsightsCard, ProfileAnalytics, ProfileAboutTab, TimelineSection, ShareProfileModal
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

// ── Full Edit Profile Modal ──────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }: {
    user: {
        name: string; username: string; bio: string; location: string; website: string;
        role: UserRole; party?: string; phone?: string; email?: string; avatar?: string; banner?: string;
        position?: string; ideology?: string; yearsActive?: string; country?: string;
        campaignPromises?: string[]; achievements?: string[];
        company?: string; industry?: string; services?: string[]; portfolioUrl?: string;
    };
    onClose: () => void;
    onSave: (data: Partial<{
        name: string; bio: string; location: string; website: string; role: UserRole;
        party: string; phone: string; email: string; position: string; ideology: string;
        yearsActive: string; country: string; campaignPromises: string[]; achievements: string[];
        company: string; industry: string; services: string[]; portfolioUrl: string;
        avatar: string; banner: string;
    }>) => void;
}) {
    const [step, setStep] = useState<'info' | 'role' | 'details' | 'advanced'>('info');
    
    const [privacyMsg, setPrivacyMsg] = useState('Everyone');
    const [privacyVis, setPrivacyVis] = useState('Everyone');
    const [privacyCall, setPrivacyCall] = useState('Followers Only');
    const [privacyStatus, setPrivacyStatus] = useState('On');
    const [privacyNotif, setPrivacyNotif] = useState('All');

    const cycle = (current: string, options: string[], setter: (v: string) => void) => {
        const idx = options.indexOf(current);
        setter(options[(idx + 1) % options.length]);
    };
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [location, setLocation] = useState(user.location);
    const [website, setWebsite] = useState(user.website);
    const [party, setParty] = useState(user.party || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState<UserRole>(user.role);
    const [roleSearch, setRoleSearch] = useState('');
    const [showBioSuggestions, setShowBioSuggestions] = useState(false);

    // Photo uploads
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.banner || null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            if (type === 'avatar') setAvatarPreview(result);
            else setBannerPreview(result);
        };
        reader.readAsDataURL(file);
    };

    // Political fields
    const [position, setPosition] = useState(user.position || '');
    const [ideology, setIdeology] = useState(user.ideology || '');
    const [yearsActive, setYearsActive] = useState(user.yearsActive || '');
    const [country, setCountry] = useState(user.country || '');
    const [promisesText, setPromisesText] = useState((user.campaignPromises || []).join('\n'));
    const [achievementsText, setAchievementsText] = useState((user.achievements || []).join('\n'));

    // Business fields
    const [company, setCompany] = useState(user.company || '');
    const [industry, setIndustry] = useState(user.industry || '');
    const [servicesText, setServicesText] = useState((user.services || []).join(', '));
    const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || '');

    const filteredRoles = ALL_ROLES.filter(r =>
        !roleSearch || r.label.toLowerCase().includes(roleSearch.toLowerCase()) ||
        r.desc.toLowerCase().includes(roleSearch.toLowerCase())
    );

    const [bioSuggestions, setBioSuggestions] = useState<string[]>([]);
    const [bioSuggestionsLoading, setBioSuggestionsLoading] = useState(false);

    const fetchBioSuggestions = async () => {
        if (bioSuggestions.length > 0) { setShowBioSuggestions(!showBioSuggestions); return; }
        setShowBioSuggestions(true);
        setBioSuggestionsLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolId: 'post', input: `Generate exactly 3 short professional bio suggestions (max 160 chars each) for a ${ROLE_LABELS[role] || role} on a political and business social platform. Separate them with "|||". No numbering, no quotes.` }),
            });
            const data = await res.json();
            if (data.success && data.output) {
                setBioSuggestions(data.output.split('|||').map((s: string) => s.trim()).filter(Boolean).slice(0, 3));
            } else {
                setBioSuggestions(['Engaged citizen passionate about democracy and civic participation.', 'Building a better future through transparent governance.', 'Professional committed to excellence and community impact.']);
            }
        } catch {
            setBioSuggestions(['Engaged citizen passionate about democracy and civic participation.', 'Building a better future through transparent governance.', 'Professional committed to excellence and community impact.']);
        }
        setBioSuggestionsLoading(false);
    };

    const isPolitical = role === 'politician' || role === 'official';
    const isBusiness = role === 'businessman' || role === 'entrepreneur' || role === 'journalist' || role === 'banker';

    const handleSave = () => {
        const data: Record<string, unknown> = { name, bio, location, website, role, party, phone, email, country };
        // Include photos if changed
        if (avatarPreview && avatarPreview !== user.avatar) data.avatar = avatarPreview;
        if (bannerPreview && bannerPreview !== user.banner) data.banner = bannerPreview;
        // Political fields
        if (isPolitical) {
            data.position = position;
            data.ideology = ideology;
            data.yearsActive = yearsActive;
            data.campaignPromises = promisesText.split('\n').map(s => s.trim()).filter(Boolean);
            data.achievements = achievementsText.split('\n').map(s => s.trim()).filter(Boolean);
        }
        // Business fields
        if (isBusiness) {
            data.company = company;
            data.industry = industry;
            data.services = servicesText.split(',').map(s => s.trim()).filter(Boolean);
            data.portfolioUrl = portfolioUrl;
        }
         
        onSave(data as any);
        onClose();
    };

    const selectedRole = ALL_ROLES.find(r => r.value === role)!;

    const POSITIONS = ['President', 'Vice President', 'Senator', 'Governor', 'Secretary', 'State Representative', 'City Council Member', 'Mayor', 'MP', 'Minister', 'Candidate', 'Other'];
    const IDEOLOGIES = ['Progressive', 'Liberal', 'Centrist', 'Moderate', 'Conservative', 'Libertarian', 'Socialist', 'Other'];
    const INDUSTRIES = ['Technology', 'Finance & Banking', 'Healthcare', 'Energy', 'Real Estate', 'Media & Journalism', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Legal Services', 'Research & Analytics', 'Other'];

    return (
        <div className="edit-profile-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', maxWidth: 560, width: '100%' }}>

                {/* Header */}
                <div className="edit-profile-header" style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-icon" onClick={onClose}><XIcon size={20} /></button>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            {step === 'info' ? 'Edit Profile' : step === 'role' ? 'Change Role' : step === 'details' ? (isPolitical ? 'Political Details' : 'Professional Details') : 'Advanced Settings'}
                        </h2>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>Save changes</button>
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ flexShrink: 0, borderBottom: '1px solid var(--border)', overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none' }}>
                    <button className={`tab ${step === 'info' ? 'active' : ''}`} onClick={() => setStep('info')}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <UserIcon size={13} /> Profile
                    </button>
                    {(isPolitical || isBusiness) && (
                        <button className={`tab ${step === 'details' ? 'active' : ''}`} onClick={() => setStep('details')}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {isPolitical ? <LandmarkIcon size={13} /> : <BarChartIcon size={13} />}
                            {isPolitical ? 'Political' : 'Professional'}
                        </button>
                    )}
                    <button className={`tab ${step === 'role' ? 'active' : ''}`} onClick={() => setStep('role')}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <ShieldIcon size={13} /> Role
                        <span style={{ marginLeft: 4, fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: `${selectedRole?.color}20`, color: selectedRole?.color }}>
                            {selectedRole?.label}
                        </span>
                    </button>
                    <button className={`tab ${step === 'advanced' ? 'active' : ''}`} onClick={() => setStep('advanced')}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <ZapIcon size={13} /> Advanced
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>

                    {/* ─── PROFILE INFO TAB ─── */}
                    {step === 'info' && (
                        <>
                            <input ref={bannerInputRef} type="file" accept="image/*" hidden
                                onChange={e => handleImagePick(e, 'banner')} />
                            <input ref={avatarInputRef} type="file" accept="image/*" hidden
                                onChange={e => handleImagePick(e, 'avatar')} />

                            <div className="edit-profile-banner"
                                style={bannerPreview
                                    ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                    : { background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }
                                }
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                <div className="edit-banner-overlay">
                                    <CameraIcon size={22} />
                                    <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: 2 }}>Change Cover</span>
                                </div>
                            </div>
                            <div className="edit-profile-avatar-wrap" onClick={() => avatarInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                                <UserAvatar name={name} avatar={avatarPreview || user.avatar} size="xxl" />
                                <div className="edit-avatar-overlay">
                                    <CameraIcon size={18} />
                                    <span style={{ fontSize: '0.55rem', fontWeight: 600 }}>Change</span>
                                </div>
                            </div>

                            <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`role-badge role-${role}`}>{ROLE_LABELS[role]}</span>
                                <button onClick={() => setStep('role')}
                                    style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                    Change role →
                                </button>
                            </div>

                            <div className="edit-profile-form">
                                <div className="edit-field">
                                    <label className="edit-field-label">Display Name</label>
                                    <input className="edit-field-input" type="text" value={name}
                                        onChange={e => setName(e.target.value)} maxLength={50} placeholder="Your display name" />
                                    <span className="edit-field-count">{name.length}/50</span>
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        Bio
                                        <button onClick={fetchBioSuggestions}
                                            style={{ fontSize: '0.68rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <BotIcon size={11} /> {bioSuggestionsLoading ? 'Generating...' : 'AI Suggest'}
                                        </button>
                                    </label>
                                    {showBioSuggestions && (
                                        <div style={{ marginBottom: 8 }}>
                                            {bioSuggestionsLoading ? (
                                                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}><span className="auth-spinner" style={{ width: 14, height: 14, display: 'inline-block', marginRight: 6 }} /> Generating bio suggestions...</div>
                                            ) : bioSuggestions.map((s, i) => (
                                                <button key={i} onClick={() => { setBio(s); setShowBioSuggestions(false); }}
                                                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 4, fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 8, cursor: 'pointer', lineHeight: 1.4 }}>
                                                    &ldquo;{s}&rdquo;
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <textarea className="edit-field-input edit-field-textarea" value={bio}
                                        onChange={e => setBio(e.target.value)} maxLength={200} rows={3} placeholder="Tell people about yourself…" />
                                    <span className="edit-field-count">{bio.length}/200</span>
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPinIcon size={13} /> Location</label>
                                    <input className="edit-field-input" type="text" value={location}
                                        onChange={e => setLocation(e.target.value)} maxLength={40} placeholder="City, State or Country" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><GlobeIcon size={13} /> Country</label>
                                    <input className="edit-field-input" type="text" value={country}
                                        onChange={e => setCountry(e.target.value)} maxLength={40} placeholder="United States, India, UK…" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><GlobeIcon size={13} /> Website</label>
                                    <input className="edit-field-input" type="url" value={website}
                                        onChange={e => setWebsite(e.target.value)} placeholder="https://your-website.com" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MailIcon size={13} /> Email</label>
                                    <input className="edit-field-input" type="email" value={email}
                                        onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PhoneIcon size={13} /> Phone</label>
                                    <input className="edit-field-input" type="tel" value={phone}
                                        onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                                </div>

                                {/* Hint to go to details tab */}
                                {(isPolitical || isBusiness) && (
                                    <div style={{ marginTop: 4, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {isPolitical ? <LandmarkIcon size={14} /> : <BarChartIcon size={14} />}
                                        <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            You have additional {isPolitical ? 'political' : 'professional'} fields to fill out.
                                        </div>
                                        <button onClick={() => setStep('details')} style={{ fontSize: '0.72rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                                            Edit →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ─── POLITICAL / BUSINESS DETAILS TAB ─── */}
                    {step === 'details' && isPolitical && (
                        <div style={{ padding: '16px 20px' }}>
                            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <LandmarkIcon size={16} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>Political Profile Fields</span>
                            </div>

                            <div className="edit-profile-form">
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><LandmarkIcon size={13} /> Party / Affiliation</label>
                                    <input className="edit-field-input" type="text" value={party}
                                        onChange={e => setParty(e.target.value)} maxLength={50} placeholder="Progressive Alliance, Unity Party…" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label">Position</label>
                                    <select className="edit-field-input" value={position} onChange={e => setPosition(e.target.value)}
                                        style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                                        <option value="">Select position…</option>
                                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label">Ideology</label>
                                    <select className="edit-field-input" value={ideology} onChange={e => setIdeology(e.target.value)}
                                        style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                                        <option value="">Select ideology…</option>
                                        {IDEOLOGIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label">Years Active</label>
                                    <input className="edit-field-input" type="text" value={yearsActive}
                                        onChange={e => setYearsActive(e.target.value)} placeholder="2021 – Present" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        Campaign Promises
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>One per line</span>
                                    </label>
                                    <textarea className="edit-field-input edit-field-textarea" value={promisesText}
                                        onChange={e => setPromisesText(e.target.value)} rows={4}
                                        placeholder={"Digital Privacy Act\nHealthcare Reform\nEducation Equity"} />
                                    <span className="edit-field-count">{promisesText.split('\n').filter(Boolean).length} promises</span>
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        Achievements
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>One per line</span>
                                    </label>
                                    <textarea className="edit-field-input edit-field-textarea" value={achievementsText}
                                        onChange={e => setAchievementsText(e.target.value)} rows={4}
                                        placeholder={"Passed Digital Privacy Act\nLed bipartisan infrastructure coalition"} />
                                    <span className="edit-field-count">{achievementsText.split('\n').filter(Boolean).length} achievements</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'details' && isBusiness && (
                        <div style={{ padding: '16px 20px' }}>
                            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BarChartIcon size={16} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>Professional Profile Fields</span>
                            </div>

                            <div className="edit-profile-form">
                                <div className="edit-field">
                                    <label className="edit-field-label">Company / Organization</label>
                                    <input className="edit-field-input" type="text" value={company}
                                        onChange={e => setCompany(e.target.value)} maxLength={60} placeholder="Acme Corp, National Post…" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label">Industry</label>
                                    <select className="edit-field-input" value={industry} onChange={e => setIndustry(e.target.value)}
                                        style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                                        <option value="">Select industry…</option>
                                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        Services
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>Comma separated</span>
                                    </label>
                                    <input className="edit-field-input" type="text" value={servicesText}
                                        onChange={e => setServicesText(e.target.value)}
                                        placeholder="Consulting, Strategy, Analytics…" />
                                </div>
                                <div className="edit-field">
                                    <label className="edit-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><GlobeIcon size={13} /> Portfolio URL</label>
                                    <input className="edit-field-input" type="url" value={portfolioUrl}
                                        onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://portfolio.example.com" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'details' && !isPolitical && !isBusiness && (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>
                                No additional details for your current role. Change your role to unlock more fields.
                            </p>
                            <button onClick={() => setStep('role')} className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
                                Change Role
                            </button>
                        </div>
                    )}

                    {/* ─── ROLE TAB ─── */}
                    {step === 'role' && (
                        <div style={{ padding: '16px 20px' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                                Your role appears on your profile and every post you make. Change it any time.
                            </p>
                            <div className="search-box" style={{ marginBottom: 14 }}>
                                <span className="search-icon"><ZapIcon size={14} /></span>
                                <input placeholder="Search roles…" value={roleSearch} onChange={e => setRoleSearch(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {filteredRoles.map(r => (
                                    <button key={r.value} onClick={() => setRole(r.value)} style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                        border: `2px solid ${role === r.value ? r.color : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        background: role === r.value ? `${r.color}10` : 'var(--bg-secondary)',
                                        cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                                    }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${r.color}30` }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.6rem', color: r.color, textTransform: 'uppercase' }}>
                                                {r.label.slice(0, 3)}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === r.value ? r.color : 'inherit' }}>{r.label}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{r.desc}</div>
                                        </div>
                                        {role === r.value && (
                                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircleIcon size={13} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── ADVANCED TAB ─── */}
                    {step === 'advanced' && (
                        <div style={{ padding: '16px 20px' }}>
                            <div className="prof-section-card">
                                <div className="prof-section-header"><ShieldIcon size={16} /><span>Privacy Controls</span></div>
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
                                    <div className="prof-privacy-row">
                                        <span className="prof-privacy-label">Profile notifications</span>
                                        <button className="prof-privacy-value" style={{ cursor: 'pointer', border: 'none' }} onClick={() => cycle(privacyNotif, ['All', 'Mentions Only', 'None'], setPrivacyNotif)}>{privacyNotif}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
                </div>
            </div>
        </div>
    );
}

// ── Main /profile Page ────────────────────────────────────────────────────
export default function ProfilePage() {
    const { isLoggedIn, user: loggedInUser, updateProfile } = useAuth();
    const { requireAuth } = useAuthGate();

    const mockUser = { id: 'self', name: 'User', username: 'user', avatar: '', bio: '', role: 'citizen' as const, verified: false, followers: 0, following: 0, joined: '', party: undefined, position: undefined, ideology: undefined, yearsActive: undefined, country: undefined, campaignPromises: undefined, achievements: undefined, company: undefined, industry: undefined, services: undefined, portfolioUrl: undefined, profileViews: 0, supportPercentage: undefined };
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/users?limit=8')
            .then(r => r.json())
            .then(data => { if (data.users) setAllUsers(data.users); })
            .catch(() => { });
    }, []);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
     
    const [editStep, setEditStep] = useState<'info' | 'role'>('info');

    const displayName = isLoggedIn && loggedInUser ? loggedInUser.name : mockUser.name;
    const displayBio = isLoggedIn && loggedInUser ? loggedInUser.bio : mockUser.bio;
    const displayLocation = isLoggedIn && loggedInUser ? (loggedInUser.location ?? '') : '';
    const displayWebsite = isLoggedIn && loggedInUser ? (loggedInUser.website ?? '') : '';
    const displayRole = (isLoggedIn && loggedInUser?.role ? loggedInUser.role : mockUser.role) as UserRole;
    const displayParty = isLoggedIn && loggedInUser ? (loggedInUser.party ?? '') : (mockUser.party ?? '');
    const displayEmail = isLoggedIn && loggedInUser ? (loggedInUser.email ?? '') : '';
    const displayAvatar = isLoggedIn && loggedInUser?.avatar ? loggedInUser.avatar : mockUser.avatar;
    const displayBanner = isLoggedIn && loggedInUser?.banner ? loggedInUser.banner : null;

     
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [activeCommType, setActiveCommType] = useState<null | 'message' | 'call' | 'video'>(null);

    const displayUsername = isLoggedIn && loggedInUser ? loggedInUser.username : '';

    useEffect(() => {
        if (!displayUsername) return;
        fetch(`/api/posts?tab=foryou`)
            .then(r => r.json())
            .then(data => {
                if (data.posts) {
                    setFeedPosts(data.posts.filter((p: any) => p.author.username === displayUsername));
                }
            })
            .catch(() => { });
    }, [displayUsername]);

    const totalLikes = feedPosts.reduce((a, p) => a + (p.likes || 0), 0);
    const totalReposts = feedPosts.reduce((a, p) => a + (p.reposts || 0), 0);
    const engagementRate = '4.8';

    const roleInfo = ALL_ROLES.find(r => r.value === displayRole);

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

    const toggleFollowUser = (userId: string) => requireAuth(async () => {
        const isCurrentlyFollowing = followingIds.has(userId);
        // Optimistic update
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
            // Revert on failure
            setFollowingIds(prev => {
                const next = new Set(prev);
                if (isCurrentlyFollowing) next.add(userId);
                else next.delete(userId);
                return next;
            });
        }
    });

    const openEdit = (step: 'info' | 'role' = 'info') => {
        setEditStep(step);
        setShowEditModal(true);
    };

    const TABS = [
        { id: 'posts', label: 'Posts', icon: <FileTextIcon size={13} /> },
        { id: 'about', label: 'About', icon: <UserIcon size={13} /> },
        { id: 'media', label: 'Media', icon: <LayersIcon size={13} /> },
        { id: 'activity', label: 'Analytics', icon: <BarChartIcon size={13} /> },
        { id: 'timeline', label: 'Timeline', icon: <ClockIcon size={13} /> },
    ];

    const mutuals = allUsers.filter(u => u.id !== profileUser.id && u.verified).slice(0, 3);
    const similarUsers = allUsers.filter(u => u.id !== profileUser.id).slice(0, 4);

    // Build user object with all display overrides for ProfileComponents
    const profileUser = {
        ...mockUser,
        ...(isLoggedIn && loggedInUser ? {
            name: loggedInUser.name,
            username: loggedInUser.username,
            avatar: loggedInUser.avatar || '',
            bio: loggedInUser.bio || '',
            role: loggedInUser.role || 'citizen',
            party: loggedInUser.party || '',
            verified: loggedInUser.verified || false,
            followers: loggedInUser.followers ?? loggedInUser.followersCount ?? 0,
            following: loggedInUser.following ?? loggedInUser.followingCount ?? 0,
            joined: loggedInUser.joined || '',
            profileViews: loggedInUser.profileViews ?? 0,
            // Political fields
            position: loggedInUser.position || '',
            ideology: loggedInUser.ideology || '',
            yearsActive: loggedInUser.yearsActive || '',
            country: loggedInUser.country || '',
            campaignPromises: loggedInUser.campaignPromises || [],
            achievements: loggedInUser.achievements || [],
            supportPercentage: loggedInUser.supportPercentage,
            // Business fields
            company: loggedInUser.company || '',
            industry: loggedInUser.industry || '',
            services: loggedInUser.services || [],
            portfolioUrl: loggedInUser.portfolioUrl || '',
        } : {}),
    } as any;

    return (
        <div className="page-container home-3col">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="home-left-panel">
                {/* Profile Hero Card */}
                <div className="prof-hero-card">
                    {/* Gradient banner with shimmer – show uploaded image if present */}
                    <div className="prof-hero-banner"
                        style={displayBanner
                            ? { backgroundImage: `url(${displayBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : undefined
                        }
                    />

                    {/* Avatar overlapping banner */}
                    <div className="prof-hero-avatar-wrap">
                        <div className="prof-hero-avatar-ring">
                            <UserAvatar name={displayName} avatar={displayAvatar} size="xl" hasStory={checkUserHasStory(profileUser.id)} />
                            {isLoggedIn && (
                                <button className="prof-hero-camera-btn" onClick={() => openEdit('info')}>
                                    <CameraIcon size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="prof-hero-identity">
                        <div className="prof-hero-name">{displayName}</div>
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

                    {/* Edit button */}
                    {isLoggedIn && (
                        <button className="prof-hero-edit-btn" onClick={() => openEdit('info')}>
                            <PenIcon size={14} /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Trust & Verification */}
                <TrustVerificationCard user={profileUser} />

                {/* About */}
                <div className="hp-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div className="hp-card-title" style={{ marginBottom: 0 }}><ZapIcon size={15} /> About</div>
                        {isLoggedIn && <button onClick={() => openEdit('info')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600 }}>Edit</button>}
                    </div>
                    {displayBio && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{displayBio}</p>}

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
                        {displayParty && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><LandmarkIcon size={13} /> {displayParty}</div>}
                        {displayLocation && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><MapPinIcon size={13} /> {displayLocation}</div>}
                        {displayWebsite && <a href={displayWebsite} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}><GlobeIcon size={13} /> {displayWebsite.replace(/^https?:\/\//, '')}</a>}
                        {displayEmail && isLoggedIn && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><MailIcon size={13} /> {displayEmail}</div>}
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
                    <div style={{ position: 'relative' }}>
                        <div className="profile-banner" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
                        {isLoggedIn && (
                            <button onClick={() => openEdit('info')} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
                                <CameraIcon size={13} /> Change Banner
                            </button>
                        )}
                    </div>

                    {/* Avatar + actions */}
                    <div className="profile-avatar-section">
                        <div style={{ position: 'relative', display: 'inline-flex' }}>
                            <UserAvatar name={displayName} avatar={profileUser.avatar} size="xxl" hasStory={checkUserHasStory(profileUser.id)} />
                            {isLoggedIn && (
                                <button onClick={() => openEdit('info')} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <CameraIcon size={13} />
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, paddingBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            {isLoggedIn ? (
                                <button className="profile-action-btn" onClick={() => openEdit('info')}>
                                    <PenIcon size={14} /> <span className="btn-text">Edit Profile</span>
                                </button>
                            ) : (
                                <>
                                    <button className="profile-action-btn primary" onClick={() => requireAuth(() => { })}>Follow</button>
                                    <button className="profile-action-btn" onClick={() => requireAuth(() => setActiveCommType('message'))}>
                                        <MailIcon size={14} /> <span className="btn-text">Message</span>
                                    </button>
                                    <button className="profile-action-btn" onClick={() => requireAuth(() => setActiveCommType('call'))}>
                                        <PhoneIcon size={14} /> <span className="btn-text">Call</span>
                                    </button>
                                    <button className="profile-action-btn" onClick={() => requireAuth(() => setActiveCommType('video'))}>
                                        <VideoIcon size={14} /> <span className="btn-text">Video</span>
                                    </button>
                                </>
                            )}
                            <button className="profile-action-btn" onClick={() => setIsShareModalOpen(true)}>
                                <ShareIcon size={14} /> <span className="btn-text">Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile info */}
                    <div className="profile-info">
                        <div className="profile-name">
                            {displayName}
                            {profileUser.verified && <VerifiedIcon size={16} />}
                        </div>
                        <div className="profile-handle">@{profileUser.username}</div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole] ?? displayRole}</span>
                            {displayParty && <span className="role-badge role-politician">{displayParty}</span>}
                            {isLoggedIn && (
                                <button onClick={() => openEdit('role')} style={{ fontSize: '0.68rem', color: 'var(--primary)', background: 'rgba(var(--primary-rgb),0.08)', border: '1px solid rgba(var(--primary-rgb),0.2)', borderRadius: 20, padding: '2px 8px', cursor: 'pointer', fontWeight: 600 }}>
                                    Change role
                                </button>
                            )}
                        </div>
                        <div className="profile-meta">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={13} /> Joined {profileUser.joined}</span>
                            {displayLocation && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={13} /> {displayLocation}</span>}
                            {displayWebsite && <a href={displayWebsite} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}><GlobeIcon size={13} /> {displayWebsite.replace(/^https?:\/\//, '')}</a>}
                            {profileUser.profileViews && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><EyeIcon size={13} /> {formatNumber(profileUser.profileViews)} views</span>}
                        </div>
                    </div>
                    {displayBio && <div className="profile-bio">{displayBio}</div>}

                    {/* Stats row */}
                    <div className="profile-stats">
                        <div className="profile-stat"><div className="profile-stat-value">{formatNumber(profileUser.following)}</div><div className="profile-stat-label">Following</div></div>
                        <div className="profile-stat"><div className="profile-stat-value">{formatNumber(profileUser.followers)}</div><div className="profile-stat-label">Followers</div></div>
                        <div className="profile-stat"><div className="profile-stat-value">{feedPosts.length}</div><div className="profile-stat-label">Posts</div></div>
                        <div className="profile-stat"><div className="profile-stat-value">{formatNumber(totalLikes)}</div><div className="profile-stat-label">Total Likes</div></div>
                    </div>
                </div>

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
                                    <UserAvatar name={displayName} avatar={profileUser.avatar} hasStory={checkUserHasStory(profileUser.id)} />
                                    <div className="post-meta">
                                        <div className="post-author-row">
                                            <span className="post-author">{displayName}</span>
                                            {profileUser.verified && <VerifiedIcon size={14} />}
                                            <span className="post-handle">@{profileUser.username}</span>
                                            <span className="post-time">{post.timestamp}</span>
                                        </div>
                                        <div style={{ marginTop: 2 }}>
                                            <span className={`role-badge role-${displayRole}`}>{ROLE_LABELS[displayRole] ?? displayRole}</span>
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
                                    <button className={`post-action ${post.bookmarked ? 'bookmarked' : ''}`} onClick={() => toggleSave(post.id)}>
                                        <span className="action-icon"><BookmarkIcon size={17} /></span>
                                    </button>
                                    <button className="post-action" onClick={() => requireAuth(() => { })}><span className="action-icon"><ShareIcon size={17} /></span></button>
                                </div>
                            </article>
                        </div>
                    )) : (
                        <div className="empty-state">
                            <span className="empty-state-title">No posts yet</span>
                        </div>
                    )
                )}

                {/* About tab */}
                {activeTab === 'about' && (
                    <ProfileAboutTab user={profileUser} displayBio={displayBio} displayLocation={displayLocation}
                        displayWebsite={displayWebsite} displayEmail={displayEmail} displayParty={displayParty} isOwn={isLoggedIn} />
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

                {/* Quick edit links */}
                {isLoggedIn && (
                    <div className="hp-card" style={{ marginBottom: 16, background: 'linear-gradient(135deg,rgba(var(--primary-rgb),0.06),rgba(var(--accent-rgb),0.06))', border: '1px solid rgba(var(--primary-rgb),0.18)' }}>
                        <div className="hp-card-title" style={{ color: 'var(--primary)' }}><PenIcon size={15} /> Profile Settings</div>
                        {[
                            { label: 'Edit profile info', step: 'info' as const },
                            { label: 'Change your role', step: 'role' as const },
                            { label: 'Update bio & links', step: 'info' as const },
                            { label: 'Change banner photo', step: 'info' as const },
                            { label: 'Update contact info', step: 'info' as const },
                        ].map((item, i) => (
                            <button key={i} onClick={() => openEdit(item.step)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.82rem', color: 'inherit', textAlign: 'left', fontWeight: 500 }}>
                                {item.label} <ChevronRightIcon size={13} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Browse Profiles */}
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><UsersIcon size={15} /> Browse Profiles</div>
                    {allUsers.slice(0, 5).map(u => (
                        <Link key={u.id} href={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit' }}>
                            <UserAvatar name={u.name} avatar={u.avatar} size="sm" hasStory={checkUserHasStory(u.id)} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {u.name} {u.verified && <VerifiedIcon size={13} />}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>@{u.username}</div>
                                <span className={`role-badge role-${u.role}`} style={{ marginTop: 3, display: 'inline-block' }}>{ROLE_LABELS[u.role] ?? u.role}</span>
                            </div>
                            <button 
                                className={followingIds.has(u.id) ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"} 
                                style={{ flexShrink: 0, fontSize: '0.7rem', padding: '3px 8px' }}
                                onClick={e => { e.preventDefault(); toggleFollowUser(u.id); }}>
                                {followingIds.has(u.id) ? 'Following' : 'Follow'}
                            </button>
                        </Link>
                    ))}
                    <Link href="/explore" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 12, textAlign: 'center', display: 'block' }}>
                        View All Profiles
                    </Link>
                </div>

                {/* Who to follow */}
                <div className="hp-card">
                    <div className="hp-card-title"><TrendingUpIcon size={15} /> Suggested For You</div>
                    {similarUsers.map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <Link href={`/profile/${u.username}`}><UserAvatar name={u.name} avatar={u.avatar} size="sm" /></Link>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {u.name} {u.verified && <VerifiedIcon size={12} />}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{ROLE_LABELS[u.role] ?? u.role}</div>
                            </div>
                            <button 
                                className={followingIds.has(u.id) ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"} 
                                style={{ flexShrink: 0, fontSize: '0.7rem', padding: '3px 8px' }} 
                                onClick={e => { e.preventDefault(); toggleFollowUser(u.id); }}>
                                {followingIds.has(u.id) ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Edit Profile Modal */}
            {showEditModal && isLoggedIn && loggedInUser && (
                <EditProfileModal
                    user={{ ...loggedInUser, role: loggedInUser.role ?? 'citizen' }}
                    onClose={() => setShowEditModal(false)}
                    onSave={data => updateProfile(data)}
                />
            )}

            {/* Share Profile Modal */}
            {isShareModalOpen && (
                <ShareProfileModal 
                    user={profileUser} 
                    onClose={() => setIsShareModalOpen(false)} 
                />
            )}

            {activeCommType && profileUser && (
                <CommunicationModal
                    user={profileUser}
                    type={activeCommType}
                    onClose={() => setActiveCommType(null)}
                />
            )}
        </div>
    );
}
