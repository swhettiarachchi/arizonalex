import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET groups — same as conversations but filtered for 3+ participants
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        const { data: parts } = await admin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (!parts || parts.length === 0) return NextResponse.json({ success: true, groups: [] });

        // Count participants per conversation to find groups (3+)
        const groups = [];
        for (const p of parts) {
            const { count } = await admin
                .from('conversation_participants')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', p.conversation_id);

            if (count && count >= 3) {
                const { data: conv } = await admin.from('conversations').select('*').eq('id', p.conversation_id).single();
                const { data: members } = await admin
                    .from('conversation_participants')
                    .select('user_id')
                    .eq('conversation_id', p.conversation_id);

                const { data: profiles } = await admin
                    .from('profiles')
                    .select('id, username, display_name, avatar_url, role, is_verified')
                    .in('id', (members || []).map(m => m.user_id));

                groups.push({
                    _id: p.conversation_id, id: p.conversation_id,
                    type: 'group', name: `Group (${count} members)`,
                    participants: profiles || [],
                    memberCount: count,
                    updatedAt: conv?.updated_at,
                });
            }
        }

        return NextResponse.json({ success: true, groups });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
}

// POST — create a group conversation
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { participantIds, name } = await req.json();
        if (!participantIds || participantIds.length < 2) {
            return NextResponse.json({ error: 'At least 2 participants required' }, { status: 400 });
        }

        const admin = createAdminClient();
        const allParticipants = [user.id, ...participantIds.filter((id: string) => id !== user.id)];

        const { data: conv, error } = await admin
            .from('conversations')
            .insert({ updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error || !conv) return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });

        await admin.from('conversation_participants').insert(
            allParticipants.map((id: string) => ({ conversation_id: conv.id, user_id: id }))
        );

        return NextResponse.json({
            success: true,
            group: { _id: conv.id, id: conv.id, type: 'group', name: name || `Group (${allParticipants.length} members)` },
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
