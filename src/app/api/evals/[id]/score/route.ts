import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits } from "@/lib/rate-limit";
import { humanScoreSchema, safeParse } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/evals/[id]/score
 * Submit a human score for an evaluation result
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const limiter = rateLimits.api(session.user.id);
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Validate request
    const validation = safeParse(humanScoreSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    // Verify evaluation exists and user has access
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }

    // Only the evaluation owner can submit human scores
    if (evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify result exists and belongs to this evaluation
    const result = await prisma.evalResult.findUnique({
      where: { id: data.resultId },
      select: { evalId: true },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    if (result.evalId !== id) {
      return NextResponse.json(
        { error: "Result does not belong to this evaluation" },
        { status: 400 }
      );
    }

    // Create or update human score
    const humanScore = await prisma.humanScore.upsert({
      where: {
        resultId_userId: {
          resultId: data.resultId,
          userId: session.user.id,
        },
      },
      create: {
        resultId: data.resultId,
        userId: session.user.id,
        score: data.score,
        breakdown: (data.breakdown || {}) as any,
        comment: data.comment,
      },
      update: {
        score: data.score,
        breakdown: (data.breakdown || {}) as any,
        comment: data.comment,
      },
    });

    // Recalculate average human score for this result
    const allHumanScores = await prisma.humanScore.findMany({
      where: { resultId: data.resultId },
      select: { score: true },
    });

    const averageScore =
      allHumanScores.length > 0
        ? allHumanScores.reduce((sum: number, hs: any) => sum + hs.score, 0) /
          allHumanScores.length
        : null;

    // Update result with average human score
    const updatedResult = await prisma.evalResult.update({
      where: { id: data.resultId },
      data: { humanScore: averageScore },
    });

    return NextResponse.json(
      {
        humanScore,
        resultHumanScore: updatedResult.humanScore,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/evals/[id]/score]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
