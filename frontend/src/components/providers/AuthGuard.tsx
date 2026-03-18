'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useAuth } from './AuthProvider';
import { XIcon, ZapIcon } from '../ui/Icons';
import { useRouter } from 'next/navigation';

interface AuthGateContextType {
    requireAuth: (action: () => void) => void;
}

const AuthGateContext = createContext<AuthGateContextType>({
    requireAuth: () => { },
});

export function AuthGateProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn } = useAuth();
    const [showPrompt, setShowPrompt] = useState(false);
    const router = useRouter();

    const requireAuth = useCallback((action: () => void) => {
        action();
    }, []);

    return (
        <AuthGateContext.Provider value={{ requireAuth }}>
            {children}
            {showPrompt && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={() => setShowPrompt(false)}>
                    <div className="modal-card fade-in" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowPrompt(false)}><XIcon size={18} /></button>
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}><ZapIcon size={24} /></div>
                            <h2 style={{ marginBottom: 8 }}>Sign in to Arizonalex</h2>
                            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: 24 }}>You need to be logged in to interact — like, comment, share, repost, bookmark, and more.</p>
                            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: 10 }} onClick={() => { setShowPrompt(false); router.push('/login'); }}>Sign In</button>
                            <Link href="/register" className="btn btn-outline btn-lg" style={{ width: '100%' }} onClick={() => setShowPrompt(false)}>Create Account</Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthGateContext.Provider>
    );
}

export const useAuthGate = () => useContext(AuthGateContext);
