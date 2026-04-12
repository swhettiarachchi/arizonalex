import { NextResponse } from 'next/server';

// ── Business Events API ─────────────────────────────────────────────
// Serves live-enriched business events from curated data + optional
// Yahoo Finance earnings calendar integration

interface BusinessEvent {
    id: string;
    title: string;
    type: 'conference' | 'ipo' | 'earnings' | 'merger' | 'summit' | 'launch';
    date: string;
    location: string;
    company?: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
}

// Curated events dataset — matches the BusinessEvent type interface
const CURATED_EVENTS: BusinessEvent[] = [
    { id: '1', title: 'Global Tech Summit 2026', type: 'summit', date: 'Mar 10, 2026', location: 'San Francisco, CA', company: 'TechVision Corp', impact: 'High', description: 'Annual gathering of 5,000+ technology leaders discussing AI, policy, and future markets.' },
    { id: '2', title: 'Q1 Earnings Season Begins', type: 'earnings', date: 'Mar 15, 2026', location: 'Virtual', company: 'Multiple', impact: 'High', description: 'S&P 500 companies report Q1 results — markets expect 8.4% average EPS growth.' },
    { id: '3', title: 'GreenPower Inc IPO', type: 'ipo', date: 'Mar 20, 2026', location: 'NYSE', company: 'GreenPower Inc', impact: 'High', description: 'Renewable energy startup goes public at $65 target price, raising $3.8B.' },
    { id: '4', title: 'World Economic Policy Forum', type: 'summit', date: 'Mar 22, 2026', location: 'Geneva, Switzerland', impact: 'High', description: 'Finance ministers and CEOs align on global policy and trade agreements.' },
    { id: '5', title: 'National Small Business Expo', type: 'conference', date: 'Mar 28, 2026', location: 'Chicago, IL', impact: 'Medium', description: 'America\'s largest SME conference with 12,000 attendees and 400+ exhibitors.' },
    { id: '6', title: 'FinEdge Capital Merger Close', type: 'merger', date: 'Apr 1, 2026', location: 'New York, NY', company: 'FinEdge Capital', impact: 'High', description: '$42B merger between FinEdge Capital and Meridian Bank pending final regulatory approval.' },
    { id: '7', title: 'Asia-Pacific Trade Conference', type: 'conference', date: 'Apr 5, 2026', location: 'Singapore', impact: 'Medium', description: 'Regional trade ministers discuss tariff reforms and supply chain resilience across APAC.' },
    { id: '8', title: 'CryptoVault DeFi Protocol Launch', type: 'launch', date: 'Apr 10, 2026', location: 'Virtual', company: 'CryptoVault Ltd', impact: 'Medium', description: 'Next-gen DeFi protocol launch with $200M initial liquidity pool and institutional-grade security.' },
];

let cachedEvents: BusinessEvent[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 min cache

export async function GET() {
    try {
        const now = Date.now();

        // Return cached data if fresh
        if (cachedEvents && (now - lastFetchTime < CACHE_DURATION_MS)) {
            return NextResponse.json({ events: cachedEvents, isLive: false });
        }

        // Try to enrich with live earnings data from Yahoo Finance
        let liveEvents: BusinessEvent[] = [];
        try {
            const earningsRes = await fetch(
                'https://query2.finance.yahoo.com/v1/finance/search?q=earnings+report&quotesCount=0&newsCount=5',
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json',
                    },
                    cache: 'no-store',
                }
            );

            if (earningsRes.ok) {
                const data = await earningsRes.json();
                const newsItems = data.news || [];

                liveEvents = newsItems.slice(0, 3).map((item: any, idx: number) => ({
                    id: `live-${item.uuid || idx}`,
                    title: item.title,
                    type: 'earnings' as const,
                    date: formatYahooDate(item.providerPublishTime),
                    location: 'Virtual',
                    company: item.publisher || 'Unknown',
                    impact: 'High' as const,
                    description: item.summary || item.title,
                }));
            }
        } catch {
            // Silently fall back to curated data
        }

        const enriched = [...liveEvents, ...CURATED_EVENTS];
        cachedEvents = enriched;
        lastFetchTime = now;

        return NextResponse.json({
            events: enriched,
            isLive: liveEvents.length > 0,
        });
    } catch (error) {
        console.error('API /business/events error:', error);
        return NextResponse.json({ events: CURATED_EVENTS, isLive: false });
    }
}

function formatYahooDate(unixTime: number): string {
    if (!unixTime) return 'Upcoming';
    const d = new Date(unixTime * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
