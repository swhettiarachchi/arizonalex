'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { ZapIcon, BellIcon, MailIcon, LandmarkIcon, BookmarkIcon } from '@/components/ui/Icons';

const AUTH_PAGES = ['/login', '/register'];
const PROTECTED_PAGES = ['/notifications', '/messages', '/politics', '/bookmarks'];

const PROTECTED_PAGE_INFO: Record<string, { icon: React.ReactNode; label: string; desc: string }> = {
    '/notifications': { icon: <BellIcon size={28} />, label: 'Notifications', desc: 'Sign in to see your notifications, mentions, and activity.' },
    '/messages': { icon: <MailIcon size={28} />, label: 'Messages', desc: 'Sign in to send and receive direct messages.' },
    '/politics': { icon: <LandmarkIcon size={28} />, label: 'Politics Hub', desc: 'Sign in to access polls, promise trackers, events, and political analytics.' },
    '/bookmarks': { icon: <BookmarkIcon size={28} />, label: 'Bookmarks', desc: 'Sign in to view your saved posts and bookmarks.' },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLoggedIn } = useAuth();
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isProtectedPage = PROTECTED_PAGES.includes(pathname);

    // Login/register pages render without the app shell
    if (isAuthPage) {
        return <main className="main-content">{children}</main>;
    }

    // Protected pages require login
    if (isProtectedPage && !isLoggedIn) {
        const info = PROTECTED_PAGE_INFO[pathname];
        return (
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <div className="page-container">
                        <div className="feed-column">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
                                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 20 }}>
                                    {info?.icon || <ZapIcon size={28} />}
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{info?.label || 'Page'}</h2>
                                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 360 }}>{info?.desc || 'Sign in to access this page.'}</p>
                                <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: 180, marginBottom: 10 }}>Sign In</Link>
                                <Link href="/register" className="btn btn-outline btn-lg" style={{ minWidth: 180 }}>Create Account</Link>
                            </div>
                        </div>
                    </div>
                </main>
                <MobileNav />
            </div>
        );
    }

    // All other pages show sidebar + mobile nav (even for guests)
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
            <MobileNav />
        </div>
    );
}
