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
                banner: (profile as any)?.cover_url || '',
                bio: profile?.bio || '',
                role: profile?.role || 'citizen',
                verified: profile?.is_verified || false,
                party: (profile as any)?.party || '',
                location: profile?.location || '',
                website: profile?.website || '',
                phone: (profile as any)?.phone || '',
                followersCount: profile?.followers_count || 0,
                followingCount: profile?.following_count || 0,
                postsCount: profile?.posts_count || 0,
                profileViews: profile?.profile_views || 0,
                twoFactorEnabled: false,
                authProvider,
                // Political fields
                position: (profile as any)?.position || '',
                ideology: (profile as any)?.ideology || '',
                yearsActive: (profile as any)?.years_active || '',
                country: (profile as any)?.country || '',
                campaignPromises: (profile as any)?.campaign_promises || [],
                achievements: (profile as any)?.achievements || [],
                supportPercentage: (profile as any)?.support_percentage,
                // Business fields
                company: (profile as any)?.company || '',
                industry: (profile as any)?.industry || '',
                services: (profile as any)?.services || [],
                portfolioUrl: (profile as any)?.portfolio_url || '',
                // Verification fields
                faceVerified: (profile as any)?.face_verified || false,
                verificationScore: (profile as any)?.verification_score || 0,
                trustScore: profile?.trust_score || 0,
                identityLevel: (profile as any)?.identity_level || 'normal',
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

        // Basic profile fields
        if (updates.name !== undefined) dbUpdates.display_name = updates.name;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
        if (updates.banner !== undefined) dbUpdates.cover_url = updates.banner;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.website !== undefined) dbUpdates.website = updates.website;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;

        // Political fields
        if (updates.party !== undefined) dbUpdates.party = updates.party;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        if (updates.ideology !== undefined) dbUpdates.ideology = updates.ideology;
        if (updates.yearsActive !== undefined) dbUpdates.years_active = updates.yearsActive;
        if (updates.country !== undefined) dbUpdates.country = updates.country;
        if (updates.campaignPromises !== undefined) dbUpdates.campaign_promises = updates.campaignPromises;
        if (updates.achievements !== undefined) dbUpdates.achievements = updates.achievements;

        // Business fields
        if (updates.company !== undefined) dbUpdates.company = updates.company;
        if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
        if (updates.services !== undefined) dbUpdates.services = updates.services;
        if (updates.portfolioUrl !== undefined) dbUpdates.portfolio_url = updates.portfolioUrl;

        // Pass through any already-correct column names
        if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
        if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
        if (updates.cover_url !== undefined) dbUpdates.cover_url = updates.cover_url;

        const { createAdminClient } = await import('@/lib/supabase-auth');
        const admin = createAdminClient();

        const { data: profile, error } = await (admin
            .from('profiles') as any)
            .update(dbUpdates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Profile update error:', error);
            // If columns don't exist yet, update only the basic ones
            const basicUpdates: Record<string, unknown> = {};
            for (const key of ['display_name', 'bio', 'avatar_url', 'cover_url', 'location', 'website', 'role']) {
                if (dbUpdates[key] !== undefined) basicUpdates[key] = dbUpdates[key];
            }

            const { data: fallbackProfile, error: fallbackError } = await admin
                .from('profiles')
                .update(basicUpdates)
                .eq('id', user.id)
                .select()
                .single();

            if (fallbackError) {
                return NextResponse.json({ error: fallbackError.message }, { status: 400 });
            }

            // Return with merged data from the request (for fields that couldn't save to DB)
            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    name: fallbackProfile.display_name || '',
                    email: user.email || '',
                    username: fallbackProfile.username,
                    avatar: fallbackProfile.avatar_url || '/default-avatar.svg',
                    banner: (fallbackProfile as any).cover_url || '',
                    bio: fallbackProfile.bio || '',
                    role: fallbackProfile.role,
                    verified: fallbackProfile.is_verified,
                    location: fallbackProfile.location || '',
                    website: fallbackProfile.website || '',
                    // Include the political/business fields from what was sent
                    party: updates.party ?? '',
                    position: updates.position ?? '',
                    ideology: updates.ideology ?? '',
                    yearsActive: updates.yearsActive ?? '',
                    country: updates.country ?? '',
                    campaignPromises: updates.campaignPromises ?? [],
                    achievements: updates.achievements ?? [],
                    company: updates.company ?? '',
                    industry: updates.industry ?? '',
                    services: updates.services ?? [],
                    portfolioUrl: updates.portfolioUrl ?? '',
                },
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: profile.display_name || '',
                email: user.email || '',
                username: profile.username,
                avatar: profile.avatar_url || '/default-avatar.svg',
                banner: profile.cover_url || '',
                bio: profile.bio || '',
                role: profile.role,
                verified: profile.is_verified,
                location: profile.location || '',
                website: profile.website || '',
                party: profile.party || '',
                position: profile.position || '',
                ideology: profile.ideology || '',
                yearsActive: profile.years_active || '',
                country: profile.country || '',
                campaignPromises: profile.campaign_promises || [],
                achievements: profile.achievements || [],
                company: profile.company || '',
                industry: profile.industry || '',
                services: profile.services || [],
                portfolioUrl: profile.portfolio_url || '',
                faceVerified: profile.face_verified || false,
                trustScore: profile.trust_score || 0,
            },
        });
    } catch (err) {
        console.error('Profile update error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
