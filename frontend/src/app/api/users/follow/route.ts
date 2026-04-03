import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { userId, username, action } = body;

        // Resolve userId from username if needed
        let targetId = userId;
        if (!targetId && username) {
            const userRes = await fetch(`${API_BASE}/users/username/${username}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                targetId = userData.user?._id || userData.user?.id;
            }
        }

        if (!targetId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine follow or unfollow
        const endpoint = action === 'unfollow' ? 'unfollow' : 'follow';
        const res = await fetch(`${API_BASE}/users/${targetId}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok) {
            // If already following, try toggling
            if (data.message?.includes('Already following')) {
                const unfollowRes = await fetch(`${API_BASE}/users/${targetId}/unfollow`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                const unfollowData = await unfollowRes.json();
                return NextResponse.json({ following: false, ...unfollowData }, { status: unfollowRes.status });
            }
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json({
            following: endpoint === 'follow',
            ...data,
        });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
