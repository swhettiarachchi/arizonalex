import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase-auth';

// AI generation endpoint — stub for now, will integrate with external AI service
export async function POST(req: NextRequest) {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        // TODO: Integrate with OpenAI, Anthropic, or other AI service
        return NextResponse.json({
            success: true,
            generated: `AI-assisted content for: ${body.prompt || 'unknown prompt'}`,
            message: 'AI service integration pending',
        });
    } catch {
        return NextResponse.json({ error: 'AI service connection failed' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: true,
        status: 'pending',
        message: 'AI service integration pending — no backend required',
    });
}
