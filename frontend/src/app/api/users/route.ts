import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// ── GET /api/users ──────────────────────────────────────────────────
// Supports: ?limit=N  ?username=<exact>  ?role=<role>  ?q=<search>
// Returns users from the Supabase `profiles` table with mock fallback
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const limitParam = url.searchParams.get('limit');
        const usernameParam = url.searchParams.get('username');
        const roleParam = url.searchParams.get('role');
        const searchParam = url.searchParams.get('q');
        const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 20;

        const admin = createAdminClient();

        // ── Single user lookup by username ────────────────────────
        if (usernameParam) {
            const { data: profile, error } = await admin
                .from('profiles')
                .select('*')
                .eq('username', usernameParam)
                .single();

            if (error || !profile) {
                return NextResponse.json({ success: false, users: [], error: 'User not found' }, { status: 404 });
            }

            const user = serializeProfile(profile);
            return NextResponse.json({ success: true, users: [user], user });
        }

        // ── List users ───────────────────────────────────────────
        let query = admin
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('is_active', true)
            .order('followers_count', { ascending: false })
            .limit(limit);

        // Filter by role
        if (roleParam) {
            query = query.eq('role', roleParam);
        }

        // Text search on display_name, username, bio
        if (searchParam) {
            query = query.or(`display_name.ilike.%${searchParam}%,username.ilike.%${searchParam}%,bio.ilike.%${searchParam}%`);
        }

        const { data: profiles, count, error } = await query;

        if (error) {
            console.error('Users query error:', error);
            return NextResponse.json({ success: false, users: [], error: error.message }, { status: 500 });
        }

        // Check if authenticated user is following any of these users
        const currentUser = await getAuthUser(req);
        let followingIds = new Set<string>();

        if (currentUser && profiles && profiles.length > 0) {
            const { data: follows } = await admin
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUser.id)
                .in('following_id', profiles.map(p => p.id));
            if (follows) {
                followingIds = new Set(follows.map(f => f.following_id));
            }
        }

        const users = (profiles || []).map(p => ({
            ...serializeProfile(p),
            isFollowedByMe: followingIds.has(p.id),
        }));

        return NextResponse.json({
            success: true,
            users,
            total: count || users.length,
        });
    } catch (err) {
        console.error('Users GET error:', err);
        return NextResponse.json({ success: false, users: [], error: 'Failed to fetch users' }, { status: 500 });
    }
}

// ── Serialize a Supabase profile row into the shape the frontend expects ──
function serializeProfile(p: Record<string, unknown>) {
    // Parse the extended metadata JSON field if it exists
    const meta = (typeof p.metadata === 'object' && p.metadata !== null)
        ? p.metadata as Record<string, unknown>
        : {};

    return {
        id: p.id,
        _id: p.id,
        name: p.display_name || p.username || '',
        username: p.username || '',
        avatar: p.avatar_url || '',
        banner: p.cover_url || '',
        bio: p.bio || '',
        role: p.role || 'citizen',
        verified: p.is_verified || false,
        party: meta.party || '',
        followers: p.followers_count || 0,
        following: p.following_count || 0,
        joined: formatJoinDate(p.joined_at as string),
        // Political fields
        position: meta.position || '',
        ideology: meta.ideology || '',
        yearsActive: meta.yearsActive || '',
        country: (p.location as string) || meta.country || '',
        campaignPromises: meta.campaignPromises || [],
        achievements: meta.achievements || [],
        // Business fields
        company: meta.company || '',
        industry: meta.industry || '',
        services: meta.services || [],
        portfolioUrl: meta.portfolioUrl || '',
        // Analytics
        profileViews: p.profile_views || 0,
        supportPercentage: meta.supportPercentage || 0,
    };
}

function formatJoinDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return '';
    }
}
