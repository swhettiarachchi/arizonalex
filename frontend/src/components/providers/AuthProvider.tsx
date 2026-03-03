'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
    name: string;
    username: string;
    bio: string;
    location: string;
    website: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: UserProfile | null;
    login: () => void;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    login: () => { },
    logout: () => { },
    updateProfile: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    const login = () => {
        setIsLoggedIn(true);
        setUser({
            name: 'Alex Jordan',
            username: 'alexjordan',
            bio: 'Engaged citizen. Democracy is not a spectator sport.',
            location: 'Washington, D.C.',
            website: '',
        });
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    const updateProfile = (updates: Partial<UserProfile>) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    };

    return <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
