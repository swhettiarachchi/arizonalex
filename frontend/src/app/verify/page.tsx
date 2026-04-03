'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import {
    ShieldIcon, CheckCircleIcon, UserIcon, BriefcaseIcon, BuildingIcon,
    CameraIcon, LinkIcon, FileTextIcon, ArrowRightIcon, StarIcon, ZapIcon,
    AlertCircleIcon, ChevronDownIcon, LockIcon, SearchIcon, HelpCircleIcon,
    UploadIcon, XIcon
} from '@/components/ui/Icons';

const verificationTiers = [
    { id: 'blue', label: 'Blue Badge', role: 'Government & Officials', color: '#3b82f6', desc: 'Elected representatives, government agencies, political candidates, and diplomats.', requirements: ['Government-issued credentials', 'Proof of office or candidacy', 'Official .gov email or letterhead'] },
    { id: 'gold', label: 'Gold Badge', role: 'Media & Journalism', color: '#f59e0b', desc: 'Credentialed journalists, news organizations, and recognized media professionals.', requirements: ['Press credentials or byline history', 'Recognized publication affiliation', 'Editorial board confirmation'] },
    { id: 'green', label: 'Green Badge', role: 'Finance & Analysis', color: '#10b981', desc: 'Certified financial analysts, licensed advisors, economists, and fintech professionals.', requirements: ['CFA, Series 7/66, or equivalent license', 'Institutional affiliation proof', 'Published research or analysis'] },
];

const benefits = [
    { icon: <ShieldIcon size={22} />, title: 'Trust Badge', desc: 'A colored badge displayed next to your name on all posts, comments, and your profile.', color: '#8b5cf6' },
    { icon: <SearchIcon size={22} />, title: 'Priority Visibility', desc: 'Boosted placement in search results and discovery algorithm recommendations.', color: '#3b82f6' },
    { icon: <ZapIcon size={22} />, title: 'Creator Studio', desc: 'Access advanced analytics, engagement metrics, and audience insights tools.', color: '#f59e0b' },
    { icon: <LockIcon size={22} />, title: 'Enhanced Security', desc: 'Mandatory 2FA protection and dedicated security monitoring for your account.', color: '#10b981' },
    { icon: <StarIcon size={22} />, title: 'Priority Support', desc: 'Dedicated customer support lane with faster response times and escalation.', color: '#ec4899' },
    { icon: <ArrowRightIcon size={22} />, title: 'API Access', desc: 'Verified accounts unlock expanded API rate limits and advanced data endpoints.', color: '#06b6d4' },
];

const faqItems = [
    { q: 'How long does verification review take?', a: 'Our Trust & Safety team reviews all applications within 3-5 business days. You will receive an in-app notification with the result.' },
    { q: 'Can I reapply if denied?', a: 'Yes. You will receive specific feedback about why your application was denied. You may reapply after 90 days with improved documentation.' },
    { q: 'What happens if I violate platform guidelines after verification?', a: 'Verified accounts that violate community guidelines may have their badges revoked. This includes misinformation violations, harassment, and impersonation.' },
    { q: 'Is verification free?', a: 'Yes, verification on Arizonalex is completely free. We do not charge for badge issuance or review. Beware of any third-party services claiming to offer "fast-track" verification.' },
    { q: 'Can organizations get verified?', a: 'Absolutely. Companies, news organizations, government agencies, and nonprofits can all apply. Upload Articles of Incorporation or an official letterhead as your identity document.' },
    { q: 'Does verification grant special content moderation privileges?', a: 'No. Verified accounts follow the same community guidelines as all users. Verification confirms identity and notability — it does not grant immunity from platform rules.' },
];

export default function VerifyRequestPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [openFaq, setOpenFaq] = useState<Set<number>>(new Set());

    const [formData, setFormData] = useState({
        category: '',
        fullName: '',
        knownAs: '',
        links: ['', ''],
        statement: '',
        idUploaded: false,
        fileName: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPG, PNG, and PDF files are allowed.');
                return;
            }
            setFormData(prev => ({ ...prev, idUploaded: true, fileName: file.name }));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPG, PNG, and PDF files are allowed.');
                return;
            }
            setFormData(prev => ({ ...prev, idUploaded: true, fileName: file.name }));
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, idUploaded: false, fileName: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCategorySelect = (cat: string) => {
        setFormData(prev => ({ ...prev, category: cat }));
        setTimeout(() => setStep(2), 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
        }, 2000);
    };

    const toggleFaq = (i: number) => {
        setOpenFaq(prev => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    if (success) {
        return (
            <div className="info-container">
                <main className="info-main" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="info-card" style={{ textAlign: 'center', padding: '60px 30px', maxWidth: 500 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(16,185,129,0.3)'
                        }}>
                            <CheckCircleIcon size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Request Submitted</h2>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 30 }}>
                            Thank you for submitting your verification request. Our trust and safety team will review your provided documents and notability links. You will receive a notification regarding your status within 3-5 business days.
                        </p>
                        <Link href="/" className="btn btn-primary" style={{ padding: '12px 30px', borderRadius: 30, fontSize: '0.95rem' }}>
                            Return to Feed
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero */}
            <div className="info-hero">
                <div className="info-hero-glow" />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', marginBottom: 20, fontSize: '0.8rem', color: '#a78bfa' }}>
                        <ShieldIcon size={14} /> Get Verified
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
                        Request <span className="info-gradient-text">Verification</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 0, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
                        Arizonalex verification lets people know that your account is authentic, notable, and active. Earn your badge to build trust and prevent impersonation.
                    </p>
                </div>
            </div>

            <div className="info-page-content">
                {/* Verification Tiers */}
                <h2 className="info-section-title">Verification Tiers</h2>
                <div className="info-grid-3">
                    {verificationTiers.map((tier, i) => (
                        <div key={tier.id} className="info-card" style={{ animationDelay: `${i * 80}ms`, padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${tier.color}15`, border: `2px solid ${tier.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldIcon size={22} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: tier.color }}>{tier.label}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{tier.role}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{tier.desc}</p>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Requirements</div>
                                {tier.requirements.map((req, j) => (
                                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                        <CheckCircleIcon size={13} />
                                        <span>{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>Benefits of Verification</h2>
                <div className="info-grid-3">
                    {benefits.map((b, i) => (
                        <div key={i} className="info-card info-card-hover" style={{ padding: 22, animationDelay: `${i * 60}ms`, textAlign: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${b.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: b.color }}>
                                {b.icon}
                            </div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6 }}>{b.title}</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{b.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Application Form */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>Apply Now</h2>
                <div className="info-card" style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(24px, 5vw, 32px)' }}>
                    
                    {/* Stepper */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 15, left: 30, right: 30, height: 2, background: 'var(--border)', zIndex: 0 }} />
                        <div style={{ position: 'absolute', top: 15, left: 30, width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', height: 2, background: 'var(--primary)', zIndex: 0, transition: 'width 0.4s ease' }} />
                        
                        {[ { num: 1, label: 'Category' }, { num: 2, label: 'Identity' }, { num: 3, label: 'Notability' }].map(s => (
                            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: 8 }}>
                                <div style={{ 
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: step >= s.num ? 'var(--primary)' : 'var(--bg-tertiary)',
                                    color: step >= s.num ? '#fff' : 'var(--text-tertiary)',
                                    fontWeight: 800, fontSize: '0.85rem', border: `2px solid ${step >= s.num ? 'var(--primary)' : 'var(--border)'}`, transition: 'all 0.3s'
                                }}>
                                    {step > s.num ? <CheckCircleIcon size={16} /> : s.num}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Category */}
                    {step === 1 && (
                        <div className="fade-in">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, textAlign: 'center' }}>Tell us who you are</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
                                {[
                                    { id: 'politician', icon: <BuildingIcon size={24} />, title: 'Government / Official', desc: 'Elected officials, agencies, or political candidates.' },
                                    { id: 'news', icon: <FileTextIcon size={24} />, title: 'News / Journalist', desc: 'Recognized media organizations and journalists.' },
                                    { id: 'business', icon: <BriefcaseIcon size={24} />, title: 'Business / Brand', desc: 'Companies, brands, and notable startup organizations.' },
                                    { id: 'creator', icon: <CameraIcon size={24} />, title: 'Creator / Influencer', desc: 'Public figures, experts, and highly active creators.' }
                                ].map(cat => (
                                    <button key={cat.id} onClick={() => handleCategorySelect(cat.id)} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left',
                                        padding: '24px', borderRadius: '16px',
                                        border: `2px solid ${formData.category === cat.id ? 'var(--primary)' : 'transparent'}`,
                                        background: formData.category === cat.id ? 'rgba(139,92,246,0.08)' : 'var(--bg-secondary)',
                                        boxShadow: formData.category === cat.id ? '0 0 0 4px rgba(139,92,246,0.15)' : '0 4px 20px rgba(0,0,0,0.04)',
                                        cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', width: '100%'
                                    }} className="hover-lift">
                                        <div style={{ 
                                            width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                                            background: formData.category === cat.id ? 'var(--primary)' : 'var(--bg-tertiary)',
                                            color: formData.category === cat.id ? '#fff' : 'var(--text-secondary)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {cat.icon}
                                        </div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{cat.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{cat.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Identity */}
                    {step === 2 && (
                        <form className="fade-in" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>Confirm your identity</h3>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Legal Name</label>
                                <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="As it appears on your official ID" style={{
                                    width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none'
                                }} />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Known As (Optional)</label>
                                <input type="text" value={formData.knownAs} onChange={e => setFormData({...formData, knownAs: e.target.value})} placeholder="Stage name, pseudonym, or alias if highly recognized" style={{
                                    width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none'
                                }} />
                            </div>

                            <div style={{ marginBottom: 30 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Official Document (ID or Articles of Incorporation)</label>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".jpg,.jpeg,.png,.pdf" 
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }}
                                />
                                <div 
                                    style={{
                                        border: '2px dashed var(--border)', 
                                        borderRadius: 12, 
                                        padding: '30px', 
                                        textAlign: 'center', 
                                        background: formData.idUploaded ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }} 
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {formData.idUploaded ? (
                                        <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <CheckCircleIcon size={30} />
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formData.fileName}</span>
                                            <button 
                                                type="button" 
                                                onClick={removeFile}
                                                style={{ 
                                                    background: 'rgba(239, 68, 68, 0.1)', 
                                                    color: '#ef4444', 
                                                    border: 'none', 
                                                    padding: '4px 12px', 
                                                    borderRadius: 20, 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 600,
                                                    marginTop: 4
                                                }}
                                            >
                                                Remove File
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <div style={{ color: 'var(--primary)' }}><UploadIcon size={30} /></div>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Click or drag a file to securely upload</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>JPG, PNG, or PDF max 5MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 10, fontWeight: 700 }}>Back</button>
                                <button type="submit" className="btn btn-primary" disabled={!formData.fullName || !formData.idUploaded} style={{ flex: 2, padding: '14px', borderRadius: 10, fontWeight: 700, opacity: (!formData.fullName || !formData.idUploaded) ? 0.5 : 1 }}>Continue</button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Notability */}
                    {step === 3 && (
                        <form className="fade-in" onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>Prove your notability</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>To get verified, you must demonstrate that your account represents a prominent, highly searched individual or brand. Please provide links to news articles or official properties.</p>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Official Links (Up to 3)</label>
                                {[0, 1].map((index) => (
                                    <div key={index} style={{ position: 'relative', marginBottom: 12 }}>
                                        <div style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-tertiary)' }}><LinkIcon size={18} /></div>
                                        <input type="url" value={formData.links[index]} onChange={(e) => {
                                            const newLinks = [...formData.links]; newLinks[index] = e.target.value; setFormData({...formData, links: newLinks});
                                        }} placeholder={`https://`} style={{
                                            width: '100%', padding: '14px 16px 14px 40px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none'
                                        }} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: 30 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Significance Statement</label>
                                <textarea required value={formData.statement} onChange={e => setFormData({...formData, statement: e.target.value})} placeholder="Briefly explain why this account requires a verification badge..." rows={4} style={{
                                    width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', resize: 'vertical'
                                }} />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 10, fontWeight: 700 }} disabled={submitting}>Back</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting || !formData.links[0] || !formData.statement} style={{ flex: 2, padding: '14px', borderRadius: 10, fontWeight: 700, opacity: (submitting || !formData.links[0] || !formData.statement) ? 0.5 : 1 }}>
                                    {submitting ? <span className="auth-spinner" style={{ width: 18, height: 18, borderTopColor: '#fff', borderRightColor: '#fff' }} /> : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Verification FAQ */}
                <h2 className="info-section-title" style={{ marginTop: 48 }}>Frequently Asked Questions</h2>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {faqItems.map((faq, i) => (
                        <div key={i} className="info-accordion" style={{ animationDelay: `${i * 60}ms` }}>
                            <button
                                className={`info-accordion-header ${openFaq.has(i) ? 'open' : ''}`}
                                onClick={() => toggleFaq(i)}
                            >
                                <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: '0.92rem' }}>{faq.q}</span>
                                <span className={`info-accordion-chevron ${openFaq.has(i) ? 'open' : ''}`}>
                                    <ChevronDownIcon size={18} />
                                </span>
                            </button>
                            <div className={`info-accordion-body ${openFaq.has(i) ? 'open' : ''}`}>
                                <div className="info-accordion-content">
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{faq.a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="info-cta-section" style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Need More Information?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, maxWidth: 440 }}>
                        Read our comprehensive verification guide or contact our Trust & Safety team.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/help/article/gs-3" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <FileTextIcon size={16} /> Full Verification Guide
                        </Link>
                        <Link href="/contact" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <HelpCircleIcon size={16} /> Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
