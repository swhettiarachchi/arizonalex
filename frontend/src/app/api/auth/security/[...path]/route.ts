import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';

// GET /api/auth/security/[...path]
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const subpath = path.join('/');

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();

    if (subpath === 'login-history') {
        try {
            const { data: history } = await admin
                .from('login_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            return NextResponse.json({ success: true, history: history || [] });
        } catch {
            return NextResponse.json({ success: true, history: [] });
        }
    }

    if (subpath === 'sessions') {
        try {
            const { data: sessions } = await admin
                .from('sessions')
                .select('*')
                .eq('user_id', user.id);
            return NextResponse.json({ success: true, sessions: sessions || [] });
        } catch {
            return NextResponse.json({ success: true, sessions: [] });
        }
    }

    if (subpath === 'account') {
        const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();
        return NextResponse.json({ success: true, account: profile });
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}

// POST /api/auth/security/[...path]
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const subpath = path.join('/');

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (subpath === 'change-password') {
        const { newPassword } = await req.json();
        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, message: 'Password changed' });
    }

    if (subpath === 'change-email') {
        const { email } = await req.json();
        const { error } = await supabase.auth.updateUser({ email });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, message: 'Email update initiated' });
    }

    if (subpath === 'delete-account') {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(user.id);
        return NextResponse.json({ success: true, message: 'Account deleted' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return POST(req, { params });
}
