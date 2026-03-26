import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/leaderboard
 * Get public evaluations with aggregated scores (no auth required)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
    const sortBy = url.searchParams.get("sortBy") || "createdAt";

    const skip = (page - 1) * limit;

    // Build sort order
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "avgHumanScore") {
      // For now, just sort by createdAt - aggregation in app layer if needed
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "completedTasks") {
      orderBy = { completedTasks: "desc" };
    }

    const [evals, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: {
          isPublic: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          totalTasks: true,
          completedTasks: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          results: {
            select: {
              id: true,
              humanScore: true,
              aiScore: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.evaluation.count({
        where: {
          isPublic: true,
        },
      }),
    ]);

    // Aggregate scores for each evaluation
    const evalWithScores = evals.map((eval_: any) => {
      const humanScores = eval_.results
        .filter((r: any) => r.humanScore !== null)
        .map((r: any) => r.humanScore as number);

      const aiScores = eval_.results
        .filter((r: any) => r.aiScore !== null)
        .map((r: any) => r.aiScore as number);

      const avgHumanScore =
        humanScores.length > 0
          ? humanScores.reduce((a: number, b: number) => a + b, 0) / humanScores.length
          : null;

      const avgAiScore =
        aiScores.length > 0
          ? aiScores.reduce((a: number, b: number) => a + b, 0) / aiScores.length
          : null;

      const { results, user, ...rest } = eval_;
      return {
        ...rest,
        author: user?.name || "Anonymous",
        authorImage: user?.image || null,
        averageHumanScore: avgHumanScore,
        averageAiScore: avgAiScore,
        resultCount: eval_.results.length,
      };
    });

    return NextResponse.json({
      data: evalWithScores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/leaderboard]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
