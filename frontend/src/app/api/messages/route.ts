import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
    return NextResponse.json({ conversations: store.conversations });
}

export async function POST(req: NextRequest) {
    try {
        const { content, conversationId } = await req.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const convId = conversationId || '1';
        if (!store.messages[convId]) {
            store.messages[convId] = [];
        }

        const conversation = store.conversations.find(c => c.id === convId);
        const newMsg = {
            id: `msg_${Date.now()}`,
            sender: conversation?.participant ?? store.conversations[0].participant,
            content,
            timestamp: 'Just now',
            read: false,
        };

        store.messages[convId].push(newMsg);

        // Update last message in conversation
        if (conversation) {
            conversation.lastMessage = content;
            conversation.timestamp = 'Just now';
        }

        return NextResponse.json({ message: newMsg });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
