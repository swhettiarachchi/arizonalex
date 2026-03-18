import { NextResponse } from 'next/server';
import { economicIndicators } from '@/lib/mock-data';

async function fetchQuote(ticker: string) {
    try {
        const res = await fetch(
            `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                },
                cache: 'no-store',
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;
        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose ?? meta.chartPreviousClose;
        if (price == null) return null;

        const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        return { price, changePct };
    } catch {
        return null;
    }
}

export async function GET() {
    // Top 5 Sectors mapping to standard SPDR ETFs for proxy live data
    const sectorMap = [
        { ticker: 'XLK', name: 'Technology', marketCap: '$14.2T' },
        { ticker: 'XLV', name: 'Healthcare', marketCap: '$6.8T' },
        { ticker: 'XLE', name: 'Energy', marketCap: '$4.1T' },
        { ticker: 'XLF', name: 'Finance', marketCap: '$8.9T' },
        { ticker: 'XLRE', name: 'Real Estate', marketCap: '$2.4T' }
    ];

    const [spxQuote, ...sectorQuotes] = await Promise.all([
        fetchQuote('%5EGSPC'),
        ...sectorMap.map(s => fetchQuote(s.ticker))
    ]);

    const spxPrice = spxQuote?.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const marketStats = [
        { icon: 'DollarSignIcon', val: '$38.5T', label: 'Total Market Cap', change: '+2.1%', up: true },
        { icon: 'TrendingUpIcon', val: spxPrice ?? '5,842.31', label: 'S&P 500', change: spxQuote ? 'Live' : '+1.24%', up: true },
        { icon: 'ScaleIcon', val: '$51.4B', label: 'M&A Volume MTD', change: '+34%', up: true },
        { icon: 'ActivityIcon', val: '3', label: 'IPOs This Month', change: 'Upcoming', up: true },
    ];

    const liveSectorPerformance = sectorMap.map((s, idx) => {
        const quote = sectorQuotes[idx];
        const isPositive = quote ? quote.changePct >= 0 : true;
        const ytd = quote ? `${isPositive ? '+' : ''}${quote.changePct.toFixed(2)}%` : '+0.00%';

        return {
            sector: s.name,
            marketCap: s.marketCap,
            ytd: ytd,
            positive: isPositive
        };
    });

    return NextResponse.json({
        marketStats,
        sectorPerformance: liveSectorPerformance,
        economicIndicators: economicIndicators.slice(0, 4)
    });
}
