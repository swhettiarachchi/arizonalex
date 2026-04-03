const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompts per tool — tuned for politics/business/crypto platform
const TOOL_PROMPTS = {
    speech: `You are a professional political speechwriter for Arizonalex, a politics/business/crypto platform. Write a powerful, persuasive political speech based on the user's topic. Use rhetorical techniques, emotional appeals, and a strong call to action. Format with clear paragraphs. Keep it 200-400 words.`,
    post: `You are a social media content strategist for politicians and business leaders on Arizonalex. Generate an engaging social media post with relevant hashtags based on the user's topic. Use bullet points, concise language, and include 3-5 relevant hashtags. Keep it under 280 characters for the main body plus hashtags.`,
    factcheck: `You are an AI fact-checker for Arizonalex. Analyze the user's claim and provide a structured fact-check report with: CLAIM, VERDICT (TRUE/MOSTLY TRUE/MIXED/MOSTLY FALSE/FALSE), ANALYSIS (detailed explanation), and SOURCES (cite plausible authoritative sources). Be balanced and thorough.`,
    sentiment: `You are a political sentiment analyst. Analyze public sentiment around the user's topic. Provide a structured report with: percentages (Positive/Neutral/Negative), Key Drivers, Trend Direction, and Recommendations. Use realistic-sounding data and analysis. Format with clear sections.`,
    news: `You are an AI news summarizer for political and business news. Summarize the latest developments related to the user's topic in a numbered list format. Provide 5-7 key points with a "Key Takeaway" at the end. Be concise and factual.`,
    translate: `You are a professional translator. Translate the user's text into Spanish, French, German, Japanese, Arabic, and Chinese (Simplified). Format as: TRANSLATION COMPLETE, then show the Original text followed by each translation clearly labeled with the language name.`,
    moderate: `You are an AI content moderator. Analyze the user's text for: hate speech, spam, misinformation, harassment, and inappropriate content. Provide a CONTENT MODERATION REPORT with: overall assessment (CLEAN/FLAGGED/VIOLATION), confidence score, detected issues, and recommendations.`,
    trend: `You are a political and business trend predictor. Based on the user's topic, predict emerging trends for the next 7 days. Provide 5-7 trending topics with predicted peak times, confidence percentages, and a strategic recommendation. Format as a structured report.`,
    debate: `You are a debate performance analyst. Analyze the debate topic or arguments provided by the user. Score argument strength, factual accuracy, audience engagement, and rebuttal effectiveness. Provide scores out of 100 and identify key moments. Format as DEBATE ANALYSIS.`,
    crisis: `You are a crisis communications expert. Based on the user's crisis scenario, provide a structured CRISIS MANAGEMENT PLAN with: Immediate actions (0-2 hours), Short-term (2-24 hours), Medium-term (1-7 days), recommended tone, and key messaging points.`,
    caption: `You are a political media caption specialist. Generate 5 compelling, shareable captions for the user's topic. Each caption should be concise, impactful, and include a relevant hashtag. Number each caption. Keep each under 150 characters.`,
    policy: `You are a policy impact simulator. Simulate the projected impact of the user's proposed policy over 5 years. Include: key outcomes with percentages, GDP impact, cost estimates, ROI, risk factors, and a confidence score. Format as POLICY IMPACT SIMULATION.`,
    market: `You are a market impact analyst specializing in how policy and political events affect markets. Analyze the user's topic for: immediate market impact, sector-specific effects, medium-term outlook, and analyst consensus. Use realistic market terminology and percentages.`,
    business: `You are a business intelligence analyst. Generate a comprehensive business intelligence report based on the user's topic. Include: opportunities, risks, market conditions, and strategic recommendations. Format as BUSINESS INTELLIGENCE REPORT.`,
};

// Groq model fallback chain — fastest to slowest
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @route POST /api/ai/generate
exports.generate = async (req, res, next) => {
    try {
        const { toolId, input } = req.body;

        if (!toolId || !input) {
            return res.status(400).json({ success: false, message: 'Tool ID and input are required' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI service not configured. Please set GROQ_API_KEY.' });
        }

        const systemPrompt = TOOL_PROMPTS[toolId];
        if (!systemPrompt) {
            return res.status(400).json({ success: false, message: 'Unknown AI tool' });
        }

        let lastError = null;

        // Try each model in order — if one is rate-limited, try the next
        for (const model of GROQ_MODELS) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const response = await fetch(GROQ_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                        },
                        body: JSON.stringify({
                            model,
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: input },
                            ],
                            temperature: 0.8,
                            max_tokens: 2048,
                            top_p: 0.95,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const text = data?.choices?.[0]?.message?.content;
                        if (!text) {
                            return res.status(502).json({ success: false, message: 'AI returned empty response. Try a different input.' });
                        }
                        console.log(`[AI] Success with ${model}`);
                        return res.json({ success: true, output: text, model });
                    }

                    // Rate limited — retry or move to next model
                    if (response.status === 429) {
                        const errorData = await response.json().catch(() => ({}));
                        lastError = errorData?.error?.message || 'Rate limited';
                        console.warn(`[AI] ${model} rate-limited (attempt ${attempt + 1}). Trying next option...`);
                        if (attempt === 0) {
                            await sleep(2000);
                            continue;
                        }
                        break;
                    }

                    // Auth error — no point trying other models
                    if (response.status === 401) {
                        const errorData = await response.json().catch(() => ({}));
                        return res.status(502).json({
                            success: false,
                            message: 'Invalid Groq API key. Please check your GROQ_API_KEY in .env.'
                        });
                    }

                    // Other error — log and try next model
                    const errorData = await response.json().catch(() => ({}));
                    lastError = errorData?.error?.message || `HTTP ${response.status}`;
                    console.error(`[AI] ${model} error:`, response.status, lastError);
                    break;

                } catch (fetchErr) {
                    lastError = fetchErr.message;
                    console.error(`[AI] ${model} fetch error:`, fetchErr.message);
                    break;
                }
            }
        }

        // All models failed
        const isQuotaError = (lastError || '').includes('quota') || (lastError || '').includes('rate');
        return res.status(502).json({
            success: false,
            message: isQuotaError
                ? 'AI rate limit reached. Please wait a moment and try again.'
                : (lastError || 'AI service temporarily unavailable. Please try again.')
        });
    } catch (error) {
        console.error('[AI] Error:', error.message);
        next(error);
    }
};

// @route GET /api/ai/status
exports.getStatus = async (req, res) => {
    res.json({
        success: true,
        status: {
            operational: !!GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            provider: 'Groq',
            tools: Object.keys(TOOL_PROMPTS).length,
        },
    });
};
