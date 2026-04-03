import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const qs = url.search || '';
    return proxyToBackend(req, '/posts', { queryString: qs });
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        return proxyToBackend(req, '/posts', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
