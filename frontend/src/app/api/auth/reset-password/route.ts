import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();
        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
