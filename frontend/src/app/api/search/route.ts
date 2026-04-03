import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';

    if (!q.trim()) {
        return NextResponse.json({ posts: [], users: [], hashtags: [] });
    }

    const token = req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(
            `${API_BASE}/explore/search?q=${encodeURIComponent(q)}`,
            { headers, cache: 'no-store' }
        );

        if (!res.ok) {
            return NextResponse.json({ posts: [], users: [], hashtags: [] });
        }

        const data = await res.json();

        // Map backend response format to frontend expectations
        return NextResponse.json({
            posts: data.results?.posts || [],
            users: data.results?.users || [],
            hashtags: data.results?.hashtags || [],
        });
    } catch {
        return NextResponse.json({ posts: [], users: [], hashtags: [] });
    }
}
