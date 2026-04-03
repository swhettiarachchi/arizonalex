import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message === 'Invalid login credentials'
                    ? 'Invalid credentials'
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
        const admin = createAdminClient();
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

        // Set Supabase session cookies
        response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60,
            sameSite: 'lax',
        });
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });
        response.cookies.set('user-id', data.user.id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
    }
}
