import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const q = url.searchParams.get('q');
        if (!q) return NextResponse.json({ success: true, results: [] });

        const admin = createAdminClient();

        // Get user's conversations
        const { data: parts } = await admin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (!parts || parts.length === 0) return NextResponse.json({ success: true, results: [] });
        const convIds = parts.map(p => p.conversation_id);

        // Search messages in user's conversations
        const { data: messages } = await admin
            .from('messages')
            .select('*, profiles:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
            .in('conversation_id', convIds)
            .ilike('content', `%${q}%`)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(20);

        return NextResponse.json({
            success: true,
            results: (messages || []).map(m => ({
                _id: m.id, content: m.content, conversationId: m.conversation_id,
                sender: m.profiles, createdAt: m.created_at,
            })),
        });
    } catch {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
