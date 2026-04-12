import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// ── GET /api/stories ────────────────────────────────────────────────
// Fetches recent "stories" — for now we generate stories from active
// profiles that have posted recently.  Returns the shape the home feed expects.
export async function GET(req: NextRequest) {
    try {
        const admin = createAdminClient();

        // Fetch verified / high-follower profiles who have recent posts
        const { data: recentAuthors } = await admin
            .from('posts')
            .select('author_id, created_at, profiles!posts_author_id_fkey(id, username, display_name, avatar_url, is_verified)')
            .eq('is_hidden', false)
            .order('created_at', { ascending: false })
            .limit(30);

        // Deduplicate by author, keep most recent
        const seen = new Set<string>();
        const stories: any[] = [];

        if (recentAuthors) {
            for (const post of recentAuthors) {
                const profile = post.profiles as Record<string, unknown> | null;
                if (!profile || seen.has(profile.id as string)) continue;
                seen.add(profile.id as string);

                stories.push({
                    id: `story-${profile.id}`,
                    author: {
                        id: profile.id,
                        name: profile.display_name || profile.username || '',
                        username: profile.username || '',
                        avatar: profile.avatar_url || '',
                        verified: profile.is_verified || false,
                    },
                    image: generateStoryGradient(stories.length),
                    timestamp: formatTimestamp(post.created_at),
                    viewed: false,
                });

                if (stories.length >= 10) break;
            }
        }

        // If no DB stories, return curated fallback
        if (stories.length === 0) {
            return NextResponse.json({
                stories: FALLBACK_STORIES,
            });
        }

        return NextResponse.json({ stories });
    } catch (err) {
        console.error('Stories GET error:', err);
        // Return fallback on any error
        return NextResponse.json({ stories: FALLBACK_STORIES });
    }
}

// ── Helpers ──────────────────────────────────────────────────────────

const GRADIENT_THEMES = [
    'gradient-politics', 'gradient-green', 'gradient-infra',
    'gradient-edu', 'gradient-news', 'gradient-data', 'gradient-civic',
];

function generateStoryGradient(index: number): string {
    return GRADIENT_THEMES[index % GRADIENT_THEMES.length];
}

function formatTimestamp(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const FALLBACK_STORIES = [
    { id: 's1', author: { name: 'Sarah Mitchell', username: 'sarahmitchell', avatar: '', id: 'u1' }, image: 'gradient-politics', timestamp: '1h ago', viewed: false },
    { id: 's2', author: { name: 'Diana Chen', username: 'dianachen', avatar: '', id: 'u3' }, image: 'gradient-green', timestamp: '3h ago', viewed: false },
    { id: 's3', author: { name: 'Robert Kim', username: 'robertkim', avatar: '', id: 'u7' }, image: 'gradient-infra', timestamp: '5h ago', viewed: true },
    { id: 's4', author: { name: 'Elena Vasquez', username: 'elenavasquez', avatar: '', id: 'u8' }, image: 'gradient-edu', timestamp: '8h ago', viewed: true },
    { id: 's5', author: { name: 'James Rivera', username: 'jamesrivera', avatar: '', id: 'u2' }, image: 'gradient-news', timestamp: '10h ago', viewed: false },
    { id: 's6', author: { name: 'Priya Patel', username: 'priyapatel', avatar: '', id: 'u6' }, image: 'gradient-data', timestamp: '12h ago', viewed: true },
];
