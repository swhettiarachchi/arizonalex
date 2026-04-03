import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// GET /api/debates  or  GET /api/debates/[id]  or  GET /api/debates/[id]/messages  etc
export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const { path } = await params;
    const subpath = path ? path.join('/') : '';
    const token = req.cookies.get('auth_token')?.value;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const url = new URL(req.url);
        const qs = url.search || '';
        const res = await fetch(`${API_BASE}/debates${subpath ? '/' + subpath : ''}${qs}`, { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, message: 'Server connection failed' }, { status: 500 });
    }
}

// POST /api/debates  or  POST /api/debates/[id]/join  etc
export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const { path } = await params;
    const subpath = path ? path.join('/') : '';
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    try {
        let body: string | undefined;
        try {
            const json = await req.json();
            body = JSON.stringify(json);
        } catch {
            // No body (e.g. POST /debates/:id/start)
        }

        const res = await fetch(`${API_BASE}/debates${subpath ? '/' + subpath : ''}`, {
            method: 'POST',
            headers,
            body,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, message: 'Server connection failed' }, { status: 500 });
    }
}
