'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type ApiUser, getToken, setToken, removeToken } from '@/lib/api';

interface AuthContextType {
    isLoggedIn: boolean;
    user: ApiUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<ApiUser>) => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    token: null,
    login: async () => { },
    logout: () => { },
    updateProfile: () => { },
    loading: false,
    error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ApiUser | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);  // start true to rehydrate
    const [error, setError] = useState<string | null>(null);

    // Rehydrate session from localStorage on mount
    useEffect(() => {
        const storedToken = getToken();
        if (storedToken) {
            setTokenState(storedToken);
            authApi.getMe()
                .then(res => setUser(res.user))
                .catch(() => {
                    // Token expired or invalid — clear it
                    removeToken();
                    setTokenState(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.login(email, password);
            setToken(res.token);
            setTokenState(res.token);
            setUser(res.user);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;  // rethrow so login page can handle it
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        removeToken();
        setTokenState(null);
        setUser(null);
    };

    const updateProfile = (updates: Partial<ApiUser>) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                token,
                login,
                logout,
                updateProfile,
                loading,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
