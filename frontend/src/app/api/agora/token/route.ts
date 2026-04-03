import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const channelName = req.nextUrl.searchParams.get('channelName');
        const uid = req.nextUrl.searchParams.get('uid');
        const role = req.nextUrl.searchParams.get('role');

        const res = await fetch(`${API_BASE}/agora/token?channelName=${encodeURIComponent(channelName || '')}&uid=${uid}&role=${role}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Token generation failed' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
    }
}
