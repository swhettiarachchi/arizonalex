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
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [user, setUser] = useState<UserProfile | null>({
        id: 'demo-user-123',
        name: 'Demo User',
        username: 'demouser',
        bio: 'This is a demo account for ArizonaLex.',
        location: 'Phoenix, AZ',
        website: 'https://arizonalex.com',
        role: 'citizen',
        verified: true,
        followers: 1250,
        following: 450,
        joined: 'March 2026',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    });
    const [loading, setLoading] = useState(false);

    // Initial session check disabled for demo
    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
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
