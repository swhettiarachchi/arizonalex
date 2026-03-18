import { NextResponse } from 'next/server';

const SECTOR_TICKERS: Record<string, string[]> = {
    'Technology': ['AAPL', 'MSFT', 'NVDA'],
    'Healthcare': ['LLY', 'UNH', 'JNJ'],
    'Energy': ['XOM', 'CVX', 'COP'],
    'Finance': ['JPM', 'BAC', 'WFC'],
    'Real Estate': ['PLD', 'AMT', 'EQIX']
};

const SECTOR_INSIGHTS: Record<string, string> = {
    'Technology': "The technology sector remains highly sensitive to terminal rate expectations. Mega-cap tech continues to operate as a safe-haven trade driven by robust free cash flow and structural AI tailwinds, while smaller software multiples compress.",
    'Healthcare': "Healthcare currently exhibits defensive characteristics amid broader macroeconomic chop. Regulatory headwinds in Medicare Advantage are offset by explosive growth in GLP-1 weight-loss pipelines and continued biotech M&A activity.",
    'Energy': "Energy markets are pricing in a tighter supply environment into 2H. Capital discipline remains the core thesis for the majors, heavily prioritizing share buybacks and dividend growth over aggressive capacity expansion.",
    'Finance': "Net interest margins for regional banks have seemingly bottomed, but commercial real estate (CRE) exposure remains a potent localized risk. Diversified money center banks are relying on rebounding investment banking fees and strong wealth management inflows.",
    'Real Estate': "REITs are navigating a higher-for-longer regime by aggressively restructuring debt maturities. Industrial and data-center trusts maintain immense pricing power and occupancy, starkly contrasting the distressed office subclasses."
};

async function fetchQuote(ticker: string) {
    try {
        const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store'
        });
        if (!res.ok) return null;

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;

        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose ?? meta.chartPreviousClose;
        if (price == null || prevClose == null) return null;

        const change = price - prevClose;
        const changePct = (change / prevClose) * 100;

        return {
            symbol: ticker,
            price: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
            positive: changePct >= 0
        };
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sectorName = searchParams.get('sector');

    if (!sectorName || !SECTOR_TICKERS[sectorName]) {
        return NextResponse.json({ error: 'Invalid or missing sector' }, { status: 400 });
    }

    const tickers = SECTOR_TICKERS[sectorName];
    const insight = SECTOR_INSIGHTS[sectorName];

    const quotes = await Promise.all(tickers.map(fetchQuote));
    const topMovers = quotes.filter(q => q !== null);

    return NextResponse.json({
        sector: sectorName,
        insight,
        topMovers
    });
}
