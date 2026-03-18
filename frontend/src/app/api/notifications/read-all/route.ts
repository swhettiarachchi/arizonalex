import { NextRequest, NextResponse } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const currentUser = getUserFromCookies(token);
    const userId = currentUser?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    store.notifications.forEach(n => n.readBy.add(userId));
    return NextResponse.json({ success: true });
}
