import { NextRequest, NextResponse } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const messages = store.messages[id] || store.messages['1'] || [];
    return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);

    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { content } = await req.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        if (!store.messages[id]) {
            store.messages[id] = [];
        }

        const sender = {
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

        const newMsg = {
            id: `msg_${Date.now()}`,
            sender,
            content,
            timestamp: 'Just now',
            read: false,
        };

        store.messages[id].push(newMsg);

        const conversation = store.conversations.find(c => c.id === id);
        if (conversation) {
            conversation.lastMessage = content;
            conversation.timestamp = 'Just now';
        }

        return NextResponse.json({ message: newMsg });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
