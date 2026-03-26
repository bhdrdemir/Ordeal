"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl font-bold text-orange-200 mb-4">500</div>
          <h1 className="text-2xl font-bold text-slate-950 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all active:scale-95"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
