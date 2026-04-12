import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, createAdminClient } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        cookies: {
            'sb-access-token': req.cookies.get('sb-access-token')?.value ? '***present***' : 'MISSING',
            'sb-refresh-token': req.cookies.get('sb-refresh-token')?.value ? '***present***' : 'MISSING',
            'user-id': req.cookies.get('user-id')?.value || 'MISSING',
        },
        env: {
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***set***' : 'MISSING',
            SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***set***' : 'MISSING',
            SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***set***' : 'MISSING',
        },
    };

    // Test 1: Auth user resolution
    try {
        const user = await getAuthUser(req);
        results.authUser = user ? { id: user.id, email: user.email || '(none)' } : 'NULL - not authenticated';
    } catch (e: any) {
        results.authUser = `ERROR: ${e.message}`;
    }

    // Test 2: Admin client DB connection
    try {
        const admin = createAdminClient();
        const { data, error } = await admin.from('profiles').select('id, username').limit(2);
        if (error) {
            results.dbConnection = `ERROR: ${error.message} (code: ${error.code})`;
        } else {
            results.dbConnection = `OK - found ${data?.length || 0} profiles`;
            results.sampleProfiles = data?.map(p => ({ id: p.id?.substring(0, 8) + '...', username: p.username }));
        }
    } catch (e: any) {
        results.dbConnection = `ERROR: ${e.message}`;
    }

    // Test 3: Check follows table exists
    try {
        const admin = createAdminClient();
        const { data, error } = await admin.from('follows').select('follower_id').limit(1);
        if (error) {
            results.followsTable = `ERROR: ${error.message} (code: ${error.code})`;
        } else {
            results.followsTable = `OK - table exists (${data?.length || 0} rows sampled)`;
        }
    } catch (e: any) {
        results.followsTable = `ERROR: ${e.message}`;
    }

    // Test 4: Check notifications table
    try {
        const admin = createAdminClient();
        const { data, error } = await admin.from('notifications').select('id').limit(1);
        if (error) {
            results.notificationsTable = `ERROR: ${error.message} (code: ${error.code})`;
        } else {
            results.notificationsTable = `OK - table exists`;
        }
    } catch (e: any) {
        results.notificationsTable = `ERROR: ${e.message}`;
    }

    // Test 5: If authenticated, try a test follow operation (dry run)
    const user = await getAuthUser(req).catch(() => null);
    if (user) {
        try {
            const admin = createAdminClient();
            // Get a target user to test with
            const { data: targets } = await admin
                .from('profiles')
                .select('id, username')
                .neq('id', user.id)
                .limit(1);

            if (targets && targets.length > 0) {
                const targetId = targets[0].id;
                // Check if follow exists
                const { data: existing, error: checkErr } = await admin
                    .from('follows')
                    .select('follower_id')
                    .eq('follower_id', user.id)
                    .eq('following_id', targetId)
                    .maybeSingle();

                results.followTest = {
                    status: checkErr ? `CHECK_ERROR: ${checkErr.message}` : 'OK',
                    target: targets[0].username,
                    currentlyFollowing: !!existing,
                };
            } else {
                results.followTest = 'No other users to test with';
            }
        } catch (e: any) {
            results.followTest = `ERROR: ${e.message}`;
        }
    } else {
        results.followTest = 'SKIPPED - not authenticated';
    }

    return NextResponse.json(results, { status: 200 });
}
