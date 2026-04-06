import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getUserProfile } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Fetch full profile
        const profile = await getUserProfile(user.id);

        const authProvider = user.app_metadata?.provider === 'google' ? 'google' : 'email';

        return NextResponse.json({
            user: {
                id: user.id,
                name: profile?.display_name || user.user_metadata?.display_name || '',
                email: user.email || '',
                username: profile?.username || '',
                avatar: profile?.avatar_url || '/default-avatar.svg',
                bio: profile?.bio || '',
                role: profile?.role || 'citizen',
                verified: profile?.is_verified || false,
                party: '',
                location: profile?.location || '',
                website: profile?.website || '',
                followersCount: profile?.followers_count || 0,
                followingCount: profile?.following_count || 0,
                postsCount: profile?.posts_count || 0,
                profileViews: profile?.profile_views || 0,
                twoFactorEnabled: false,
                authProvider,
            },
        });
    } catch {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await req.json();

        // Map frontend field names to database column names
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.display_name = updates.name;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
        if (updates.banner !== undefined) dbUpdates.cover_url = updates.banner;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.website !== undefined) dbUpdates.website = updates.website;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
        // Pass through any already-correct column names
        if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
        if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
        if (updates.cover_url !== undefined) dbUpdates.cover_url = updates.cover_url;

        const { createAdminClient } = await import('@/lib/supabase-auth');
        const admin = createAdminClient();

        const { data: profile, error } = await admin
            .from('profiles')
            .update(dbUpdates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: profile.display_name || '',
                email: user.email || '',
                username: profile.username,
                avatar: profile.avatar_url || '',
                bio: profile.bio || '',
                role: profile.role,
                verified: profile.is_verified,
            },
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
