import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password, username, name, bio, role } = await req.json();

        if (!email || !password || !username || !name) {
            return NextResponse.json(
                { error: 'Name, email, username, and password are required' },
                { status: 400 }
            );
        }

        const admin = createAdminClient();

        // ── Smart Auth: Check if email already exists ──
        const { data: userList } = await admin.auth.admin.listUsers();
        const existingAuthUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (existingAuthUser) {
            const provider = existingAuthUser.app_metadata?.provider;
            if (provider === 'google') {
                return NextResponse.json(
                    {
                        error: 'This email is already registered with Google. Please login with Google instead.',
                        errorType: 'provider_mismatch',
                        provider: 'google',
                    },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login instead.' },
                { status: 409 }
            );
        }

        // Check if username is taken
        const { data: existing } = await admin
            .from('profiles')
            .select('id')
            .eq('username', username.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Username is already taken' },
                { status: 400 }
            );
        }

        // Create auth user
        const { data: authData, error: authError } = await admin.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name,
                    username: username.toLowerCase(),
                },
            },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // Create profile
        const { error: profileError } = await admin
            .from('profiles')
            .insert({
                id: authData.user.id,
                username: username.toLowerCase(),
                display_name: name,
                bio: bio || null,
                role: role || 'citizen',
                is_verified: false,
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

        if (profileError) {
            console.error('Profile creation error:', profileError);
        }

        // Create wallet
        await admin.from('wallets').insert({
            user_id: authData.user.id,
            balance: 100,
            currency: 'AZC',
        });

        const user = {
            id: authData.user.id,
            name,
            email,
            username: username.toLowerCase(),
            avatar: '',
            bio: bio || '',
            role: role || 'citizen',
            verified: false,
        };

        const response = NextResponse.json({ success: true, user });

        if (authData.session) {
            response.cookies.set('sb-access-token', authData.session.access_token, {
                httpOnly: true, path: '/', maxAge: 60 * 60, sameSite: 'lax',
            });
            response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
                httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
            });
            response.cookies.set('user-id', authData.user.id, {
                path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
            });
        }

        return response;
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
