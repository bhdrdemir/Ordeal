'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-950 mb-4">
          Something went wrong
        </h1>

        <p className="text-slate-600 text-base mb-2">
          {error.message || 'An unexpected error occurred'}
        </p>

        {error.digest && (
          <p className="text-slate-500 text-sm mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <p className="text-slate-600 text-base mb-8">
          Please try again or contact support if the problem persists.
        </p>

        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all active:scale-95"
        >
          <RotateCcw size={18} />
          Try again
        </button>
      </div>
    </div>
  );
}
