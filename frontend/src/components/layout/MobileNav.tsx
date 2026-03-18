'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon, SearchIcon, PlusIcon, BellIcon, UserIcon,
    MoreHorizontalIcon, MailIcon, LandmarkIcon, BriefcaseIcon,
    BotIcon, BookmarkIcon, SettingsIcon, XIcon, GlobeIcon,
    HelpCircleIcon, FlagIcon, ShieldIcon, FileTextIcon,
    MessageSquareIcon, ServerIcon, ScaleIcon
} from '../ui/Icons';

const bottomItems = [
    { href: '/', icon: <HomeIcon size={22} />, label: 'Home' },
    { href: '/create-post', icon: <PlusIcon size={22} />, label: 'Post' },
    { href: '/business', icon: <BriefcaseIcon size={22} />, label: 'Business' },
    { href: '/politics', icon: <LandmarkIcon size={22} />, label: 'Politics' },
    { href: '/messages', icon: <MailIcon size={22} />, label: 'Messages', badge: true },
    { href: '/global-politics', icon: <GlobeIcon size={22} />, label: 'Global' },
];

interface MenuSection {
    label: string;
    items: { href: string; icon: React.ReactNode; label: string }[];
}

const menuSections: MenuSection[] = [
    {
        label: 'Navigate',
        items: [
            { href: '/explore', icon: <SearchIcon size={20} />, label: 'Explore' },
            { href: '/notifications', icon: <BellIcon size={20} />, label: 'Notifications' },
            { href: '/global-politics', icon: <GlobeIcon size={20} />, label: 'Global Politics' },
            { href: '/ai-tools', icon: <BotIcon size={20} />, label: 'AI Tools' },
        ]
    },
    {
        label: 'Your Account',
        items: [
            { href: '/bookmarks', icon: <BookmarkIcon size={20} />, label: 'Bookmarks' },
            { href: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
            { href: '/admin', icon: <SettingsIcon size={20} />, label: 'Admin' },
        ]
    },
    {
        label: 'Support',
        items: [
            { href: '/help', icon: <HelpCircleIcon size={20} />, label: 'Help Center' },
            { href: '/faq', icon: <MessageSquareIcon size={20} />, label: 'FAQ' },
            { href: '/contact', icon: <MailIcon size={20} />, label: 'Contact' },
            { href: '/report', icon: <FlagIcon size={20} />, label: 'Report' },
            { href: '/status', icon: <ServerIcon size={20} />, label: 'Status' },
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Expanded Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className="mobile-menu-drawer" onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Menu</h2>
                        <button onClick={() => setIsMenuOpen(false)} style={{ padding: 8, color: 'var(--text-secondary)' }}>
                            <XIcon size={24} />
                        </button>
                    </div>

                    {menuSections.map((section, si) => (
                        <div key={si} className="mobile-menu-section">
                            <div className="mobile-menu-section-label">{section.label}</div>
                            <div className="mobile-menu-grid">
                                {section.items.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`mobile-menu-link ${pathname === item.href ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="icon-box">{item.icon}</div>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Tab Bar */}
            <nav className="mobile-nav">
                {bottomItems.map(item => (
                    <Link key={item.href} href={item.href} className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}>
                        {item.badge && <span className="mob-badge" />}
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
                <button className="mobile-nav-item" onClick={() => setIsMenuOpen(true)}>
                    <MoreHorizontalIcon size={22} />
                    <span>More</span>
                </button>
            </nav>
        </>
    );
}
