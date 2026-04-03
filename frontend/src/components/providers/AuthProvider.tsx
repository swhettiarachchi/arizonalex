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
    joined?: string;
    twoFactorEnabled?: boolean;
    // Political fields
    position?: string;
    ideology?: string;
    yearsActive?: string;
    country?: string;
    campaignPromises?: string[];
    achievements?: string[];
    // Business fields
    company?: string;
    industry?: string;
    services?: string[];
    portfolioUrl?: string;
    // Face verification fields
    faceVerified?: boolean;
    verificationScore?: number;
    verificationDate?: string;
    identityLevel?: 'normal' | 'verified_citizen' | 'verified_politician' | 'official_government';
    faceioId?: string;
    trustScore?: number;
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
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    loading: true,
    login: async () => ({ success: false }),
    logout: async () => { },
    updateProfile: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        setIsLoggedIn(true);
                    }
                }
            } catch {
                // No active session
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            // 2FA required — return temp token for the login page to handle
            if (data.success && data.requires2FA) {
                return {
                    success: true,
                    requires2FA: true,
                    tempToken: data.tempToken,
                    devOtp: data.devOtp,
                };
            }

            if (data.success && data.user) {
                setUser(data.user);
                setIsLoggedIn(true);
                return { success: true };
            }
            return { success: false, error: data.error || 'Login failed' };
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
            if (data.user) {
                setUser(data.user);
            } else {
                // Optimistic update if API failed
                setUser(prev => prev ? { ...prev, ...updates } : prev);
            }
        } catch {
            setUser(prev => prev ? { ...prev, ...updates } : prev);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
