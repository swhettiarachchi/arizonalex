import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized — please log in' }, { status: 401 });
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        const { userId, username, action } = body;
        const admin = createAdminClient();

        // Resolve target user ID
        let targetId = userId;
        if (!targetId && username) {
            const { data: target, error: lookupErr } = await admin
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();
            if (lookupErr || !target) {
                return NextResponse.json({ success: false, error: `User @${username} not found` }, { status: 404 });
            }
            targetId = target.id;
        }

        if (!targetId) {
            return NextResponse.json({ success: false, error: 'No user specified' }, { status: 400 });
        }
        if (targetId === user.id) {
            return NextResponse.json({ success: false, error: 'Cannot follow yourself' }, { status: 400 });
        }

        // Check current follow status
        const { data: existing, error: checkErr } = await admin
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', targetId)
            .maybeSingle();

        if (checkErr) {
            console.error('Follow check error:', checkErr);
            return NextResponse.json({ success: false, error: 'Database error checking follow status' }, { status: 500 });
        }

        const shouldUnfollow = action === 'unfollow' || (existing && action !== 'follow');

        if (shouldUnfollow) {
            // ── UNFOLLOW ──
            if (existing) {
                const { error: delErr } = await admin.from('follows').delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', targetId);

                if (delErr) {
                    console.error('Unfollow delete error:', delErr);
                    return NextResponse.json({ success: false, error: 'Failed to unfollow' }, { status: 500 });
                }

                // Decrement counts (best-effort, don't fail the request)
                try {
                    const { data: myProfile } = await admin.from('profiles').select('following_count').eq('id', user.id).single();
                    const { data: theirProfile } = await admin.from('profiles').select('followers_count').eq('id', targetId).single();
                    await admin.from('profiles').update({ following_count: Math.max(0, (myProfile?.following_count || 1) - 1) }).eq('id', user.id);
                    await admin.from('profiles').update({ followers_count: Math.max(0, (theirProfile?.followers_count || 1) - 1) }).eq('id', targetId);
                } catch (e) {
                    console.error('Count decrement error (non-fatal):', e);
                }
            }

            return NextResponse.json({ success: true, following: false });
        } else {
            // ── FOLLOW ──
            if (!existing) {
                const { error: insertErr } = await admin.from('follows').insert({
                    follower_id: user.id,
                    following_id: targetId,
                });

                if (insertErr) {
                    console.error('Follow insert error:', insertErr);
                    // Check for unique constraint violation (already following)
                    if (insertErr.code === '23505') {
                        return NextResponse.json({ success: true, following: true });
                    }
                    return NextResponse.json({ success: false, error: 'Failed to follow: ' + insertErr.message }, { status: 500 });
                }

                // Increment counts (best-effort)
                try {
                    const { data: myProfile } = await admin.from('profiles').select('following_count').eq('id', user.id).single();
                    const { data: theirProfile } = await admin.from('profiles').select('followers_count').eq('id', targetId).single();
                    await admin.from('profiles').update({ following_count: (myProfile?.following_count || 0) + 1 }).eq('id', user.id);
                    await admin.from('profiles').update({ followers_count: (theirProfile?.followers_count || 0) + 1 }).eq('id', targetId);
                } catch (e) {
                    console.error('Count increment error (non-fatal):', e);
                }

                // Send notification (best-effort)
                try {
                    await admin.from('notifications').insert({
                        recipient_id: targetId,
                        actor_id: user.id,
                        type: 'follow',
                        body: 'started following you',
                    });
                } catch (e) {
                    console.error('Notification insert error (non-fatal):', e);
                }
            }

            return NextResponse.json({ success: true, following: true });
        }
    } catch (err) {
        console.error('Follow route unhandled error:', err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

// GET: Check if current user follows a target user
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ following: false });

        const targetId = req.nextUrl.searchParams.get('userId');
        const username = req.nextUrl.searchParams.get('username');

        const admin = createAdminClient();
        let resolvedId = targetId;

        if (!resolvedId && username) {
            const { data: target } = await admin.from('profiles').select('id').eq('username', username).single();
            resolvedId = target?.id || null;
        }

        if (!resolvedId) return NextResponse.json({ following: false });

        const { data: existing } = await admin
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', resolvedId)
            .maybeSingle();

        return NextResponse.json({ following: !!existing });
    } catch {
        return NextResponse.json({ following: false });
    }
}
