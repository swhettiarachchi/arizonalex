import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase-auth';

// Agora token generation — stub for now, will integrate Agora SDK directly
export async function GET(req: NextRequest) {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const channelName = req.nextUrl.searchParams.get('channelName');
        const uid = req.nextUrl.searchParams.get('uid');

        if (!channelName) {
            return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
        }

        // TODO: Generate Agora token using agora-access-token package
        // For now, return a placeholder token
        return NextResponse.json({
            success: true,
            token: 'placeholder-token',
            channelName,
            uid: uid || '0',
            message: 'Agora token generation pending — integrate agora-access-token package',
        });
    } catch {
        return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
    }
}
