import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const supabase = createAdminClient();

        // Check if user exists and their provider
        const { data: userList } = await supabase.auth.admin.listUsers();
        const existingUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!existingUser) {
            // Don't reveal that account doesn't exist (security best practice)
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            });
        }

        // Check if user signed up with Google
        const provider = existingUser.app_metadata?.provider;
        if (provider === 'google') {
            return NextResponse.json({
                error: 'This account was created using Google. You cannot reset a password for a Google account. Please login with Google.',
                errorType: 'provider_mismatch',
                provider: 'google',
            }, { status: 403 });
        }

        // Send password reset email via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password?step=reset`,
        });

        if (error) {
            console.error('Reset password error:', error);
            return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'A password reset link has been sent to your email.',
            method: 'link',
        });
    } catch {
        return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }
}
