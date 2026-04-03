import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Client-side Supabase instance (browser) ──────────────────────────
// Uses the anon key — safe for client-side, protected by RLS policies
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
})

// ── Server-side Supabase instance (API routes, server components) ────
// Uses the service role key when available for admin operations
// Falls back to anon key if service role key is not set
export function createServerClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    return createClient<Database>(
        supabaseUrl,
        serviceRoleKey || supabaseAnonKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    )
}

// ── Auth helpers ─────────────────────────────────────────────────────

/** Sign up a new user with email and password */
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
    })
    return { data, error }
}

/** Sign in with email and password */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback`,
        },
    })
    return { data, error }
}

/** Sign out the current user */
export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

/** Get the current session */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
}

/** Get the current user */
export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

/** Listen to auth state changes */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
}

// ── Database helpers ─────────────────────────────────────────────────
// Use supabase.from() directly for type-safe queries:
//   const { data } = await supabase.from('users').select('*')
//   const { data } = await supabase.from('posts').select('*').eq('author_id', userId)

/** Upload a file to Supabase Storage */
export async function uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
    })
    return { data, error }
}

/** Get a public URL for a file in Supabase Storage */
export function getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

// ── Realtime helpers ─────────────────────────────────────────────────

/** Subscribe to realtime changes on a table */
export function subscribeToTable(
    table: string,
    callback: (payload: unknown) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
    return supabase
        .channel(`public:${table}`)
        .on(
            'postgres_changes',
            { event, schema: 'public', table },
            callback
        )
        .subscribe()
}
