'use client';

import Link from 'next/link';
import { Github, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <span
              className="text-sm font-semibold tracking-wider text-zinc-900"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
            >
              ORDEAL
            </span>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              Open-source LLM benchmarking platform. Test any model with your prompts and your rules.
            </p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
              Ordeal {currentYear} &mdash; Free &amp; Open Source
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block" style={{ fontFamily: 'var(--font-mono)' }}>
              Product
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link href="/leaderboard" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors inline-flex items-center gap-1">
                  Leaderboard
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block" style={{ fontFamily: 'var(--font-mono)' }}>
              Reach Out
            </span>
            <div className="flex gap-3">
              <Link
                href="https://github.com/bhdrdemir/Ordeal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 text-zinc-600 text-xs hover:border-zinc-500 hover:text-zinc-900 transition-all"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
              >
                <Github className="w-4 h-4" />
                GITHUB
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar with scroll-to-top */}
        <div className="border-t border-zinc-200 pt-6 flex items-center justify-between">
          <p className="text-[10px] text-zinc-400" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            BUILT FOR THE AI COMMUNITY
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
          >
            TOP &uarr;
          </button>
        </div>
      </div>
    </footer>
  );
}
