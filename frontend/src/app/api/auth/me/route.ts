import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getUserProfile } from '@/lib/supabase-auth';

// ── Role-specific metadata stored as JSON in the `profession` column ──
// The Supabase profiles table doesn't have dedicated columns for party,
// position, ideology, etc. We store all extended data as a JSON object
// in the existing `profession` text column. On read, we parse it.
// On write, we serialize it. This avoids needing schema migrations.

interface RoleMetadata {
    party?: string;
    position?: string;
    ideology?: string;
    yearsActive?: string;
    country?: string;
    campaignPromises?: string[];
    achievements?: string[];
    supportPercentage?: number;
    company?: string;
    industry?: string;
    services?: string[];
    portfolioUrl?: string;
    phone?: string;
}

function parseRoleMetadata(profession: string | null): RoleMetadata {
    if (!profession) return {};
    try {
        // If profession starts with '{', treat as JSON metadata
        if (profession.trim().startsWith('{')) {
            return JSON.parse(profession) as RoleMetadata;
        }
    } catch {
        // Not valid JSON, ignore
    }
    return {};
}

function serializeRoleMetadata(meta: RoleMetadata): string {
    return JSON.stringify(meta);
}

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Fetch full profile
        const profile = await getUserProfile(user.id);

        const authProvider = user.app_metadata?.provider === 'google' ? 'google' : 'email';

        // Parse role-specific metadata from the profession column
        const meta = parseRoleMetadata(profile?.profession || null);

        return NextResponse.json({
            user: {
                id: user.id,
                name: profile?.display_name || user.user_metadata?.display_name || '',
                email: user.email || '',
                username: profile?.username || '',
                avatar: profile?.avatar_url || '/default-avatar.svg',
                banner: (profile as any)?.cover_url || '',
                bio: profile?.bio || '',
                role: profile?.role || 'citizen',
                verified: profile?.is_verified || false,
                location: profile?.location || '',
                website: profile?.website || '',
                followersCount: profile?.followers_count || 0,
                followingCount: profile?.following_count || 0,
                postsCount: profile?.posts_count || 0,
                profileViews: profile?.profile_views || 0,
                twoFactorEnabled: false,
                authProvider,
                trustScore: profile?.trust_score || 0,
                // Role-specific fields from metadata
                party: meta.party || '',
                phone: meta.phone || '',
                position: meta.position || '',
                ideology: meta.ideology || '',
                yearsActive: meta.yearsActive || '',
                country: meta.country || '',
                campaignPromises: meta.campaignPromises || [],
                achievements: meta.achievements || [],
                supportPercentage: meta.supportPercentage,
                company: meta.company || '',
                industry: meta.industry || '',
                services: meta.services || [],
                portfolioUrl: meta.portfolioUrl || '',
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
            console.error('PATCH /api/auth/me: No authenticated user found');
            return NextResponse.json({ error: 'Unauthorized — please log in again' }, { status: 401 });
        }

        let updates: Record<string, unknown>;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        console.log('PATCH /api/auth/me: Updating profile for user', user.id, 'with keys:', Object.keys(updates));

        const { createAdminClient } = await import('@/lib/supabase-auth');
        const admin = createAdminClient();

        // First, fetch the current profile to get existing metadata
        const { data: currentProfile, error: fetchErr } = await admin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (fetchErr) {
            console.error('PATCH /api/auth/me: Failed to fetch current profile:', fetchErr);
            return NextResponse.json({ error: 'Failed to load current profile: ' + fetchErr.message }, { status: 500 });
        }

        // Parse existing role metadata
        const existingMeta = parseRoleMetadata(currentProfile?.profession || null);

        // Build updated role metadata by merging with existing
        const newMeta: RoleMetadata = { ...existingMeta };
        if (updates.party !== undefined) newMeta.party = updates.party as string;
        if (updates.position !== undefined) newMeta.position = updates.position as string;
        if (updates.ideology !== undefined) newMeta.ideology = updates.ideology as string;
        if (updates.yearsActive !== undefined) newMeta.yearsActive = updates.yearsActive as string;
        if (updates.country !== undefined) newMeta.country = updates.country as string;
        if (updates.campaignPromises !== undefined) newMeta.campaignPromises = updates.campaignPromises as string[];
        if (updates.achievements !== undefined) newMeta.achievements = updates.achievements as string[];
        if (updates.supportPercentage !== undefined) newMeta.supportPercentage = updates.supportPercentage as number;
        if (updates.company !== undefined) newMeta.company = updates.company as string;
        if (updates.industry !== undefined) newMeta.industry = updates.industry as string;
        if (updates.services !== undefined) newMeta.services = updates.services as string[];
        if (updates.portfolioUrl !== undefined) newMeta.portfolioUrl = updates.portfolioUrl as string;
        if (updates.phone !== undefined) newMeta.phone = updates.phone as string;

        // Map frontend field names to database column names
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.display_name = updates.name;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.website !== undefined) dbUpdates.website = updates.website;
        if (updates.role !== undefined) dbUpdates.role = updates.role;

        // Handle avatar — if it's a data URL, store it directly (or skip if too large)
        if (updates.avatar !== undefined) {
            const avatar = updates.avatar as string;
            if (avatar && avatar.startsWith('data:') && avatar.length > 2_000_000) {
                console.warn('PATCH /api/auth/me: Avatar too large, skipping');
            } else {
                dbUpdates.avatar_url = avatar || null;
            }
        }
        if (updates.banner !== undefined) {
            const banner = updates.banner as string;
            if (banner && banner.startsWith('data:') && banner.length > 2_000_000) {
                console.warn('PATCH /api/auth/me: Banner too large, skipping');
            } else {
                dbUpdates.cover_url = banner || null;
            }
        }

        // Store ALL role-specific data as JSON in the profession column
        dbUpdates.profession = serializeRoleMetadata(newMeta);

        // Pass through any already-correct column names
        if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
        if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
        if (updates.cover_url !== undefined) dbUpdates.cover_url = updates.cover_url;

        console.log('PATCH /api/auth/me: DB update payload keys:', Object.keys(dbUpdates));

        const { data: profile, error } = await admin
            .from('profiles')
            .update(dbUpdates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error('PATCH /api/auth/me: Profile update error:', error);
            return NextResponse.json({ error: 'Profile update failed: ' + error.message }, { status: 400 });
        }

        console.log('PATCH /api/auth/me: Profile updated successfully for', user.id);

        // Parse the saved metadata back for the response
        const savedMeta = parseRoleMetadata(profile.profession);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: profile.display_name || '',
                email: user.email || '',
                username: profile.username,
                avatar: profile.avatar_url || '/default-avatar.svg',
                banner: (profile as any).cover_url || '',
                bio: profile.bio || '',
                role: profile.role,
                verified: profile.is_verified,
                location: profile.location || '',
                website: profile.website || '',
                followersCount: profile.followers_count || 0,
                followingCount: profile.following_count || 0,
                postsCount: profile.posts_count || 0,
                profileViews: profile.profile_views || 0,
                trustScore: profile.trust_score || 0,
                // Role metadata
                party: savedMeta.party || '',
                phone: savedMeta.phone || '',
                position: savedMeta.position || '',
                ideology: savedMeta.ideology || '',
                yearsActive: savedMeta.yearsActive || '',
                country: savedMeta.country || '',
                campaignPromises: savedMeta.campaignPromises || [],
                achievements: savedMeta.achievements || [],
                supportPercentage: savedMeta.supportPercentage,
                company: savedMeta.company || '',
                industry: savedMeta.industry || '',
                services: savedMeta.services || [],
                portfolioUrl: savedMeta.portfolioUrl || '',
            },
        });
    } catch (err) {
        console.error('PATCH /api/auth/me: Unhandled error:', err);
        return NextResponse.json({ error: 'Server error — please try again' }, { status: 500 });
    }
}

