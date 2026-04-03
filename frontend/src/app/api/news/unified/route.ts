import { NextResponse } from 'next/server';
import {
    SOURCE_META, analyzeSentiment, detectTopic, detectGlobalCategory,
    detectCountry, detectLeader, generateKeyPoints, computeImpact,
    computeUrgency, computePopularity, getTimeAgo, getRegion, fetchGNews,
} from '@/lib/news-utils';

// ─── Polls ───
const NEWS_POLLS = [
    {
        id: 'unp1',
        question: 'Which sector will outperform in 2026?',
        options: [
            { label: 'Technology & AI', votes: 52300 },
            { label: 'Cryptocurrency', votes: 38200 },
            { label: 'Healthcare', votes: 22600 },
            { label: 'Renewable Energy', votes: 19400 },
        ],
        totalVotes: 132500,
    },
    {
        id: 'unp2',
        question: 'Should AI-generated content be labeled by law?',
        options: [
            { label: 'Yes, mandatory labeling', votes: 61200 },
            { label: 'Only for news & politics', votes: 28400 },
            { label: 'No regulation needed', votes: 15800 },
            { label: 'Undecided', votes: 9600 },
        ],
        totalVotes: 115000,
    },
];

// ─── Cache ───
let cachedData: any = null;
let lastFetch = 0;
const CACHE_MS = 900_000; // 15 minutes

function enrichArticle(a: any, idx: number) {
    const text = `${a.title} ${a.description || ''}`;
    const srcMeta = SOURCE_META[a.source] || { credibility: 70, bias: 'center', country: 'Unknown' };
    const impact = computeImpact(a.title, a.description || '', a.source);
    const urgencyLevel = computeUrgency(text);

    return {
        ...a,
        id: a.id || `unf-${idx}`,
        sentiment: analyzeSentiment(text),
        bias: srcMeta.bias,
        topic: detectTopic(text),
        country: detectCountry(text),
        region: getRegion(detectCountry(text)),
        relatedLeader: detectLeader(text),
        globalCategory: a.globalCategory || detectGlobalCategory(text),
        impactScore: impact,
        urgencyLevel,
        keyPoints: generateKeyPoints(a.title, a.description || ''),
        credibilityScore: srcMeta.credibility,
        sourceCountry: srcMeta.country,
        popularityScore: computePopularity(impact, urgencyLevel),
        timeAgo: getTimeAgo(a.publishedAt),
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const countryFilter = searchParams.get('country');
    const topicFilter = searchParams.get('topic');

    const now = Date.now();
    if (cachedData && now - lastFetch < CACHE_MS) {
        return applyFilters(cachedData, categoryFilter, countryFilter, topicFilter);
    }

    // Fetch live news from GNews API across multiple categories
    let rawArticles = await fetchGNews({
        categories: [
            { gnewsCat: 'world', label: 'politics' },
            { gnewsCat: 'business', label: 'business' },
            { gnewsCat: 'technology', label: 'crypto' },
            { gnewsCat: 'nation', label: 'politics' },
            { gnewsCat: 'science', label: 'business' },
        ],
    });

    let isLive = rawArticles.length > 0;

    // Attach globalCategory from the label
    rawArticles = rawArticles.map(a => ({
        ...a,
        globalCategory: a._label || detectGlobalCategory(`${a.title} ${a.description || ''}`),
    }));

    if (rawArticles.length === 0) {
        const fallbackHeadlines = [
            { headline: 'Global leaders convene for emergency climate summit', category: 'politics' },
            { headline: 'Trade negotiations advance between major economic blocs', category: 'business' },
            { headline: 'Bitcoin ETF inflows exceed expectations in Q1', category: 'crypto' },
            { headline: 'International space cooperation reaches new milestone', category: 'politics' },
            { headline: 'AI regulation framework proposed by tech industry leaders', category: 'business' },
            { headline: 'Decentralized finance adoption accelerates globally', category: 'crypto' },
        ];
        rawArticles = fallbackHeadlines.map((n: any, i: number) => ({
            id: `gn-unified-fallback-${i}`,
            title: n.headline,
            description: 'AI intelligence analysis suggests compounding global implications across multiple sectors.',
            source: 'Reuters Global',
            publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
            image: `https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=600&h=400&fit=crop`,
            url: `https://news.google.com/search?q=${encodeURIComponent(n.headline)}`,
            globalCategory: n.category?.toLowerCase() || 'politics'
        }));
        isLive = false;
    }

    const articles = rawArticles.map((a, i) => enrichArticle(a, i));

    // Smart Ranking: weighted combo of impact, urgency, credibility, recency
    articles.sort((a, b) => {
        const urgencyWeight: Record<string, number> = { breaking: 100, high: 60, medium: 30, low: 0 };
        const recencyA = Date.now() - new Date(a.publishedAt).getTime();
        const recencyB = Date.now() - new Date(b.publishedAt).getTime();
        const scoreA = a.impactScore * 2 + (urgencyWeight[a.urgencyLevel] || 0) + a.credibilityScore - (recencyA / 3600000) * 2;
        const scoreB = b.impactScore * 2 + (urgencyWeight[b.urgencyLevel] || 0) + b.credibilityScore - (recencyB / 3600000) * 2;
        return scoreB - scoreA;
    });

    const topics = [...new Set(articles.map(a => a.topic))];
    const countries = [...new Set(articles.map(a => a.country))].filter(c => c !== 'Global');
    const regions = [...new Set(articles.map(a => a.region))].filter(r => r !== 'Global');

    const sentimentBreakdown = {
        positive: articles.filter(a => a.sentiment === 'positive').length,
        negative: articles.filter(a => a.sentiment === 'negative').length,
        neutral: articles.filter(a => a.sentiment === 'neutral').length,
    };

    const categoryBreakdown = {
        politics: articles.filter(a => a.globalCategory === 'politics').length,
        business: articles.filter(a => a.globalCategory === 'business').length,
        crypto: articles.filter(a => a.globalCategory === 'crypto').length,
    };

    const result = {
        articles,
        topics,
        countries,
        regions,
        polls: NEWS_POLLS,
        stats: {
            totalArticles: articles.length,
            breakingCount: articles.filter(a => a.urgencyLevel === 'breaking' || a.urgencyLevel === 'high').length,
            avgCredibility: Math.round(articles.reduce((s, a) => s + a.credibilityScore, 0) / articles.length),
            avgImpact: Math.round(articles.reduce((s, a) => s + a.impactScore, 0) / articles.length),
            sentimentBreakdown,
            categoryBreakdown,
            topSources: [...new Set(articles.map(a => a.source))].slice(0, 10),
        },
        lastUpdated: Date.now(),
        isLive,
    };

    cachedData = result;
    lastFetch = now;
    return applyFilters(result, categoryFilter, countryFilter, topicFilter);
}

function applyFilters(data: any, category: string | null, country: string | null, topic: string | null) {
    let articles = data.articles;
    if (category) articles = articles.filter((a: any) => a.globalCategory === category);
    if (country) articles = articles.filter((a: any) => a.country === country);
    if (topic) articles = articles.filter((a: any) => a.topic === topic);
    return NextResponse.json({ ...data, articles });
}
