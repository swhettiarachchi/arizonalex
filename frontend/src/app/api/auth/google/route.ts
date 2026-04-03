import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Google authentication failed' }, { status: res.status });
        }

        const user = data.user;
        const response = NextResponse.json({ success: true, user: { ...user, id: user._id || user.id } });

        response.cookies.set('auth_token', data.token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        response.cookies.set('user-id', user.id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
    }
}
