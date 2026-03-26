import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-md text-center">
        <div className="mb-8">
          <p className="text-[120px] md:text-[160px] font-bold text-orange-300 leading-none">
            404
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-950 mb-4">
          Page not found
        </h1>

        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          We couldn't find the page you're looking for.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
