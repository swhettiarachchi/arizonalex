import { NextResponse, NextRequest } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;

    try {
        const res = await fetch(`${API_BASE}/promises`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const data = await res.json();
        if (!res.ok) throw new Error('Backend returned error');

        const promises = data.promises.map((p: any) => ({
            ...p,
            id: p._id,
            date: new Date(p.date).toLocaleString('en-US', { month: 'short', year: 'numeric' })
        }));

        return NextResponse.json({ promises });
    } catch (e) {
        console.warn('Backend unreachable for promises, using in-memory store');
        // Fallback to in-memory store
        const promises = store.promises.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            status: p.status,
            politician: p.politician,
            date: p.date,
            category: p.category
        }));
        return NextResponse.json({ promises });
    }
}
