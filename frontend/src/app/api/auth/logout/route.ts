import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function POST() {
    // Sign out from Supabase
    const supabase = createAdminClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true });

    // Clear all auth cookies
    response.cookies.set('sb-access-token', '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax' });
    response.cookies.set('sb-refresh-token', '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax' });
    response.cookies.set('user-id', '', { path: '/', maxAge: 0, sameSite: 'lax' });
    // Clear legacy cookie
    response.cookies.set('auth_token', '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax' });

    return response;
}
