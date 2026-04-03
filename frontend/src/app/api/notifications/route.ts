import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/notifications — list user notifications
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '30');
        const offset = (page - 1) * limit;

        const { data: notifications, error, count } = await admin
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get actor profiles
        const actorIds = [...new Set((notifications || []).map(n => n.actor_id).filter(Boolean))] as string[];
        const { data: profiles } = await admin
            .from('profiles')
            .select('id, username, display_name, avatar_url, role, is_verified')
            .in('id', actorIds.length > 0 ? actorIds : ['none']);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        const enriched = (notifications || []).map(n => {
            const actor = n.actor_id ? profileMap.get(n.actor_id) : null;
            return {
                id: n.id,
                _id: n.id,
                type: n.type,
                content: n.body || '',
                read: n.is_read,
                timestamp: formatTimestamp(n.created_at),
                createdAt: n.created_at,
                entityType: n.entity_type,
                entityId: n.entity_id,
                actor: actor ? {
                    _id: actor.id,
                    id: actor.id,
                    name: actor.display_name || actor.username,
                    username: actor.username,
                    avatar: actor.avatar_url || '',
                } : null,
            };
        });

        // Count unread
        const { count: unreadCount } = await admin
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('is_read', false);

        return NextResponse.json({
            success: true,
            notifications: enriched,
            total: count || 0,
            unreadCount: unreadCount || 0,
            page,
        });
    } catch (err) {
        console.error('Notifications GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

function formatTimestamp(dateStr: string) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
