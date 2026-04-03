// ═══════════════════════════════════════════════════════════════════════
// Shared News Utilities — Single source of truth for all news API routes
// ═══════════════════════════════════════════════════════════════════════

// ─── Source credibility & bias database ───
export const SOURCE_META: Record<string, { credibility: number; bias: string; country: string }> = {
    'Reuters': { credibility: 95, bias: 'center', country: 'UK' },
    'Associated Press': { credibility: 94, bias: 'center', country: 'US' },
    'BBC News': { credibility: 92, bias: 'center', country: 'UK' },
    'Al Jazeera': { credibility: 78, bias: 'center-left', country: 'Qatar' },
    'Bloomberg': { credibility: 92, bias: 'center', country: 'US' },
    'The Guardian': { credibility: 85, bias: 'left', country: 'UK' },
    'CNN': { credibility: 75, bias: 'left', country: 'US' },
    'Fox News': { credibility: 68, bias: 'right', country: 'US' },
    'The New York Times': { credibility: 88, bias: 'center-left', country: 'US' },
    'The Washington Post': { credibility: 87, bias: 'center-left', country: 'US' },
    'Financial Times': { credibility: 93, bias: 'center', country: 'UK' },
    'Deutsche Welle': { credibility: 88, bias: 'center', country: 'Germany' },
    'France 24': { credibility: 84, bias: 'center', country: 'France' },
    'NHK World': { credibility: 86, bias: 'center', country: 'Japan' },
    'Times of India': { credibility: 72, bias: 'center-right', country: 'India' },
    'South China Morning Post': { credibility: 76, bias: 'center', country: 'Hong Kong' },
    'The Economist': { credibility: 93, bias: 'center', country: 'UK' },
    'Politico': { credibility: 84, bias: 'center-left', country: 'US' },
    'Foreign Policy': { credibility: 90, bias: 'center', country: 'US' },
    'The Hill': { credibility: 82, bias: 'center', country: 'US' },
    'CNBC': { credibility: 82, bias: 'center', country: 'US' },
    'Forbes': { credibility: 84, bias: 'center-right', country: 'US' },
    'Wall Street Journal': { credibility: 90, bias: 'center-right', country: 'US' },
    'MarketWatch': { credibility: 80, bias: 'center', country: 'US' },
    "Barron's": { credibility: 88, bias: 'center', country: 'US' },
    'TechCrunch': { credibility: 82, bias: 'center-left', country: 'US' },
    'Business Insider': { credibility: 78, bias: 'center-left', country: 'US' },
    'Yahoo Finance': { credibility: 76, bias: 'center', country: 'US' },
    'CoinDesk': { credibility: 80, bias: 'center', country: 'US' },
    'CoinTelegraph': { credibility: 76, bias: 'center', country: 'US' },
    'Decrypt': { credibility: 74, bias: 'center', country: 'US' },
    'The Block': { credibility: 78, bias: 'center', country: 'US' },
};

// ─── Sentiment Analysis ───
const POS_WORDS = [
    'peace', 'agreement', 'growth', 'reform', 'progress', 'victory', 'success',
    'boost', 'approve', 'landmark', 'bipartisan', 'historic', 'recovery',
    'alliance', 'cooperation', 'breakthrough', 'expand', 'investment',
    'opportunity', 'surge', 'record', 'profit', 'rally', 'gains', 'bullish',
    'soar', 'upgrade',
];
const NEG_WORDS = [
    'war', 'crisis', 'sanctions', 'conflict', 'collapse', 'attack', 'threat',
    'bomb', 'death', 'disaster', 'strike', 'protest', 'tension', 'fraud',
    'corruption', 'crash', 'layoff', 'loss', 'decline', 'plunge', 'warning',
    'recall', 'lawsuit', 'recession', 'bear', 'downgrade', 'slump', 'bankrupt',
    'violat', 'fail', 'emergency', 'flee', 'refugee',
];

export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lower = text.toLowerCase();
    let pos = 0, neg = 0;
    POS_WORDS.forEach(w => { if (lower.includes(w)) pos++; });
    NEG_WORDS.forEach(w => { if (lower.includes(w)) neg++; });
    if (pos > neg + 1) return 'positive';
    if (neg > pos) return 'negative';
    if (pos > neg) return 'positive';
    return 'neutral';
}

// ─── Topic Detection ───
export function detectTopic(text: string): string {
    const lower = text.toLowerCase();
    if (/election|vote|ballot|campaign|candidate|poll/.test(lower)) return 'Elections';
    if (/war|military|army|bomb|strike|missile|defense|weapon/.test(lower)) return 'War & Conflict';
    if (/econom|gdp|inflation|trade|tariff|market|recession|growth|fiscal/.test(lower)) return 'Economy';
    if (/climate|environment|emission|green|renewable|carbon/.test(lower)) return 'Climate';
    if (/sanction|diplomat|treaty|alliance|summit|bilateral|nato|un /.test(lower)) return 'Diplomacy';
    if (/policy|bill|legislation|reform|law|regulation|act|govern/.test(lower)) return 'Policy';
    if (/health|pandemic|vaccine|medical|disease/.test(lower)) return 'Healthcare';
    if (/tech|ai|cyber|digital|data|privacy|chip|semiconductor/.test(lower)) return 'Technology';
    if (/bitcoin|ethereum|crypto|blockchain|defi/.test(lower)) return 'Cryptocurrency';
    if (/oil|energy|renewable|solar|gas|opec/.test(lower)) return 'Energy';
    if (/bank|financ|interest rate|fed|central bank/.test(lower)) return 'Finance';
    return 'General';
}

// ─── Global Category Detection ───
export function detectGlobalCategory(text: string, existingCategory?: string): string {
    if (existingCategory && ['politics', 'business', 'crypto'].includes(existingCategory.toLowerCase())) {
        return existingCategory.toLowerCase();
    }
    const lower = text.toLowerCase();
    if (/bitcoin|ethereum|crypto|blockchain|defi|nft|token|altcoin|mining|staking|web3/.test(lower)) return 'crypto';
    if (/election|vote|senate|congress|parliament|president|prime minister|sanction|diplomat|treaty|nato|un |policy|bill|legislation/.test(lower)) return 'politics';
    return 'business';
}

// ─── Country Detection ───
export function detectCountry(text: string): string {
    const lower = text.toLowerCase();
    const map: [RegExp, string][] = [
        [/united states|u\.s\.|america|washington|congress|senate|white house|biden|trump/, 'United States'],
        [/china|beijing|xi jinping|chinese/, 'China'],
        [/russia|moscow|kremlin|putin/, 'Russia'],
        [/ukraine|kyiv|zelensky/, 'Ukraine'],
        [/iran|tehran/, 'Iran'],
        [/israel|jerusalem|netanyahu|gaza/, 'Israel'],
        [/india|delhi|modi/, 'India'],
        [/uk|britain|london|parliament|starmer/, 'United Kingdom'],
        [/france|paris|macron/, 'France'],
        [/germany|berlin|scholz/, 'Germany'],
        [/japan|tokyo/, 'Japan'],
        [/south korea|seoul/, 'South Korea'],
        [/north korea|pyongyang|kim jong/, 'North Korea'],
        [/pakistan|islamabad/, 'Pakistan'],
        [/saudi|riyadh/, 'Saudi Arabia'],
        [/turkey|ankara|erdogan/, 'Turkey'],
        [/brazil|brasilia|lula/, 'Brazil'],
        [/eu |european union|brussels/, 'European Union'],
    ];
    for (const [re, c] of map) if (re.test(lower)) return c;
    return 'Global';
}

// ─── Leader Detection ───
export function detectLeader(text: string): string | null {
    const lower = text.toLowerCase();
    const leaders: [RegExp, string][] = [
        [/biden/, 'Joe Biden'], [/trump/, 'Donald Trump'], [/xi jinping|xi/, 'Xi Jinping'],
        [/putin/, 'Vladimir Putin'], [/zelensky/, 'Volodymyr Zelensky'], [/modi/, 'Narendra Modi'],
        [/macron/, 'Emmanuel Macron'], [/scholz/, 'Olaf Scholz'], [/starmer/, 'Keir Starmer'],
        [/netanyahu/, 'Benjamin Netanyahu'], [/erdogan/, 'Recep Tayyip Erdogan'],
        [/lula/, 'Luiz Inácio Lula da Silva'], [/kim jong/, 'Kim Jong Un'],
    ];
    for (const [re, name] of leaders) if (re.test(lower)) return name;
    return null;
}

// ─── Key Points ───
export function generateKeyPoints(title: string, desc: string): string[] {
    const text = `${title}. ${desc}`;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15).slice(0, 3);
    if (sentences.length >= 2) return sentences.map(s => s.trim());
    return [
        `Key development: ${title.slice(0, 80)}`,
        'Intelligence team is monitoring for broader impact',
        'Real-time analysis underway across global markets',
    ];
}

// ─── Impact Score ───
export function computeImpact(title: string, desc: string, source?: string): number {
    let score = 50;
    const text = `${title} ${desc}`.toLowerCase();
    if (/breaking|urgent|emergency|crisis/.test(text)) score += 25;
    if (/president|prime minister|summit/.test(text)) score += 15;
    if (/war|military|nuclear/.test(text)) score += 20;
    if (/election|vote/.test(text)) score += 10;
    if (/sanction|trade war|tariff/.test(text)) score += 12;
    if (/billion|trillion|major|massive/.test(text)) score += 10;
    if (/merger|acquisition|ipo|deal/.test(text)) score += 12;
    if (/fed|interest rate|central bank|regulation/.test(text)) score += 10;
    if (/record|historic|landmark|unprecedented/.test(text)) score += 15;
    const src = source ? (SOURCE_META[source] || { credibility: 70 }) : { credibility: 70 };
    score += Math.floor((src.credibility - 70) / 3);
    return Math.min(Math.max(score, 10), 100);
}

// ─── Urgency Level ───
export function computeUrgency(text: string): string {
    const lower = text.toLowerCase();
    if (/breaking|just in|urgent|flash|developing/.test(lower)) return 'breaking';
    if (/crisis|emergency|war|attack|bomb|collapse|crash/.test(lower)) return 'high';
    if (/summit|election|reform|policy|announce|surge|record/.test(lower)) return 'medium';
    return 'low';
}

// ─── Popularity Score ───
export function computePopularity(impactScore: number, urgency: string): number {
    let base = Math.floor(Math.random() * 500) + 100;
    if (urgency === 'breaking') base += 2000;
    else if (urgency === 'high') base += 800;
    else if (urgency === 'medium') base += 300;
    base += impactScore * 10;
    return base;
}

// ─── Relative Time ───
export function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Region Mapping ───
export function getRegion(country: string): string {
    const regionMap: Record<string, string> = {
        'United States': 'North America', 'Brazil': 'South America',
        'China': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia', 'North Korea': 'Asia', 'India': 'Asia',
        'Russia': 'Europe/Asia', 'Ukraine': 'Europe', 'France': 'Europe', 'Germany': 'Europe',
        'United Kingdom': 'Europe', 'European Union': 'Europe', 'Turkey': 'Europe/Asia',
        'Iran': 'Middle East', 'Israel': 'Middle East', 'Saudi Arabia': 'Middle East',
        'Pakistan': 'South Asia',
    };
    return regionMap[country] || 'Global';
}

// ─── Business Sector Detection ───
export function detectSector(text: string): string {
    const lower = text.toLowerCase();
    if (/tech|ai|software|chip|semiconductor|apple|google|microsoft|meta/.test(lower)) return 'Technology';
    if (/bank|financ|jpmorgan|goldman|credit|loan|interest rate/.test(lower)) return 'Finance';
    if (/oil|energy|renewable|solar|gas|opec|petrol/.test(lower)) return 'Energy';
    if (/pharma|health|drug|biotech|fda|vaccine/.test(lower)) return 'Healthcare';
    if (/retail|consumer|amazon|walmart|shopping/.test(lower)) return 'Retail';
    if (/auto|tesla|ev|electric vehicle|car|motor/.test(lower)) return 'Automotive';
    if (/real estate|housing|mortgage|property/.test(lower)) return 'Real Estate';
    return 'Markets';
}

// ═══════════════════════════════════════════════════════════════════════
// GNews API Fetcher — unified fetch with dedup, used by all routes
// ═══════════════════════════════════════════════════════════════════════

export interface GNewsFetchOptions {
    /** GNews category slugs to fetch, e.g. ['world', 'business'] */
    categories?: { gnewsCat: string; label: string }[];
    /** Alternatively, a search query string (uses /search endpoint) */
    searchQuery?: string;
    /** Max articles per category (default 10) */
    maxPerCategory?: number;
    /** Timeout ms (default 8000) */
    timeoutMs?: number;
}

export async function fetchGNews(options: GNewsFetchOptions): Promise<any[]> {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) return [];

    const maxPer = options.maxPerCategory ?? 10;
    const timeout = options.timeoutMs ?? 8000;

    let fetches: Promise<any[]>[];

    if (options.searchQuery) {
        // Search mode (used by crypto)
        fetches = [
            fetch(
                `https://gnews.io/api/v4/search?q=${encodeURIComponent(options.searchQuery)}&lang=en&max=${maxPer}&sortby=publishedAt&apikey=${apiKey}`,
                { cache: 'no-store', signal: AbortSignal.timeout(timeout) }
            )
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (!data?.articles?.length) return [];
                    return data.articles.map((a: any, i: number) => ({
                        id: `gn-search-${i}`,
                        title: a.title,
                        description: a.description || a.content?.slice(0, 200) || '',
                        source: a.source?.name || 'Unknown',
                        publishedAt: a.publishedAt,
                        image: a.image,
                        url: a.url,
                    }));
                })
                .catch(() => [])
        ];
    } else {
        // Category mode (used by politics, business, unified)
        const cats = options.categories || [{ gnewsCat: 'general', label: 'general' }];
        fetches = cats.map(({ gnewsCat, label }) =>
            fetch(
                `https://gnews.io/api/v4/top-headlines?category=${gnewsCat}&lang=en&max=${maxPer}&apikey=${apiKey}`,
                { cache: 'no-store', signal: AbortSignal.timeout(timeout) }
            )
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (!data?.articles?.length) return [];
                    return data.articles.map((a: any, i: number) => ({
                        id: `gn-${label}-${i}`,
                        title: a.title,
                        description: a.description || a.content?.slice(0, 200) || '',
                        source: a.source?.name || 'Unknown',
                        publishedAt: a.publishedAt,
                        image: a.image,
                        url: a.url,
                        _label: label,
                    }));
                })
                .catch(() => [])
        );
    }

    const results = await Promise.all(fetches);
    const allArticles = results.flat();

    // Deduplicate by title similarity
    const seen = new Set<string>();
    return allArticles.filter(a => {
        const key = a.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
