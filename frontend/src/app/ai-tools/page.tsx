'use client';
import { useState } from 'react';
import { MicIcon, FileTextIcon, SearchIcon, BarChartIcon, GlobeIcon, ShieldIcon, TrendingUpIcon, ScaleIcon, AlertTriangleIcon, MessageCircleIcon, LandmarkIcon, ZapIcon, ArrowLeftIcon, TargetIcon } from '@/components/ui/Icons';
import { useAuthGate } from '@/components/providers/AuthGuard';

const aiTools = [
    { id: 'speech', icon: <MicIcon size={22} />, name: 'AI Speech Writer', desc: 'Generate powerful political speeches with AI assistance.', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    { id: 'post', icon: <FileTextIcon size={22} />, name: 'AI Post Generator', desc: 'Create engaging social media posts optimized for political engagement.', gradient: 'linear-gradient(135deg, #10b981, #3b82f6)' },
    { id: 'factcheck', icon: <SearchIcon size={22} />, name: 'AI Fact Checker', desc: 'Verify claims and statements with AI-powered fact-checking.', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
    { id: 'sentiment', icon: <BarChartIcon size={22} />, name: 'Sentiment Analysis', desc: 'Analyze public sentiment on political topics and policies.', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
    { id: 'news', icon: <FileTextIcon size={22} />, name: 'AI News Summarizer', desc: 'Get concise AI summaries of political news and developments.', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
    { id: 'translate', icon: <GlobeIcon size={22} />, name: 'AI Translator', desc: 'Translate political content into 50+ languages instantly.', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { id: 'moderate', icon: <ShieldIcon size={22} />, name: 'Content Moderator', desc: 'AI-powered moderation for hate speech, spam, and misinformation.', gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)' },
    { id: 'trend', icon: <TrendingUpIcon size={22} />, name: 'Trend Predictor', desc: 'Predict emerging political trends and topics before they peak.', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { id: 'debate', icon: <ScaleIcon size={22} />, name: 'Debate Analyzer', desc: 'Analyze debate performances with AI scoring and insights.', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
    { id: 'crisis', icon: <AlertTriangleIcon size={22} />, name: 'Crisis Assistant', desc: 'AI-guided crisis management and response planning.', gradient: 'linear-gradient(135deg, #dc2626, #991b1b)' },
    { id: 'caption', icon: <MessageCircleIcon size={22} />, name: 'Caption Generator', desc: 'Create compelling captions for political media posts.', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
    { id: 'policy', icon: <LandmarkIcon size={22} />, name: 'Policy Simulator', desc: 'Simulate the impact of proposed policies with AI modeling.', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
];

const mockResponses: Record<string, string> = {
    speech: "Ladies and gentlemen, fellow citizens,\n\nToday we stand at a crossroads — not of ideology, but of responsibility. Our nation's strength has always been rooted in the courage of its people to demand better, to dream larger, and to hold their leaders accountable.\n\nThe Digital Privacy Act is not merely legislation. It is a declaration that in this new era, every citizen's data, every family's privacy, and every community's trust is sacred and inviolable.\n\nWe will not stand idle while corporate interests override individual rights. We will not accept a world where your personal data is a commodity traded without your knowledge or consent.\n\nThis is our promise. This is our mission. And together, we will deliver.",
    post: "Today marks a historic step forward for digital privacy rights.\n\nThe Digital Privacy Act passed with overwhelming bipartisan support — proof that when we put citizens first, progress follows.\n\n• Your data, YOUR control\n• Corporate accountability\n• Transparent data practices\n\nThis is what happens when government works FOR the people.\n\n#DigitalPrivacy #YourDataYourRights #Governance",
    factcheck: "FACT-CHECK RESULT\n\nClaim: \"The Digital Privacy Act will protect 100% of citizen data.\"\n\nVerdict: MOSTLY TRUE\n\nAnalysis: The Act covers 94% of consumer data categories under its protection framework. Certain national security exemptions exist for 6% of data categories, which is standard practice in comparable legislation.\n\nSources: Congressional Record, Legal Analysis Section 4(b), Privacy Commission Report 2026",
    sentiment: "SENTIMENT ANALYSIS REPORT\n\nTopic: Digital Privacy Act\nSample Size: 847,000 posts\n\nPositive: 67.3% (+5.2% from last week)\nNeutral: 18.1% (-2.1%)\nNegative: 14.6% (-3.1%)\n\nKey Drivers:\n• Privacy protection → Strong positive\n• Bipartisan cooperation → Moderate positive\n• Implementation timeline → Mixed sentiment\n• Corporate pushback → Negative driver\n\nOverall Trend: Increasingly positive",
    news: "AI NEWS SUMMARY — March 1, 2026\n\n1. Digital Privacy Act passes Senate 78-22, heads to President's desk\n2. Green Energy Initiative reaches Phase 1 milestone — 3 new solar farms operational\n3. Infrastructure bill faces amendment challenges in Committee\n4. Healthcare reform proposal gains 312 co-sponsors\n5. International trade negotiations enter final round\n\nKey Takeaway: Strong legislative momentum across multiple policy areas, with bipartisan support on privacy and energy initiatives.",
    translate: "TRANSLATION COMPLETE\n\nOriginal (English):\n\"Together we build a stronger democracy.\"\n\nSpanish: \"Juntos construimos una democracia más fuerte.\"\nFrench: \"Ensemble, nous construisons une démocratie plus forte.\"\nGerman: \"Gemeinsam bauen wir eine stärkere Demokratie auf.\"\nJapanese: \"共に、より強い民主主義を築きましょう。\"\nArabic: \"معاً نبني ديمقراطية أقوى.\"\nChinese: \"我们携手共建更强大的民主。\"",
    moderate: "CONTENT MODERATION REPORT\n\nScanned: 15,600 posts today\n\nClean content: 14,892 (95.5%)\nFlagged for review: 489 (3.1%)\nAuto-removed: 219 (1.4%)\n\nBreakdown of removals:\n• Hate speech: 78\n• Spam/bots: 92\n• Misinformation: 34\n• Harassment: 15\n\nFalse positive rate: 2.1% (industry avg: 4.3%)\nAccuracy: 97.9%",
    trend: "TREND PREDICTION — Next 7 Days\n\nPredicted Trending Topics:\n\n1. #DigitalPrivacyAct — Peaking now\n2. #ClimateAction2026 — Rising (peak in 3 days)\n3. #HealthcareReform — Steady growth\n4. #InfrastructureVote — Spike expected Thursday\n5. #Election2026Primary — Emerging\n\nConfidence Level: 89%\n\nRecommendation: Position content around #ClimateAction2026 and #HealthcareReform for maximum engagement this week.",
    debate: "DEBATE ANALYSIS\n\nEvent: Climate Policy Debate 2026\n\nPerformance Scores:\n\n1. Candidate A: 82/100\n   • Argument strength: 85\n   • Factual accuracy: 91\n   • Audience engagement: 78\n   • Rebuttal effectiveness: 74\n\n2. Candidate B: 76/100\n   • Argument strength: 79\n   • Factual accuracy: 82\n   • Audience engagement: 71\n   • Rebuttal effectiveness: 72\n\nKey Moments: Candidate A's infrastructure argument at 23:45 generated highest audience engagement spike.",
    crisis: "CRISIS MANAGEMENT PLAN\n\nSituation: Public backlash on policy announcement\n\nImmediate Actions (0-2 hours):\n1. Acknowledge concerns publicly\n2. Prepare factual clarification statement\n3. Brief communications team\n\nShort-term (2-24 hours):\n4. Release detailed FAQ document\n5. Schedule press briefing\n6. Engage key stakeholders directly\n\nMedium-term (1-7 days):\n7. Town hall listening sessions\n8. Policy amendment if warranted\n9. Follow-up with affected communities\n\nTone: Empathetic, transparent, solution-oriented",
    caption: "CAPTIONS GENERATED\n\n1. \"Progress isn't partisan — it's patriotic. #BipartisanAction\"\n\n2. \"When leaders listen, communities thrive. Today we proved it.\"\n\n3. \"The future of governance starts with transparency. Here's our roadmap.\"\n\n4. \"Every great policy begins with a single conversation. Let's talk.\"\n\n5. \"Data privacy isn't a privilege — it's a right. And today, it's law.\"",
    policy: "POLICY IMPACT SIMULATION\n\nPolicy: Universal Pre-K Education Bill\nProjection Period: 5 years\n\nProjected Outcomes:\n\n• School readiness: +34% improvement\n• Working parent employment: +12%\n• Long-term education outcomes: +28%\n• GDP impact: +0.4% over 10 years\n• Cost: $45B over 5 years\n• ROI: $3.20 per $1 invested (30-year projection)\n\nRisk Factors:\n• Teacher shortage (mitigable with training programs)\n• Implementation variance across states\n\nConfidence: 78% (based on 12 comparable programs globally)",
};

export default function AIToolsPage() {
    const { requireAuth } = useAuthGate();
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [generating, setGenerating] = useState(false);

    const runTool = () => {
        if (!activeTool) return;
        setGenerating(true); setOutput('');
        setTimeout(() => { setOutput(mockResponses[activeTool] || 'AI processing complete.'); setGenerating(false); }, 1500);
    };
    const activeSel = aiTools.find(t => t.id === activeTool);

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header"><h1>AI Tools</h1></div>
                {!activeTool ? (
                    <div style={{ padding: 16 }}>
                        <div className="stats-grid" style={{ marginBottom: 20 }}>
                            {[
                                { icon: <ZapIcon size={20} />, val: '24', label: 'AI Tools Available' },
                                { icon: <TargetIcon size={20} />, val: '97.9%', label: 'AI Accuracy' },
                                { icon: <BarChartIcon size={20} />, val: '1.2M', label: 'Analyses Today' },
                                { icon: <GlobeIcon size={20} />, val: '50+', label: 'Languages' },
                            ].map((s, i) => (
                                <div key={i} className="stat-card"><span className="stat-icon" style={{ color: 'var(--primary)' }}>{s.icon}</span><span className="stat-value">{s.val}</span><span className="stat-label">{s.label}</span></div>
                            ))}
                        </div>
                        <h3 className="section-title">All AI Tools</h3>
                        <div className="ai-tools-grid">
                            {aiTools.map(tool => (
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
                        <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTool(null); setOutput(''); setInput(''); }} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}><ArrowLeftIcon size={14} /> Back to Tools</button>
                        <div className="ai-panel">
                            <div className="ai-panel-header" style={{ color: 'var(--primary)' }}>{activeSel?.icon}<span style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{activeSel?.name}</span></div>
                            <div className="ai-panel-body">
                                <textarea className="ai-panel-textarea" placeholder={`Enter your input for ${activeSel?.name}...`} value={input} onChange={e => setInput(e.target.value)} />
                                <button className="btn btn-primary" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => requireAuth(runTool)} disabled={generating}>
                                    {generating ? 'Generating...' : <><ZapIcon size={15} /> Run {activeSel?.name}</>}
                                </button>
                                {generating && <div className="ai-generating">Processing your request<span className="dots"></span></div>}
                                {output && <div className="ai-panel-output fade-in">{output}</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
