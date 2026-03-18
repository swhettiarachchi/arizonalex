import { NextRequest, NextResponse } from 'next/server';
import { store, getUserFromCookies, serializePost } from '@/lib/store';
import { users, trendingHashtags } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);
    const userId = currentUser?.id;

    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';

    if (!q.trim()) {
        return NextResponse.json({ posts: [], users: [], hashtags: [] });
    }

    const query = q.toLowerCase();

    const matchedPosts = store.posts
        .filter(p =>
            p.content.toLowerCase().includes(query) ||
            p.author.name.toLowerCase().includes(query) ||
            p.author.username.toLowerCase().includes(query) ||
            p.hashtags?.some(h => h.toLowerCase().includes(query))
        )
        .slice(0, 20)
        .map(p => serializePost(p, userId));

    const matchedUsers = users
        .filter(u =>
            u.name.toLowerCase().includes(query) ||
            u.username.toLowerCase().includes(query) ||
            u.bio.toLowerCase().includes(query)
        )
        .slice(0, 10);

    const matchedHashtags = trendingHashtags
        .filter(t => t.tag.toLowerCase().includes(query))
        .slice(0, 5);

    return NextResponse.json({ posts: matchedPosts, users: matchedUsers, hashtags: matchedHashtags });
}
