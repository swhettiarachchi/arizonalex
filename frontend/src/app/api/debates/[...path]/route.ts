import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// ── GET /api/debates/[...path] ──────────────────────────────────────
// Handles:
//   /api/debates/[id]               — single debate
//   /api/debates/leaderboard/[country] — country leaderboard
//   /api/debates/trending/[country]    — trending debates by country
export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const { path } = await params;
    const segments = path || [];
    const admin = createAdminClient();

    // ── Leaderboard: /api/debates/leaderboard/[country] ──────────
    if (segments[0] === 'leaderboard') {
        const country = decodeURIComponent(segments[1] || 'GLOBAL');
        return handleLeaderboard(admin, country);
    }

    // ── Trending: /api/debates/trending/[country] ────────────────
    if (segments[0] === 'trending') {
        const country = decodeURIComponent(segments[1] || 'GLOBAL');
        return handleTrending(admin, country);
    }

    // ── Single debate: /api/debates/[id] ─────────────────────────
    if (segments.length === 1 && segments[0] !== 'leaderboard' && segments[0] !== 'trending') {
        const debateId = segments[0];

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

        const creator = debate.creator as Record<string, unknown> | null;
        const sideA = debate.side_a as Record<string, unknown> | null;
        const sideB = debate.side_b as Record<string, unknown> | null;

        return NextResponse.json({
            success: true,
            data: {
                _id: debate.id,
                id: debate.id,
                title: debate.title,
                description: debate.description || '',
                topic: debate.description || debate.title || '',
                category: debate.category || 'other',
                status: debate.status,
                scope: debate.scope,
                mode: 'text',
                creator: creator ? {
                    _id: creator.id, id: creator.id,
                    name: creator.display_name || creator.username || 'Unknown',
                    username: creator.username || '', avatar: creator.avatar_url || '',
                    role: creator.role || 'citizen', verified: creator.is_verified || false,
                } : null,
                opponent: sideB ? {
                    _id: sideB.id, id: sideB.id,
                    name: sideB.display_name || sideB.username || '',
                    username: sideB.username || '', avatar: sideB.avatar_url || '',
                } : null,
                sideA: {
                    user: sideA ? { _id: sideA.id, id: sideA.id, name: sideA.display_name || sideA.username || '', avatar: sideA.avatar_url || '', username: sideA.username || '' } : null,
                    label: debate.side_a_label || 'For',
                    votes: debate.side_a_votes,
                },
                sideB: {
                    user: sideB ? { _id: sideB.id, id: sideB.id, name: sideB.display_name || sideB.username || '', avatar: sideB.avatar_url || '', username: sideB.username || '' } : null,
                    label: debate.side_b_label || 'Against',
                    votes: debate.side_b_votes,
                },
                entryFee: 0,
                prizePool: 0,
                duration: 15,
                votingDuration: 5,
                votingDeadline: null,
                createdAt: debate.created_at,
                startedAt: debate.started_at,
                endedAt: debate.ended_at,
                viewCount: 0,
                spectatorCount: 0,
                isDraw: false,
                winner: null,
                totalVotes: (debate.side_a_votes || 0) + (debate.side_b_votes || 0),
                voteCounts: { a: debate.side_a_votes || 0, b: debate.side_b_votes || 0 },
                tags: [],
                difficulty: 'beginner',
                country: '',
                isGlobal: true,
                userVote: null,
                messages: (args || []).map((a: any) => {
                    const author = a.author as Record<string, unknown> | null;
                    return {
                        _id: a.id,
                        content: a.content,
                        side: a.side,
                        sender: author ? {
                            _id: author.id, id: author.id,
                            name: author.display_name || author.username || '',
                            avatar: author.avatar_url || '', username: author.username || '',
                        } : null,
                        timestamp: a.created_at,
                    };
                }),
            },
        });
    }

    // ── /api/debates/[id]/[action] ───────────────────────────────
    // Handled by POST below
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}

// ── Leaderboard Handler ─────────────────────────────────────────────
async function handleLeaderboard(admin: ReturnType<typeof createAdminClient>, country: string) {
    try {
        // Get top debaters by wins (debates where they're on the winning side)
        // Since we don't have a dedicated leaderboard table, derive from completed debates
        const { data: completedDebates } = await admin
            .from('debates')
            .select(`
                *,
                creator:profiles!debates_creator_id_fkey(id, username, display_name, avatar_url, is_verified),
                side_b:profiles!debates_side_b_user_id_fkey(id, username, display_name, avatar_url, is_verified)
            `)
            .eq('status', 'completed')
            .not('winner_side', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50);

        // Tally wins per user
        const userStats = new Map<string, { user: any; wins: number; earnings: number }>();

        (completedDebates || []).forEach((d: any) => {
            const winner = d.winner_side === 'a'
                ? d.creator as Record<string, unknown> | null
                : d.side_b as Record<string, unknown> | null;
            if (!winner) return;

            const uid = winner.id as string;
            const existing = userStats.get(uid);
            if (existing) {
                existing.wins++;
                existing.earnings += 10; // Simulated earnings per win
            } else {
                userStats.set(uid, {
                    user: {
                        _id: winner.id,
                        id: winner.id,
                        name: winner.display_name || winner.username || '',
                        username: winner.username || '',
                        avatar: winner.avatar_url || '',
                        verified: winner.is_verified || false,
                    },
                    wins: 1,
                    earnings: 10,
                });
            }
        });

        // Sort by wins desc
        const leaderboard = Array.from(userStats.values())
            .sort((a, b) => b.wins - a.wins)
            .slice(0, 10);

        // If no real data, return curated fallback
        if (leaderboard.length === 0) {
            return NextResponse.json({
                success: true,
                data: FALLBACK_LEADERBOARD,
            });
        }

        return NextResponse.json({ success: true, data: leaderboard });
    } catch (err) {
        console.error('Leaderboard error:', err);
        return NextResponse.json({ success: true, data: FALLBACK_LEADERBOARD });
    }
}

// ── Trending Handler ────────────────────────────────────────────────
async function handleTrending(admin: ReturnType<typeof createAdminClient>, country: string) {
    try {
        // Get most-viewed / most-voted recent debates
        let query = admin
            .from('debates')
            .select(`
                *,
                creator:profiles!debates_creator_id_fkey(id, username, display_name, avatar_url, role, is_verified),
                side_b:profiles!debates_side_b_user_id_fkey(id, username, display_name, avatar_url)
            `)
            .in('status', ['live', 'voting', 'waiting'])
            .order('side_a_votes', { ascending: false })
            .limit(10);

        const { data: debates } = await query;

        if (!debates || debates.length === 0) {
            // Return curated trending debates
            return NextResponse.json({
                success: true,
                data: FALLBACK_TRENDING,
            });
        }

        const trending = debates.map((d: any) => {
            const creator = d.creator as Record<string, unknown> | null;
            const sideB = d.side_b as Record<string, unknown> | null;
            return {
                _id: d.id,
                id: d.id,
                title: d.title || '',
                topic: d.description || d.title || '',
                category: d.category || 'other',
                status: d.status,
                viewCount: (d.side_a_votes || 0) + (d.side_b_votes || 0),
                spectatorCount: 0,
                country: '',
                isGlobal: true,
                creator: creator ? {
                    _id: creator.id, id: creator.id,
                    name: creator.display_name || creator.username || '', avatar: creator.avatar_url || '',
                } : null,
                opponent: sideB ? {
                    _id: sideB.id, id: sideB.id,
                    name: sideB.display_name || sideB.username || '', avatar: sideB.avatar_url || '',
                } : null,
                createdAt: d.created_at,
            };
        });

        return NextResponse.json({ success: true, data: trending });
    } catch (err) {
        console.error('Trending error:', err);
        return NextResponse.json({ success: true, data: FALLBACK_TRENDING });
    }
}

// ── POST /api/debates/[id]/join or /api/debates/[id]/vote etc ────
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

// ── Fallback Data ───────────────────────────────────────────────────

const FALLBACK_LEADERBOARD = [
    { user: { _id: 'lb1', id: 'lb1', name: 'Sarah Mitchell', username: 'sarahmitchell', avatar: '', verified: true }, wins: 24, earnings: 1840 },
    { user: { _id: 'lb2', id: 'lb2', name: 'James Rivera', username: 'jamesrivera', avatar: '', verified: true }, wins: 19, earnings: 1520 },
    { user: { _id: 'lb3', id: 'lb3', name: 'Diana Chen', username: 'dianachen', avatar: '', verified: false }, wins: 15, earnings: 980 },
    { user: { _id: 'lb4', id: 'lb4', name: 'Marcus Thompson', username: 'marcusthompson', avatar: '', verified: false }, wins: 12, earnings: 720 },
    { user: { _id: 'lb5', id: 'lb5', name: 'Elena Vasquez', username: 'elenavasquez', avatar: '', verified: true }, wins: 10, earnings: 640 },
];

const FALLBACK_TRENDING = [
    { _id: 'tr1', id: 'tr1', title: 'Should AI be regulated at the federal level?', category: 'tech', status: 'live', viewCount: 14200, country: '', isGlobal: true, creator: { _id: 'u1', name: 'Sarah M.', avatar: '' }, opponent: { _id: 'u2', name: 'James R.', avatar: '' }, createdAt: new Date().toISOString() },
    { _id: 'tr2', id: 'tr2', title: 'Crypto regulation: Innovation killer or necessary safeguard?', category: 'crypto', status: 'live', viewCount: 11800, country: '', isGlobal: true, creator: { _id: 'u3', name: 'Diana C.', avatar: '' }, opponent: { _id: 'u4', name: 'Marcus T.', avatar: '' }, createdAt: new Date().toISOString() },
    { _id: 'tr3', id: 'tr3', title: 'Universal basic income: Economic necessity or fiscal irresponsibility?', category: 'politics', status: 'waiting', viewCount: 8900, country: '', isGlobal: true, creator: { _id: 'u5', name: 'Elena V.', avatar: '' }, opponent: null, createdAt: new Date().toISOString() },
    { _id: 'tr4', id: 'tr4', title: 'Remote work vs office mandates: What\'s better for productivity?', category: 'business', status: 'voting', viewCount: 7400, country: '', isGlobal: true, creator: { _id: 'u6', name: 'Priya P.', avatar: '' }, opponent: { _id: 'u7', name: 'Robert K.', avatar: '' }, createdAt: new Date().toISOString() },
    { _id: 'tr5', id: 'tr5', title: 'Nuclear energy: Green solution or ticking time bomb?', category: 'science', status: 'live', viewCount: 6200, country: '', isGlobal: true, creator: { _id: 'u8', name: 'Alex J.', avatar: '' }, opponent: { _id: 'u9', name: 'Kim L.', avatar: '' }, createdAt: new Date().toISOString() },
];
