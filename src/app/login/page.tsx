import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginButtons from "@/components/login-buttons";
import { ArrowUpRight } from "lucide-react";

export default async function LoginPage() {
  let isAuthenticated = false;
  try {
    const session = await auth();
    if (session?.user) isAuthenticated = true;
  } catch {
    // DB not ready or auth error — just show login page
  }
  if (isAuthenticated) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#fafafa] blueprint-grid relative flex">
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-crosshairs pointer-events-none z-0" />

      {/* Left — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-12">
            <Link
              href="/"
              className="text-sm font-semibold tracking-wider text-zinc-900"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
            >
              ORDEAL
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <span
              className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-3"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              [ Authentication ]
            </span>
            <h1 className="text-4xl font-semibold text-zinc-900 mb-2">
              Sign in
            </h1>
            <p className="text-zinc-500 text-sm">
              Start benchmarking LLMs with custom metrics
            </p>
          </div>

          {/* Login Buttons */}
          <LoginButtons />

          {/* Footer info */}
          <div className="mt-10 pt-6 border-t border-zinc-200">
            <div className="tech-panel">
              <div className="p-3 space-y-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.04em' }}>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-orange-500">*</span> FREE FOREVER. NO CREDIT CARD.
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-orange-500">*</span> API KEYS ENCRYPTED (AES-256-GCM)
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-orange-500">*</span> OPEN SOURCE &mdash; MIT LICENSE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Info panel (Sutéra-style) */}
      <div className="hidden lg:flex flex-1 bg-zinc-950 items-center justify-center px-12 py-12 relative overflow-hidden">
        {/* Grid on dark */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }} />

        {/* Orange orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-sm relative z-10">
          {/* Title */}
          <h2
            className="text-5xl font-semibold text-white mb-8 leading-tight"
            style={{ fontFamily: "var(--font-slabo), 'Slabo 27px', serif" }}
          >
            Benchmark<br />
            <span className="text-orange-500">like a pro</span>
          </h2>

          {/* Features list */}
          <div className="space-y-5 mb-10">
            {[
              { tag: '01', text: 'Custom metrics and scoring criteria' },
              { tag: '02', text: 'Support for 10+ providers and any custom API' },
              { tag: '03', text: 'Human + AI judge evaluation' },
              { tag: '04', text: 'Shareable public leaderboards' },
            ].map((item) => (
              <div key={item.tag} className="flex items-start gap-3">
                <span
                  className="text-orange-500 text-xs mt-0.5"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {item.tag}.
                </span>
                <span className="text-zinc-400 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-3">
            <Link
              href="https://github.com/bhdrdemir/Ordeal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-400 text-xs hover:border-zinc-500 hover:text-zinc-300 transition-all"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            >
              GITHUB
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-400 text-xs hover:border-zinc-500 hover:text-zinc-300 transition-all"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            >
              DOCS
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
