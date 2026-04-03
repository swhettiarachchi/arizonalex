import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/debates/[id] or /api/debates/[id]/messages etc
export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const { path } = await params;
    const subpath = path ? path.join('/') : '';

    const admin = createAdminClient();

    // Single debate: /api/debates/[id]
    if (subpath && !subpath.includes('/')) {
        const debateId = subpath;

        const { data: debate, error } = await admin
            .from('debates')
            .select(`
                *,
                creator:profiles!debates_creator_id_fkey(id, username, display_name, avatar_url, role, is_verified),
                side_a:profiles!debates_side_a_user_id_fkey(id, username, display_name, avatar_url),
                side_b:profiles!debates_side_b_user_id_fkey(id, username, display_name, avatar_url)
            `)
            .eq('id', debateId)
            .single();

        if (error || !debate) {
            return NextResponse.json({ success: false, message: 'Debate not found' }, { status: 404 });
        }

        // Get debate arguments/messages
        let args = null;
        try {
            const res = await admin
                .from('debate_arguments')
                .select('*, author:profiles!debate_arguments_author_id_fkey(id, username, display_name, avatar_url)')
                .eq('debate_id', debateId)
                .order('created_at', { ascending: true });
            args = res.data;
        } catch { /* table may not exist */ }

        return NextResponse.json({
            success: true,
            debate: {
                ...debate,
                messages: args || [],
            },
        });
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}

// POST /api/debates/[id]/join or /api/debates/[id]/vote etc
export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const { path } = await params;
    if (!path || path.length === 0) {
        return NextResponse.json({ success: false, message: 'Invalid path' }, { status: 400 });
    }

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const debateId = path[0];
    const action = path[1]; // join, vote, message, start, end

    const { data: debate } = await admin.from('debates').select('*').eq('id', debateId).single();
    if (!debate) return NextResponse.json({ success: false, message: 'Debate not found' }, { status: 404 });

    if (action === 'join') {
        if (debate.side_b_user_id) {
            return NextResponse.json({ success: false, message: 'Debate is full' }, { status: 400 });
        }

        await admin.from('debates').update({
            side_b_user_id: user.id,
            status: 'live',
            started_at: new Date().toISOString(),
        }).eq('id', debateId);

        return NextResponse.json({ success: true, message: 'Joined debate' });
    }

    if (action === 'vote') {
        const { side } = await req.json();
        if (!side || !['a', 'b'].includes(side)) {
            return NextResponse.json({ success: false, message: 'Invalid side' }, { status: 400 });
        }

        // Check if already voted
        const { data: existingVote } = await admin
            .from('debate_votes')
            .select('*')
            .eq('debate_id', debateId)
            .eq('voter_id', user.id)
            .maybeSingle();

        if (existingVote) {
            return NextResponse.json({ success: false, message: 'Already voted' }, { status: 400 });
        }

        await admin.from('debate_votes').insert({
            debate_id: debateId,
            voter_id: user.id,
            side,
        });

        // Increment vote count
        if (side === 'a') {
            await admin.from('debates').update({ side_a_votes: debate.side_a_votes + 1 }).eq('id', debateId);
        } else {
            await admin.from('debates').update({ side_b_votes: debate.side_b_votes + 1 }).eq('id', debateId);
        }

        return NextResponse.json({ success: true, message: 'Vote recorded' });
    }

    if (action === 'message') {
        const { content } = await req.json();
        if (!content) return NextResponse.json({ success: false, message: 'Content required' }, { status: 400 });

        await admin.from('debate_arguments').insert({
            debate_id: debateId,
            author_id: user.id,
            content,
            side: debate.side_a_user_id === user.id ? 'a' : 'b',
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
}
