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

    // Protected pages check removed for demo
    /*
    if (isProtectedPage && !isLoggedIn) {
        ...
    }
    */

    // All other pages show sidebar + mobile nav (even for guests)
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
            <MobileNav />
        </div>
    );
}
