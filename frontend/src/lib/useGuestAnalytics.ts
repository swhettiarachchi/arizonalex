'use client';

const STORAGE_KEY = 'arizonalex_guest_analytics';
const RETURN_TO_KEY = 'arizonalex_returnTo';

export interface GuestAnalytics {
    protectedPageAttempts: Record<string, number>;
    blockedInteractions: number;
    lastAttemptAt: string | null;
}

function getAnalytics(): GuestAnalytics {
    if (typeof window === 'undefined') return { protectedPageAttempts: {}, blockedInteractions: 0, lastAttemptAt: null };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { protectedPageAttempts: {}, blockedInteractions: 0, lastAttemptAt: null };
}

function saveAnalytics(data: GuestAnalytics) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

/** Record a protected page access attempt */
export function trackProtectedPageAttempt(pathname: string) {
    const data = getAnalytics();
    data.protectedPageAttempts[pathname] = (data.protectedPageAttempts[pathname] || 0) + 1;
    data.lastAttemptAt = new Date().toISOString();
    saveAnalytics(data);
}

/** Record a blocked interaction (like, comment, follow, etc.) */
export function trackBlockedInteraction() {
    const data = getAnalytics();
    data.blockedInteractions += 1;
    data.lastAttemptAt = new Date().toISOString();
    saveAnalytics(data);
}

/** Get the most requested protected pages, sorted by count */
export function getTopRequestedPages(): { path: string; count: number }[] {
    const data = getAnalytics();
    return Object.entries(data.protectedPageAttempts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);
}

/** Get total blocked interactions */
export function getBlockedInteractionCount(): number {
    return getAnalytics().blockedInteractions;
}

/** Clear analytics (e.g., after login) */
export function clearGuestAnalytics() {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ── Intended route helpers ──

/** Save the intended route for redirect after login */
export function saveIntendedRoute(pathname: string) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(RETURN_TO_KEY, pathname); } catch { /* ignore */ }
}

/** Get and clear the intended route */
export function popIntendedRoute(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const route = localStorage.getItem(RETURN_TO_KEY);
        if (route) localStorage.removeItem(RETURN_TO_KEY);
        return route;
    } catch { return null; }
}

/** Check if there's a pending intended route */
export function hasIntendedRoute(): boolean {
    if (typeof window === 'undefined') return false;
    try { return !!localStorage.getItem(RETURN_TO_KEY); } catch { return false; }
}
