import { NextResponse } from 'next/server';
import { marketData as mockMarketData } from '@/lib/mock-data';

const TICKERS = [
    { symbol: '^GSPC', label: 'S&P 500', url: 'https://www.tradingview.com/chart/?symbol=SP%3ASPX' },
    { symbol: '^IXIC', label: 'NASDAQ', url: 'https://www.tradingview.com/chart/?symbol=NASDAQ%3AIXIC' },
    { symbol: '^DJI', label: 'DOW JONES', url: 'https://www.tradingview.com/chart/?symbol=DJ%3ADJI' },
    { symbol: 'BTC-USD', label: 'BTC/USD', url: 'https://www.tradingview.com/chart/?symbol=BITSTAMP%3ABTCUSD' },
    { symbol: 'GC=F', label: 'Gold', url: 'https://www.tradingview.com/chart/?symbol=COMEX%3AGC1!' },
    { symbol: 'CL=F', label: 'Oil (WTI)', url: 'https://www.tradingview.com/chart/?symbol=NYMEX%3ACL1!' },
];

let cachedMarketData: any = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60000; // 60 seconds

async function fetchQuote(ticker: { symbol: string; label: string; url: string }, index: number) {
    try {
        const encodedSymbol = encodeURIComponent(ticker.symbol);
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?interval=1d&range=1d`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            },
            // No Next.js cache, always fresh
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;

        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose ?? meta.chartPreviousClose;

        if (price == null) return null;

        const change = prevClose ? price - prevClose : 0;
        const changePct = prevClose ? (change / prevClose) * 100 : 0;
        const isPositive = changePct >= 0;

        let priceStr = '';
        if (ticker.symbol === 'BTC-USD') {
            priceStr = `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        } else if (ticker.symbol === 'GC=F' || ticker.symbol === 'CL=F') {
            priceStr = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            priceStr = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        const changeStr = `${isPositive ? '+' : ''}${changePct.toFixed(2)}%`;

        return {
            id: String(index + 1),
            symbol: ticker.label,
            price: priceStr,
            change: changeStr,
            positive: isPositive,
            url: ticker.url,
        };
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const now = Date.now();
        if (cachedMarketData && (now - lastFetchTime < CACHE_DURATION_MS)) {
            return NextResponse.json({ marketData: cachedMarketData });
        }

        // Fetch all quotes in parallel
        const results = await Promise.all(
            TICKERS.map((ticker, index) => fetchQuote(ticker, index))
        );

        // Map results, falling back to mock data for failed fetches
        const marketData = TICKERS.map((ticker, index) => {
            const result = results[index];
            if (result) return result;

            // Find matching mock data entry
            const mock = mockMarketData.find(m => m.symbol === ticker.label) ?? mockMarketData[index];
            return mock
                ? { ...mock, id: String(index + 1) }
                : {
                    id: String(index + 1),
                    symbol: ticker.label,
                    price: 'N/A',
                    change: 'N/A',
                    positive: true,
                    url: ticker.url,
                };
        });

        // Only cache if we got at least some live data
        const liveCount = results.filter(Boolean).length;
        if (liveCount > 0) {
            cachedMarketData = marketData;
            lastFetchTime = Date.now();
        }

        return NextResponse.json({ marketData });
    } catch (error) {
        console.error('Error fetching market data:', error);
        if (cachedMarketData) {
            return NextResponse.json({ marketData: cachedMarketData });
        }
        return NextResponse.json({ marketData: mockMarketData });
    }
}
