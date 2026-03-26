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

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's evaluations
  const evaluations = await prisma.evaluation.findMany({
    where: { userId: session.user.id },
    include: {
      results: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Calculate stats
  const totalEvals = evaluations.length;
  let totalCost = 0;
  let totalAiScoreSum = 0;
  let totalAiScoreCount = 0;

  for (const evaluation of evaluations) {
    for (const result of evaluation.results) {
      if (result.cost !== null && result.cost !== undefined) {
        totalCost += result.cost;
      }
      if (result.aiScore !== null && result.aiScore !== undefined) {
        totalAiScoreSum += result.aiScore;
        totalAiScoreCount++;
      }
    }
  }

  const modelsTested = evaluations.reduce((sum, evaluation) => sum + (evaluation.results.length > 0 ? 1 : 0), 0);
  const averageQuality = totalAiScoreCount > 0 ? totalAiScoreSum / totalAiScoreCount : null;

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Welcome back, <span className="text-orange-500">{session.user.name || "User"}</span>
        </h1>
        <p className="text-zinc-500">Here's an overview of your evaluations</p>
      </div>

      <div className="space-y-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Evaluations */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm font-medium mb-2">Total Evaluations</p>
                <p className="text-3xl font-bold text-zinc-900">{totalEvals}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 size={24} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Models Tested */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm font-medium mb-2">Models Tested</p>
                <p className="text-3xl font-bold text-zinc-900">{modelsTested}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Bot size={24} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Average Quality */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm font-medium mb-2">Average Quality</p>
                <p className="text-3xl font-bold text-zinc-900">
                  {averageQuality !== null ? averageQuality.toFixed(1) : "—"}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Star size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm font-medium mb-2">Total Cost</p>
                <p className="text-3xl font-bold text-zinc-900">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex gap-4">
          <Link
            href="/dashboard/evals/new"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-3 font-semibold transition-colors active:scale-95"
          >
            <PlusCircle size={20} />
            New Evaluation
          </Link>
        </div>

        {/* Recent Evaluations Section */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Recent Evaluations</h2>

          {evaluations.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-sm">
              <BarChart3 size={48} className="mx-auto mb-4 text-zinc-300" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                No evaluations yet
              </h3>
              <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                Create your first evaluation to compare models and analyze performance.
              </p>
              <Link
                href="/dashboard/evals/new"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-3 font-semibold transition-colors active:scale-95"
              >
                Create First Evaluation
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            // Evaluations Table
            <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 uppercase">
                        Models
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 uppercase">
                        Quality
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-zinc-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {evaluations.map((evaluation) => {
                      const aiScores = evaluation.results
                        .filter((r) => r.aiScore !== null)
                        .map((r) => r.aiScore as number);
                      const avgQuality =
                        aiScores.length > 0
                          ? (aiScores.reduce((a, b) => a + b, 0) / aiScores.length).toFixed(1)
                          : "—";

                      const createdDate = new Date(evaluation.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      );

                      return (
                        <tr
                          key={evaluation.id}
                          className="hover:bg-zinc-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                            {evaluation.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {evaluation.results.length}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <EvalStatusBadge status={evaluation.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                            {avgQuality}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-500 flex items-center gap-1">
                            <Clock size={16} />
                            {createdDate}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Link
                              href={`/dashboard/evals/${evaluation.id}`}
                              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                            >
                              View
                              <ArrowRight size={16} />
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
    </div>
  );
}
