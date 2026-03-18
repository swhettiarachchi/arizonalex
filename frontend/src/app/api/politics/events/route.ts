import { NextResponse, NextRequest } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const user = getUserFromCookies(token);

    try {
        const res = await fetch(`${API_BASE}/events`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const data = await res.json();
        if (!res.ok) throw new Error('Backend returned error');

        const uid = req.cookies.get('user-id')?.value;
        const events = data.events.map((e: any) => ({
            ...e,
            id: e._id,
            date: new Date(e.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
            isRSVPed: uid && e.attendees ? e.attendees.includes(uid) : false,
            attendees: e.attendees ? e.attendees.length : 0
        }));

        return NextResponse.json({ events });
    } catch (e) {
        console.warn('Backend unreachable for events, using in-memory store');
        // Fallback to in-memory store
        const events = store.events.map(ev => ({
            id: ev.id,
            title: ev.title,
            type: ev.type,
            date: ev.date,
            location: ev.location,
            organizer: ev.organizer,
            attendees: ev.attendees + ev.rsvps.size,
            description: ev.description,
            isRSVPed: user ? ev.rsvps.has(user.id) : false
        }));
        return NextResponse.json({ events });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const user = getUserFromCookies(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // Try backend first
        try {
            if (body.title && body.location) {
                const res = await fetch(`${API_BASE}/events`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (res.ok && data.event) {
                    const e = data.event;
                    return NextResponse.json({
                        event: {
                            ...e,
                            id: e._id,
                            date: new Date(e.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
                            isRSVPed: true,
                            attendees: e.attendees ? e.attendees.length : 1
                        }
                    });
                }
                throw new Error('Backend event creation failed');
            }

            // RSVP request via backend
            const { id } = body;
            const res = await fetch(`${API_BASE}/events/${id}/attend`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (res.ok) {
                return NextResponse.json({
                    event: {
                        id: id,
                        isRSVPed: data.attending,
                    }
                });
            }
            throw new Error('Backend RSVP failed');
        } catch {
            // Fallback to in-memory store
            if (body.title && body.location) {
                // Create event in store
                const newEvent = {
                    id: `ev_${Date.now()}`,
                    title: body.title,
                    type: body.type || 'meeting' as const,
                    date: body.date ? new Date(body.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD',
                    location: body.location,
                    organizer: { id: user.id, name: user.name || 'You', username: user.username || 'you', avatar: '', bio: '', role: 'citizen' as const, verified: false, followers: 0, following: 0, joined: '2024' },
                    attendees: 1,
                    description: body.description || '',
                    rsvps: new Set<string>([user.id])
                };
                store.events.unshift(newEvent as any);
                return NextResponse.json({
                    event: {
                        id: newEvent.id,
                        title: newEvent.title,
                        type: newEvent.type,
                        date: newEvent.date,
                        location: newEvent.location,
                        organizer: newEvent.organizer,
                        attendees: 1,
                        description: newEvent.description,
                        isRSVPed: true
                    }
                });
            }

            // RSVP toggle in store
            const { id } = body;
            const ev = store.events.find(e => e.id === id);
            if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

            const wasRSVPed = ev.rsvps.has(user.id);
            if (wasRSVPed) {
                ev.rsvps.delete(user.id);
            } else {
                ev.rsvps.add(user.id);
            }

            return NextResponse.json({
                event: {
                    id: id,
                    isRSVPed: !wasRSVPed
                }
            });
        }
    } catch (e: any) {
        console.error('Event operation failed:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
