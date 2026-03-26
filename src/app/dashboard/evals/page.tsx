'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FlaskConical, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Evaluation {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  isPublic: boolean;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  RUNNING: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export default function EvalsPage() {
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const fetchEvals = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (statusFilter) {
          params.append('status', statusFilter);
        }

        const res = await fetch(`/api/evals?${params}`);
        if (!res.ok) {
          throw new Error('Failed to fetch evaluations');
        }

        const data = await res.json();
        setEvals(data.evals || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchEvals();
  }, [page, statusFilter]);

  if (loading && evals.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Evaluations</h1>
          <p className="text-zinc-500">Manage and run your LLM evaluations</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
          <span className="text-zinc-500">Loading evaluations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Evaluations</h1>
          <p className="text-zinc-500">Manage and run your LLM evaluations</p>
        </div>
        <Link
          href="/dashboard/evals/new"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors active:scale-95"
        >
          <Plus size={20} />
          New Evaluation
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {evals.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <FlaskConical className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No evaluations found</h3>
          <p className="text-zinc-500 mb-6">
            {statusFilter
              ? 'No evaluations with this status'
              : 'Create your first evaluation to compare models'}
          </p>
          <Link
            href="/dashboard/evals/new"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors active:scale-95"
          >
            <Plus size={20} />
            Create Evaluation
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {evals.map((evaluation) => {
                  const colors = STATUS_COLORS[evaluation.status];
                  const progressPercent = evaluation.totalTasks > 0
                    ? Math.round((evaluation.completedTasks / evaluation.totalTasks) * 100)
                    : 0;

                  const createdDate = new Date(evaluation.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={evaluation.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{evaluation.name}</p>
                          {evaluation.description && (
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                              {evaluation.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {evaluation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {evaluation.totalTasks > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-600">
                              {evaluation.completedTasks}/{evaluation.totalTasks}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600">{createdDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/evals/${evaluation.id}`}
                          className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-zinc-50">
              <p className="text-sm text-zinc-600">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 border border-zinc-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-zinc-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
