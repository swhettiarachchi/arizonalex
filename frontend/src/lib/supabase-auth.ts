import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import type { NextRequest } from 'next/server'

// ── Lazy helpers — only read env vars at runtime, never at import/build time ──
function getUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}
function getServiceKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}
function getAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

// ── Server-side admin client (bypasses RLS) ──────────────────────────
export function createAdminClient() {
    return createClient<Database>(getUrl(), getServiceKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
    })
}

// ── Server-side client with user's session ───────────────────────────
export async function createServerClientFromCookies() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    const client = createClient<Database>(getUrl(), getAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
    })

    if (accessToken && refreshToken) {
        await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }

    return client
}

// ── Get authenticated user from request cookies ──────────────────────
export async function getAuthUser(req: NextRequest) {
    const accessToken = req.cookies.get('sb-access-token')?.value
    const refreshToken = req.cookies.get('sb-refresh-token')?.value

    if (!accessToken) return null

    const client = createClient<Database>(getUrl(), getAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
    })

    if (refreshToken) {
        await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }

    const { data: { user }, error } = await client.auth.getUser(accessToken)
    if (error || !user) return null

    return user
}

// ── Get user profile from Supabase ───────────────────────────────────
export async function getUserProfile(userId: string) {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) return null
    return data
}

// ── Set auth cookies on response ─────────────────────────────────────
export function setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string
) {
    const headers = new Headers(response.headers)

    // Access token — short-lived
    headers.append('Set-Cookie', `sb-access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60}`)
    // Refresh token — long-lived
    headers.append('Set-Cookie', `sb-refresh-token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

// ── Clear auth cookies ───────────────────────────────────────────────
export function clearAuthCookies(response: Response) {
    const headers = new Headers(response.headers)
    headers.append('Set-Cookie', `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
    headers.append('Set-Cookie', `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

// ── Require auth helper for API routes ───────────────────────────────
export async function requireAuth(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) {
        return { user: null, error: 'Unauthorized' }
    }
    return { user, error: null }
}
