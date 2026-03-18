import { NextRequest, NextResponse } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);
    const userId = currentUser?.id;

    const notifications = store.notifications.map(n => ({
        ...n,
        read: n.read || (userId ? n.readBy.has(userId) : false),
        readBy: undefined,
    }));

    return NextResponse.json({ notifications });
}
