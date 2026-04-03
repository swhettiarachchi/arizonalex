import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Proxy helper — forwards requests to the Express backend.
 * Automatically handles auth token forwarding from httpOnly cookies.
 */
export async function proxyToBackend(
    req: NextRequest,
    backendPath: string,
    options: {
        method?: string;
        body?: string | null;
        queryString?: string;
    } = {}
): Promise<NextResponse> {
    const token = req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const qs = options.queryString || '';
    const url = `${API_BASE}${backendPath}${qs}`;

    try {
        const res = await fetch(url, {
            method: options.method || 'GET',
            headers,
            body: options.body || undefined,
            cache: 'no-store',
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Backend server connection failed' },
            { status: 502 }
        );
    }
}
