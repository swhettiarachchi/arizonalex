import { NextResponse } from 'next/server';
import {
    SOURCE_META, analyzeSentiment, detectTopic, detectCountry, detectLeader,
    generateKeyPoints, computeImpact, computeUrgency, getTimeAgo, fetchGNews,
} from '@/lib/news-utils';

// ─── Polls ───
const NEWS_POLLS = [
    {
        id: 'np1',
        question: 'Should the UN have binding authority over national climate policy?',
        options: [
            { label: 'Yes, binding authority needed', votes: 42300 },
            { label: 'Advisory role only', votes: 31200 },
            { label: 'No UN involvement', votes: 18500 },
            { label: 'Undecided', votes: 8900 },
        ],
        totalVotes: 100900,
    },
    {
        id: 'np2',
        question: 'Which global issue deserves the most attention right now?',
        options: [
            { label: 'Climate Change', votes: 38100 },
            { label: 'Armed Conflicts', votes: 34800 },
            { label: 'Economic Inequality', votes: 22600 },
            { label: 'AI Regulation', votes: 19400 },
            { label: 'Healthcare Access', votes: 15200 },
        ],
        totalVotes: 130100,
    },
];

// ─── Cache ───
let cachedData: any = null;
let lastFetch = 0;
const CACHE_MS = 900_000; // 15 minutes

function enrichArticle(a: any, idx: number) {
    const text = `${a.title} ${a.description || ''}`;
    const srcMeta = SOURCE_META[a.source] || { credibility: 70, bias: 'center', country: 'Unknown' };
    return {
        ...a,
        id: a.id || `art-${idx}`,
        sentiment: analyzeSentiment(text),
        bias: srcMeta.bias,
        topic: detectTopic(text),
        country: detectCountry(text),
        relatedLeader: detectLeader(text),
        impactScore: computeImpact(a.title, a.description || '', a.source),
        urgencyLevel: computeUrgency(text),
        keyPoints: generateKeyPoints(a.title, a.description || ''),
        credibilityScore: srcMeta.credibility,
        sourceCountry: srcMeta.country,
        timeAgo: getTimeAgo(a.publishedAt),
    };
}

export async function GET() {
    const now = Date.now();
    if (cachedData && now - lastFetch < CACHE_MS) {
        return NextResponse.json(cachedData);
    }

    // Fetch live political news from GNews API
    let rawArticles = await fetchGNews({
        categories: [
            { gnewsCat: 'world', label: 'world' },
            { gnewsCat: 'nation', label: 'nation' },
        ],
    });

    let isLive = rawArticles.length > 0;

    if (rawArticles.length === 0) {
        const fallbackHeadlines = [
            { headline: 'Global leaders convene for emergency climate summit', category: 'politics' },
            { headline: 'Trade negotiations advance between major economic blocs', category: 'economy' },
            { headline: 'Security council addresses emerging geopolitical tensions', category: 'security' },
            { headline: 'International space cooperation reaches new milestone', category: 'science' },
            { headline: 'Healthcare reform bill advances through legislative committee', category: 'health' },
            { headline: 'Digital privacy regulations proposed across multiple nations', category: 'technology' },
        ];
        rawArticles = fallbackHeadlines.map((n: any, i: number) => ({
            id: `gn-fallback-${i}`,
            title: n.headline,
            description: 'AI intelligence analysis suggests compounding global implications across multiple sectors.',
            source: 'Reuters Global',
            publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
            image: `https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=600&h=400&fit=crop`,
            url: `https://news.google.com/search?q=${encodeURIComponent(n.headline)}`,
            category: n.category || 'politics'
        }));
        isLive = false;
    }

    const articles = rawArticles.map((a, i) => enrichArticle(a, i));
    articles.sort((a, b) => b.impactScore - a.impactScore);

    const topics = [...new Set(articles.map(a => a.topic))];
    const countries = [...new Set(articles.map(a => a.country))].filter(c => c !== 'Global');

    const sentimentBreakdown = {
        positive: articles.filter(a => a.sentiment === 'positive').length,
        negative: articles.filter(a => a.sentiment === 'negative').length,
        neutral: articles.filter(a => a.sentiment === 'neutral').length,
    };

    const result = {
        articles,
        topics,
        countries,
        polls: NEWS_POLLS,
        stats: {
            totalArticles: articles.length,
            breakingCount: articles.filter(a => a.urgencyLevel === 'breaking').length,
            avgCredibility: Math.round(articles.reduce((s, a) => s + a.credibilityScore, 0) / articles.length),
            sentimentBreakdown,
            topSources: [...new Set(articles.map(a => a.source))].slice(0, 8),
        },
        lastUpdated: Date.now(),
        isLive,
    };

    cachedData = result;
    lastFetch = now;
    return NextResponse.json(result);
}
