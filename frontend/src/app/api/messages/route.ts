import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/messages — list conversations
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        // Get conversations where user is a participant
        const { data: participations } = await admin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (!participations || participations.length === 0) {
            return NextResponse.json({ success: true, conversations: [] });
        }

        const convIds = participations.map(p => p.conversation_id);

        // Get conversations with their participants
        const { data: conversations, error } = await admin
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Enrich each conversation with participant profiles and last message
        const enriched = await Promise.all((conversations || []).map(async (conv) => {
            // Get participants
            const { data: parts } = await admin
                .from('conversation_participants')
                .select('user_id, last_read_at')
                .eq('conversation_id', conv.id);

            const participantIds = parts?.map(p => p.user_id) || [];

            // Get participant profiles
            const { data: profiles } = await admin
                .from('profiles')
                .select('id, username, display_name, avatar_url, role, is_verified')
                .in('id', participantIds);

            // Get last message  
            const { data: lastMessages } = await admin
                .from('messages')
                .select('content, sender_id, created_at, is_deleted')
                .eq('conversation_id', conv.id)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .limit(1);

            const lastMsg = lastMessages?.[0];

            // Count unread messages
            const myParticipation = parts?.find(p => p.user_id === user.id);
            const lastReadAt = myParticipation?.last_read_at || '1970-01-01T00:00:00Z';

            const { count: unreadCount } = await admin
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .neq('sender_id', user.id)
                .gt('created_at', lastReadAt)
                .eq('is_deleted', false);

            return {
                _id: conv.id,
                id: conv.id,
                type: participantIds.length > 2 ? 'group' : 'dm',
                participants: (profiles || []).map(p => ({
                    _id: p.id,
                    id: p.id,
                    name: p.display_name || p.username,
                    username: p.username,
                    avatar: p.avatar_url || '',
                    role: p.role,
                    verified: p.is_verified,
                })),
                lastMessage: lastMsg?.is_deleted ? 'This message was deleted' : (lastMsg?.content || ''),
                lastMessageAt: lastMsg?.created_at || conv.updated_at,
                lastMessageBy: lastMsg?.sender_id ? { _id: lastMsg.sender_id } : null,
                unread: unreadCount || 0,
                isPinned: false,
                isMuted: false,
                isArchived: false,
                updatedAt: conv.updated_at,
            };
        }));

        // Sort by last message time
        enriched.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        return NextResponse.json({ success: true, conversations: enriched });
    } catch (err) {
        console.error('Messages GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

// POST /api/messages — create conversation / send DM
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { participantId, username, content } = await req.json();
        const admin = createAdminClient();

        let targetId = participantId;

        // Resolve username to ID if needed
        if (username && !targetId) {
            const { data: target } = await admin
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            targetId = target.id;
        }

        if (!targetId) return NextResponse.json({ error: 'participantId or username required' }, { status: 400 });

        // Check for existing DM conversation
        const { data: myConvs } = await admin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        const { data: theirConvs } = await admin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', targetId);

        let existingConvId: string | null = null;
        if (myConvs && theirConvs) {
            const mySet = new Set(myConvs.map(c => c.conversation_id));
            for (const c of theirConvs) {
                if (mySet.has(c.conversation_id)) {
                    // Check it's a DM (2 participants)
                    const { count } = await admin
                        .from('conversation_participants')
                        .select('*', { count: 'exact', head: true })
                        .eq('conversation_id', c.conversation_id);
                    if (count === 2) {
                        existingConvId = c.conversation_id;
                        break;
                    }
                }
            }
        }

        let conversationId = existingConvId;

        if (!conversationId) {
            // Create new conversation
            const { data: conv, error: convErr } = await admin
                .from('conversations')
                .insert({ updated_at: new Date().toISOString() })
                .select()
                .single();

            if (convErr || !conv) {
                return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
            }

            conversationId = conv.id;

            // Add participants
            await admin.from('conversation_participants').insert([
                { conversation_id: conversationId, user_id: user.id },
                { conversation_id: conversationId, user_id: targetId },
            ]);
        }

        // Send initial message if provided
        if (content) {
            await admin.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content,
            });

            await admin.from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId);
        }

        // Return populated conversation
        const { data: participants } = await admin
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId);

        const { data: profiles } = await admin
            .from('profiles')
            .select('id, username, display_name, avatar_url, role, is_verified')
            .in('id', (participants || []).map(p => p.user_id));

        return NextResponse.json({
            success: true,
            conversation: {
                _id: conversationId,
                id: conversationId,
                type: 'dm',
                participants: (profiles || []).map(p => ({
                    _id: p.id,
                    id: p.id,
                    name: p.display_name || p.username,
                    username: p.username,
                    avatar: p.avatar_url || '',
                    role: p.role,
                    verified: p.is_verified,
                })),
            },
        }, { status: 201 });
    } catch (err) {
        console.error('Messages POST error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
