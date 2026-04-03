import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// GET /api/debates (list all)
export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const url = new URL(req.url);
        const qs = url.search || '';
        const res = await fetch(`${API_BASE}/debates${qs}`, { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, message: 'Server connection failed' }, { status: 500 });
    }
}

// POST /api/debates (create)
export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const res = await fetch(`${API_BASE}/debates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, message: 'Server connection failed' }, { status: 500 });
    }
}
