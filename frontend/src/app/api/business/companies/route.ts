import { NextResponse } from 'next/server';

// Static company reference data — enriched with live prices from Yahoo Finance
const COMPANIES = [
    { id: '1', name: 'Apple Inc.', ticker: 'AAPL', sector: 'Technology', price: '$170.50', change: '+1.14%', positive: true, marketCap: '$2.8T', revenue: '$383.2B', employees: '161K', ceo: 'Tim Cook' },
    { id: '2', name: 'Microsoft Corp', ticker: 'MSFT', sector: 'Technology', price: '$410.22', change: '+0.85%', positive: true, marketCap: '$3.0T', revenue: '$227.6B', employees: '221K', ceo: 'Satya Nadella' },
    { id: '3', name: 'Tesla Inc', ticker: 'TSLA', sector: 'Automotive', price: '$182.80', change: '-2.23%', positive: false, marketCap: '$580.6B', revenue: '$96.7B', employees: '140K', ceo: 'Elon Musk' },
    { id: '4', name: 'JPMorgan Chase', ticker: 'JPM', sector: 'Finance', price: '$192.10', change: '+0.78%', positive: true, marketCap: '$550.4B', revenue: '$158.1B', employees: '309K', ceo: 'Jamie Dimon' },
    { id: '5', name: 'Nvidia Corp', ticker: 'NVDA', sector: 'Technology', price: '$850.60', change: '+2.52%', positive: true, marketCap: '$2.1T', revenue: '$60.9B', employees: '29K', ceo: 'Jensen Huang' },
    { id: '6', name: 'Coinbase Global', ticker: 'COIN', sector: 'Crypto/Web3', price: '$240.84', change: '+8.90%', positive: true, marketCap: '$58.2B', revenue: '$3.1B', employees: '3.4K', ceo: 'Brian Armstrong' },
];

let cachedCompanies: any = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60000;

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
        return {
            price: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${isPositive ? '+' : ''}${changePct.toFixed(2)}%`,
            positive: isPositive,
        };
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

        const companies = [...COMPANIES];
        const quotes = await Promise.all(companies.map(c => fetchCompanyQuote(c.ticker)));

        const updatedCompanies = companies.map((company, index) => {
            const quote = quotes[index];
            if (quote) return { ...company, ...quote };
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
        if (cachedCompanies) return NextResponse.json({ companies: cachedCompanies });
        return NextResponse.json({ companies: COMPANIES });
    }
}
