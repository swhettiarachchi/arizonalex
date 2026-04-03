import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { userId, username, action } = await req.json();
        const admin = createAdminClient();

        // Resolve target user ID
        let targetId = userId;
        if (!targetId && username) {
            const { data: target } = await admin
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();
            if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            targetId = target.id;
        }

        if (!targetId) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (targetId === user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

        // Check current follow status
        const { data: existing } = await admin
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', targetId)
            .single();

        if (action === 'unfollow' || (existing && action !== 'follow')) {
            // Unfollow
            if (existing) {
                await admin.from('follows').delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', targetId);

                // Decrement counts
                await admin.from('profiles')
                    .update({ following_count: Math.max(0, 0) }) // Will be handled by trigger ideally
                    .eq('id', user.id);

                // Decrement follower count via raw update
                const { data: myProfile } = await admin.from('profiles').select('following_count').eq('id', user.id).single();
                const { data: theirProfile } = await admin.from('profiles').select('followers_count').eq('id', targetId).single();

                await admin.from('profiles').update({ following_count: Math.max(0, (myProfile?.following_count || 1) - 1) }).eq('id', user.id);
                await admin.from('profiles').update({ followers_count: Math.max(0, (theirProfile?.followers_count || 1) - 1) }).eq('id', targetId);
            }

            return NextResponse.json({ success: true, following: false });
        } else {
            // Follow
            if (!existing) {
                await admin.from('follows').insert({
                    follower_id: user.id,
                    following_id: targetId,
                });

                // Increment counts
                const { data: myProfile } = await admin.from('profiles').select('following_count').eq('id', user.id).single();
                const { data: theirProfile } = await admin.from('profiles').select('followers_count').eq('id', targetId).single();

                await admin.from('profiles').update({ following_count: (myProfile?.following_count || 0) + 1 }).eq('id', user.id);
                await admin.from('profiles').update({ followers_count: (theirProfile?.followers_count || 0) + 1 }).eq('id', targetId);

                // Notify the followed user
                await admin.from('notifications').insert({
                    recipient_id: targetId,
                    actor_id: user.id,
                    type: 'follow',
                    body: 'started following you',
                });
            }

            return NextResponse.json({ success: true, following: true });
        }
    } catch (err) {
        console.error('Follow error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
