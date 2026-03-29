'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FlaskConical,
  Share2,
  Download,
  Play,
  Loader2,
  ArrowLeft,
  Search,
  BarChart3,
  TrendingDown,
  DollarSign,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EvalData {
  id: string;
  name: string;
  description: string;
  status: string;
  isPublic: boolean;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
  prompts: Array<{ id: string; content: string; category: string; order: number }>;
  models: Array<{ id: string; providerId: string; modelId: string; label: string; provider?: { name: string } }>;
  results: Array<{
    id: string;
    promptId: string;
    evalModelId: string;
    response: string;
    latency: number | null;
    cost: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    aiScore: number | null;
    humanScore: number | null;
    error: string | null;
    runIndex: number;
  }>;
}

export default function EvalDetailPage() {
  const params = useParams();
  const evalId = params.id as string;

  const [evalData, setEvalData] = useState<EvalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'detail'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Compare tab state
  const [compareModel1, setCompareModel1] = useState('');
  const [compareModel2, setCompareModel2] = useState('');

  const fetchEval = useCallback(async () => {
    try {
      const res = await fetch(`/api/evals/${evalId}`);
      if (!res.ok) throw new Error('Failed to fetch evaluation');
      const data = await res.json();
      setEvalData(data.evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation');
    } finally {
      setLoading(false);
    }
  }, [evalId]);

  useEffect(() => {
    fetchEval();
    const interval = setInterval(fetchEval, 5000);
    return () => clearInterval(interval);
  }, [fetchEval]);

  // ── Run Evaluation ──
  const handleRun = async () => {
    if (!evalData) return;
    setRunning(true);
    setRunError(null);
    try {
      const res = await fetch(`/api/evals/${evalId}/run`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run evaluation');
      await fetchEval();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Failed to run evaluation');
    } finally {
      setRunning(false);
    }
  };

  // ── Share ──
  const handleShare = async () => {
    if (!evalData) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/evals/${evalId}/share`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to share');
      setShareSuccess(true);
      await fetchEval();
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Failed to share evaluation');
    } finally {
      setSharing(false);
    }
  };

  // ── Download ──
  const handleDownload = () => {
    if (!evalData) return;
    const blob = new Blob([JSON.stringify(evalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evalData.name.replace(/\s+/g, '-').toLowerCase()}-results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
          <span className="text-zinc-500">Loading evaluation...</span>
        </div>
      </div>
    );
  }

  if (!evalData) {
    return (
      <div className="w-full">
        <Link
          href="/dashboard/evals"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Evaluations
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Evaluation not found'}</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };

  const progressPercent = evalData.totalTasks > 0
    ? Math.round((evalData.completedTasks / evalData.totalTasks) * 100)
    : 0;

  // Build a prompt lookup map for easy access
  const promptMap = Object.fromEntries(evalData.prompts.map((p) => [p.id, p]));

  // Compute summary stats per model
  const modelStats = evalData.models.map((model) => {
    const modelResults = evalData.results.filter((r) => r.evalModelId === model.id);
    const scored = modelResults.filter((r) => r.aiScore !== null);
    const avgScore = scored.length > 0
      ? scored.reduce((sum, r) => sum + (r.aiScore ?? 0), 0) / scored.length
      : null;
    const avgLatency = modelResults.length > 0
      ? modelResults.reduce((sum, r) => sum + (r.latency ?? 0), 0) / modelResults.length
      : 0;
    const totalCost = modelResults.reduce((sum, r) => sum + (r.cost ?? 0), 0);
    const errorCount = modelResults.filter((r) => r.error).length;

    return {
      id: model.id,
      label: model.label || model.modelId,
      provider: model.provider?.name || 'Unknown',
      avgScore,
      avgLatency,
      totalCost,
      resultCount: modelResults.length,
      errorCount,
    };
  });

  const filteredStats = modelStats.filter((stat) =>
    stat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scoreChartData = filteredStats
    .filter((s) => s.avgScore !== null)
    .map((stat) => ({
      name: stat.label,
      score: Math.round((stat.avgScore ?? 0) * 100) / 100,
    }));

  const latencyChartData = filteredStats.map((stat) => ({
    name: stat.label,
    latency: Math.round(stat.avgLatency) ,
  }));

  // Compare tab helpers
  const getModelResults = (modelId: string) =>
    evalData.results.filter((r) => r.evalModelId === modelId);

  const compareStats1 = compareModel1 ? modelStats.find((s) => s.id === compareModel1) : null;
  const compareStats2 = compareModel2 ? modelStats.find((s) => s.id === compareModel2) : null;

  const canRun = ['DRAFT', 'PENDING', 'FAILED'].includes(evalData.status);
  const isCompleted = evalData.status === 'COMPLETED';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/evals"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Evaluations
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{evalData.name}</h1>
            {evalData.description && (
              <p className="text-zinc-600">{evalData.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {canRun && (
              <button
                onClick={handleRun}
                disabled={running}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed"
              >
                {running ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Play size={18} />
                )}
                {running ? 'Running...' : 'Run Evaluation'}
              </button>
            )}
            {isCompleted && (
              <>
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  title={evalData.isPublic ? 'Already shared' : 'Share to leaderboard'}
                  className={`inline-flex items-center gap-2 p-2 border rounded-lg transition-colors ${
                    evalData.isPublic || shareSuccess
                      ? 'border-green-300 bg-green-50 text-green-600'
                      : 'border-zinc-300 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  {sharing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : shareSuccess || evalData.isPublic ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Share2 size={20} />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  title="Download results as JSON"
                  className="p-2 border border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-600"
                >
                  <Download size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {(runError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <XCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{runError}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColors[evalData.status]}`}>
            {evalData.status}
          </span>
          {evalData.status === 'RUNNING' && (
            <div className="flex items-center gap-2">
              <div className="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-zinc-600">
                {evalData.completedTasks}/{evalData.totalTasks}
              </span>
            </div>
          )}
          {evalData.isPublic && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 size={13} /> Public on leaderboard
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {isCompleted && modelStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Best Model */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-600">Best Model (Score)</p>
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            {(() => {
              const scored = modelStats.filter((s) => s.avgScore !== null);
              if (scored.length === 0) return <p className="text-2xl font-bold text-zinc-400">No scores yet</p>;
              const best = scored.reduce((a, b) => (a.avgScore ?? 0) > (b.avgScore ?? 0) ? a : b);
              return (
                <>
                  <p className="text-2xl font-bold text-zinc-900">{best.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{((best.avgScore ?? 0) * 100).toFixed(1)}%</p>
                </>
              );
            })()}
          </div>

          {/* Avg Latency */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-600">Avg Latency</p>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">
              {(modelStats.reduce((sum, s) => sum + s.avgLatency, 0) / Math.max(modelStats.length, 1) / 1000).toFixed(2)}s
            </p>
            <p className="text-xs text-zinc-500 mt-1">across all models</p>
          </div>

          {/* Total Cost */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-600">Total Cost</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">
              ${modelStats.reduce((sum, s) => sum + s.totalCost, 0).toFixed(4)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">across all runs</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {isCompleted && (
        <div className="bg-white rounded-lg border border-zinc-200 mb-6">
          <div className="flex border-b border-zinc-200">
            {(['overview', 'compare', 'detail'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 font-medium transition-all ${
                  activeTab === tab
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {scoreChartData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">Score Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scoreChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(2)}`, 'Score']} />
                        <Bar dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Latency Comparison (ms)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={latencyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => [`${v}ms`, 'Latency']} />
                      <Bar dataKey="latency" fill="#71717a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Cost Breakdown</h3>
                  <div className="space-y-3">
                    {filteredStats.map((stat) => {
                      const maxCost = Math.max(...filteredStats.map((s) => s.totalCost), 0.0001);
                      return (
                        <div key={stat.id} className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                          <div>
                            <p className="font-medium text-zinc-900">{stat.label}</p>
                            <p className="text-xs text-zinc-500">{stat.provider}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500"
                                style={{ width: `${(stat.totalCost / maxCost) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 w-20 text-right">
                              ${stat.totalCost.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Compare Tab ── */}
            {activeTab === 'compare' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-2">Model 1</label>
                    <select
                      value={compareModel1}
                      onChange={(e) => setCompareModel1(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Select model...</option>
                      {evalData.models.map((m) => (
                        <option key={m.id} value={m.id}>{m.label || m.modelId}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-2">Model 2</label>
                    <select
                      value={compareModel2}
                      onChange={(e) => setCompareModel2(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Select model...</option>
                      {evalData.models.map((m) => (
                        <option key={m.id} value={m.id}>{m.label || m.modelId}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {compareModel1 && compareModel2 && compareModel1 !== compareModel2 && compareStats1 && compareStats2 ? (
                  <div className="space-y-4">
                    {/* Stats comparison header */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center text-sm font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                        {compareStats1.label}
                      </div>
                      <div className="text-center text-xs text-zinc-400 flex items-center justify-center font-mono">
                        VS
                      </div>
                      <div className="text-center text-sm font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                        {compareStats2.label}
                      </div>
                    </div>

                    {/* Metric rows */}
                    {[
                      {
                        label: 'Avg Score',
                        v1: compareStats1.avgScore !== null ? `${((compareStats1.avgScore) * 100).toFixed(1)}%` : '—',
                        v2: compareStats2.avgScore !== null ? `${((compareStats2.avgScore) * 100).toFixed(1)}%` : '—',
                        better: (compareStats1.avgScore ?? -1) > (compareStats2.avgScore ?? -1) ? 1 : (compareStats2.avgScore ?? -1) > (compareStats1.avgScore ?? -1) ? 2 : 0,
                      },
                      {
                        label: 'Avg Latency',
                        v1: `${compareStats1.avgLatency.toFixed(0)}ms`,
                        v2: `${compareStats2.avgLatency.toFixed(0)}ms`,
                        better: compareStats1.avgLatency < compareStats2.avgLatency ? 1 : compareStats2.avgLatency < compareStats1.avgLatency ? 2 : 0,
                      },
                      {
                        label: 'Total Cost',
                        v1: `$${compareStats1.totalCost.toFixed(4)}`,
                        v2: `$${compareStats2.totalCost.toFixed(4)}`,
                        better: compareStats1.totalCost < compareStats2.totalCost ? 1 : compareStats2.totalCost < compareStats1.totalCost ? 2 : 0,
                      },
                      {
                        label: 'Errors',
                        v1: `${compareStats1.errorCount}`,
                        v2: `${compareStats2.errorCount}`,
                        better: compareStats1.errorCount < compareStats2.errorCount ? 1 : compareStats2.errorCount < compareStats1.errorCount ? 2 : 0,
                      },
                    ].map((row) => (
                      <div key={row.label} className="grid grid-cols-3 gap-4 items-center">
                        <div className={`text-center p-3 rounded-lg border font-semibold ${row.better === 1 ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-zinc-200 text-zinc-700'}`}>
                          {row.v1}
                        </div>
                        <div className="text-center text-xs text-zinc-400 font-mono">{row.label}</div>
                        <div className={`text-center p-3 rounded-lg border font-semibold ${row.better === 2 ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-zinc-200 text-zinc-700'}`}>
                          {row.v2}
                        </div>
                      </div>
                    ))}

                    {/* Side-by-side responses */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-zinc-900 mb-3">Response Comparison by Prompt</h4>
                      <div className="space-y-4">
                        {evalData.prompts.map((prompt) => {
                          const r1 = getModelResults(compareModel1).find((r) => r.promptId === prompt.id);
                          const r2 = getModelResults(compareModel2).find((r) => r.promptId === prompt.id);
                          return (
                            <div key={prompt.id} className="border border-zinc-200 rounded-lg overflow-hidden">
                              <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200">
                                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Prompt</p>
                                <p className="text-sm text-zinc-800 mt-0.5 line-clamp-2">{prompt.content}</p>
                              </div>
                              <div className="grid grid-cols-2 divide-x divide-zinc-200">
                                {[r1, r2].map((r, i) => (
                                  <div key={i} className="p-4">
                                    {r ? (
                                      <>
                                        <p className="text-xs text-zinc-500 mb-1 line-clamp-4">{r.response || <em className="text-red-400">Error: {r.error}</em>}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-zinc-400">
                                          {r.aiScore !== null && <span>Score: {(r.aiScore * 100).toFixed(0)}%</span>}
                                          {r.latency && <span>{r.latency.toFixed(0)}ms</span>}
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-xs text-zinc-400 italic">No result</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : compareModel1 && compareModel2 && compareModel1 === compareModel2 ? (
                  <p className="text-zinc-500 text-center py-8">Please select two different models to compare.</p>
                ) : (
                  <p className="text-zinc-500 text-center py-8">Select two models above to see a side-by-side comparison.</p>
                )}
              </div>
            )}

            {/* ── Detail Tab ── */}
            {activeTab === 'detail' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredStats.map((stat) => (
                    <div key={stat.id} className="border border-zinc-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedModel(expandedModel === stat.id ? null : stat.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <ChevronDown
                            className={`w-5 h-5 text-zinc-600 transition-transform ${expandedModel === stat.id ? 'rotate-180' : ''}`}
                          />
                          <div className="text-left">
                            <p className="font-medium text-zinc-900">{stat.label}</p>
                            <p className="text-xs text-zinc-500">{stat.provider}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8 text-right">
                          <div>
                            <p className="text-xs text-zinc-600">Score</p>
                            <p className="font-semibold text-zinc-900">
                              {stat.avgScore !== null ? `${(stat.avgScore * 100).toFixed(1)}%` : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600">Latency</p>
                            <p className="font-semibold text-zinc-900">{stat.avgLatency.toFixed(0)}ms</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600">Cost</p>
                            <p className="font-semibold text-zinc-900">${stat.totalCost.toFixed(4)}</p>
                          </div>
                        </div>
                      </button>

                      {expandedModel === stat.id && (
                        <div className="border-t border-zinc-200 bg-zinc-50 p-4">
                          <p className="text-sm text-zinc-600 mb-3">
                            {stat.resultCount} results · {stat.errorCount} errors
                          </p>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {evalData.results
                              .filter((r) => r.evalModelId === stat.id)
                              .map((result) => {
                                const prompt = promptMap[result.promptId];
                                return (
                                  <div key={result.id} className="text-sm p-3 bg-white rounded border border-zinc-200">
                                    {/* Prompt content */}
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Prompt</p>
                                      <p className="text-zinc-700 text-xs line-clamp-2">
                                        {prompt?.content ?? result.promptId}
                                      </p>
                                    </div>
                                    {/* Response */}
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Response</p>
                                      {result.error ? (
                                        <p className="text-red-600 text-xs">Error: {result.error}</p>
                                      ) : (
                                        <p className="text-zinc-600 line-clamp-3">{result.response}</p>
                                      )}
                                    </div>
                                    {/* Metrics */}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                                      {result.aiScore !== null && (
                                        <span className="text-orange-500 font-semibold">
                                          Score: {(result.aiScore * 100).toFixed(0)}%
                                        </span>
                                      )}
                                      {result.latency !== null && <span>{result.latency.toFixed(0)}ms</span>}
                                      {result.cost !== null && <span>${result.cost.toFixed(5)}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State for non-completed evals */}
      {!isCompleted && (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <FlaskConical className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            {evalData.status === 'DRAFT'
              ? 'Evaluation Not Started'
              : evalData.status === 'RUNNING'
              ? 'Evaluation in Progress'
              : 'No Results Available'}
          </h3>
          <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
            {evalData.status === 'DRAFT'
              ? 'Run this evaluation to generate results'
              : evalData.status === 'RUNNING'
              ? 'Results will appear here as the evaluation progresses'
              : 'Something went wrong. You can retry running the evaluation.'}
          </p>
          {canRun && (
            <button
              onClick={handleRun}
              disabled={running}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
            >
              {running ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
              {running ? 'Running...' : 'Run Evaluation'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
