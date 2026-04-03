import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();

    const { data: existing } = await admin
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', id)
        .single();

    if (existing) {
        await admin.from('likes').delete().eq('user_id', user.id).eq('post_id', id);
        const { data: post } = await admin.from('posts').select('likes_count').eq('id', id).single();
        const newCount = Math.max(0, (post?.likes_count || 1) - 1);
        await admin.from('posts').update({ likes_count: newCount }).eq('id', id);
        return NextResponse.json({ success: true, liked: false, likes: newCount });
    } else {
        await admin.from('likes').insert({ user_id: user.id, post_id: id });
        const { data: post } = await admin.from('posts').select('likes_count, author_id').eq('id', id).single();
        const newCount = (post?.likes_count || 0) + 1;
        await admin.from('posts').update({ likes_count: newCount }).eq('id', id);

        if (post && post.author_id !== user.id) {
            await admin.from('notifications').insert({
                recipient_id: post.author_id, actor_id: user.id,
                type: 'like', entity_type: 'post', entity_id: id, body: 'liked your post',
            });
        }

        return NextResponse.json({ success: true, liked: true, likes: newCount });
    }
}
