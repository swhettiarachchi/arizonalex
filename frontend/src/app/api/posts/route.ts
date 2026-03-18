import { NextRequest, NextResponse } from 'next/server';
import { store, serializePost, getUserFromCookies } from '@/lib/store';
import { users } from '@/lib/mock-data';
import { translateToEnglish } from '@/lib/translate';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);
    const userId = currentUser?.id;

    const url = new URL(req.url);
    const bookmarked = url.searchParams.get('bookmarked') === 'true';
    const tab = url.searchParams.get('tab') || 'foryou';
    const q = url.searchParams.get('q') || '';

    let posts = store.posts;

    if (bookmarked && userId) {
        posts = posts.filter(p => p.bookmarkedBy.has(userId));
    }

    if (q) {
        const query = q.toLowerCase();
        posts = posts.filter(p =>
            p.content.toLowerCase().includes(query) ||
            p.author.name.toLowerCase().includes(query) ||
            p.author.username.toLowerCase().includes(query) ||
            p.hashtags?.some(h => h.toLowerCase().includes(query))
        );
    }

    if (!bookmarked && !q) {
        if (tab === 'politics') posts = posts.filter(p => ['politician', 'official'].includes(p.author.role));
        else if (tab === 'business') posts = posts.filter(p => ['businessman', 'entrepreneur', 'banker', 'stock_trader', 'crypto_trader'].includes(p.author.role));
        else if (tab === 'policy') posts = posts.filter(p => p.type === 'policy' || ['official', 'politician'].includes(p.author.role));
        else if (tab === 'trending') posts = posts.filter(p => p.likes > 10000);
        else if (tab === 'markets') posts = posts.filter(p => p.hashtags?.some(h => ['markets', 'stocks', 'crypto', 'finance', 'economy'].includes(h.toLowerCase())));
    }

    const serialized = posts.map(p => serializePost(p, userId));
    const displayPosts = serialized.length > 0 ? serialized : store.posts.slice(0, 8).map(p => serializePost(p, userId));

    return NextResponse.json({ posts: displayPosts });
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);

    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { content, type = 'text' } = body;

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Auto-translate content to English if written in another language
        const translatedContent = await translateToEnglish(content);

        // Build post author from auth user, falling back to mock user data
        const mockUser = users.find(u => u.username === currentUser.username) || {
            id: currentUser.id,
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar || '',
            bio: currentUser.bio || '',
            role: currentUser.role || 'citizen',
            verified: currentUser.verified || false,
            followers: currentUser.followers || 0,
            following: currentUser.following || 0,
            joined: currentUser.joined || 'March 2026',
        };

        const hashtags = (translatedContent.match(/#([a-zA-Z0-9]+)/g) || []).map((h: string) => h.slice(1));

        const newPost = {
            id: `post_${Date.now()}`,
            author: mockUser,
            content: translatedContent,
            type: type as 'text' | 'image' | 'video' | 'thread' | 'policy',
            likes: 0,
            comments: 0,
            reposts: 0,
            timestamp: 'Just now',
            hashtags,
            likedBy: new Set<string>(),
            bookmarkedBy: new Set<string>(),
            repostedBy: new Set<string>(),
        };

        store.posts.unshift(newPost);
        return NextResponse.json({ post: serializePost(newPost, currentUser.id) });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
