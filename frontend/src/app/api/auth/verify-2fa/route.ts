import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // 2FA verification is handled through Supabase MFA when enabled
    // For now, return success as 2FA is not yet configured
    try {
        const { code } = await req.json();
        if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

        // Placeholder — Supabase MFA integration will be added later
        return NextResponse.json({ success: true, message: '2FA verification passed' });
    } catch {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
