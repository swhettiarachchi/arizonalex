import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// ── Serialize a Supabase debate row into the shape the frontend Debate type expects ──
function serializeDebate(d: Record<string, unknown>) {
    const creator = d.creator as Record<string, unknown> | null;
    const sideA = d.side_a as Record<string, unknown> | null;
    const sideB = d.side_b as Record<string, unknown> | null;

    return {
        _id: d.id,
        id: d.id,
        title: d.title || '',
        description: d.description || '',
        topic: d.description || d.title || '',
        category: d.category || 'other',
        mode: 'text' as const,
        status: d.status || 'waiting',
        scope: d.scope || 'public',

        // Creator — map to the shape DebateCard expects
        creator: creator ? {
            _id: creator.id,
            id: creator.id,
            name: creator.display_name || creator.username || 'Unknown',
            username: creator.username || '',
            avatar: creator.avatar_url || '',
            role: creator.role || 'citizen',
            verified: creator.is_verified || false,
        } : { _id: '', id: '', name: 'Unknown', username: '', avatar: '', role: 'citizen', verified: false },

        // Opponent (side B)
        opponent: sideB ? {
            _id: sideB.id,
            id: sideB.id,
            name: sideB.display_name || sideB.username || '',
            username: sideB.username || '',
            avatar: sideB.avatar_url || '',
            role: 'citizen',
            verified: false,
        } : null,

        // Financials
        entryFee: (d.entry_fee as number) || 0,
        prizePool: ((d.entry_fee as number) || 0) * 2,
        platformFee: 0,

        // Timing
        duration: (d.duration as number) || 15,
        votingDuration: (d.voting_duration as number) || 5,
        startedAt: d.started_at || null,
        endedAt: d.ended_at || null,
        votingDeadline: null,

        // Participants / spectators
        spectators: [],
        spectatorCount: (d.spectator_count as number) || 0,
        maxSpectators: 100,

        // Winner
        winner: d.winner_side ? (d.winner_side === 'a' ? (creator ? {
            _id: creator.id, id: creator.id,
            name: creator.display_name || creator.username || '',
            username: creator.username || '', avatar: creator.avatar_url || '',
            role: creator.role || 'citizen', verified: creator.is_verified || false,
        } : null) : (sideB ? {
            _id: sideB.id, id: sideB.id,
            name: sideB.display_name || sideB.username || '',
            username: sideB.username || '', avatar: sideB.avatar_url || '',
            role: 'citizen', verified: false,
        } : null)) : null,
        isDraw: false,

        // Tags & metadata
        tags: (d.tags as string[]) || [],
        difficulty: (d.difficulty as string) || 'beginner',
        country: (d.country as string) || '',
        countries: (d.countries as string[]) || [],
        language: (d.language as string) || 'English',
        debateType: (d.debate_type as string) || '1v1',
        isGlobal: (d.scope === 'public'),

        // Analytics
        viewCount: (d.view_count as number) || 0,
        featured: (d.featured as boolean) || false,
        messages: [],

        // Voting
        voteCounts: {
            a: d.side_a_votes || 0,
            b: d.side_b_votes || 0,
        },
        totalVotes: ((d.side_a_votes as number) || 0) + ((d.side_b_votes as number) || 0),

        // Timestamps
        createdAt: d.created_at || new Date().toISOString(),
        updatedAt: d.created_at || new Date().toISOString(),
    };
}

// GET /api/debates — list debates with full filtering
export async function GET(req: NextRequest) {
    try {
        const admin = createAdminClient();
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const category = url.searchParams.get('category');
        const difficulty = url.searchParams.get('difficulty');
        const searchQuery = url.searchParams.get('search');
        const language = url.searchParams.get('language');
        const debateType = url.searchParams.get('debateType');
        const entryFeeType = url.searchParams.get('entryFeeType');
        const country = url.searchParams.get('country');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        let query = admin
            .from('debates')
            .select(`
                *,
                creator:profiles!debates_creator_id_fkey(id, username, display_name, avatar_url, role, is_verified),
                side_a:profiles!debates_side_a_user_id_fkey(id, username, display_name, avatar_url),
                side_b:profiles!debates_side_b_user_id_fkey(id, username, display_name, avatar_url)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status && status !== 'all') query = query.eq('status', status);
        if (category && category !== 'all') query = query.eq('category', category);
        if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

        const { data: debates, count, error } = await query;

        if (error) {
            return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
        }

        const serialized = (debates || []).map(d => serializeDebate(d));

        // The frontend expects `data` key
        return NextResponse.json({
            success: true,
            data: serialized,
            total: count || 0,
            page,
        });
    } catch (err) {
        console.error('Debates GET error:', err);
        return NextResponse.json({ success: false, message: 'Failed to fetch debates', data: [] }, { status: 500 });
    }
}

// POST /api/debates — create debate
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { title, description, category, scope, sideALabel, sideBLabel, entryFee } = await req.json();

        if (!title) {
            return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data: debate, error } = await admin
            .from('debates')
            .insert({
                creator_id: user.id,
                title,
                description: description || null,
                category: category || 'other',
                status: 'waiting',
                scope: scope || 'public',
                side_a_user_id: user.id,
                side_a_label: sideALabel || 'For',
                side_b_label: sideBLabel || 'Against',
                side_a_votes: 0,
                side_b_votes: 0,
            })
            .select(`
                *,
                creator:profiles!debates_creator_id_fkey(id, username, display_name, avatar_url, role, is_verified)
            `)
            .single();

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        // Hold entry fee in escrow if specified
        if (entryFee && entryFee > 0) {
            const { data: wallet } = await admin
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (wallet && wallet.balance >= entryFee) {
                await admin.from('wallets').update({ balance: wallet.balance - entryFee }).eq('id', wallet.id);

                await admin.from('wallet_transactions').insert({
                    wallet_id: wallet.id,
                    type: 'entry_fee',
                    amount: entryFee,
                    balance_after: wallet.balance - entryFee,
                    description: `Entry fee for debate: ${title}`,
                    entity_type: 'debate',
                    entity_id: debate.id,
                });
            }
        }

        return NextResponse.json({ success: true, data: { ...debate, _id: debate.id } }, { status: 201 });
    } catch (err) {
        console.error('Debates POST error:', err);
        return NextResponse.json({ success: false, message: 'Failed to create debate' }, { status: 500 });
    }
}
