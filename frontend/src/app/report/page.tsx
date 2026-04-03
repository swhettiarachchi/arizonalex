'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    FlagIcon, AlertCircleIcon, CheckCircleIcon, ChevronDownIcon,
    UserIcon, MessageSquareIcon, ImageIcon, LinkIcon, ShieldIcon,
    FileTextIcon, SendIcon, EyeIcon, BotIcon, ZapIcon, LockIcon
} from '@/components/ui/Icons';

const reportTypes = [
    { id: 'harassment', icon: <AlertCircleIcon size={22} />, label: 'Harassment or Abuse', desc: 'Threats, bullying, or targeted hate speech', color: '#ef4444' },
    { id: 'misinfo', icon: <ShieldIcon size={22} />, label: 'Misinformation', desc: 'False claims, deepfakes, or misleading data', color: '#f59e0b' },
    { id: 'impersonation', icon: <UserIcon size={22} />, label: 'Impersonation', desc: 'Fake accounts pretending to be someone else', color: '#8b5cf6' },
    { id: 'spam', icon: <MessageSquareIcon size={22} />, label: 'Spam or Manipulation', desc: 'Bot activity, astroturfing, or spam', color: '#3b82f6' },
    { id: 'content', icon: <ImageIcon size={22} />, label: 'Inappropriate Content', desc: 'NSFW material or violent content', color: '#ec4899' },
    { id: 'technical', icon: <ZapIcon size={22} />, label: 'Technical Bug', desc: 'Platform issues, broken features, or errors', color: '#06b6d4' },
];

const templates: Record<string, string> = {
    harassment: 'I would like to report harassment/abuse from a user. The behavior includes:\n\nUser involved: @\nSpecific behavior observed:\nDate/time of incident:\nScreenshot URLs (if any):',
    misinfo: 'I would like to report misleading or false information.\n\nPost/content URL:\nWhat is inaccurate:\nCorrect information source:\nPotential impact level:',
    impersonation: 'I would like to report an account that is impersonating someone.\n\nImpersonating account: @\nReal person/org being impersonated:\nProof of real identity:\nHow this was discovered:',
    spam: 'I would like to report spam or platform manipulation.\n\nSuspicious account(s): @\nType of spam:\nFrequency observed:\nAdditional context:',
    content: 'I would like to report inappropriate content.\n\nContent URL:\nType of violation:\nAdditional context:',
    technical: 'I would like to report a technical issue.\n\nFeature affected:\nExpected behavior:\nActual behavior:\nBrowser/device info:\nSteps to reproduce:',
};

const safetyTips = [
    'Block the user immediately if you feel unsafe',
    'Take screenshots before content is removed',
    'Don\'t engage with harassers — report and disengage',
    'Use our "mute" feature to stop notifications from them',
    'Reports are confidential — the user won\'t know who reported',
];

export default function ReportPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedType, setSelectedType] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [description, setDescription] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleTypeSelect = (id: string) => {
        setSelectedType(id);
        setDescription(templates[id] || '');
        setStep(2);
    };

    const handleSubmit = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
        }, 1800);
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div className="info-card" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 480 }}>
                    <div className="info-success-icon">
                        <CheckCircleIcon size={44} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Report Submitted</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 6 }}>
                        Your report has been received and assigned to our Trust & Safety team.
                    </p>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>
                        Reference: RPT-{Date.now().toString().slice(-6)} • Review within 24 hours
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => { setSuccess(false); setStep(1); setSelectedType(''); setDescription(''); }}>Submit Another</button>
                        <Link href="/" className="btn btn-outline">Return to Feed</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#f87171' }}>
                        <FlagIcon size={14} /> Report
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>Report a Problem</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        Help keep Arizonalex safe. All reports are reviewed by our Trust & Safety team within 24 hours.
                    </p>
                </div>
            </div>

            <div className="info-page-content">
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    {/* Main Content */}
                    <div style={{ flex: '1 1 560px', minWidth: 0 }}>
                        {/* Stepper */}
                        <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
                            {[{ n: 1, l: 'Type' }, { n: 2, l: 'Details' }, { n: 3, l: 'Review' }].map((s, i) => (
                                <div key={s.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    {i > 0 && <div style={{ position: 'absolute', top: 14, left: -40, width: 80, height: 2, background: step >= s.n ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s', zIndex: 0 }} />}
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: step >= s.n ? 'var(--primary)' : 'var(--bg-tertiary)', color: step >= s.n ? '#fff' : 'var(--text-tertiary)',
                                        fontSize: '0.75rem', fontWeight: 800, zIndex: 1, border: `2px solid ${step >= s.n ? 'var(--primary)' : 'var(--border)'}`, transition: 'all 0.3s'
                                    }}>
                                        {step > s.n ? <CheckCircleIcon size={14} /> : s.n}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: 6, color: step >= s.n ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{s.l}</span>
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Select Type */}
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>What are you reporting?</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 12 }}>
                                    {reportTypes.map(type => (
                                        <button key={type.id} className="info-card info-card-hover" onClick={() => handleTypeSelect(type.id)}
                                            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', textAlign: 'left', border: selectedType === type.id ? `2px solid ${type.color}` : undefined, background: selectedType === type.id ? `${type.color}08` : undefined }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${type.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, flexShrink: 0 }}>
                                                {type.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{type.label}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{type.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <div className="fade-in">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Provide Details</h2>
                                
                                {/* Anonymous toggle */}
                                <div className="info-card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Anonymous Report</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Your identity will be hidden from moderators</div>
                                    </div>
                                    <button onClick={() => setIsAnonymous(!isAnonymous)} style={{
                                        width: 48, height: 26, borderRadius: 13, cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
                                        background: isAnonymous ? 'var(--primary)' : 'var(--bg-tertiary)', border: `1px solid ${isAnonymous ? 'var(--primary)' : 'var(--border)'}`
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                                            left: isAnonymous ? 25 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                                        }} />
                                    </button>
                                </div>

                                <div className="info-form-group">
                                    <label className="info-form-label">Description</label>
                                    <textarea className="info-form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={8} placeholder="Describe the issue in detail..." />
                                </div>

                                <div className="info-form-group">
                                    <label className="info-form-label">Evidence URL (optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-tertiary)' }}><LinkIcon size={16} /></div>
                                        <input className="info-form-input" type="url" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} placeholder="https://arizonalex.com/post/..."
                                            style={{ paddingLeft: 36 }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                    <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
                                    <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 2 }} disabled={!description.trim()}>Review Report</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="fade-in">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Review & Submit</h2>
                                <div className="info-card" style={{ padding: 22, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12, fontSize: '0.82rem' }}>
                                        <span style={{ fontWeight: 700 }}>Type: <span style={{ color: 'var(--primary)' }}>{reportTypes.find(t => t.id === selectedType)?.label}</span></span>
                                        <span style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{isAnonymous ? <><LockIcon size={14} /> Anonymous</> : <><UserIcon size={14} /> Identified</>}</span>
                                    </div>
                                    <div style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                                        {description}
                                    </div>
                                    {evidenceUrl && (
                                        <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#7C3AED', wordBreak: 'break-all' }}>
                                            <LinkIcon size={12} /> {evidenceUrl}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }} disabled={submitting}>Edit</button>
                                    <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={submitting}>
                                        {submitting ? <span className="auth-spinner" style={{ width: 18, height: 18, borderTopColor: '#fff', borderRightColor: '#fff' }} /> : <><SendIcon size={16} /> Submit Report</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ flex: '0 1 300px', minWidth: 260 }}>
                        <div className="info-card" style={{ padding: 22, marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ShieldIcon size={16} /> Safety Tips
                            </h3>
                            {safetyTips.map((tip, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircleIcon size={14} />
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>

                        <div className="info-card" style={{ padding: 22, marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <EyeIcon size={16} /> What Happens Next?
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {['Report received & classified', 'Assigned to reviewer (24h)', 'Evidence collected & analyzed', 'Action taken & you\'re notified'].map((step, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, color: 'var(--text-tertiary)' }}>
                                            {i + 1}
                                        </div>
                                        <span style={{ lineHeight: 1.4 }}>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link href="/guidelines" className="info-card info-card-hover" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <FileTextIcon size={18} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Community Guidelines</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Review our content policies</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
