import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { ChevronRight, TrendingUp } from 'lucide-react';

async function LeaderboardContent() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/leaderboard`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    const data = await res.json();
    const evals = data.evals || [];

    if (evals.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">No public evaluations yet</h3>
          <p className="text-slate-600 mb-6">Be the first to share your benchmark results</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all"
          >
            Create Evaluation
            <ChevronRight size={18} />
          </Link>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Evaluation</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Models Tested</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Avg Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Creator</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600"></th>
            </tr>
          </thead>
          <tbody>
            {evals.map((entry: any, i: number) => (
              <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-950">{i + 1}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{entry.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{entry.modelCount || 0}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-950">
                  {entry.avgScore ? entry.avgScore.toFixed(2) : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{entry.creatorName || 'Anonymous'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/leaderboard/${entry.id}`}
                    className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium text-sm"
                  >
                    View
                    <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Failed to load leaderboard. Please try again later.</p>
      </div>
    );
  }
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-950 mb-3">
              Public Leaderboard
            </h1>
            <p className="text-lg text-slate-600">
              Browse public evaluations and benchmarks from the community
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Suspense fallback={
              <div className="px-6 py-12 text-center">
                <p className="text-slate-600">Loading leaderboard...</p>
              </div>
            }>
              <LeaderboardContent />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
