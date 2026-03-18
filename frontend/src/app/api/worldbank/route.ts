import { NextRequest, NextResponse } from 'next/server';

// Proxy for World Bank Open Data API — avoids browser CORS/CSP issues
// Usage: GET /api/worldbank?country=lk&indicator=NY.GDP.MKTP.KD.ZG
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const indicator = searchParams.get('indicator');

  if (!country || !indicator) {
    return NextResponse.json({ error: 'Missing country or indicator' }, { status: 400 });
  }

  try {
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&mrv=12&per_page=12`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // cache for 1 hour on server
    });

    if (!res.ok) {
      return NextResponse.json({ error: `World Bank API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (err) {
    console.error('WorldBank proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch from World Bank' }, { status: 500 });
  }
}
