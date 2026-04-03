import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/posts — list posts with filtering
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const tab = url.searchParams.get('tab');
        const type = url.searchParams.get('type');
        const author = url.searchParams.get('author');
        const hashtag = url.searchParams.get('hashtag');
        const q = url.searchParams.get('q');
        const bookmarked = url.searchParams.get('bookmarked');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const admin = createAdminClient();
        const user = await getAuthUser(req);
        const userId = user?.id;

        let query = admin
            .from('posts')
            .select('*, profiles!posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified, bio, followers_count, following_count)', { count: 'exact' })
            .eq('is_hidden', false)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Tab-based filtering
        if (tab === 'politics') {
            // Get political users first
            const { data: politicalUsers } = await admin
                .from('profiles')
                .select('id')
                .in('role', ['politician', 'official']);
            if (politicalUsers) {
                query = query.in('author_id', politicalUsers.map(u => u.id));
            }
        } else if (tab === 'business') {
            const { data: businessUsers } = await admin
                .from('profiles')
                .select('id')
                .in('role', ['businessman', 'entrepreneur', 'banker', 'stock_trader', 'crypto_trader']);
            if (businessUsers) {
                query = query.in('author_id', businessUsers.map(u => u.id));
            }
        } else if (tab === 'policy') {
            query = query.eq('post_type', 'policy');
        }

        // Direct filters
        if (type) query = query.eq('post_type', type);
        if (author) query = query.eq('author_id', author);
        if (hashtag) query = query.contains('tags', [hashtag]);

        // Search
        if (q) {
            query = query.ilike('content', `%${q}%`);
        }

        // Bookmarked posts
        if (bookmarked === 'true' && userId) {
            const { data: bookmarkedIds } = await admin
                .from('bookmarks')
                .select('post_id')
                .eq('user_id', userId);
            if (bookmarkedIds && bookmarkedIds.length > 0) {
                query = query.in('id', bookmarkedIds.map(b => b.post_id));
            } else {
                return NextResponse.json({ success: true, count: 0, total: 0, page, posts: [] });
            }
        }

        const { data: posts, count, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get like/bookmark/repost status for current user
        let userLikes: Set<string> = new Set();
        let userBookmarks: Set<string> = new Set();
        let userReposts: Set<string> = new Set();

        if (userId && posts && posts.length > 0) {
            const postIds = posts.map(p => p.id);

            const [likesRes, bookmarksRes, repostsRes] = await Promise.all([
                admin.from('likes').select('post_id').eq('user_id', userId).in('post_id', postIds),
                admin.from('bookmarks').select('post_id').eq('user_id', userId).in('post_id', postIds),
                admin.from('reposts').select('post_id').eq('user_id', userId).in('post_id', postIds),
            ]);

            if (likesRes.data) userLikes = new Set(likesRes.data.map(l => l.post_id));
            if (bookmarksRes.data) userBookmarks = new Set(bookmarksRes.data.map(b => b.post_id));
            if (repostsRes.data) userReposts = new Set(repostsRes.data.map(r => r.post_id));
        }

        // Serialize posts
        const serialized = (posts || []).map(post => {
            const profile = post.profiles as Record<string, unknown> | null;
            return {
                id: post.id,
                author: profile ? {
                    id: profile.id,
                    name: profile.display_name || '',
                    username: profile.username || '',
                    avatar: profile.avatar_url || '',
                    role: profile.role || 'citizen',
                    verified: profile.is_verified || false,
                    bio: profile.bio || '',
                    followersCount: profile.followers_count || 0,
                    followingCount: profile.following_count || 0,
                } : null,
                content: post.content,
                type: post.post_type,
                images: post.media_urls || [],
                video: '',
                likes: post.likes_count,
                comments: post.replies_count,
                reposts: post.reposts_count,
                timestamp: formatTimestamp(post.created_at),
                hashtags: post.tags || [],
                policyTitle: post.category === 'policy' ? post.content.substring(0, 50) : '',
                policyCategory: post.category || '',
                liked: userLikes.has(post.id),
                bookmarked: userBookmarks.has(post.id),
                reposted: userReposts.has(post.id),
            };
        });

        return NextResponse.json({
            success: true,
            count: serialized.length,
            total: count || 0,
            page,
            posts: serialized,
        });
    } catch (err) {
        console.error('Posts GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST /api/posts — create a new post
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, type, images, video, policyTitle, policyCategory } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Extract hashtags from content
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        const tags = matches ? matches.map((tag: string) => tag.replace('#', '')) : [];

        const admin = createAdminClient();

        const { data: post, error } = await admin
            .from('posts')
            .insert({
                author_id: user.id,
                content,
                post_type: type || 'text',
                media_urls: images || [],
                tags,
                category: type === 'policy' ? (policyCategory || 'General') : null,
            })
            .select('*, profiles!posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified, bio, followers_count, following_count)')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Increment posts_count
        const { data: currentProfile } = await admin.from('profiles').select('posts_count').eq('id', user.id).single();
        await admin.from('profiles').update({ posts_count: (currentProfile?.posts_count || 0) + 1 }).eq('id', user.id);

        // Also insert hashtags into post_hashtags if table exists
        if (tags.length > 0) {
            const hashtagInserts = tags.map((tag: string) => ({ post_id: post.id, hashtag: tag }));
            await admin.from('post_hashtags').insert(hashtagInserts);
        }

        const profile = post.profiles as Record<string, unknown> | null;
        const serialized = {
            id: post.id,
            author: profile ? {
                id: profile.id,
                name: profile.display_name || '',
                username: profile.username || '',
                avatar: profile.avatar_url || '',
                role: profile.role || 'citizen',
                verified: profile.is_verified || false,
                bio: profile.bio || '',
            } : null,
            content: post.content,
            type: post.post_type,
            images: post.media_urls || [],
            video: video || '',
            likes: 0,
            comments: 0,
            reposts: 0,
            timestamp: 'Just now',
            hashtags: tags,
            liked: false,
            bookmarked: false,
            reposted: false,
        };

        return NextResponse.json({ success: true, post: serialized }, { status: 201 });
    } catch (err) {
        console.error('Posts POST error:', err);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatTimestamp(dateStr: string) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
