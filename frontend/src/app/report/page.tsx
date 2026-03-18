'use client';
import { useState, useEffect } from 'react';
import {
    FlagIcon, AlertCircleIcon, AlertTriangleIcon, ShieldIcon, SettingsIcon,
    ZapIcon, HelpCircleIcon, ChevronRightIcon, CheckCircleIcon, UploadIcon,
    ClockIcon, XIcon, ImageIcon
} from '@/components/ui/Icons';

interface RecentReport {
    id: string;
    title: string;
    status: 'open' | 'in-review' | 'resolved';
    date: string;
    type: string;
}

const problemTypes = [
    { id: 'bug', label: 'Bug Report', desc: 'Something isn\'t working correctly', icon: <AlertCircleIcon size={28} />, color: '#ef4444' },
    { id: 'misinfo', label: 'Misinformation', desc: 'False or misleading political/financial content', icon: <AlertTriangleIcon size={28} />, color: '#f59e0b' },
    { id: 'harassment', label: 'Harassment', desc: 'Abusive, threatening, or targeted behavior', icon: <ShieldIcon size={28} />, color: '#8b5cf6' },
    { id: 'account', label: 'Account Issue', desc: 'Login, security, or profile problems', icon: <SettingsIcon size={28} />, color: '#3b82f6' },
    { id: 'feature', label: 'Feature Request', desc: 'Suggest a new feature or improvement', icon: <ZapIcon size={28} />, color: '#10b981' },
    { id: 'other', label: 'Other', desc: 'Anything else we should know about', icon: <HelpCircleIcon size={28} />, color: '#94a3b8' },
];

const recentReports: RecentReport[] = [
    { id: 'RPT-2847', title: 'Market data delayed on S&P 500 widget', status: 'in-review', date: 'Mar 15, 2026', type: 'Bug' },
    { id: 'RPT-2831', title: 'False campaign finance figures on post', status: 'resolved', date: 'Mar 12, 2026', type: 'Misinformation' },
    { id: 'RPT-2819', title: 'Cannot export legislative tracking data', status: 'open', date: 'Mar 10, 2026', type: 'Bug' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    'open': { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Open' },
    'in-review': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'In Review' },
    'resolved': { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: 'Resolved' },
};

export default function ReportPage() {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [priority, setPriority] = useState('medium');
    const [fileName, setFileName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [ticketNumber] = useState('RPT-' + Math.floor(2850 + Math.random() * 100));

    // Auto-save draft
    useEffect(() => {
        const draft = { selectedType, description, url, priority };
        localStorage.setItem('arizonalex_report_draft', JSON.stringify(draft));
    }, [selectedType, description, url, priority]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('arizonalex_report_draft');
            if (saved) {
                const draft = JSON.parse(saved);
                if (draft.selectedType) setSelectedType(draft.selectedType);
                if (draft.description) setDescription(draft.description);
                if (draft.url) setUrl(draft.url);
                if (draft.priority) setPriority(draft.priority);
            }
        } catch {}
    }, []);

    const handleSubmit = () => {
        setSubmitted(true);
        setStep(3);
        localStorage.removeItem('arizonalex_report_draft');
    };

    const errors: Record<string, string> = {};
    if (step === 2) {
        if (!description.trim()) errors.description = 'Please describe the issue';
        if (description.trim().length > 0 && description.trim().length < 20) errors.description = 'Please provide at least 20 characters';
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero" style={{ paddingBottom: 30 }}>
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#f87171' }}>
                        <FlagIcon size={14} /> Report a Problem
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>
                        Report a Problem
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        Help us improve Arizonalex by reporting bugs, misinformation, or policy violations.
                    </p>
                </div>
            </div>

            <div className="info-page-content" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Main Form */}
                <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                    {/* Progress indicator */}
                    <div className="info-progress-bar">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`info-progress-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                                <div className="info-progress-circle">
                                    {step > s ? <CheckCircleIcon size={18} /> : s}
                                </div>
                                <span className="info-progress-label">
                                    {s === 1 ? 'Problem Type' : s === 2 ? 'Details' : 'Confirmation'}
                                </span>
                            </div>
                        ))}
                        <div className="info-progress-line">
                            <div className="info-progress-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                        </div>
                    </div>

                    {/* Step 1: Problem Type */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>What type of problem?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>Select the category that best describes your issue.</p>
                            <div className="info-grid-2">
                                {problemTypes.map(type => (
                                    <button
                                        key={type.id}
                                        className={`info-card info-card-hover info-selectable ${selectedType === type.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedType(type.id)}
                                        style={{ textAlign: 'left', cursor: 'pointer', border: selectedType === type.id ? `2px solid ${type.color}` : undefined }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${type.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, flexShrink: 0 }}>
                                                {type.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{type.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{type.desc}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                <button
                                    className="btn btn-primary"
                                    disabled={!selectedType}
                                    onClick={() => setStep(2)}
                                    style={{ opacity: selectedType ? 1 : 0.5 }}
                                >
                                    Continue <ChevronRightIcon size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>Provide details</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                                The more detail you provide, the faster we can resolve the issue.
                            </p>

                            <div className="info-form-group">
                                <label className="info-form-label">Description *</label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        className="info-form-textarea"
                                        placeholder="Describe the issue in detail. What happened? What did you expect?"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={5}
                                        maxLength={2000}
                                    />
                                    <span style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '0.72rem', color: description.length > 1800 ? '#ef4444' : 'var(--text-tertiary)' }}>
                                        {description.length}/2000
                                    </span>
                                </div>
                                {errors.description && <span className="info-form-error">{errors.description}</span>}
                            </div>

                            <div className="info-form-group">
                                <label className="info-form-label">URL (optional)</label>
                                <input
                                    className="info-form-input"
                                    type="text"
                                    placeholder="https://arizonalex.com/..."
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                />
                            </div>

                            <div className="info-form-group">
                                <label className="info-form-label">Priority</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['low', 'medium', 'high'].map(p => (
                                        <button
                                            key={p}
                                            className={`info-priority-btn ${priority === p ? 'active' : ''}`}
                                            onClick={() => setPriority(p)}
                                            data-priority={p}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="info-form-group">
                                <label className="info-form-label">Screenshot (optional)</label>
                                <div
                                    className="info-upload-area"
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => { e.preventDefault(); setFileName(e.dataTransfer.files[0]?.name || ''); }}
                                >
                                    {fileName ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <ImageIcon size={20} />
                                            <span style={{ fontSize: '0.85rem' }}>{fileName}</span>
                                            <button onClick={() => setFileName('')} style={{ color: 'var(--text-tertiary)' }}><XIcon size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadIcon size={28} />
                                            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Drag & drop a screenshot, or <span style={{ color: '#7C3AED', fontWeight: 600 }}>click to browse</span></p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>PNG, JPG up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
                                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                                <button
                                    className="btn btn-primary"
                                    disabled={!description.trim() || description.trim().length < 20}
                                    onClick={handleSubmit}
                                    style={{ opacity: description.trim().length >= 20 ? 1 : 0.5 }}
                                >
                                    Submit Report <ChevronRightIcon size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && submitted && (
                        <div className="info-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <div className="info-success-icon">
                                <CheckCircleIcon size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Report Submitted</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                                Thank you for helping improve Arizonalex. We take every report seriously.
                            </p>
                            <div className="info-card" style={{ background: 'var(--bg-tertiary)', maxWidth: 340, margin: '0 auto 24px', padding: 20 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Ticket Number</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7C3AED', marginBottom: 12 }}>{ticketNumber}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                    <ClockIcon size={14} /> Estimated response: 24–48 hours
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={() => { setStep(1); setSubmitted(false); setSelectedType(''); setDescription(''); setUrl(''); setFileName(''); }}>
                                Submit Another Report
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Recent Reports */}
                <div style={{ flex: '0 0 300px', minWidth: 260 }}>
                    <div className="info-card" style={{ position: 'sticky', top: 20 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ClockIcon size={16} /> Your Recent Reports
                        </h3>
                        {recentReports.map(r => {
                            const status = STATUS_COLORS[r.status];
                            return (
                                <div key={r.id} style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{r.id}</span>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: status.bg, color: status.text }}>{status.label}</span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{r.type} · {r.date}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
