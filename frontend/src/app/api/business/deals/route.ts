import { NextResponse } from 'next/server';

function formatYahooDate(unixTime: number): string {
    const d = new Date(unixTime * 1000);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return `${Math.max(1, Math.floor(diffHours))}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseDealValue(text: string): string {
    const match = text.match(/\$[\d.]+\s?(Billion|Million|B|M|Trillion|T)/i);
    return match ? match[0].toUpperCase() : 'Undisclosed';
}

function determineDealStatus(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('rumor') || lower.includes('consider') || lower.includes('weigh') || lower.includes('eye') || lower.includes('talk')) return 'Rumored';
    if (lower.includes('close') || lower.includes('complete')) return 'Closed';
    return 'Announced';
}

function determineDealType(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('merg')) return 'Merger';
    if (lower.includes('spinoff') || lower.includes('spin-off') || lower.includes('carve')) return 'Spinoff';
    if (lower.includes('buyout') || lower.includes('private')) return 'Buyout';
    return 'Acquisition';
}

function guessSector(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('tech') || lower.includes('software') || lower.includes('cyber') || lower.includes('ai') || lower.includes('chip')) return 'Technology';
    if (lower.includes('health') || lower.includes('pharma') || lower.includes('biotech') || lower.includes('drug')) return 'Healthcare';
    if (lower.includes('bank') || lower.includes('finan') || lower.includes('capital') || lower.includes('fund')) return 'Financials';
    if (lower.includes('oil') || lower.includes('gas') || lower.includes('energy') || lower.includes('power')) return 'Energy';
    if (lower.includes('retail') || lower.includes('store') || lower.includes('brand')) return 'Consumer';
    return 'Industrials';
}

export async function GET() {
    try {
        const res = await fetch(
            'https://query2.finance.yahoo.com/v1/finance/search?q=merger&quotesCount=0&newsCount=8',
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!res.ok) {
            return NextResponse.json({ deals: [] });
        }

        const data = await res.json();
        const news = data.news || [];

        const liveDeals = news.map((item: any) => {
            const title = item.title;
            const summary = item.summary || '';
            const combinedText = title + ' ' + summary;

            return {
                id: item.uuid,
                title: title,
                parties: item.publisher,
                value: parseDealValue(combinedText),
                date: formatYahooDate(item.providerPublishTime),
                status: determineDealStatus(title),
                type: determineDealType(title),
                sector: guessSector(combinedText),
                link: item.link
            };
        });

        return NextResponse.json({ deals: liveDeals });
    } catch (error) {
        console.error('API /business/deals error:', error);
        return NextResponse.json({ deals: [] });
    }
}
