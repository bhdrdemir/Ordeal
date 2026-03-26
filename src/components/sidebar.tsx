'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Plug, FlaskConical, Key, Settings, LogOut, Github } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Providers', href: '/dashboard/providers', icon: Plug },
    { label: 'Evaluations', href: '/dashboard/evals', icon: FlaskConical },
    { label: 'API Keys', href: '/dashboard/keys', icon: Key },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Link href="/dashboard" className="block hover:opacity-80 transition-opacity">
          <Image src="/logo/ordeal-logo-dark.svg" alt="Ordeal" width={140} height={40} style={{ height: 'auto' }} priority />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* GitHub */}
      <div className="px-3 pb-2">
        <Link
          href="https://github.com/bhdrdemir/Ordeal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors text-sm"
        >
          <Github size={16} />
          <span>GitHub</span>
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-slate-800 px-3 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ redirectTo: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
