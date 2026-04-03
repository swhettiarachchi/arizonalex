import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const next = url.searchParams.get('next') || '/';

        if (!code) {
            return NextResponse.redirect(new URL('/login?error=no_code', req.url));
        }

        // Create a fresh Supabase client to exchange the code
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user || !data.session) {
            console.error('OAuth callback error:', error);
            return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
        }

        const admin = createAdminClient();

        // Check if profile exists
        const { data: existingProfile } = await admin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // Create profile if first-time OAuth sign-in
        if (!existingProfile) {
            const email = data.user.email || '';
            const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0];
            const avatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '';

            // Generate unique username
            let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 25);
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
                id: data.user.id,
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

            // Create wallet for new user
            await admin.from('wallets').insert({
                user_id: data.user.id,
                balance: 100,
                currency: 'AZC',
            });
        }

        // Set session cookies and redirect
        const response = NextResponse.redirect(new URL(next, req.url));

        response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true, path: '/', maxAge: 60 * 60, sameSite: 'lax',
        });
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
        });
        response.cookies.set('user-id', data.user.id, {
            path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
        });

        return response;
    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(new URL('/login?error=server_error', req.url));
    }
}
