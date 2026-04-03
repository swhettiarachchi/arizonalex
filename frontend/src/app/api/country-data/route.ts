import { NextResponse } from 'next/server';

// GET /api/country-data — proxy to ipapi.co for geo-detection
export async function GET() {
    try {
        const res = await fetch('https://ipapi.co/json/', {
            headers: { 'Accept': 'application/json', 'User-Agent': 'Arizonalex/1.0' },
            next: { revalidate: 3600 }, // cache for 1 hour
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, country_code: 'US', country_name: 'United States' }, { status: 200 });
        }

        const data = await res.json();
        return NextResponse.json({
            success: true,
            country_code: data.country_code || 'US',
            country_name: data.country_name || 'United States',
            city: data.city || '',
            region: data.region || '',
            timezone: data.timezone || '',
            languages: data.languages || 'en',
        });
    } catch {
        return NextResponse.json({
            success: false,
            country_code: 'US',
            country_name: 'United States',
        }, { status: 200 });
    }
}
