'use client';
import { useEffect } from 'react';

/**
 * Intercepts OAuth tokens in the URL hash from any page.
 * Supabase sometimes redirects to the root URL with tokens in the hash
 * instead of the /auth/callback page. This component detects that
 * and redirects to /auth/callback so the tokens are properly handled.
 */
export default function HashTokenInterceptor() {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=') && hash.includes('refresh_token=')) {
            // Tokens found in URL hash — redirect to callback page
            window.location.replace(`/auth/callback${hash}`);
        }
    }, []);

    return null;
}
