'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import {
    HomeIcon, SearchIcon, PlusIcon, BellIcon, UserIcon,
    MailIcon, LandmarkIcon, BriefcaseIcon,
    BotIcon, BookmarkIcon, SettingsIcon, XIcon, GlobeIcon,
    HelpCircleIcon, FlagIcon, ShieldIcon, FileTextIcon,
    MessageSquareIcon, ServerIcon, ScaleIcon, SwordsIcon, WalletIcon,
    DollarSignIcon, NewspaperIcon, LockIcon, LogOutIcon,
    SunIcon, MoonIcon, ZapIcon, ChevronDownIcon
} from '../ui/Icons';
import { UserAvatar } from '../ui/UserAvatar';

/* ── Bottom Tab Items ── */
const bottomTabs = [
    { href: '/', icon: <HomeIcon size={22} />, label: 'Home' },
    { href: '/explore', icon: <SearchIcon size={22} />, label: 'Explore' },
    { href: '/create-post', icon: <PlusIcon size={22} />, label: 'Post', isAction: true },
    { href: '/notifications', icon: <BellIcon size={22} />, label: 'Alerts' },
];

/* ── Full Menu Sections ── */
interface MenuSection {
    label: string;
    items: { href: string; icon: React.ReactNode; label: string }[];
}

const menuSections: MenuSection[] = [
    {
        label: 'Main',
        items: [
            { href: '/', icon: <HomeIcon size={20} />, label: 'Home' },
            { href: '/explore', icon: <SearchIcon size={20} />, label: 'Explore' },
            { href: '/news', icon: <NewspaperIcon size={20} />, label: 'News' },
            { href: '/messages', icon: <MailIcon size={20} />, label: 'Messages' },
            { href: '/notifications', icon: <BellIcon size={20} />, label: 'Notifications' },
        ]
    },
    {
        label: 'Arena',
        items: [
            { href: '/debates', icon: <SwordsIcon size={20} />, label: 'Debates' },
            { href: '/wallet', icon: <WalletIcon size={20} />, label: 'Wallet' },
            { href: '/create-post', icon: <PlusIcon size={20} />, label: 'Create Post' },
        ]
    },
    {
        label: 'Intelligence',
        items: [
            { href: '/global-politics', icon: <GlobeIcon size={20} />, label: 'Global Politics' },
            { href: '/politics', icon: <LandmarkIcon size={20} />, label: 'Politics' },
            { href: '/business', icon: <BriefcaseIcon size={20} />, label: 'Business' },
            { href: '/crypto', icon: <DollarSignIcon size={20} />, label: 'Crypto' },
            { href: '/ai-tools', icon: <BotIcon size={20} />, label: 'AI Tools' },
        ]
    },
    {
        label: 'Your Account',
        items: [
            { href: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
            { href: '/bookmarks', icon: <BookmarkIcon size={20} />, label: 'Bookmarks' },
            { href: '/settings/security', icon: <LockIcon size={20} />, label: 'Security' },
            { href: '/admin', icon: <SettingsIcon size={20} />, label: 'Admin' },
            { href: '/verify', icon: <ShieldIcon size={20} />, label: 'Get Verified' },
        ]
    },
    {
        label: 'Support',
        items: [
            { href: '/help', icon: <HelpCircleIcon size={20} />, label: 'Help Center' },
            { href: '/faq', icon: <MessageSquareIcon size={20} />, label: 'FAQ' },
            { href: '/contact', icon: <MailIcon size={20} />, label: 'Contact' },
            { href: '/report', icon: <FlagIcon size={20} />, label: 'Report' },
            { href: '/status', icon: <ServerIcon size={20} />, label: 'System Status' },
        ]
    },
    {
        label: 'Legal',
        items: [
            { href: '/guidelines', icon: <ShieldIcon size={20} />, label: 'Guidelines' },
            { href: '/privacy', icon: <FileTextIcon size={20} />, label: 'Privacy' },
            { href: '/terms', icon: <ScaleIcon size={20} />, label: 'Terms' },
        ]
    },
];

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggle } = useTheme();
    const { isLoggedIn, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const drawerRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when menu open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    return (
        <>
            {/* ══════════ Mobile Top Header ══════════ */}
            <header className="mobile-top-header">
                <Link href="/" className="mobile-logo">
                    <div className="mobile-logo-icon"><ZapIcon size={16} /></div>
                    <span>Arizonalex</span>
                </Link>
                <div className="mobile-top-actions">
                    <button className="mobile-top-btn" onClick={toggle} aria-label="Toggle theme">
                        {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
                    </button>
                    <button
                        className="mobile-hamburger"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <span className="hamburger-line" />
                        <span className="hamburger-line" />
                        <span className="hamburger-line" />
                    </button>
                </div>
            </header>

            {/* ══════════ Full Menu Overlay ══════════ */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className="mobile-menu-drawer" ref={drawerRef} onClick={e => e.stopPropagation()}>
                    {/* Drawer Header */}
                    <div className="mobile-drawer-header">
                        <div className="mobile-drawer-title">
                            <div className="mobile-drawer-logo"><ZapIcon size={16} /></div>
                            <span>Menu</span>
                        </div>
                        <button className="mobile-drawer-close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                            <XIcon size={22} />
                        </button>
                    </div>

                    {/* User Section */}
                    {isLoggedIn && (
                        <Link href="/profile" className="mobile-menu-user" onClick={() => setIsMenuOpen(false)}>
                            <UserAvatar name={user?.name || "Alex Jordan"} avatar="/avatars/alex-jordan.png" size="md" />
                            <div className="mobile-menu-user-info">
                                <div className="mobile-menu-user-name">{user?.name || "Alex Jordan"}</div>
                                <div className="mobile-menu-user-handle">@{user?.username || "alexjordan"}</div>
                            </div>
                            <ChevronDownIcon size={16} className="mobile-menu-user-arrow" />
                        </Link>
                    )}

                    {/* Search */}
                    <form className="mobile-menu-search" onSubmit={handleSearch}>
                        <SearchIcon size={16} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Menu Sections */}
                    <div className="mobile-menu-scroll">
                        {menuSections.map((section, si) => (
                            <div key={si} className="mobile-menu-section">
                                <div className="mobile-menu-section-label">{section.label}</div>
                                <div className="mobile-menu-list">
                                    {section.items.map(item => {
                                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`mobile-menu-link ${isActive ? 'active' : ''}`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <span className="mobile-menu-icon">{item.icon}</span>
                                                <span className="mobile-menu-label">{item.label}</span>
                                                {isActive && <span className="mobile-menu-active-dot" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Theme Toggle in Menu */}
                        <div className="mobile-menu-section">
                            <div className="mobile-menu-section-label">Appearance</div>
                            <button className="mobile-menu-link" onClick={() => { toggle(); }}>
                                <span className="mobile-menu-icon">{theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}</span>
                                <span className="mobile-menu-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                        </div>

                        {/* Auth buttons */}
                        {isLoggedIn ? (
                            <div className="mobile-menu-section">
                                <button className="mobile-menu-link mobile-menu-logout" onClick={() => {
                                    logout();
                                    setIsMenuOpen(false);
                                    router.push('/login');
                                }}>
                                    <span className="mobile-menu-icon"><LogOutIcon size={20} /></span>
                                    <span className="mobile-menu-label">Log Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-menu-auth">
                                <Link href="/login" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)} style={{ flex: 1, textAlign: 'center' }}>Sign In</Link>
                                <Link href="/register" className="btn btn-outline btn-sm" onClick={() => setIsMenuOpen(false)} style={{ flex: 1, textAlign: 'center' }}>Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════ Bottom Tab Bar ══════════ */}
            <nav className="mobile-nav">
                {bottomTabs.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mobile-nav-item ${isActive ? 'active' : ''} ${item.isAction ? 'action' : ''}`}
                        >
                            <span className="mobile-nav-icon">{item.icon}</span>
                            <span className="mobile-nav-label">{item.label}</span>
                        </Link>
                    );
                })}
                {/* Profile tab */}
                <Link href="/profile" className={`mobile-nav-item ${pathname === '/profile' ? 'active' : ''}`}>
                    {isLoggedIn ? (
                        <UserAvatar name={user?.name || "A"} avatar="/avatars/alex-jordan.png" size="xs" />
                    ) : (
                        <UserIcon size={22} />
                    )}
                    <span className="mobile-nav-label">Profile</span>
                </Link>
            </nav>
        </>
    );
}
