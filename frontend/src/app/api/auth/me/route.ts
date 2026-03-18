import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            return NextResponse.json({ user: null }, { status: res.status });
        }

        const data = await res.json();
        const user = data.user;
        return NextResponse.json({ user: { ...user, id: user._id || user.id } });
    } catch {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const userId = req.cookies.get('user-id')?.value;

    if (!token || !userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const updates = await req.json();

        const res = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Update failed' }, { status: res.status });
        }

        const user = data.user;
        return NextResponse.json({ success: true, user: { ...user, id: user._id || user.id } });
    } catch {
        return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
    }
}
