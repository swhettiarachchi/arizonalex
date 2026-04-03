import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = createAdminClient();

        let events: Record<string, unknown>[] = [];
        try {
            const { data } = await admin
                .from('political_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            events = (data || []) as Record<string, unknown>[];
        } catch {
            return NextResponse.json({ events: [] });
        }

        const mapped = events.map((e) => ({
            ...e,
            id: e.id,
            date: e.date ? new Date(e.date as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD',
            isRSVPed: false,
            attendees: 0,
        }));

        return NextResponse.json({ events: mapped });
    } catch {
        return NextResponse.json({ events: [] });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const admin = createAdminClient();

        if (body.title && body.location) {
            let event: Record<string, unknown> | null = null;
            try {
                const { data } = await admin
                    .from('political_events')
                    .insert({
                        title: body.title,
                        description: body.description || null,
                        location: body.location,
                        date: body.date || null,
                        category: body.category || null,
                        creator_id: user.id,
                    })
                    .select()
                    .single();
                event = data as Record<string, unknown> | null;
            } catch {
                return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
            }

            if (!event) return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });

            return NextResponse.json({
                event: {
                    ...event, id: event.id,
                    date: event.date ? new Date(event.date as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD',
                    isRSVPed: true, attendees: 1,
                },
            });
        }

        return NextResponse.json({ error: 'Title and location required' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
