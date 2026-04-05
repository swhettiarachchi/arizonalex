import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';

// One-time migration endpoint — adds auth_provider column to profiles
export async function POST() {
    try {
        const admin = createAdminClient();

        // Try to select auth_provider to check if it exists
        const { error: checkError } = await admin
            .from('profiles')
            .select('auth_provider')
            .limit(1);

        if (checkError && checkError.message.includes('auth_provider')) {
            // Column doesn't exist — we can't run ALTER TABLE via the JS client
            return NextResponse.json({
                success: false,
                message: 'Column auth_provider does not exist. Please run this SQL in Supabase Dashboard:',
                sql: "ALTER TABLE profiles ADD COLUMN auth_provider TEXT DEFAULT 'email';",
            });
        }

        // Column exists — backfill existing users
        // Get all users from Supabase auth
        const { data: userList } = await admin.auth.admin.listUsers();
        let updated = 0;

        if (userList?.users) {
            for (const user of userList.users) {
                const provider = user.app_metadata?.provider || 'email';
                const authProvider = provider === 'google' ? 'google' : 'email';

                // Update profile if auth_provider is null
                const { error: updateError } = await admin
                    .from('profiles')
                    .update({ auth_provider: authProvider })
                    .eq('id', user.id)
                    .is('auth_provider', null);

                if (!updateError) updated++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration complete. Updated ${updated} profiles.`,
            columnExists: true,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
