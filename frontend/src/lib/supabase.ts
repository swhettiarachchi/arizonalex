import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// ── Lazy-initialized client (only created when first used, not at import time) ──
let _supabase: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !key) {
            throw new Error('Supabase environment variables are not configured')
        }
        _supabase = createClient<Database>(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        })
    }
    return _supabase
}

// Backward-compatible export — lazy getter via Proxy
// This allows `import { supabase } from '@/lib/supabase'` to work without changing consumers
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
    get(_target, prop) {
        return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
    },
})

// ── Server-side Supabase instance (API routes, server components) ────
export function createServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !(serviceRoleKey || anonKey)) {
        throw new Error('Supabase environment variables are not configured')
    }
    return createClient<Database>(
        url,
        serviceRoleKey || anonKey!,
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
    const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: metadata },
    })
    return { data, error }
}

/** Sign in with email and password */
export async function signIn(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
    const { data, error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback`,
        },
    })
    return { data, error }
}

/** Sign out the current user */
export async function signOut() {
    const { error } = await getSupabase().auth.signOut()
    return { error }
}

/** Get the current session */
export async function getSession() {
    const { data: { session }, error } = await getSupabase().auth.getSession()
    return { session, error }
}

/** Get the current user */
export async function getUser() {
    const { data: { user }, error } = await getSupabase().auth.getUser()
    return { user, error }
}

/** Listen to auth state changes */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return getSupabase().auth.onAuthStateChange(callback)
}

// ── Database helpers ─────────────────────────────────────────────────

/** Upload a file to Supabase Storage */
export async function uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await getSupabase().storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
    })
    return { data, error }
}

/** Get a public URL for a file in Supabase Storage */
export function getPublicUrl(bucket: string, path: string) {
    const { data } = getSupabase().storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

// ── Realtime helpers ─────────────────────────────────────────────────

/** Subscribe to realtime changes on a table */
export function subscribeToTable(
    table: string,
    callback: (payload: unknown) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
    return getSupabase()
        .channel(`public:${table}`)
        .on(
            'postgres_changes',
            { event, schema: 'public', table },
            callback
        )
        .subscribe()
}
