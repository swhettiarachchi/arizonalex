import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// GET /api/wallet/transactions etc
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const subpath = path.join('/');
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const qs = url.search || '';
        const res = await fetch(`${API_BASE}/wallet/${subpath}${qs}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, message: 'Server connection failed' }, { status: 500 });
    }
}

// POST /api/wallet/deposit, /api/wallet/withdraw, /api/wallet/toggle-2fa
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const subpath = path.join('/');
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        let body: string | undefined;
        try {
            const json = await req.json();
            body = JSON.stringify(json);
        } catch {
            // No body
        }

        const res = await fetch(`${API_BASE}/wallet/${subpath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ success: false, message: 'Server connection failed' }, { status: 500 });
    }
}
