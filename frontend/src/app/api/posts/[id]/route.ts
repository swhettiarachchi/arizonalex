import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// PUT /api/posts/[id] — like, bookmark, repost, or update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const admin = createAdminClient();

        // Handle like action
        if (body.action === 'like') {
            const { data: existing } = await admin
                .from('likes')
                .select('*')
                .eq('user_id', user.id)
                .eq('post_id', id)
                .single();

            if (existing) {
                await admin.from('likes').delete().eq('user_id', user.id).eq('post_id', id);
                // Decrement likes_count
                const { data: post } = await admin.from('posts').select('likes_count').eq('id', id).single();
                await admin.from('posts').update({ likes_count: Math.max(0, (post?.likes_count || 1) - 1) }).eq('id', id);
                return NextResponse.json({ success: true, liked: false, likes: Math.max(0, (post?.likes_count || 1) - 1) });
            } else {
                await admin.from('likes').insert({ user_id: user.id, post_id: id });
                const { data: post } = await admin.from('posts').select('likes_count, author_id').eq('id', id).single();
                await admin.from('posts').update({ likes_count: (post?.likes_count || 0) + 1 }).eq('id', id);

                // Notify post author
                if (post && post.author_id !== user.id) {
                    await admin.from('notifications').insert({
                        recipient_id: post.author_id,
                        actor_id: user.id,
                        type: 'like',
                        entity_type: 'post',
                        entity_id: id,
                        body: 'liked your post',
                    });
                }

                return NextResponse.json({ success: true, liked: true, likes: (post?.likes_count || 0) + 1 });
            }
        }

        // Handle bookmark action
        if (body.action === 'bookmark') {
            const { data: existing } = await admin
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .eq('post_id', id)
                .single();

            if (existing) {
                await admin.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', id);
                return NextResponse.json({ success: true, bookmarked: false });
            } else {
                await admin.from('bookmarks').insert({ user_id: user.id, post_id: id });
                return NextResponse.json({ success: true, bookmarked: true });
            }
        }

        // Handle repost action
        if (body.action === 'repost') {
            const { data: existing } = await admin
                .from('reposts')
                .select('*')
                .eq('user_id', user.id)
                .eq('post_id', id)
                .single();

            if (existing) {
                await admin.from('reposts').delete().eq('user_id', user.id).eq('post_id', id);
                const { data: post } = await admin.from('posts').select('reposts_count').eq('id', id).single();
                await admin.from('posts').update({ reposts_count: Math.max(0, (post?.reposts_count || 1) - 1) }).eq('id', id);
                return NextResponse.json({ success: true, reposted: false, reposts: Math.max(0, (post?.reposts_count || 1) - 1) });
            } else {
                await admin.from('reposts').insert({ user_id: user.id, post_id: id });
                const { data: post } = await admin.from('posts').select('reposts_count, author_id').eq('id', id).single();
                await admin.from('posts').update({ reposts_count: (post?.reposts_count || 0) + 1 }).eq('id', id);

                if (post && post.author_id !== user.id) {
                    await admin.from('notifications').insert({
                        recipient_id: post.author_id,
                        actor_id: user.id,
                        type: 'repost',
                        entity_type: 'post',
                        entity_id: id,
                        body: 'reposted your post',
                    });
                }

                return NextResponse.json({ success: true, reposted: true, reposts: (post?.reposts_count || 0) + 1 });
            }
        }

        // Default: update post content
        const { data: post } = await admin.from('posts').select('author_id').eq('id', id).single();
        if (!post || post.author_id !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const updates: Record<string, unknown> = {};
        if (body.content !== undefined) updates.content = body.content;
        if (body.type !== undefined) updates.post_type = body.type;
        if (body.images !== undefined) updates.media_urls = body.images;

        const { data: updated, error } = await admin
            .from('posts')
            .update(updates)
            .eq('id', id)
            .select('*, profiles!posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified)')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true, post: updated });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

// DELETE /api/posts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        const { data: post } = await admin.from('posts').select('author_id').eq('id', id).single();
        if (!post || post.author_id !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Delete related data
        await Promise.all([
            admin.from('likes').delete().eq('post_id', id),
            admin.from('bookmarks').delete().eq('post_id', id),
            admin.from('reposts').delete().eq('post_id', id),
            admin.from('post_hashtags').delete().eq('post_id', id),
        ]);

        await admin.from('posts').delete().eq('id', id);

        return NextResponse.json({ success: true, message: 'Post deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
