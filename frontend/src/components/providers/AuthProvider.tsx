'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole =
    | 'politician' | 'official' | 'journalist' | 'citizen' | 'admin'
    | 'businessman' | 'entrepreneur' | 'crypto_trader' | 'stock_trader'
    | 'banker' | 'doctor' | 'researcher' | 'academic' | 'lawyer'
    | 'judge' | 'activist' | 'celebrity' | 'other';

export interface UserProfile {
    id?: string;
    name: string;
    username: string;
    bio: string;
    location: string;
    website: string;
    role: UserRole;
    party?: string;
    avatar?: string;
    banner?: string;
    phone?: string;
    email?: string;
    verified?: boolean;
    followers?: number;
    following?: number;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    profileViews?: number;
    joined?: string;
    twoFactorEnabled?: boolean;
    // Political fields
    position?: string;
    ideology?: string;
    yearsActive?: string;
    country?: string;
    campaignPromises?: string[];
    achievements?: string[];
    supportPercentage?: number;
    // Business fields
    company?: string;
    industry?: string;
    services?: string[];
    portfolioUrl?: string;
    // Verification fields
    faceVerified?: boolean;
    verificationScore?: number;
    verificationDate?: string;
    identityLevel?: 'normal' | 'verified_citizen' | 'verified_politician' | 'official_government';
    faceioId?: string;
    trustScore?: number;
    authProvider?: 'google' | 'email';
}

interface LoginResult {
    success: boolean;
    error?: string;
    requires2FA?: boolean;
    tempToken?: string;
    devOtp?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    loading: true,
    login: async () => ({ success: false }),
    logout: async () => { },
    updateProfile: async () => { },
    refreshAuth: async () => { },
});

// Helper to read a cookie by name (client-side only for non-httpOnly cookies)
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const res = await fetch('/api/auth/me', { signal: controller.signal });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                    setIsLoggedIn(true);
                    return true;
                }
            }
        } catch {
            // Network error or timeout — don't log out the user if cookie exists
            const userId = getCookie('user-id');
            if (userId) {
                // Session cookie exists but server validation failed (likely network issue)
                // Keep user "logged in" optimistically
                if (!isLoggedIn) {
                    setIsLoggedIn(true);
                    setUser({
                        id: userId,
                        name: 'Loading...',
                        username: '',
                        bio: '',
                        location: '',
                        website: '',
                        role: 'citizen',
                    });
                }
                return true;
            }
        }
        return false;
    };

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            // Fast path: check if user-id cookie exists (non-httpOnly)
            const userId = getCookie('user-id');
            if (!userId) {
                setLoading(false);
                return;
            }

            // Cookie exists — user is likely logged in, show optimistic UI
            setIsLoggedIn(true);

            // Fetch full user data from server
            await fetchUser();
            setLoading(false);
        };
        checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshAuth = async () => {
        await fetchUser();
    };

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (data.success && data.user) {
                setUser(data.user);
                setIsLoggedIn(true);
                return { success: true };
            }

            // Return full error details (including provider_mismatch)
            return {
                success: false,
                error: data.error || 'Login failed',
                requires2FA: data.requires2FA,
                tempToken: data.tempToken,
                devOtp: data.devOtp,
            };
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch { }
        setIsLoggedIn(false);
        setUser(null);
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setUser(data.user);
                console.log('Profile updated successfully');
            } else {
                console.error('Profile update failed:', data.error || res.status);
                setUser(prev => prev ? { ...prev, ...updates } : prev);
            }
        } catch (err) {
            console.error('Profile update network error:', err);
            setUser(prev => prev ? { ...prev, ...updates } : prev);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout, updateProfile, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
