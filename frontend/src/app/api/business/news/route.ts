import { NextResponse } from 'next/server';
import {
    SOURCE_META, analyzeSentiment, detectSector, computeImpact, getTimeAgo, fetchGNews,
} from '@/lib/news-utils';

function enrichArticle(a: any) {
    const text = `${a.title} ${a.description || ''}`;
    const srcMeta = SOURCE_META[a.source] || { credibility: 75, bias: 'center', country: 'Unknown' };
    return {
        ...a,
        headline: a.title,
        sentiment: analyzeSentiment(text),
        sector: a.category || detectSector(text),
        impactScore: computeImpact(a.title, a.description || '', a.source),
        credibilityScore: srcMeta.credibility,
        bias: srcMeta.bias,
        timeAgo: getTimeAgo(a.publishedAt),
    };
}

// Cache
let cachedData: any = null;
let lastFetch = 0;
const CACHE_MS = 900_000; // 15 minutes

export async function GET() {
    const now = Date.now();
    if (cachedData && now - lastFetch < CACHE_MS) {
        return NextResponse.json(cachedData);
    }

    // Fetch live business news from GNews API
    let rawArticles = await fetchGNews({
        categories: [{ gnewsCat: 'business', label: 'business' }],
    });

    let isLive = rawArticles.length > 0;

    // Add sector and urgency metadata
    rawArticles = rawArticles.map(a => ({
        ...a,
        category: detectSector(`${a.title} ${a.description || ''}`),
        urgency: /breaking|surge|crash|record/i.test(a.title) ? 'high' : 'medium',
    }));

    if (rawArticles.length === 0) {
        const fallbackHeadlines = [
            { headline: 'Fed holds rates steady; signals two cuts possible in H2 2026', category: 'Finance' },
            { headline: 'Tech sector leads market rally as AI adoption accelerates', category: 'Technology' },
            { headline: 'Global supply chain pressures ease for fifth consecutive month', category: 'Economy' },
            { headline: 'Energy markets stabilize amid OPEC+ production decisions', category: 'Energy' },
            { headline: 'Small business optimism hits 3-year high on easing inflation', category: 'Economy' },
            { headline: 'Crypto market cap crosses $2T as institutional adoption grows', category: 'Crypto' },
        ];
        rawArticles = fallbackHeadlines.map((n: any, i: number) => ({
            id: `gbn-fallback-${i}`,
            title: n.headline,
            description: 'Market analysis highlights significant macroeconomic shifts in the current trading session.',
            source: 'Bloomberg News',
            publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
            image: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop`,
            url: `https://news.google.com/search?q=${encodeURIComponent(n.headline)}`,
            category: n.category || 'technology'
        }));
        isLive = false;
    }

    const articles = rawArticles.map(enrichArticle);
    articles.sort((a, b) => b.impactScore - a.impactScore);

    const sectors = [...new Set(articles.map(a => a.sector))];
    const sentimentBreakdown = {
        positive: articles.filter(a => a.sentiment === 'positive').length,
        negative: articles.filter(a => a.sentiment === 'negative').length,
        neutral: articles.filter(a => a.sentiment === 'neutral').length,
    };

    const result = {
        news: articles,
        sectors,
        stats: {
            totalArticles: articles.length,
            breakingCount: articles.filter(a => a.urgency === 'high').length,
            avgCredibility: Math.round(articles.reduce((s, a) => s + a.credibilityScore, 0) / articles.length),
            sentimentBreakdown,
        },
        lastUpdated: Date.now(),
        isLive,
    };

    cachedData = result;
    lastFetch = now;
    return NextResponse.json(result);
}
