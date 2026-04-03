'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import {
    HomeIcon, SearchIcon, BellIcon, MailIcon, LandmarkIcon, BotIcon,
    BookmarkIcon, UserIcon, SettingsIcon, SunIcon, MoonIcon,
    MoreHorizontalIcon, ZapIcon, PlusIcon, LogOutIcon, BriefcaseIcon,
    GlobeIcon, HelpCircleIcon, FlagIcon, ShieldIcon, FileTextIcon,
    MessageSquareIcon, ServerIcon, ScaleIcon, DollarSignIcon, NewspaperIcon, LockIcon,
    SwordsIcon, WalletIcon, ChevronDownIcon, XIcon
} from '../ui/Icons';
import React from 'react';
import { UserAvatar } from '../ui/UserAvatar';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        label: '',
        items: [
            { href: '/', icon: <HomeIcon />, label: 'Home' },
            { href: '/explore', icon: <SearchIcon />, label: 'Explore' },
            { href: '/notifications', icon: <BellIcon />, label: 'Notifications', badge: 3 },
            { href: '/messages', icon: <MailIcon />, label: 'Messages', badge: 2 },
        ]
    },
    {
        label: 'Arena',
        items: [
            { href: '/debates', icon: <SwordsIcon />, label: 'Debates' },
            { href: '/wallet', icon: <WalletIcon />, label: 'Wallet' },
        ]
    },
    {
        label: 'Intelligence',
        items: [
            { href: '/global-politics', icon: <GlobeIcon />, label: 'Global Politics' },
            { href: '/politics', icon: <LandmarkIcon />, label: 'Politics' },
            { href: '/business', icon: <BriefcaseIcon />, label: 'Business' },
            { href: '/crypto', icon: <DollarSignIcon />, label: 'Crypto' },
            { href: '/news', icon: <NewspaperIcon />, label: 'News' },
            { href: '/ai-tools', icon: <BotIcon />, label: 'AI Tools' },
        ]
    },
    {
        label: 'You',
        items: [
            { href: '/bookmarks', icon: <BookmarkIcon />, label: 'Bookmarks' },
            { href: '/profile', icon: <UserIcon />, label: 'Profile' },
            { href: '/settings/security', icon: <LockIcon />, label: 'Security' },
            { href: '/admin', icon: <SettingsIcon />, label: 'Admin' },
            { href: '/verify', icon: <ShieldIcon />, label: 'Get Verified' },
        ]
    },
    {
        label: 'Support',
        items: [
            { href: '/help', icon: <HelpCircleIcon />, label: 'Help Center' },
            { href: '/faq', icon: <MessageSquareIcon />, label: 'FAQ' },
            { href: '/contact', icon: <MailIcon />, label: 'Contact Us' },
            { href: '/report', icon: <FlagIcon />, label: 'Report' },
            { href: '/status', icon: <ServerIcon />, label: 'System Status' },
        ]
    },
    {
        label: 'Legal',
        items: [
            { href: '/guidelines', icon: <ShieldIcon />, label: 'Guidelines' },
            { href: '/privacy', icon: <FileTextIcon />, label: 'Privacy' },
            { href: '/terms', icon: <ScaleIcon />, label: 'Terms' },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggle } = useTheme();
    const { isLoggedIn, logout, user } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Track scroll for dynamic header
    useEffect(() => {
        const main = document.querySelector('.main-content');
        if (!main) return;
        const handleScroll = () => setIsScrolled(main.scrollTop > 30);
        main.addEventListener('scroll', handleScroll, { passive: true });
        return () => main.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    return (
        <aside className={`sidebar ${isScrolled ? 'sidebar-compact' : ''}`}>
            {/* Logo */}
            <Link href="/" className="sidebar-logo">
                <div className="logo-icon"><ZapIcon size={18} /></div>
                <span className="logo-text">Arizonalex</span>
            </Link>

            {/* Search */}
            <div className="sidebar-search-wrap" ref={searchRef}>
                <button className="sidebar-search-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
                    <SearchIcon size={18} />
                    <span>Search</span>
                </button>
                {showSearch && (
                    <div className="sidebar-search-dropdown fade-in">
                        <form onSubmit={handleSearch}>
                            <div className="sidebar-search-input-wrap">
                                <SearchIcon size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users, posts, news..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button type="button" className="search-clear" onClick={() => setSearchQuery('')}>
                                        <XIcon size={14} />
                                    </button>
                                )}
                            </div>
                        </form>
                        <div className="sidebar-search-hint">
                            Press <kbd>Enter</kbd> to search
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navSections.map((section, si) => (
                    <React.Fragment key={si}>
                        {section.label && (
                            <div className="sidebar-section-label">{section.label}</div>
                        )}
                        {section.items.map(item => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                    {isLoggedIn && item.badge && <span className="nav-badge">{item.badge}</span>}
                                    {isActive && <span className="nav-active-indicator" />}
                                </Link>
                            );
                        })}
                    </React.Fragment>
                ))}

                {/* Theme Toggle */}
                <div className="sidebar-section-label" />
                <button className="nav-item nav-theme-toggle" onClick={toggle}>
                    <span className="nav-icon">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
                    <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </nav>

            {/* User Footer */}
            <div className="sidebar-footer" ref={menuRef}>
                {isLoggedIn ? (
                    <>
                        {showUserMenu && (
                            <div className="user-menu-dropdown fade-in">
                                <div className="user-menu-header">
                                    <UserAvatar name={user?.name || "Alex Jordan"} avatar="/avatars/alex-jordan.png" size="md" />
                                    <div>
                                        <div className="user-menu-name">{user?.name || "Alex Jordan"}</div>
                                        <div className="user-menu-handle">@{user?.username || "alexjordan"}</div>
                                    </div>
                                </div>
                                <div className="user-menu-divider" />
                                <Link href="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <UserIcon size={18} />
                                    <span>View Profile</span>
                                </Link>
                                <Link href="/settings/security" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <SettingsIcon size={18} />
                                    <span>Settings</span>
                                </Link>
                                <Link href="/login" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <PlusIcon size={18} />
                                    <span>Add Account</span>
                                </Link>
                                <div className="user-menu-divider" />
                                <button className="user-menu-item user-menu-logout" onClick={() => {
                                    logout();
                                    setShowUserMenu(false);
                                    router.push('/login');
                                }}>
                                    <LogOutIcon size={18} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        )}
                        <div className={`sidebar-user ${showUserMenu ? 'active' : ''}`}>
                            <Link href="/profile" className="sidebar-user-link">
                                <UserAvatar name={user?.name || "Alex Jordan"} avatar="/avatars/alex-jordan.png" size="sm" />
                                <div className="user-info">
                                    <div className="user-name">{user?.name || "Alex Jordan"}</div>
                                    <div className="user-handle">@{user?.username || "alexjordan"}</div>
                                </div>
                            </Link>
                            <button
                                className="sidebar-user-more"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUserMenu(!showUserMenu);
                                }}
                                aria-label="More options"
                            >
                                <MoreHorizontalIcon size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="sidebar-auth-btns">
                        <Link href="/login" className="btn btn-primary btn-sm sidebar-auth-btn">Sign In</Link>
                        <Link href="/register" className="btn btn-outline btn-sm sidebar-auth-btn">Create Account</Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
