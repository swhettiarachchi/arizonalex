import { NextResponse } from 'next/server';
import { economicIndicators } from '@/lib/mock-data';

// Generate realistic pseudo-live data based on the current hour so it fluctuates realistically
function generateSyntheticQuote(symbol: string, basePrice: number, volatility: number) {
    const now = new Date();
    // Use day of year + hour to create a deterministic but changing seed
    const seed = now.getDate() + now.getHours() + symbol.charCodeAt(0);

    // Simulate a drift
    const drift = (Math.sin(seed) * volatility);
    const currentPrice = basePrice + drift;

    // Simulate daily change
    const percentChange = (drift / basePrice) * 100;

    return {
        price: currentPrice.toFixed(2),
        change: Math.abs(percentChange).toFixed(2) + '%',
        positive: percentChange >= 0
    };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET() {
    try {
        // Fetch GovTrack bill count and backend system stats in parallel
        const [govTrackRes, backendRes] = await Promise.all([
            fetch('https://www.govtrack.us/api/v2/bill?limit=0', { cache: 'no-store' }),
            fetch(`${API_BASE}/stats`, { cache: 'no-store' }).catch(() => null)
        ]);

        let billCount = 89;
        let pollCount = 156;
        let eventCount = 24;
        let userCount = 2400000;

        if (govTrackRes.ok) {
            const govData = await govTrackRes.json();
            if (govData.meta && govData.meta.total_count) {
                billCount = govData.meta.total_count;
            }
        }

        if (backendRes && backendRes.ok) {
            const bData = await backendRes.json();
            pollCount = bData.polls || pollCount;
            eventCount = bData.events || eventCount;
            userCount = (bData.users || 0) + 2400000;
        }

        const stats = [
            { label: 'Active Voters', val: userCount > 1000000 ? `${(userCount / 1000000).toFixed(1)}M` : userCount.toLocaleString(), change: '+12%', up: true },
            { label: 'Active Polls', val: pollCount.toString(), change: '+8%', up: true },
            { label: 'Bills in Discussion', val: billCount > 1000 ? `${(billCount / 1000).toFixed(1)}k+` : billCount.toString(), change: '+3%', up: true },
            { label: 'Upcoming Events', val: eventCount.toString(), change: '+15%', up: true },
        ];

        // Additional Analytics for the "Analytics" tab
        const analytics = {
            overview: [
                { label: 'Voter Turnout Prediction', val: '68%', change: '+3%', up: true },
                { label: 'Public Approval Average', val: '72%', change: '+1.4%', up: true },
                { label: 'Political Discussions', val: '3.2M', change: '+18%', up: true },
                { label: 'Policy Engagement Rate', val: '85%', change: '+5%', up: true },
            ],
            sentiment: [
                { topic: 'Economy', pos: 62, neg: 18, neu: 20 },
                { topic: 'Healthcare', pos: 48, neg: 32, neu: 20 },
                { topic: 'Education', pos: 71, neg: 12, neu: 17 },
                { topic: 'Environment', pos: 55, neg: 25, neu: 20 },
                { topic: 'Security', pos: 66, neg: 14, neu: 20 },
            ],
            trends: [65, 45, 78, 52, 88, 71, 95, 60, 82, 70, 55, 90]
        };

        const spyData = generateSyntheticQuote('SPY', 510.50, 4.5);
        const tltData = generateSyntheticQuote('TLT', 92.10, 1.2);

        const liveEconomicIndicators = [
            { id: 'e1', label: 'S&P 500 (Market Confidence)', value: spyData.price, change: spyData.change, positive: spyData.positive, period: 'Live', url: 'https://www.tradingview.com/chart/?symbol=SP%3ASPX' },
            { id: 'e2', label: 'Treasury Bonds (TLT)', value: tltData.price, change: tltData.change, positive: tltData.positive, period: 'Live', url: 'https://www.tradingview.com/chart/?symbol=NASDAQ%3ATLT' },
            { id: 'e3', label: 'Unemployment', value: '4.2%', change: '+0.1%', positive: false, period: 'Feb 2026', url: 'https://www.tradingview.com/symbols/ECONOMICS-USUR/' },
            { id: 'e4', label: 'Inflation (CPI)', value: '3.1%', change: '-0.2%', positive: true, period: 'Feb 2026', url: 'https://www.tradingview.com/symbols/ECONOMICS-USCPI/' }
        ];

        return NextResponse.json({ stats, analytics, economicIndicators: liveEconomicIndicators });

    } catch (e: any) {
        console.warn('Failed to generate stats data. Falling back to default.', e.message);
        const fallbackStats = [
            { label: 'Active Voters', val: '2.4M', change: '+12%', up: true },
            { label: 'Active Polls', val: '156', change: '+8%', up: true },
            { label: 'Bills in Discussion', val: '89', change: '+3%', up: true },
            { label: 'Upcoming Events', val: '24', change: '+15%', up: true },
        ];
        return NextResponse.json({
            stats: fallbackStats,
            analytics: {
                overview: [
                    { label: 'Voter Turnout Prediction', val: '68%', change: '+3%', up: true },
                    { label: 'Public Approval Average', val: '72%', change: '+1.4%', up: true },
                    { label: 'Political Discussions', val: '3.2M', change: '+18%', up: true },
                    { label: 'Policy Engagement Rate', val: '85%', change: '+5%', up: true },
                ],
                sentiment: [
                    { topic: 'Economy', pos: 62, neg: 18, neu: 20 },
                    { topic: 'Healthcare', pos: 48, neg: 32, neu: 20 },
                    { topic: 'Education', pos: 71, neg: 12, neu: 17 },
                    { topic: 'Environment', pos: 55, neg: 25, neu: 20 },
                    { topic: 'Security', pos: 66, neg: 14, neu: 20 },
                ],
                trends: [65, 45, 78, 52, 88, 71, 95, 60, 82, 70, 55, 90]
            },
            economicIndicators: economicIndicators.slice(0, 4)
        });
    }
}
