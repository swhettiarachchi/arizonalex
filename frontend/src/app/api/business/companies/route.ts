import { NextResponse } from 'next/server';
import { companies as mockCompanies } from '@/lib/mock-data';

let cachedCompanies: any = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60000; // 60 seconds

async function fetchCompanyQuote(ticker: string) {
    try {
        const encodedTicker = encodeURIComponent(ticker);
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodedTicker}?interval=1d&range=1d`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            },
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

        const priceStr = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const changeStr = `${isPositive ? '+' : ''}${changePct.toFixed(2)}%`;

        return { price: priceStr, change: changeStr, positive: isPositive };
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const now = Date.now();
        if (cachedCompanies && (now - lastFetchTime < CACHE_DURATION_MS)) {
            return NextResponse.json({ companies: cachedCompanies });
        }

        const companies = [...mockCompanies];

        // Fetch all company quotes in parallel
        const quotes = await Promise.all(
            companies.map(c => fetchCompanyQuote(c.ticker))
        );

        const updatedCompanies = companies.map((company, index) => {
            const quote = quotes[index];
            if (quote) {
                return { ...company, ...quote };
            }
            return company;
        });

        const liveCount = quotes.filter(Boolean).length;
        if (liveCount > 0) {
            cachedCompanies = updatedCompanies;
            lastFetchTime = Date.now();
        }

        return NextResponse.json({ companies: updatedCompanies });

    } catch (error) {
        console.error('Error fetching live company data:', error);
        if (cachedCompanies) {
            return NextResponse.json({ companies: cachedCompanies });
        }
        return NextResponse.json({ companies: mockCompanies });
    }
}
