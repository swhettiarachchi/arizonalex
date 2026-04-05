import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        const admin = createAdminClient();

        // ── Smart Auth: Check if this email was registered with Google ──
        const { data: userList } = await admin.auth.admin.listUsers();
        const existingAuthUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (existingAuthUser) {
            // Use Supabase's built-in provider tracking
            const provider = existingAuthUser.app_metadata?.provider;
            const providers = existingAuthUser.app_metadata?.providers || [];

            // If user was created via Google OAuth (not email)
            if (provider === 'google' || (providers.includes('google') && !providers.includes('email'))) {
                return NextResponse.json(
                    {
                        error: 'This account was created using Google. Please login with Google.',
                        errorType: 'provider_mismatch',
                        provider: 'google',
                    },
                    { status: 403 }
                );
            }
        }

        // ── Standard email/password login ──
        const { data, error } = await admin.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message === 'Invalid login credentials'
                    ? 'Invalid email or password'
                    : error.message },
                { status: 401 }
            );
        }

        if (!data.user || !data.session) {
            return NextResponse.json(
                { error: 'Login failed' },
                { status: 401 }
            );
        }

        // Fetch user profile
        const { data: profile } = await admin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const user = {
            id: data.user.id,
            name: profile?.display_name || data.user.user_metadata?.display_name || '',
            email: data.user.email || '',
            username: profile?.username || '',
            avatar: profile?.avatar_url || '',
            bio: profile?.bio || '',
            role: profile?.role || 'citizen',
            verified: profile?.is_verified || false,
            party: '',
            followersCount: profile?.followers_count || 0,
            followingCount: profile?.following_count || 0,
            twoFactorEnabled: false,
        };

        const response = NextResponse.json({ success: true, user });

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
