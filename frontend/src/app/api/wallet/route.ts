import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// GET /api/wallet
export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        // Support /api/wallet and /api/wallet?transactions etc
        const qs = url.search || '';
        const res = await fetch(`${API_BASE}/wallet${qs}`, {
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

// POST /api/wallet (for deposit, withdraw actions on the root)
export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const res = await fetch(`${API_BASE}/wallet`, {
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
