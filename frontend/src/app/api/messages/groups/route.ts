import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        const body = await req.json();
        const res = await fetch(`${API_BASE}/messages/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json({ error: data.message || 'Failed' }, { status: res.status });
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
