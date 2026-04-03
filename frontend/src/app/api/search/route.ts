import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get('q');
        if (!q) return NextResponse.json({ success: true, results: { users: [], posts: [] } });

        const admin = createAdminClient();

        // Search users
        const { data: users } = await admin
            .from('profiles')
            .select('id, username, display_name, avatar_url, role, is_verified, bio')
            .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
            .limit(10);

        // Search posts
        const { data: posts } = await admin
            .from('posts')
            .select('id, content, post_type, created_at, author_id, likes_count, replies_count, reposts_count, profiles!posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified)')
            .ilike('content', `%${q}%`)
            .eq('is_hidden', false)
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            success: true,
            results: {
                users: (users || []).map(u => ({
                    _id: u.id, id: u.id, name: u.display_name || u.username,
                    username: u.username, avatar: u.avatar_url || '',
                    role: u.role, verified: u.is_verified, bio: u.bio || '',
                })),
                posts: (posts || []).map(p => {
                    const profile = p.profiles as Record<string, unknown> | null;
                    return {
                        id: p.id, content: p.content, type: p.post_type,
                        author: profile ? { name: profile.display_name, username: profile.username, avatar: profile.avatar_url } : null,
                        likes: p.likes_count, comments: p.replies_count, reposts: p.reposts_count,
                    };
                }),
            },
        });
    } catch {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
