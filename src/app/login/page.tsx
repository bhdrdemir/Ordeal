import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginButtons from "@/components/login-buttons";
import { Sparkles } from "lucide-react";

export default async function LoginPage() {
  // Server-side auth check
  let isAuthenticated = false;
  try {
    const session = await auth();
    if (session?.user) {
      isAuthenticated = true;
    }
  } catch {
    // DB not ready or auth error — just show login page
  }

  // Redirect outside try/catch so NEXT_REDIRECT isn't caught
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl -z-10" />

        <div className="w-full max-w-sm">
          <div className="mb-12">
            <Link href="/" className="text-2xl font-bold text-slate-950">
              Ordeal
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-950 mb-2">
              Sign in
            </h1>
            <p className="text-slate-600">
              Start benchmarking LLMs with custom metrics
            </p>
          </div>

          <LoginButtons />

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Free forever. No credit card required. Your API keys stay on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 items-center justify-center px-12 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="max-w-sm text-white text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={32} />
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6">
            Benchmark like a pro
          </h2>

          <p className="text-lg mb-10 leading-relaxed text-orange-100">
            Create comprehensive evaluations, test any model, and share results with your team.
          </p>

          <ul className="space-y-4 text-left mb-10">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-orange-300/30 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">•</span>
              <span className="text-orange-100">Custom metrics and scoring</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-orange-300/30 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">•</span>
              <span className="text-orange-100">Support for 10+ providers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-orange-300/30 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">•</span>
              <span className="text-orange-100">Shareable public leaderboards</span>
            </li>
          </ul>

          <p className="text-sm text-orange-200">
            Open source and free forever
          </p>
        </div>
      </div>
    </div>
  );
}
