import { NextResponse } from 'next/server';

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
    const sectorMap = [
        { ticker: 'XLK', name: 'Technology', marketCap: '$14.2T' },
        { ticker: 'XLV', name: 'Healthcare', marketCap: '$6.8T' },
        { ticker: 'XLE', name: 'Energy', marketCap: '$4.1T' },
        { ticker: 'XLF', name: 'Finance', marketCap: '$8.9T' },
        { ticker: 'XLRE', name: 'Real Estate', marketCap: '$2.4T' }
    ];

    const [spxQuote, dowQuote, nasdaqQuote, oilQuote, ...sectorQuotes] = await Promise.all([
        fetchQuote('%5EGSPC'),
        fetchQuote('%5EDJI'),
        fetchQuote('%5EIXIC'),
        fetchQuote('CL=F'),
        ...sectorMap.map(s => fetchQuote(s.ticker))
    ]);

    const formatPrice = (q: any) => q?.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A';
    const formatChangePct = (q: any) => q ? `${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%` : 'N/A';
    const isUp = (q: any) => q ? q.changePct >= 0 : true;

    const marketStats = [
        { icon: 'TrendingUpIcon', val: formatPrice(spxQuote), label: 'S&P 500', change: formatChangePct(spxQuote), up: isUp(spxQuote) },
        { icon: 'BarChartIcon', val: formatPrice(dowQuote), label: 'DOW JONES', change: formatChangePct(dowQuote), up: isUp(dowQuote) },
        { icon: 'ActivityIcon', val: formatPrice(nasdaqQuote), label: 'NASDAQ', change: formatChangePct(nasdaqQuote), up: isUp(nasdaqQuote) },
        { icon: 'DollarSignIcon', val: formatPrice(oilQuote), label: 'Crude Oil', change: formatChangePct(oilQuote), up: isUp(oilQuote) },
    ];

    const liveSectorPerformance = sectorMap.map((s, idx) => {
        const quote = sectorQuotes[idx];
        const isPositive = quote ? quote.changePct >= 0 : true;
        const ytd = quote ? `${isPositive ? '+' : ''}${quote.changePct.toFixed(2)}%` : 'N/A';
        return { sector: s.name, marketCap: s.marketCap, ytd, positive: isPositive };
    });

    const economicIndicators = [
        { id: 'e1', label: 'GDP Growth Rate', value: '2.1%', change: '+0.3%', positive: true, period: 'Q4 2025' },
        { id: 'e2', label: 'Inflation (CPI)', value: '3.1%', change: '-0.2%', positive: true, period: 'Feb 2026' },
        { id: 'e3', label: 'Unemployment Rate', value: '4.2%', change: '+0.1%', positive: false, period: 'Feb 2026' },
        { id: 'e4', label: 'Fed Funds Rate', value: '4.50%', change: '0.0%', positive: true, period: 'Current' },
    ];

    return NextResponse.json({
        marketStats,
        sectorPerformance: liveSectorPerformance,
        economicIndicators
    });
}
