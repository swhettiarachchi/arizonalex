import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/debates — list debates
export async function GET(req: NextRequest) {
    try {
        const admin = createAdminClient();
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const category = url.searchParams.get('category');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
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

        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category', category);

        const { data: debates, count, error } = await query;

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        const serialized = (debates || []).map(d => ({
            _id: d.id,
            id: d.id,
            title: d.title,
            description: d.description || '',
            topic: d.title,
            category: d.category || 'other',
            status: d.status,
            scope: d.scope,
            creator: d.creator,
            sideA: {
                user: d.side_a,
                label: d.side_a_label || 'For',
                votes: d.side_a_votes,
            },
            sideB: {
                user: d.side_b,
                label: d.side_b_label || 'Against',
                votes: d.side_b_votes,
            },
            winnerSide: d.winner_side,
            scheduledAt: d.scheduled_at,
            startedAt: d.started_at,
            endedAt: d.ended_at,
            createdAt: d.created_at,
        }));

        return NextResponse.json({
            success: true,
            debates: serialized,
            total: count || 0,
            page,
        });
    } catch (err) {
        console.error('Debates GET error:', err);
        return NextResponse.json({ success: false, message: 'Failed to fetch debates' }, { status: 500 });
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

        return NextResponse.json({ success: true, debate }, { status: 201 });
    } catch (err) {
        console.error('Debates POST error:', err);
        return NextResponse.json({ success: false, message: 'Failed to create debate' }, { status: 500 });
    }
}
