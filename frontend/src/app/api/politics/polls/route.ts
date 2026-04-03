import { NextResponse, NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}/polls`, { headers, cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error('Backend returned error');

        const uid = req.cookies.get('user-id')?.value;
        const polls = data.polls.map((p: any) => {
            let votedIndex = undefined;
            if (uid) {
                p.options.forEach((opt: any, idx: number) => {
                    if (opt.votes && Array.isArray(opt.votes) && opt.votes.includes(uid)) {
                        votedIndex = idx;
                    }
                });
            }

            return {
                ...p,
                id: p._id || p.id,
                voted: votedIndex,
                options: p.options.map((o: any) => ({
                    ...o,
                    votes: Array.isArray(o.votes) ? o.votes.length : (typeof o.votes === 'number' ? o.votes : 0)
                }))
            };
        });

        return NextResponse.json({ polls });
    } catch {
        return NextResponse.json({ polls: [] });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // Create poll
        if (body.question && body.options) {
            const res = await fetch(`${API_BASE}/polls`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok && data.poll) {
                const p = data.poll;
                return NextResponse.json({
                    poll: { ...p, id: p._id, voted: undefined, options: p.options.map((o: any) => ({ ...o, votes: 0 })) }
                });
            }
            return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
        }

        // Vote on poll
        const { id, optionIndex } = body;
        const res = await fetch(`${API_BASE}/polls/${id}/vote`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionIndex })
        });
        const data = await res.json();
        if (res.ok && data.poll) {
            const p = data.poll;
            return NextResponse.json({
                poll: {
                    ...p,
                    id: p._id || p.id,
                    voted: optionIndex,
                    options: p.options.map((o: any) => ({ ...o, votes: Array.isArray(o.votes) ? o.votes.length : o.votes }))
                }
            });
        }
        return NextResponse.json({ error: data.message || 'Vote failed' }, { status: res.status });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
