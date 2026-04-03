'use client';
import { useState, useEffect, useRef } from 'react';
import {
    MicIcon, FileTextIcon, SearchIcon, BarChartIcon, GlobeIcon, ShieldIcon,
    TrendingUpIcon, ScaleIcon, AlertTriangleIcon, MessageCircleIcon, LandmarkIcon,
    ZapIcon, ArrowLeftIcon, TargetIcon, CpuIcon, ActivityIcon,
    BriefcaseIcon, DollarSignIcon, LayersIcon
} from '@/components/ui/Icons';
import { useAuthGate } from '@/components/providers/AuthGuard';

const aiTools = [
    { id: 'speech', icon: <MicIcon size={22} />, name: 'AI Speech Writer', desc: 'Generate powerful political speeches with AI assistance.', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', category: 'political', placeholder: 'e.g. "A speech about digital privacy rights and citizen data protection"' },
    { id: 'post', icon: <FileTextIcon size={22} />, name: 'AI Post Generator', desc: 'Create engaging social media posts optimized for political reach.', gradient: 'linear-gradient(135deg, #10b981, #3b82f6)', category: 'political', placeholder: 'e.g. "Post about the new infrastructure bill passing"' },
    { id: 'factcheck', icon: <SearchIcon size={22} />, name: 'AI Fact Checker', desc: 'Verify claims and statements with AI-powered fact-checking.', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', category: 'analysis', placeholder: 'e.g. "The economy grew by 5% last quarter"' },
    { id: 'sentiment', icon: <BarChartIcon size={22} />, name: 'Sentiment Analysis', desc: 'Analyze public sentiment on political topics and policies.', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', category: 'analysis', placeholder: 'e.g. "Public opinion on climate change policy"' },
    { id: 'news', icon: <FileTextIcon size={22} />, name: 'AI News Summarizer', desc: 'Get concise AI summaries of political news and developments.', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', category: 'analysis', placeholder: 'e.g. "Latest developments in healthcare reform"' },
    { id: 'translate', icon: <GlobeIcon size={22} />, name: 'AI Translator', desc: 'Translate political content into 50+ languages instantly.', gradient: 'linear-gradient(135deg, #10b981, #059669)', category: 'utility', placeholder: 'e.g. "Together we build a stronger democracy"' },
    { id: 'moderate', icon: <ShieldIcon size={22} />, name: 'Content Moderator', desc: 'AI-powered moderation for hate speech, spam, and misinformation.', gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)', category: 'utility', placeholder: 'Paste text content to analyze for policy violations...' },
    { id: 'trend', icon: <TrendingUpIcon size={22} />, name: 'Trend Predictor', desc: 'Predict emerging political and business trends before they peak.', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', category: 'analysis', placeholder: 'e.g. "Trends around renewable energy policy"' },
    { id: 'debate', icon: <ScaleIcon size={22} />, name: 'Debate Analyzer', desc: 'Analyze debate performances with AI scoring and insights.', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', category: 'political', placeholder: 'e.g. "Analyze arguments for and against universal basic income"' },
    { id: 'crisis', icon: <AlertTriangleIcon size={22} />, name: 'Crisis Assistant', desc: 'AI-guided crisis management and communication planning.', gradient: 'linear-gradient(135deg, #dc2626, #991b1b)', category: 'political', placeholder: 'e.g. "A politician caught in a leaked email scandal"' },
    { id: 'caption', icon: <MessageCircleIcon size={22} />, name: 'Caption Generator', desc: 'Create compelling captions for political media posts.', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', category: 'utility', placeholder: 'e.g. "Photo of signing the education reform bill"' },
    { id: 'policy', icon: <LandmarkIcon size={22} />, name: 'Policy Simulator', desc: 'Simulate the impact of proposed policies with AI economic modeling.', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', category: 'analysis', placeholder: 'e.g. "Universal pre-K education for all children under 5"' },
    { id: 'market', icon: <DollarSignIcon size={22} />, name: 'Market Analyzer', desc: 'Analyze how policies and events impact market performance.', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', category: 'business', placeholder: 'e.g. "Impact of new crypto regulation on Bitcoin prices"' },
    { id: 'business', icon: <BriefcaseIcon size={22} />, name: 'Business Intelligence', desc: 'Generate AI business insights based on current policy environment.', gradient: 'linear-gradient(135deg, #10b981, #0d9488)', category: 'business', placeholder: 'e.g. "Opportunities in green energy sector given new subsidies"' },
];

const categoryFilters = [
    { id: 'all', label: 'All Tools', icon: <LayersIcon size={13} /> },
    { id: 'political', label: 'Political', icon: <LandmarkIcon size={13} /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChartIcon size={13} /> },
    { id: 'business', label: 'Business', icon: <BriefcaseIcon size={13} /> },
    { id: 'utility', label: 'Utility', icon: <ZapIcon size={13} /> },
];

export default function AIToolsPage() {
    const { requireAuth } = useAuthGate();
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [aiStatus, setAiStatus] = useState<{ operational: boolean; model: string } | null>(null);
    const [charCount, setCharCount] = useState(0);
    const outputRef = useRef<HTMLDivElement>(null);

    // Check AI status on mount
    useEffect(() => {
        fetch('/api/ai').then(r => r.json()).then(d => {
            if (d.success) setAiStatus(d.status);
        }).catch(() => { });
    }, []);

    const runTool = async () => {
        if (!activeTool || !input.trim()) { setError('Please enter your input first'); return; }
        setGenerating(true);
        setOutput('');
        setError('');

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolId: activeTool, input: input.trim() }),
            });
            const data = await res.json();

            if (data.success) {
                setOutput(data.output);
                // Scroll to output
                setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            } else {
                setError(data.message || data.error || 'AI generation failed. Please try again.');
            }
        } catch {
            setError('Failed to connect to AI service. Please check your connection.');
        }
        setGenerating(false);
    };

    const activeSel = aiTools.find(t => t.id === activeTool);
    const displayTools = activeCategory === 'all' ? aiTools : aiTools.filter(t => t.category === activeCategory);

    const stats = [
        { icon: <CpuIcon size={18} />, val: '14', label: 'AI Tools', sub: 'Groq Powered' },
        { icon: <TargetIcon size={18} />, val: aiStatus?.operational ? 'Live' : '...', label: 'Status', sub: aiStatus?.model || 'Checking' },
        { icon: <ActivityIcon size={18} />, val: 'Real-Time', label: 'Processing', sub: 'No delays' },
        { icon: <GlobeIcon size={18} />, val: '50+', label: 'Languages', sub: 'Translation support' },
    ];

    return (
        <div className="page-container home-3col">
            {/* LEFT — AI Stats + Categories */}
            <aside className="home-left-panel">
                <div className="hp-card">
                    <div className="hp-card-title"><LayersIcon size={15} /> Categories</div>
                    {categoryFilters.map(cat => (
                        <button key={cat.id} onClick={() => { setActiveCategory(cat.id); if (activeTool) setActiveTool(null); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-light)', color: activeCategory === cat.id ? 'var(--primary)' : 'inherit', fontWeight: activeCategory === cat.id ? 700 : 500, fontSize: '0.85rem' }}>
                            <span style={{ color: activeCategory === cat.id ? 'var(--primary)' : 'var(--text-tertiary)' }}>{cat.icon}</span>
                            {cat.label}
                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                {cat.id === 'all' ? aiTools.length : aiTools.filter(t => t.category === cat.id).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><ZapIcon size={15} /> Powered By</div>
                    <div style={{ padding: '8px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f55036, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>G</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Groq AI</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Llama 3.3 70B</div>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Ultra-fast AI inference with state-of-the-art language understanding.</span>
                    </div>
                </div>
            </aside>

            {/* CENTER — Tools grid or active tool */}
            <div className="feed-column" style={{ minWidth: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CpuIcon size={20} />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>AI Tools</h1>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: aiStatus?.operational ? '#22c55e' : 'var(--text-tertiary)', fontWeight: 600 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: aiStatus?.operational ? '#22c55e' : '#ef4444' }} />
                        {aiStatus?.operational ? 'Groq Online' : 'Checking...'}
                    </div>
                </div>

                {!activeTool ? (
                    <div style={{ padding: 16 }}>
                        {/* Category tabs */}
                        <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', marginBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                            {categoryFilters.map(cat => (
                                <button key={cat.id} className={`tab ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}
                                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                    {cat.icon}{cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="ai-tools-grid">
                            {displayTools.map(tool => (
                                <div key={tool.id} className="ai-tool-card" onClick={() => { setActiveTool(tool.id); setOutput(''); setError(''); setInput(''); }}>
                                    <div className="ai-tool-icon" style={{ background: tool.gradient, borderRadius: 'var(--radius-md)', color: 'white' }}>{tool.icon}</div>
                                    <div className="ai-tool-name">{tool.name}</div>
                                    <div className="ai-tool-desc">{tool.desc}</div>
                                    <div className="ai-tool-badge"><ZapIcon size={11} /> Groq AI</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: 16 }} className="fade-in">
                        <button className="btn btn-outline btn-sm" onClick={() => { setActiveTool(null); setOutput(''); setInput(''); setError(''); }}
                            style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ArrowLeftIcon size={14} /> Back to Tools
                        </button>

                        {/* Tool header */}
                        <div className="ai-insights-card" style={{ marginBottom: 16 }}>
                            <div className="ai-insights-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ background: activeSel?.gradient, borderRadius: 10, padding: 8, color: 'white', display: 'flex' }}>{activeSel?.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activeSel?.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{activeSel?.desc}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                                    Groq AI
                                </div>
                            </div>
                        </div>

                        <div className="ai-panel">
                            <div className="ai-panel-body">
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                    <span>Input</span>
                                    <span style={{ fontSize: '0.72rem', color: charCount > 0 ? 'var(--text-tertiary)' : 'transparent' }}>{charCount} chars</span>
                                </label>
                                <textarea
                                    className="ai-panel-textarea"
                                    placeholder={activeSel?.placeholder || `Enter your input for ${activeSel?.name}...`}
                                    value={input}
                                    onChange={e => { setInput(e.target.value); setCharCount(e.target.value.length); }}
                                    style={{ minHeight: 120 }}
                                />

                                {error && (
                                    <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertTriangleIcon size={14} />{error}
                                    </div>
                                )}

                                <button className="btn btn-primary" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                                    onClick={() => requireAuth(runTool)} disabled={generating || !input.trim()}>
                                    {generating ? (
                                        <><span className="auth-spinner" style={{ width: 14, height: 14 }} /> Generating with Groq...</>
                                    ) : (
                                        <><ZapIcon size={15} /> Run {activeSel?.name}</>
                                    )}
                                </button>

                                {generating && (
                                    <div className="ai-generating" style={{ marginTop: 12 }}>
                                        <CpuIcon size={15} /> Groq AI is processing your request<span className="dots"></span>
                                    </div>
                                )}

                                {output && (
                                    <div ref={outputRef}>
                                        <label style={{ fontSize: '0.82rem', fontWeight: 600, margin: '16px 0 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                            <span>AI Output</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                                                Powered by Groq AI
                                            </span>
                                        </label>
                                        <div className="ai-panel-output fade-in" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{output}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(output).catch(() => { })}>Copy Output</button>
                                            <button className="btn btn-outline btn-sm" onClick={() => { setInput(''); setOutput(''); setError(''); setCharCount(0); }}>Clear</button>
                                            <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => { })}>Post to Feed</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT — Performance & tips */}
            <aside className="right-panel">
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><ActivityIcon size={15} /> AI Capabilities</div>
                    {[
                        { model: 'Speech & Content Gen', accuracy: 98.5 },
                        { model: 'Fact Checking', accuracy: 94.2 },
                        { model: 'Sentiment Analysis', accuracy: 96.1 },
                        { model: 'Translation (50+ lang)', accuracy: 97.8 },
                        { model: 'Trend Prediction', accuracy: 89.7 },
                        { model: 'Content Moderation', accuracy: 97.3 },
                    ].map((m, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                                <span style={{ fontWeight: 500 }}>{m.model}</span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>{m.accuracy}%</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                <div style={{ width: `${m.accuracy}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 2 }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hp-card">
                    <div className="hp-card-title"><ZapIcon size={15} /> AI Quick Tips</div>
                    {[
                        'Be specific in your prompts for better results.',
                        'Combine Trend Predictor with Post Generator for maximum engagement.',
                        'Use Fact Checker before publishing sensitive claims.',
                        'Market Analyzer correlates policy changes to investments.',
                        'All tools are powered by Groq AI (Llama 3.3 70B) in real-time.',
                    ].map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', fontWeight: 800, fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                            {tip}
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
