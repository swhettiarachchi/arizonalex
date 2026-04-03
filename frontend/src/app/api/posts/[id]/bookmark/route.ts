import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();

    const { data: existing } = await admin
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', id)
        .single();

    if (existing) {
        await admin.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', id);
        return NextResponse.json({ success: true, bookmarked: false });
    } else {
        await admin.from('bookmarks').insert({ user_id: user.id, post_id: id });
        return NextResponse.json({ success: true, bookmarked: true });
    }
}
