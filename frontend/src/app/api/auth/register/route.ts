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

        // Create auth user in Supabase Auth
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
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Create profile in profiles table
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

        // Create wallet for new user
        await admin.from('wallets').insert({
            user_id: authData.user.id,
            balance: 100, // Starting credits
            currency: 'AZC',
        });

        // Build response with auth cookies
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

        // Set Supabase session cookies
        if (authData.session) {
            response.cookies.set('sb-access-token', authData.session.access_token, {
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60,
                sameSite: 'lax',
            });
            response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax',
            });
            // Legacy cookie for backward compatibility
            response.cookies.set('user-id', authData.user.id, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax',
            });
        }

        return response;
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
