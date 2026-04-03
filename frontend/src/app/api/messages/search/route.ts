import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        const q = req.nextUrl.searchParams.get('q') || '';
        const res = await fetch(`${API_BASE}/messages/search?q=${encodeURIComponent(q)}`, {
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
