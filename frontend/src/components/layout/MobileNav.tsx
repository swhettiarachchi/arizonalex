'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, SearchIcon, PlusIcon, BellIcon, UserIcon } from '../ui/Icons';

const items = [
    { href: '/', icon: <HomeIcon size={22} />, label: 'Home' },
    { href: '/explore', icon: <SearchIcon size={22} />, label: 'Explore' },
    { href: '/create-post', icon: <PlusIcon size={22} />, label: 'Post' },
    { href: '/notifications', icon: <BellIcon size={22} />, label: 'Alerts', badge: true },
    { href: '/profile', icon: <UserIcon size={22} />, label: 'Profile' },
];

export default function MobileNav() {
    const pathname = usePathname();
    return (
        <nav className="mobile-nav">
            {items.map(item => (
                <Link key={item.href} href={item.href} className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}>
                    {item.badge && <span className="mob-badge" />}
                    {item.icon}
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
