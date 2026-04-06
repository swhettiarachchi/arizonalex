import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // ── Username availability check ──
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (username) {
            const admin = createAdminClient();
            const { data: existing } = await admin
                .from('profiles')
                .select('id')
                .eq('username', username.toLowerCase())
                .single();

            return NextResponse.json({
                usernameTaken: !!existing,
                username: username.toLowerCase(),
            });
        }
        
        // ── Google OAuth status check (original functionality) ──
        if (!url || !key) {
            return NextResponse.json({ error: 'Missing env vars', url: !!url, key: !!key });
        }

        const res = await fetch(`${url}/auth/v1/settings`, {
            headers: { 'apikey': key },
        });
        
        const data = await res.json();
        
        return NextResponse.json({
            supabaseUrl: url,
            external: data.external || {},
            googleEnabled: data.external?.google || false,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
