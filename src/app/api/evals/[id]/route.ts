import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits } from "@/lib/rate-limit";
import { z } from "zod";
import { safeParse } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * GET /api/evals/[id]
 * Get full evaluation details with results
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        prompts: {
          select: {
            id: true,
            content: true,
            category: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        models: {
          select: {
            id: true,
            providerId: true,
            modelId: true,
            label: true,
          },
        },
        results: {
          select: {
            id: true,
            promptId: true,
            evalModelId: true,
            response: true,
            latency: true,
            cost: true,
            inputTokens: true,
            outputTokens: true,
            aiScore: true,
            aiScoreBreakdown: true,
            aiFeedback: true,
            humanScore: true,
            formatScore: true,
            error: true,
            runIndex: true,
            createdAt: true,
            humanScores: {
              select: {
                id: true,
                userId: true,
                score: true,
                breakdown: true,
                comment: true,
              },
            },
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ownership or public access
    if (
      evaluation.userId !== session.user.id &&
      !evaluation.isPublic
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("[GET /api/evals/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/evals/[id]
 * Update evaluation (name, description, isPublic)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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
    // Verify ownership
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Validate request
    const validation = safeParse(updateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    // Update evaluation
    const updated = await prisma.evaluation.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/evals/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/evals/[id]
 * Delete evaluation (cascade delete all related records)
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
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
    // Verify ownership
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete evaluation (cascade handled by Prisma)
    await prisma.evaluation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/evals/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
