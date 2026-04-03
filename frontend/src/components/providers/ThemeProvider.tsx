'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => { } });

export function useTheme() { return useContext(ThemeContext); }

export default function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('arizonalex-theme') as Theme | null;
        // eslint-disable-next-line
        if (saved) setTheme(saved);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('arizonalex-theme', theme);
        }
    }, [theme, mounted]);

    const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;
    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
