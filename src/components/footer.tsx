import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          {/* Logo & Description */}
          <div className="space-y-2">
            <p className="font-bold text-slate-100">Ordeal</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Professional LLM benchmarking. Free and open source.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Product</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/leaderboard" className="text-slate-400 hover:text-slate-200 transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Community</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="https://github.com/bhdrdemir/Ordeal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Github size={16} />
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-slate-500">
            &copy; {currentYear} Ordeal. Free and open source.
          </p>
          <p className="text-slate-600">
            Built with love for the AI community
          </p>
        </div>
      </div>
    </footer>
  );
}
