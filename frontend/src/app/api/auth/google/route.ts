import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function POST(req: NextRequest) {
    try {
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json(
                { error: 'Google credential is required' },
                { status: 400 }
            );
        }

        const admin = createAdminClient();

        // Verify Google token and sign in via Supabase
        const { data, error } = await admin.auth.signInWithIdToken({
            provider: 'google',
            token: credential,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        if (!data.user || !data.session) {
            return NextResponse.json(
                { error: 'Google authentication failed' },
                { status: 401 }
            );
        }


        // Check if profile exists
        const { data: existingProfile } = await admin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        let profile = existingProfile;

        // Create profile if it doesn't exist (first-time Google sign-in)
        if (!profile) {
            const email = data.user.email || '';
            const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0];
            const avatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '';

            // Generate unique username from email
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

            const { data: newProfile } = await admin
                .from('profiles')
                .insert({
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
                })
                .select()
                .single();

            profile = newProfile;

            // Create wallet for new user
            await admin.from('wallets').insert({
                user_id: data.user.id,
                balance: 100,
                currency: 'AZC',
            });
        }

        const user = {
            id: data.user.id,
            name: profile?.display_name || '',
            email: data.user.email || '',
            username: profile?.username || '',
            avatar: profile?.avatar_url || '',
            bio: profile?.bio || '',
            role: profile?.role || 'citizen',
            verified: profile?.is_verified || false,
            party: '',
            followersCount: profile?.followers_count || 0,
            followingCount: profile?.following_count || 0,
        };

        const response = NextResponse.json({ success: true, user });

        // Set session cookies
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
    } catch {
        return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
    }
}
