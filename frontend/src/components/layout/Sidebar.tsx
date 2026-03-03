'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import { HomeIcon, SearchIcon, BellIcon, MailIcon, LandmarkIcon, BotIcon, BookmarkIcon, UserIcon, SettingsIcon, SunIcon, MoonIcon, MoreHorizontalIcon, ZapIcon, PlusIcon, LogOutIcon } from '../ui/Icons';
import React from 'react';
import { UserAvatar } from '../ui/UserAvatar';

const navItems = [
    { href: '/', icon: <HomeIcon />, label: 'Home' },
    { href: '/explore', icon: <SearchIcon />, label: 'Explore' },
    { href: '/notifications', icon: <BellIcon />, label: 'Notifications', badge: 3 },
    { href: '/messages', icon: <MailIcon />, label: 'Messages', badge: 2 },
    { href: '/politics', icon: <LandmarkIcon />, label: 'Politics' },
    { href: '/ai-tools', icon: <BotIcon />, label: 'AI Tools' },
    { href: '/bookmarks', icon: <BookmarkIcon />, label: 'Bookmarks' },
    { href: '/profile', icon: <UserIcon />, label: 'Profile' },
    { href: '/admin', icon: <SettingsIcon />, label: 'Admin' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggle } = useTheme();
    const { isLoggedIn, logout, user } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon"><ZapIcon size={18} /></div>
                Arizonalex
            </div>
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                        {isLoggedIn && item.badge && <span className="badge">{item.badge}</span>}
                    </Link>
                ))}
                <button className="nav-item" onClick={toggle}>
                    <span className="nav-icon">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </nav>
            <div className="sidebar-footer" ref={menuRef}>
                {isLoggedIn ? (
                    <>
                        {showUserMenu && (
                            <div className="user-menu-dropdown fade-in">
                                <Link href="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <UserIcon size={18} />
                                    <span>View profile @{user?.username || 'alexjordan'}</span>
                                </Link>
                                <Link href="/login" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <PlusIcon size={18} />
                                    <span>Add an existing account</span>
                                </Link>
                                <button className="user-menu-item" onClick={() => {
                                    logout();
                                    setShowUserMenu(false);
                                    router.push('/login');
                                }}>
                                    <LogOutIcon size={18} />
                                    <span>Log out @{user?.username || 'alexjordan'}</span>
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
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link href="/login" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }}>Sign In</Link>
                        <Link href="/register" className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center' }}>Create Account</Link>
                    </div>
                )}
            </div>
        </aside>
    );
}

