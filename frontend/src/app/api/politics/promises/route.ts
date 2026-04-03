import { NextResponse, NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}/promises`, { headers, cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error('Backend returned error');

        const promises = data.promises.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            date: p.date ? new Date(p.date).toLocaleString('en-US', { month: 'short', year: 'numeric' }) : '',
        }));

        return NextResponse.json({ promises });
    } catch {
        return NextResponse.json({ promises: [] });
    }
}
