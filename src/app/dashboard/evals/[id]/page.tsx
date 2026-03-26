'use client';

import { useEffect, useState } from 'react';
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
  prompts: any[];
  models: any[];
  results: any[];
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

  useEffect(() => {
    const fetchEval = async () => {
      try {
        const res = await fetch(`/api/evals/${evalId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch evaluation');
        }
        const data = await res.json();
        setEvalData(data.evaluation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evaluation');
      } finally {
        setLoading(false);
      }
    };

    fetchEval();
    const interval = setInterval(fetchEval, 5000);
    return () => clearInterval(interval);
  }, [evalId]);

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

  // Compute summary stats
  const modelStats = evalData.models.map((model) => {
    const modelResults = evalData.results.filter((r) => r.evalModelId === model.id);
    const avgScore = modelResults.length > 0
      ? modelResults.reduce((sum, r) => sum + (r.aiScore || 0), 0) / modelResults.length
      : 0;
    const avgLatency = modelResults.length > 0
      ? modelResults.reduce((sum, r) => sum + (r.latency || 0), 0) / modelResults.length
      : 0;
    const totalCost = modelResults.reduce((sum, r) => sum + (r.cost || 0), 0);

    return {
      id: model.id,
      label: model.label || `Model ${model.modelId}`,
      provider: model.provider?.name || 'Unknown',
      avgScore,
      avgLatency,
      totalCost,
      resultCount: modelResults.length,
    };
  });

  // Filter by search
  const filteredStats = modelStats.filter((stat) =>
    stat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart data
  const scoreChartData = filteredStats.map((stat) => ({
    name: stat.label,
    score: Math.round(stat.avgScore * 100) / 100,
  }));

  const latencyChartData = filteredStats.map((stat) => ({
    name: stat.label,
    latency: Math.round(stat.avgLatency * 100) / 100,
  }));

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
            {evalData.status === 'DRAFT' && (
              <button className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors">
                <Play size={18} />
                Run Evaluation
              </button>
            )}
            <button className="p-2 border border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors">
              <Share2 size={20} className="text-zinc-600" />
            </button>
            <button className="p-2 border border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors">
              <Download size={20} className="text-zinc-600" />
            </button>
          </div>
        </div>

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
        </div>
      </div>

      {/* Summary Stats */}
      {evalData.status === 'COMPLETED' && modelStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Best Model */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-600">Best Model (Score)</p>
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">
              {modelStats.length > 0 ? modelStats.reduce((a, b) => a.avgScore > b.avgScore ? a : b).label : '—'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {modelStats.length > 0 ? (modelStats.reduce((a, b) => a.avgScore > b.avgScore ? a : b).avgScore * 100).toFixed(1) : '0'}%
            </p>
          </div>

          {/* Avg Latency */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-600">Avg Latency</p>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">
              {(modelStats.reduce((sum, s) => sum + s.avgLatency, 0) / Math.max(modelStats.length, 1)).toFixed(2)}s
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
      {evalData.status === 'COMPLETED' && (
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Score Comparison</h3>
                  {scoreChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scoreChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-zinc-500">No data available</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Latency Comparison</h3>
                  {latencyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={latencyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="latency" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-zinc-500">No data available</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Cost Breakdown</h3>
                  <div className="space-y-3">
                    {filteredStats.map((stat) => (
                      <div key={stat.id} className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                        <div>
                          <p className="font-medium text-zinc-900">{stat.label}</p>
                          <p className="text-xs text-zinc-500">{stat.provider}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{
                                width: `${(stat.totalCost / Math.max(...filteredStats.map((s) => s.totalCost), 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 w-16 text-right">
                            ${stat.totalCost.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Compare Tab */}
            {activeTab === 'compare' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-2">
                      Model 1
                    </label>
                    <select className="w-full px-4 py-2 border border-zinc-300 rounded-lg">
                      <option>Select model...</option>
                      {evalData.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label || m.modelId}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-2">
                      Model 2
                    </label>
                    <select className="w-full px-4 py-2 border border-zinc-300 rounded-lg">
                      <option>Select model...</option>
                      {evalData.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label || m.modelId}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-zinc-500 text-center py-8">
                  Select two models to see side-by-side comparison
                </p>
              </div>
            )}

            {/* Detail Tab */}
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
                    <div
                      key={stat.id}
                      className="border border-zinc-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedModel(expandedModel === stat.id ? null : stat.id)
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <ChevronDown
                            className={`w-5 h-5 text-zinc-600 transition-transform ${
                              expandedModel === stat.id ? 'rotate-180' : ''
                            }`}
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
                              {(stat.avgScore * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600">Latency</p>
                            <p className="font-semibold text-zinc-900">
                              {stat.avgLatency.toFixed(2)}s
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600">Cost</p>
                            <p className="font-semibold text-zinc-900">
                              ${stat.totalCost.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </button>

                      {expandedModel === stat.id && (
                        <div className="border-t border-zinc-200 bg-zinc-50 p-4">
                          <p className="text-sm text-zinc-600 mb-3">
                            {stat.resultCount} results ({evalData.prompts.length} prompts)
                          </p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {evalData.results
                              .filter((r) => r.evalModelId === stat.id)
                              .map((result) => (
                                <div key={result.id} className="text-sm p-3 bg-white rounded border border-zinc-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-zinc-900">
                                      Prompt {result.promptId}
                                    </p>
                                    {result.aiScore && (
                                      <span className="text-xs font-semibold text-orange-500">
                                        {(result.aiScore * 100).toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-zinc-600 line-clamp-2">{result.response}</p>
                                  {result.error && (
                                    <p className="text-red-600 text-xs mt-1">Error: {result.error}</p>
                                  )}
                                </div>
                              ))}
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

      {/* Empty State for Non-Completed Evals */}
      {evalData.status !== 'COMPLETED' && (
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
              : 'Something went wrong with this evaluation'}
          </p>
          {evalData.status === 'DRAFT' && (
            <button className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-3 font-semibold transition-colors">
              <Play size={20} />
              Run Evaluation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
