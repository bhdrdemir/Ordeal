import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, Bot, Star, DollarSign, PlusCircle, ArrowRight, Clock } from "lucide-react";
import EvalStatusBadge from "@/components/eval-status-badge";

export const metadata = {
  title: "Dashboard - Ordeal",
  description: "View your evaluations and manage settings",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const evaluations = await prisma.evaluation.findMany({
    where: { userId: session.user.id },
    include: { results: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalEvals = evaluations.length;
  let totalCost = 0;
  let totalAiScoreSum = 0;
  let totalAiScoreCount = 0;

  for (const evaluation of evaluations) {
    for (const result of evaluation.results) {
      if (result.cost !== null && result.cost !== undefined) totalCost += result.cost;
      if (result.aiScore !== null && result.aiScore !== undefined) {
        totalAiScoreSum += result.aiScore;
        totalAiScoreCount++;
      }
    }
  }

  const modelsTested = evaluations.reduce((sum, e) => sum + (e.results.length > 0 ? 1 : 0), 0);
  const averageQuality = totalAiScoreCount > 0 ? totalAiScoreSum / totalAiScoreCount : null;

  const stats = [
    { label: 'TOTAL EVALS', value: String(totalEvals), icon: BarChart3 },
    { label: 'MODELS TESTED', value: String(modelsTested), icon: Bot },
    { label: 'AVG QUALITY', value: averageQuality !== null ? averageQuality.toFixed(1) : '—', icon: Star },
    { label: 'TOTAL COST', value: `$${totalCost.toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="w-full max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <span
          className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-2"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
        >
          [ Dashboard ]
        </span>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Welcome back, <span className="text-orange-500">{session.user.name || "User"}</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-zinc-200 p-5 relative group hover:border-orange-300 transition-colors">
              {/* Top-right tag */}
              <span className="absolute top-3 right-3 text-[9px] text-zinc-300" style={{ fontFamily: 'var(--font-mono)' }}>
                <Icon size={14} />
              </span>

              <span
                className="block text-[10px] text-zinc-400 mb-2"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
              >
                {stat.label}
              </span>
              <span className="text-3xl font-bold text-zinc-900 tabular-nums">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Action */}
      <div className="mb-10">
        <Link
          href="/dashboard/evals/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-all active:scale-[0.97]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        >
          <PlusCircle size={16} />
          NEW EVALUATION
        </Link>
      </div>

      {/* Recent Evaluations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">Recent Evaluations</h2>
          <span className="text-[10px] text-zinc-400" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            / {String(totalEvals).padStart(2, '0')} total
          </span>
        </div>

        {evaluations.length === 0 ? (
          <div className="bg-white border border-zinc-200 p-12 text-center">
            <BarChart3 size={40} className="mx-auto mb-4 text-zinc-200" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">No evaluations yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
              Create your first evaluation to compare models and analyze performance.
            </p>
            <Link
              href="/dashboard/evals/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-all"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            >
              CREATE FIRST EVALUATION
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="border border-zinc-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200">
                    {['Name', 'Models', 'Status', 'Quality', 'Date', ''].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] text-zinc-400 uppercase"
                        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {evaluations.map((evaluation) => {
                    const aiScores = evaluation.results
                      .filter((r) => r.aiScore !== null)
                      .map((r) => r.aiScore as number);
                    const avgQuality = aiScores.length > 0
                      ? (aiScores.reduce((a, b) => a + b, 0) / aiScores.length).toFixed(1)
                      : "—";
                    const createdDate = new Date(evaluation.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    });

                    return (
                      <tr key={evaluation.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-5 py-4 text-sm font-medium text-zinc-900">{evaluation.name}</td>
                        <td className="px-5 py-4 text-sm text-zinc-500" style={{ fontFamily: 'var(--font-mono)' }}>
                          {evaluation.results.length}
                        </td>
                        <td className="px-5 py-4"><EvalStatusBadge status={evaluation.status} /></td>
                        <td className="px-5 py-4 text-sm font-medium text-zinc-900 tabular-nums">{avgQuality}</td>
                        <td className="px-5 py-4 text-sm text-zinc-400 flex items-center gap-1.5">
                          <Clock size={13} />
                          {createdDate}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <Link
                            href={`/dashboard/evals/${evaluation.id}`}
                            className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 text-xs transition-colors"
                            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
                          >
                            VIEW
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
