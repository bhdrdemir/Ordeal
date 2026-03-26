import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { ArrowLeft, Share2, Calendar } from 'lucide-react';

async function getEvalDetail(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/evals/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch eval:', error);
    return null;
  }
}

export default async function EvalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const eval_data = await getEvalDetail(params.id);

  if (!eval_data || (!eval_data.isPublic && !eval_data.shareLink)) {
    notFound();
  }

  const results = eval_data.results || [];
  const createdDate = new Date(eval_data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group results by model for table display
  const modelResults: Record<string, any> = {};
  results.forEach((result: any) => {
    if (!modelResults[result.model]) {
      modelResults[result.model] = {
        model: result.model,
        provider: result.provider,
        results: [],
      };
    }
    modelResults[result.model].results.push(result);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium mb-6"
            >
              <ArrowLeft size={18} />
              Back to leaderboard
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-950 mb-4">
              {eval_data.name}
            </h1>

            <p className="text-lg text-slate-600 mb-6 max-w-2xl">
              {eval_data.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                {createdDate}
              </div>
              <div>
                Created by <span className="font-medium text-slate-900">{eval_data.creatorName || 'Anonymous'}</span>
              </div>
              {eval_data.shareLink && (
                <button
                  onClick={() => {
                    const url = `${process.env.NEXTAUTH_URL || window.location.origin}/leaderboard/${eval_data.id}`;
                    navigator.clipboard.writeText(url);
                  }}
                  className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
                >
                  <Share2 size={18} />
                  Share
                </button>
              )}
            </div>
          </div>

          {/* Results Table */}
          {results.length > 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Model</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Provider</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Avg Quality</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Avg Latency</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Avg Cost</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Runs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(modelResults).map((modelGroup: any) => {
                      const avgQuality = modelGroup.results.length > 0
                        ? (modelGroup.results.reduce((sum: number, r: any) => sum + (r.qualityScore || 0), 0) / modelGroup.results.length).toFixed(2)
                        : '—';
                      const avgLatency = modelGroup.results.length > 0
                        ? (modelGroup.results.reduce((sum: number, r: any) => sum + (r.latency || 0), 0) / modelGroup.results.length).toFixed(2)
                        : '—';
                      const avgCost = modelGroup.results.length > 0
                        ? (modelGroup.results.reduce((sum: number, r: any) => sum + (r.cost || 0), 0) / modelGroup.results.length).toFixed(4)
                        : '—';

                      return (
                        <tr key={modelGroup.model} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{modelGroup.model}</td>
                          <td className="px-6 py-4 text-slate-600">{modelGroup.provider}</td>
                          <td className="px-6 py-4 text-slate-900">{avgQuality}</td>
                          <td className="px-6 py-4 text-slate-900">{avgLatency}s</td>
                          <td className="px-6 py-4 text-slate-900">${avgCost}</td>
                          <td className="px-6 py-4 text-slate-600">{modelGroup.results.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-600">No results available for this evaluation yet.</p>
            </div>
          )}

          {/* Evaluation Details */}
          {eval_data.customMetrics && Object.keys(eval_data.customMetrics).length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-950 mb-6">Custom Metrics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(eval_data.customMetrics).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-950 mb-2">{value.name || key}</h3>
                    <p className="text-sm text-slate-600">{value.description || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
