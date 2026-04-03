'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { SwordsIcon, ArrowLeftIcon, ZapIcon, DollarSignIcon, TimerIcon, GlobeIcon, LanguageIcon, MapIcon, RadioIcon, UsersIcon } from '@/components/ui/Icons';
import Link from 'next/link';
import { COUNTRIES, LANGUAGES, DEBATE_TYPES, searchCountries, GLOBAL_OPTION } from '@/lib/countries';
import type { CountryInfo } from '@/lib/countries';

const CATEGORIES = [
    { value: 'politics', label: 'Politics', color: '#ef4444' },
    { value: 'crypto', label: 'Crypto', color: '#f59e0b' },
    { value: 'business', label: 'Business', color: '#3b82f6' },
    { value: 'tech', label: 'Technology', color: '#8b5cf6' },
    { value: 'social', label: 'Social', color: '#ec4899' },
    { value: 'science', label: 'Science', color: '#10b981' },
    { value: 'sports', label: 'Sports', color: '#f97316' },
    { value: 'other', label: 'Other', color: '#6b7280' },
];

const DURATIONS = [
    { value: 3, label: '3 min' }, { value: 5, label: '5 min' }, { value: 10, label: '10 min' },
    { value: 15, label: '15 min' }, { value: 30, label: '30 min' },
];

const ENTRY_FEES = [
    { value: 0, label: 'Free' }, { value: 5, label: '$5' }, { value: 10, label: '$10' },
    { value: 25, label: '$25' }, { value: 50, label: '$50' }, { value: 100, label: '$100' },
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'pro'] as const;

const SUGGESTED_TOPICS = [
    'Should AI be regulated by governments?',
    'Is cryptocurrency the future of finance?',
    'Universal Basic Income: Yes or No?',
    'Should social media be age-restricted?',
    'Is remote work better for productivity?',
    'Should nuclear energy replace fossil fuels?',
    'Are electric vehicles practical for everyone?',
    'Should voting be mandatory?',
];

export default function CreateDebatePage() {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('politics');
    const [duration, setDuration] = useState(5);
    const [entryFee, setEntryFee] = useState(10);
    const [difficulty, setDifficulty] = useState<string>('beginner');
    const [tags, setTags] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Country fields
    const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(GLOBAL_OPTION);
    const [countrySearch, setCountrySearch] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [language, setLanguage] = useState('English');
    const [debateType, setDebateType] = useState('1v1');
    const [isGlobal, setIsGlobal] = useState(false);
    const [multiCountries, setMultiCountries] = useState<CountryInfo[]>([]);
    const [showMultiCountry, setShowMultiCountry] = useState(false);

    const filteredCountries = searchCountries(countrySearch);

    const selectCountry = (c: CountryInfo) => {
        setSelectedCountry(c);
        setCountrySearch('');
        setShowCountryDropdown(false);
        if (c.code === 'GLOBAL') setIsGlobal(true);
        else setIsGlobal(false);
    };

    const toggleMultiCountry = (c: CountryInfo) => {
        setMultiCountries(prev =>
            prev.find(mc => mc.code === c.code)
                ? prev.filter(mc => mc.code !== c.code)
                : [...prev, c]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) { setError('Please sign in to create a debate'); return; }
        if (!title.trim() || !topic.trim()) { setError('Title and topic are required'); return; }
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/debates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(), topic: topic.trim(), description: description.trim(),
                    category, duration, entryFee, difficulty,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    country: selectedCountry.name,
                    countries: multiCountries.map(c => c.name),
                    language,
                    debateType,
                    isGlobal,
                }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/debates/${data.data._id}`);
            } else {
                setError(data.message || 'Failed to create debate');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const useSuggestion = (suggestion: string) => {
        setTopic(suggestion);
        if (!title) setTitle(suggestion);
    };

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <Link href="/debates" className="page-back-btn"><ArrowLeftIcon size={20} /></Link>
                    <h1>Create Debate</h1>
                </div>

                <form onSubmit={handleSubmit} className="create-debate-form">
                    {error && <div className="debate-form-error fade-in">{error}</div>}

                    <div className="debate-form-group">
                        <label className="debate-form-label">Debate Title *</label>
                        <input type="text" className="debate-form-input" placeholder="e.g., AI Regulation Debate" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} id="debate-title" />
                        <span className="debate-form-hint">{title.length}/200</span>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label">Debate Topic / Question *</label>
                        <textarea className="debate-form-textarea" placeholder="What is the main question or statement to debate?" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={300} rows={3} id="debate-topic" />
                        <span className="debate-form-hint">{topic.length}/300</span>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label"><ZapIcon size={14} /> Quick Suggestions</label>
                        <div className="debate-suggestions">
                            {SUGGESTED_TOPICS.map((s, i) => (
                                <button key={i} type="button" className="debate-suggestion-chip" onClick={() => useSuggestion(s)}>{s}</button>
                            ))}
                        </div>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label">Description (optional)</label>
                        <textarea className="debate-form-textarea" placeholder="Provide context or rules for this debate..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} id="debate-description" />
                    </div>

                    {/* Country Selector */}
                    <div className="debate-form-group">
                        <label className="debate-form-label"><MapIcon size={14} /> Country</label>
                        <div className="country-selector-create">
                            <button type="button" className="country-selector-btn" onClick={() => setShowCountryDropdown(!showCountryDropdown)} id="create-country-selector">
                                {selectedCountry.flag ? <span className="country-flag-lg">{selectedCountry.flag}</span> : <GlobeIcon size={18} />}
                                <span>{selectedCountry.name}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                            {showCountryDropdown && (
                                <div className="country-dropdown-create fade-in">
                                    <input type="text" className="country-dropdown-search" placeholder="Search countries..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus />
                                    <div className="country-dropdown-list">
                                        <button type="button" className={`country-dropdown-item ${selectedCountry.code === 'GLOBAL' ? 'active' : ''}`} onClick={() => selectCountry(GLOBAL_OPTION)}>
                                            <GlobeIcon size={14} /> Global
                                        </button>
                                        {filteredCountries.map(c => (
                                            <button type="button" key={c.code} className={`country-dropdown-item ${selectedCountry.code === c.code ? 'active' : ''}`} onClick={() => selectCountry(c)}>
                                                <span className="country-flag-sm">{c.flag}</span> {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Multi-country toggle */}
                        <div className="country-multi-toggle">
                            <label className="debate-toggle-label">
                                <input type="checkbox" checked={showMultiCountry} onChange={(e) => setShowMultiCountry(e.target.checked)} />
                                <span>Multi-country debate</span>
                            </label>
                            <label className="debate-toggle-label">
                                <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />
                                <span><GlobeIcon size={14} /> Global debate</span>
                            </label>
                        </div>

                        {showMultiCountry && (
                            <div className="multi-country-picker fade-in">
                                <div className="multi-country-chips">
                                    {multiCountries.map(c => (
                                        <span key={c.code} className="multi-country-chip">
                                            {c.flag} {c.name}
                                            <button type="button" onClick={() => toggleMultiCountry(c)}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="multi-country-list">
                                    {COUNTRIES.slice(0, 30).map(c => (
                                        <button type="button" key={c.code} className={`country-dropdown-item ${multiCountries.find(mc => mc.code === c.code) ? 'active' : ''}`} onClick={() => toggleMultiCountry(c)}>
                                            <span className="country-flag-sm">{c.flag}</span> {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Language Selector */}
                    <div className="debate-form-group">
                        <label className="debate-form-label"><LanguageIcon size={14} /> Language</label>
                        <select className="debate-form-select" value={language} onChange={(e) => setLanguage(e.target.value)} id="debate-language">
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    {/* Debate Type */}
                    <div className="debate-form-group">
                        <label className="debate-form-label">Debate Type</label>
                        <div className="debate-option-row">
                            {DEBATE_TYPES.map(dt => (
                                <button key={dt.value} type="button" className={`debate-option-btn ${debateType === dt.value ? 'active' : ''}`} onClick={() => setDebateType(dt.value)}>
                                    {dt.iconName === 'swords' && <SwordsIcon size={14} />}
                                    {dt.iconName === 'users' && <UsersIcon size={14} />}
                                    {dt.iconName === 'radio' && <RadioIcon size={14} />}
                                    {dt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label">Category</label>
                        <div className="debate-category-grid">
                            {CATEGORIES.map(c => (
                                <button key={c.value} type="button" className={`debate-category-btn ${category === c.value ? 'active' : ''}`} onClick={() => setCategory(c.value)}
                                    style={category === c.value ? { borderColor: c.color, color: c.color, background: `${c.color}15` } : {}}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label"><TimerIcon size={14} /> Duration</label>
                        <div className="debate-option-row">
                            {DURATIONS.map(d => (
                                <button key={d.value} type="button" className={`debate-option-btn ${duration === d.value ? 'active' : ''}`} onClick={() => setDuration(d.value)}>{d.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label"><DollarSignIcon size={14} /> Entry Fee</label>
                        <div className="debate-option-row">
                            {ENTRY_FEES.map(f => (
                                <button key={f.value} type="button" className={`debate-option-btn ${entryFee === f.value ? 'active' : ''}`} onClick={() => setEntryFee(f.value)}>{f.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label">Difficulty Level</label>
                        <div className="debate-option-row">
                            {DIFFICULTIES.map(d => (
                                <button key={d} type="button" className={`debate-option-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="debate-form-group">
                        <label className="debate-form-label">Tags (comma-separated)</label>
                        <input type="text" className="debate-form-input" placeholder="e.g., ai, regulation, policy" value={tags} onChange={(e) => setTags(e.target.value)} id="debate-tags" />
                    </div>

                    <div className="debate-preview-section">
                        <label className="debate-form-label">Preview</label>
                        <div className="debate-preview-card">
                            <div className="debate-preview-status">WAITING</div>
                            <div className="debate-preview-category" style={{ color: CATEGORIES.find(c => c.value === category)?.color }}>{category}</div>
                            <h4>{title || 'Debate Title'}</h4>
                            <p>{topic || 'Debate topic will appear here...'}</p>
                            <div className="debate-preview-country">
                                {selectedCountry.flag ? <span>{selectedCountry.flag}</span> : <GlobeIcon size={14} />} {selectedCountry.name}
                                {isGlobal && <span className="preview-global-badge"><GlobeIcon size={12} /> Global</span>}
                            </div>
                            <div className="debate-preview-meta">
                                <span><DollarSignIcon size={12} /> ${entryFee}</span>
                                <span><TimerIcon size={12} /> {duration}m</span>
                                <span>Prize: ${entryFee * 2}</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg debate-submit-btn" disabled={submitting || !title.trim() || !topic.trim()} id="submit-debate">
                        {submitting ? <span className="debate-spinner" /> : (
                            <><SwordsIcon size={20} />{entryFee > 0 ? `Create Debate — Pay $${entryFee} Entry` : 'Create Free Debate'}</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
