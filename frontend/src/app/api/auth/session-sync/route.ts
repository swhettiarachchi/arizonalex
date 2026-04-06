import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase-auth';

const DEFAULT_AVATAR = '/default-avatar.svg';

export async function POST(req: NextRequest) {
    try {
        const { access_token, refresh_token } = await req.json();

        if (!access_token || !refresh_token) {
            return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
        }

        // Verify the access token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);

        if (userError || !user) {
            console.error('Token verification failed:', userError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const admin = createAdminClient();
        const userEmail = user.email || '';

        // ── Smart Auth: Check for provider conflicts ──
        if (userEmail) {
            const { data: allUsers } = await admin.auth.admin.listUsers();
            const emailUser = allUsers?.users?.find(
                (u) => u.email?.toLowerCase() === userEmail.toLowerCase() && u.id !== user.id
            );

            if (emailUser) {
                const emailProvider = emailUser.app_metadata?.provider;
                if (emailProvider === 'email') {
                    return NextResponse.json({
                        error: 'This email is already registered with email/password. Please login with your password.',
                        errorType: 'provider_mismatch',
                        provider: 'email',
                    }, { status: 403 });
                }
            }
        }

        // Check if profile exists for this user
        const { data: existingProfile } = await admin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (existingProfile) {
            // Existing user — just log them in
            const response = NextResponse.json({ success: true });
            response.cookies.set('sb-access-token', access_token, {
                httpOnly: true, path: '/', maxAge: 60 * 60, sameSite: 'lax',
            });
            response.cookies.set('sb-refresh-token', refresh_token, {
                httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
            });
            response.cookies.set('user-id', user.id, {
                path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
            });
            return response;
        }

        // ── New user — create profile ──
        const name = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
        const avatar = googleAvatar || DEFAULT_AVATAR;

        // Generate unique username
        let baseUsername = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 25);
        let username = baseUsername;
        let counter = 1;
        let taken = true;

        while (taken) {
            const { data: check } = await admin
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (!check) {
                taken = false;
            } else {
                username = `${baseUsername.substring(0, 25)}${counter}`;
                counter++;
            }
        }

        await admin.from('profiles').insert({
            id: user.id,
            username,
            display_name: name,
            avatar_url: avatar,
            role: 'citizen',
            is_verified: true,
            trust_score: 0,
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            profile_views: 0,
            total_likes: 0,
            total_reposts: 0,
            is_active: true,
            theme_preference: 'dark',
        });

        // Create wallet
        await admin.from('wallets').insert({
            user_id: user.id,
            balance: 100,
            currency: 'AZC',
        });

        // Set session cookies
        const response = NextResponse.json({ success: true, isNewUser: true });
        response.cookies.set('sb-access-token', access_token, {
            httpOnly: true, path: '/', maxAge: 60 * 60, sameSite: 'lax',
        });
        response.cookies.set('sb-refresh-token', refresh_token, {
            httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
        });
        response.cookies.set('user-id', user.id, {
            path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
        });

        return response;
    } catch (err) {
        console.error('Session sync error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
