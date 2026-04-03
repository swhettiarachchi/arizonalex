import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = createAdminClient();
        const { data: polls, error } = await admin
            .from('polls')
            .select('*, profiles!polls_creator_id_fkey(id, username, display_name, avatar_url, role, is_verified)')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

        // Get options for each poll
        const enriched = await Promise.all((polls || []).map(async (poll) => {
            const { data: options } = await admin
                .from('poll_options')
                .select('*')
                .eq('poll_id', poll.id);

            const profile = poll.profiles as Record<string, unknown> | null;
            return {
                _id: poll.id, id: poll.id, question: poll.question,
                category: poll.category, totalVotes: poll.total_votes,
                isFeatured: poll.is_featured, isLive: poll.is_live, endsAt: poll.ends_at,
                creator: profile ? { name: profile.display_name, username: profile.username, avatar: profile.avatar_url } : null,
                options: (options || []).map(o => ({ _id: o.id, id: o.id, label: o.label, votes: o.votes_count })),
                createdAt: poll.created_at,
            };
        }));

        return NextResponse.json({ success: true, polls: enriched });
    } catch {
        return NextResponse.json({ success: false, message: 'Failed to fetch polls' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const admin = createAdminClient();

        // Vote on a poll
        if (body.pollId && body.optionId) {
            const { data: existing } = await admin
                .from('poll_votes')
                .select('*')
                .eq('user_id', user.id)
                .eq('poll_id', body.pollId)
                .single();

            if (existing) return NextResponse.json({ success: false, message: 'Already voted' }, { status: 400 });

            await admin.from('poll_votes').insert({ user_id: user.id, poll_id: body.pollId, option_id: body.optionId });

            // Increment option votes
            const { data: opt } = await admin.from('poll_options').select('votes_count').eq('id', body.optionId).single();
            await admin.from('poll_options').update({ votes_count: (opt?.votes_count || 0) + 1 }).eq('id', body.optionId);

            // Increment total votes
            const { data: poll } = await admin.from('polls').select('total_votes').eq('id', body.pollId).single();
            await admin.from('polls').update({ total_votes: (poll?.total_votes || 0) + 1 }).eq('id', body.pollId);

            return NextResponse.json({ success: true, message: 'Vote recorded' });
        }

        // Create a new poll
        if (body.question && body.options) {
            const { data: poll, error } = await admin
                .from('polls')
                .insert({ creator_id: user.id, question: body.question, category: body.category || null })
                .select()
                .single();

            if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

            const optionInserts = body.options.map((label: string) => ({ poll_id: poll.id, label, votes_count: 0 }));
            await admin.from('poll_options').insert(optionInserts);

            return NextResponse.json({ success: true, poll }, { status: 201 });
        }

        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    } catch {
        return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
    }
}
