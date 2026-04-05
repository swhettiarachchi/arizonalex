import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
            return NextResponse.json({ error: 'Missing env vars', url: !!url, key: !!key });
        }

        const res = await fetch(`${url}/auth/v1/settings`, {
            headers: { 'apikey': key },
        });
        
        const data = await res.json();
        
        // Check if google provider is enabled
        return NextResponse.json({
            supabaseUrl: url,
            external: data.external || {},
            googleEnabled: data.external?.google || false,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
