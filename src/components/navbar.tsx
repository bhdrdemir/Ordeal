'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { X, Plus } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-zinc-200'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left — Logo / Brand name */}
        <Link href="/" className="flex-shrink-0 hover:opacity-70 transition-opacity">
          <span
            className="text-sm font-semibold tracking-wider text-zinc-900"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
          >
            ORDEAL
          </span>
        </Link>

        {/* Center — Main CTA button (Sutéra-style bordered button) */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-zinc-300 text-xs text-zinc-700 hover:border-orange-400 hover:text-orange-600 transition-all"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
          >
            LEADERBOARD
          </Link>
          <Link
            href="/docs"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
          >
            DOCS
          </Link>
        </div>

        {/* Right — Auth + time-like element */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-all active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            >
              DASHBOARD
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
              >
                LOG IN
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-all active:scale-[0.97]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
              >
                GET STARTED
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-3">
            <Link
              href="/leaderboard"
              className="block text-xs text-zinc-600 hover:text-zinc-900 transition-colors py-2"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              LEADERBOARD
            </Link>
            <Link
              href="/docs"
              className="block text-xs text-zinc-600 hover:text-zinc-900 transition-colors py-2"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              DOCS
            </Link>
            <div className="border-t border-zinc-200 pt-3 space-y-2">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="block px-5 py-2.5 bg-zinc-950 text-white text-xs font-medium text-center"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-xs text-zinc-600 hover:text-zinc-900 transition-colors py-2"
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    LOG IN
                  </Link>
                  <Link
                    href="/login"
                    className="block px-5 py-2.5 bg-zinc-950 text-white text-xs font-medium text-center"
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    GET STARTED
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
