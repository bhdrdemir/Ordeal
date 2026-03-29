'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Plug, FlaskConical, Key, Settings, LogOut, Github, ArrowUpRight } from 'lucide-react';
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
    { label: 'OVERVIEW', href: '/dashboard', icon: LayoutDashboard },
    { label: 'PROVIDERS', href: '/dashboard/providers', icon: Plug },
    { label: 'EVALUATIONS', href: '/dashboard/evals', icon: FlaskConical },
    { label: 'API KEYS', href: '/dashboard/keys', icon: Key },
    { label: 'SETTINGS', href: '/dashboard/settings', icon: Settings },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 text-white flex flex-col border-r border-zinc-800">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-zinc-800">
        <Link href="/dashboard" className="block hover:opacity-70 transition-opacity">
          <span
            className="text-xs font-semibold tracking-wider text-white"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}
          >
            ORDEAL
          </span>
        </Link>
        <span
          className="text-[9px] text-zinc-600 block mt-1"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
        >
          DASHBOARD /v1
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <span className="block px-3 mb-3 text-[9px] text-zinc-600 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
          Navigation
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-all ${
                active
                  ? 'text-orange-400 border-l-2 border-orange-500 bg-orange-500/5'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-l-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* External Links */}
      <div className="px-3 pb-2 space-y-0.5">
        <Link
          href="/docs"
          className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        >
          DOCS
          <ArrowUpRight size={12} />
        </Link>
        <Link
          href="https://github.com/bhdrdemir/Ordeal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        >
          <Github size={14} />
          GITHUB
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-zinc-800 px-3 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-7 h-7 rounded-sm flex-shrink-0 grayscale"
              />
            ) : (
              <div className="w-7 h-7 rounded-sm bg-orange-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                   style={{ fontFamily: 'var(--font-mono)' }}>
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                {user.name || 'User'}
              </p>
              <p className="text-[10px] text-zinc-600 truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ redirectTo: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 hover:text-red-400 hover:bg-red-900/10 transition-all"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        >
          <LogOut size={14} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
}
