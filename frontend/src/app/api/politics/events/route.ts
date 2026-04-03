import { NextResponse, NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}/events`, { headers, cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error('Backend returned error');

        const uid = req.cookies.get('user-id')?.value;
        const events = data.events.map((e: any) => ({
            ...e,
            id: e._id || e.id,
            date: e.date ? new Date(e.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD',
            isRSVPed: uid && e.attendees && Array.isArray(e.attendees) ? e.attendees.includes(uid) : false,
            attendees: Array.isArray(e.attendees) ? e.attendees.length : (typeof e.attendees === 'number' ? e.attendees : 0)
        }));

        return NextResponse.json({ events });
    } catch {
        return NextResponse.json({ events: [] });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // Create event
        if (body.title && body.location) {
            const res = await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok && data.event) {
                const e = data.event;
                return NextResponse.json({
                    event: {
                        ...e, id: e._id || e.id,
                        date: e.date ? new Date(e.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD',
                        isRSVPed: true,
                        attendees: Array.isArray(e.attendees) ? e.attendees.length : 1
                    }
                });
            }
            return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
        }

        // RSVP toggle
        const { id } = body;
        const res = await fetch(`${API_BASE}/events/${id}/attend`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return NextResponse.json({ event: { id, isRSVPed: data.attending } }, { status: res.status });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
