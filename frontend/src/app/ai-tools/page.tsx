'use client';
import { useState } from 'react';
import {
    MicIcon, FileTextIcon, SearchIcon, BarChartIcon, GlobeIcon, ShieldIcon,
    TrendingUpIcon, ScaleIcon, AlertTriangleIcon, MessageCircleIcon, LandmarkIcon,
    ZapIcon, ArrowLeftIcon, TargetIcon, CpuIcon, ActivityIcon, ChevronRightIcon,
    BriefcaseIcon, DollarSignIcon, LayersIcon
} from '@/components/ui/Icons';
import { useAuthGate } from '@/components/providers/AuthGuard';

const aiTools = [
    { id: 'speech', icon: <MicIcon size={22} />, name: 'AI Speech Writer', desc: 'Generate powerful political speeches with AI assistance.', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', category: 'political' },
    { id: 'post', icon: <FileTextIcon size={22} />, name: 'AI Post Generator', desc: 'Create engaging social media posts optimized for political reach.', gradient: 'linear-gradient(135deg, #10b981, #3b82f6)', category: 'political' },
    { id: 'factcheck', icon: <SearchIcon size={22} />, name: 'AI Fact Checker', desc: 'Verify claims and statements with AI-powered fact-checking.', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', category: 'analysis' },
    { id: 'sentiment', icon: <BarChartIcon size={22} />, name: 'Sentiment Analysis', desc: 'Analyze public sentiment on political topics and policies.', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', category: 'analysis' },
    { id: 'news', icon: <FileTextIcon size={22} />, name: 'AI News Summarizer', desc: 'Get concise AI summaries of political news and developments.', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', category: 'analysis' },
    { id: 'translate', icon: <GlobeIcon size={22} />, name: 'AI Translator', desc: 'Translate political content into 50+ languages instantly.', gradient: 'linear-gradient(135deg, #10b981, #059669)', category: 'utility' },
    { id: 'moderate', icon: <ShieldIcon size={22} />, name: 'Content Moderator', desc: 'AI-powered moderation for hate speech, spam, and misinformation.', gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)', category: 'utility' },
    { id: 'trend', icon: <TrendingUpIcon size={22} />, name: 'Trend Predictor', desc: 'Predict emerging political and business trends before they peak.', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', category: 'analysis' },
    { id: 'debate', icon: <ScaleIcon size={22} />, name: 'Debate Analyzer', desc: 'Analyze debate performances with AI scoring and insights.', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', category: 'political' },
    { id: 'crisis', icon: <AlertTriangleIcon size={22} />, name: 'Crisis Assistant', desc: 'AI-guided crisis management and communication planning.', gradient: 'linear-gradient(135deg, #dc2626, #991b1b)', category: 'political' },
    { id: 'caption', icon: <MessageCircleIcon size={22} />, name: 'Caption Generator', desc: 'Create compelling captions for political media posts.', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', category: 'utility' },
    { id: 'policy', icon: <LandmarkIcon size={22} />, name: 'Policy Simulator', desc: 'Simulate the impact of proposed policies with AI economic modeling.', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', category: 'analysis' },
    { id: 'market', icon: <DollarSignIcon size={22} />, name: 'Market Analyzer', desc: 'Analyze how policies and events impact market performance.', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', category: 'business' },
    { id: 'business', icon: <BriefcaseIcon size={22} />, name: 'Business Intelligence', desc: 'Generate AI business insights based on current policy environment.', gradient: 'linear-gradient(135deg, #10b981, #0d9488)', category: 'business' },
];

const mockResponses: Record<string, string> = {
    speech: `Ladies and gentlemen, fellow citizens,\n\nToday we stand at a crossroads — not of ideology, but of responsibility. Our nation's strength has always been rooted in the courage of its people to demand better, to dream larger, and to hold their leaders accountable.\n\nThe Digital Privacy Act is not merely legislation. It is a declaration that in this new digital era, every citizen's data, every family's privacy, and every community's trust is sacred and inviolable.\n\nThis is our promise. This is our mission. And together, we will deliver.`,
    post: `Today marks a historic step forward for digital privacy rights.\n\nThe Digital Privacy Act passed with overwhelming bipartisan support — proof that when we put citizens first, progress follows.\n\n• Your data, YOUR control\n• Corporate accountability\n• Transparent data practices\n\n#DigitalPrivacy #YourDataYourRights #Governance`,
    factcheck: `FACT-CHECK RESULT\n\nClaim: "The Digital Privacy Act will protect 100% of citizen data."\n\nVerdict: MOSTLY TRUE\n\nAnalysis: The Act covers 94% of consumer data categories. Certain national security exemptions exist for 6%, which is standard practice in comparable legislation.\n\nSources: Congressional Record, Legal Analysis Section 4(b), Privacy Commission Report 2026`,
    sentiment: `SENTIMENT ANALYSIS REPORT\n\nTopic: Digital Privacy Act\nSample: 847,000 posts\n\nPositive: 67.3% (+5.2% from last week)\nNeutral:  18.1% (-2.1%)\nNegative: 14.6% (-3.1%)\n\nKey Drivers:\n• Privacy protection → Strong positive\n• Bipartisan cooperation → Moderate positive\n• Implementation timeline → Mixed\n• Corporate pushback → Negative driver\n\nOverall Trend: Increasingly positive`,
    news: `AI NEWS SUMMARY — March 5, 2026\n\n1. Digital Privacy Act passes Senate 78-22, heads to President's desk\n2. Green Energy Initiative reaches Phase 1 milestone — 3 new solar farms operational\n3. Infrastructure bill faces amendment challenges in Committee\n4. Healthcare reform proposal gains 312 co-sponsors\n5. International trade negotiations enter final round\n\nKey Takeaway: Strong legislative momentum across multiple policy areas.`,
    translate: `TRANSLATION COMPLETE\n\nOriginal (English):\n"Together we build a stronger democracy."\n\nSpanish: "Juntos construimos una democracia más fuerte."\nFrench: "Ensemble, nous construisons une démocratie plus forte."\nGerman: "Gemeinsam bauen wir eine stärkere Demokratie auf."\nJapanese: "共に、より強い民主主義を築きましょう。"\nArabic: "معاً نبني ديمقراطية أقوى."\nChinese: "我们携手共建更强大的民主。"`,
    moderate: `CONTENT MODERATION REPORT\n\nScanned: 15,600 posts today\n\nClean content: 14,892 (95.5%)\nFlagged for review: 489 (3.1%)\nAuto-removed: 219 (1.4%)\n\nBreakdown:\n• Hate speech: 78\n• Spam/bots: 92\n• Misinformation: 34\n• Harassment: 15\n\nFalse positive rate: 2.1% (industry avg: 4.3%)\nAccuracy: 97.9%`,
    trend: `TREND PREDICTION — Next 7 Days\n\n1. #DigitalPrivacyAct — Peaking now\n2. #ClimateAction2026 — Rising (peak in 3 days)\n3. #HealthcareReform — Steady growth\n4. #InfrastructureVote — Spike expected Thursday\n5. #Election2026Primary — Emerging\n\nConfidence: 89%\n\nRecommendation: Position content around #ClimateAction2026 for maximum engagement this week.`,
    debate: `DEBATE ANALYSIS\n\nEvent: Climate Policy Debate 2026\n\nScore — Candidate A: 82/100\n• Argument strength: 85\n• Factual accuracy: 91\n• Audience engagement: 78\n• Rebuttal effectiveness: 74\n\nScore — Candidate B: 76/100\n• Argument strength: 79\n• Factual accuracy: 82\n• Audience engagement: 71\n\nKey Moment: Candidate A's infrastructure argument at 23:45 generated highest engagement spike.`,
    crisis: `CRISIS MANAGEMENT PLAN\n\nImmediate (0-2 hours):\n1. Acknowledge concerns publicly\n2. Prepare factual clarification statement\n3. Brief communications team\n\nShort-term (2-24 hours):\n4. Release detailed FAQ document\n5. Schedule press briefing\n6. Engage key stakeholders directly\n\nMedium-term (1-7 days):\n7. Town hall listening sessions\n8. Policy amendment if warranted\n\nTone: Empathetic, transparent, solution-oriented`,
    caption: `CAPTIONS GENERATED\n\n1. "Progress isn't partisan — it's patriotic. #BipartisanAction"\n\n2. "When leaders listen, communities thrive. Today we proved it."\n\n3. "The future of governance starts with transparency. Here's our roadmap."\n\n4. "Every great policy begins with a single conversation. Let's talk."\n\n5. "Data privacy isn't a privilege — it's a right. And today, it's law."`,
    policy: `POLICY IMPACT SIMULATION\n\nPolicy: Universal Pre-K Education Bill\nProjection: 5 years\n\nOutcomes:\n• School readiness: +34%\n• Working parent employment: +12%\n• Long-term education outcomes: +28%\n• GDP impact: +0.4% over 10 years\n• Cost: $45B over 5 years\n• ROI: $3.20 per $1 invested\n\nRisk Factors:\n• Teacher shortage (mitigable)\n• Implementation variance by state\n\nConfidence: 78%`,
    market: `MARKET IMPACT ANALYSIS\n\nTrigger Event: Digital Privacy Act passage\n\nImmediate Impact:\n• Tech sector: -1.2% (compliance costs)\n• Cybersecurity: +4.8% (demand surge)\n• Data brokers: -8.3% (regulatory risk)\n\nMedium-term (3-6 months):\n• Overall market: Neutral to slight positive\n• Consumer trust metrics: +15%\n• B2C tech companies: +2.1%\n\nAnalyst Consensus: Bullish on privacy-compliant tech stocks`,
    business: `BUSINESS INTELLIGENCE REPORT\n\nPolicy Environment: Moderately favorable for SMEs\n\nOpportunities:\n• Green energy subsidies: $45B available\n• Infrastructure contracts: $200B pipeline\n• Digital privacy compliance tools: $12B market\n\nRisks:\n• Interest rate environment: Elevated (5.25%)\n• Labor market: Tight, wage pressure\n• Regulatory complexity: Increasing\n\nRecommendation: Focus on policy-adjacent sectors for best 12-month returns.`,
};

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

    const runTool = () => {
        if (!activeTool) return;
        setGenerating(true); setOutput('');
        setTimeout(() => { setOutput(mockResponses[activeTool] || 'AI processing complete.'); setGenerating(false); }, 1500);
    };
    const activeSel = aiTools.find(t => t.id === activeTool);
    const displayTools = activeCategory === 'all' ? aiTools : aiTools.filter(t => t.category === activeCategory);

    const stats = [
        { icon: <CpuIcon size={18} />, val: '14', label: 'AI Tools', sub: 'Now available' },
        { icon: <TargetIcon size={18} />, val: '97.9%', label: 'Accuracy', sub: 'Industry-leading' },
        { icon: <ActivityIcon size={18} />, val: '1.2M', label: 'Analyses/day', sub: 'Platform-wide' },
        { icon: <GlobeIcon size={18} />, val: '50+', label: 'Languages', sub: 'Translation support' },
    ];

    return (
        <div className="page-container home-3col">

            {/* LEFT — AI Stats + Categories */}
            <aside className="home-left-panel">
                <div className="ai-insights-card" style={{ marginBottom: 16 }}>
                    <div className="ai-insights-header" style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', padding: '3px 10px', borderRadius: 20, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em' }}>
                            <CpuIcon size={11} /> AI PLATFORM
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>System Status</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {stats.map(s => (
                            <div key={s.label} className="ai-insight-tile">
                                <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.val}</div>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>{s.label}</div>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

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
                    <div className="hp-card-title"><TrendingUpIcon size={15} /> Most Used Today</div>
                    {[
                        { name: 'Sentiment Analysis', uses: '24.1K' },
                        { name: 'Trend Predictor', uses: '18.3K' },
                        { name: 'AI Post Generator', uses: '15.7K' },
                        { name: 'AI Fact Checker', uses: '12.4K' },
                    ].map((t, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.name}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{t.uses}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* CENTER — Tools grid or active tool */}
            <div className="feed-column" style={{ minWidth: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CpuIcon size={20} />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>AI Tools</h1>
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
                                <div key={tool.id} className="ai-tool-card" onClick={() => setActiveTool(tool.id)}>
                                    <div className="ai-tool-icon" style={{ background: tool.gradient, borderRadius: 'var(--radius-md)', color: 'white' }}>{tool.icon}</div>
                                    <div className="ai-tool-name">{tool.name}</div>
                                    <div className="ai-tool-desc">{tool.desc}</div>
                                    <div className="ai-tool-badge"><ZapIcon size={11} /> AI Powered</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: 16 }} className="fade-in">
                        <button className="btn btn-outline btn-sm" onClick={() => { setActiveTool(null); setOutput(''); setInput(''); }}
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
                            </div>
                        </div>

                        <div className="ai-panel">
                            <div className="ai-panel-body">
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>Input</label>
                                <textarea className="ai-panel-textarea" placeholder={`Enter your input for ${activeSel?.name}...`} value={input} onChange={e => setInput(e.target.value)} />
                                <button className="btn btn-primary" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                                    onClick={() => requireAuth(runTool)} disabled={generating}>
                                    {generating ? 'Generating...' : <><ZapIcon size={15} /> Run {activeSel?.name}</>}
                                </button>
                                {generating && (
                                    <div className="ai-generating" style={{ marginTop: 12 }}>
                                        <CpuIcon size={15} /> Processing your request<span className="dots"></span>
                                    </div>
                                )}
                                {output && (
                                    <>
                                        <label style={{ fontSize: '0.82rem', fontWeight: 600, margin: '16px 0 6px', display: 'block', color: 'var(--text-secondary)' }}>AI Output</label>
                                        <div className="ai-panel-output fade-in">{output}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(output).catch(() => { })}>Copy Output</button>
                                            <button className="btn btn-primary btn-sm" onClick={() => requireAuth(() => { })}>Post to Feed</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT — Recent outputs & tips */}
            <aside className="right-panel">
                <div className="hp-card" style={{ marginBottom: 16 }}>
                    <div className="hp-card-title"><ActivityIcon size={15} /> AI Performance</div>
                    {[
                        { model: 'Hate Speech Detection', accuracy: 99.2 },
                        { model: 'Spam Detection', accuracy: 97.8 },
                        { model: 'Misinformation Checker', accuracy: 94.5 },
                        { model: 'Sentiment Analyzer', accuracy: 96.1 },
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
                        'Market Analyzer helps correlate policy changes to investment decisions.',
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
