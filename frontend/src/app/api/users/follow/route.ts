import { NextRequest, NextResponse } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);

    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username } = await req.json();
        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const followerId = currentUser.id;
        if (!store.follows[username]) {
            store.follows[username] = new Set<string>();
        }

        let following: boolean;
        if (store.follows[username].has(followerId)) {
            store.follows[username].delete(followerId);
            following = false;
        } else {
            store.follows[username].add(followerId);
            following = true;
        }

        return NextResponse.json({
            following,
            followerCount: store.follows[username].size,
        });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
