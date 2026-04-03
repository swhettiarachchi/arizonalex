import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/messages/[id] — get messages in a conversation
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: conversationId } = await params;
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        // Verify user is a participant
        const { data: participation } = await admin
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id)
            .single();

        if (!participation) {
            return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Get messages
        const { data: messages, error } = await admin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get sender profiles
        const senderIds = [...new Set((messages || []).map(m => m.sender_id))];
        const { data: profiles } = await admin
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', senderIds.length > 0 ? senderIds : ['none']);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        // Enrich messages with sender info
        const enriched = (messages || []).map(msg => {
            const sender = profileMap.get(msg.sender_id);
            return {
                _id: msg.id,
                id: msg.id,
                content: msg.content,
                type: 'text',
                sender: sender ? {
                    _id: sender.id,
                    id: sender.id,
                    name: sender.display_name || sender.username,
                    username: sender.username,
                    avatar: sender.avatar_url || '',
                } : { _id: msg.sender_id, id: msg.sender_id },
                conversation: conversationId,
                status: 'seen',
                createdAt: msg.created_at,
                read: true,
            };
        });

        // Mark messages as read — update last_read_at
        await admin
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id);

        // Get conversation data
        const { data: conv } = await admin
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        return NextResponse.json({
            success: true,
            messages: enriched,
            conversation: conv,
        });
    } catch (err) {
        console.error('Messages GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST /api/messages/[id] — send a message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: conversationId } = await params;
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        // Verify user is a participant
        const { data: participation } = await admin
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id)
            .single();

        if (!participation) {
            return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
        }

        const { content = '', type = 'text', mediaUrl = '' } = await req.json();

        // Insert message
        const { data: message, error } = await admin
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content,
                media_url: mediaUrl || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update conversation timestamp
        await admin
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        // Get sender profile
        const { data: profile } = await admin
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', user.id)
            .single();

        const enriched = {
            _id: message.id,
            id: message.id,
            content: message.content,
            type,
            sender: profile ? {
                _id: profile.id,
                id: profile.id,
                name: profile.display_name || profile.username,
                username: profile.username,
                avatar: profile.avatar_url || '',
            } : { _id: user.id, id: user.id },
            conversation: conversationId,
            status: 'sent',
            createdAt: message.created_at,
        };

        return NextResponse.json({ success: true, message: enriched }, { status: 201 });
    } catch (err) {
        console.error('Messages POST error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
