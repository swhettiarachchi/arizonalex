import { NextRequest, NextResponse } from 'next/server';
import { store, serializePost, getUserFromCookies } from '@/lib/store';

function getPost(id: string) {
    return store.posts.find(p => p.id === id);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);

    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = getPost(id);
    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const userId = currentUser.id;
    if (post.bookmarkedBy.has(userId)) {
        post.bookmarkedBy.delete(userId);
    } else {
        post.bookmarkedBy.add(userId);
    }

    return NextResponse.json({
        bookmarked: post.bookmarkedBy.has(userId),
        post: serializePost(post, userId),
    });
}
