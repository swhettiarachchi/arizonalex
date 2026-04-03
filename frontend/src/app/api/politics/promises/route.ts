import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function GET() {
    try {
        const admin = createAdminClient();
        const { data: promises, error } = await admin
            .from('promises')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

        return NextResponse.json({
            success: true,
            promises: (promises || []).map(p => ({
                _id: p.id, id: p.id, title: p.title,
                description: p.description || '', status: p.status,
                category: p.category || '', politicianName: p.politician_name,
                madeAt: p.made_at, deadline: p.deadline,
                createdAt: p.created_at,
            })),
        });
    } catch {
        return NextResponse.json({ success: false, message: 'Failed to fetch promises' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const admin = createAdminClient();

        const { data, error } = await admin
            .from('promises')
            .insert({
                politician_name: body.politicianName || 'Unknown',
                title: body.title,
                description: body.description || null,
                status: body.status || 'pending',
                category: body.category || null,
            })
            .select()
            .single();

        if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        return NextResponse.json({ success: true, promise: data }, { status: 201 });
    } catch {
        return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
    }
}
