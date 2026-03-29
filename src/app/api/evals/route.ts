import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { evaluationCreateSchema, safeParse } from "@/lib/validation";

/**
 * GET /api/evals
 * List user's evaluations with pagination and status filter
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
    const status = url.searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = { userId: session.user.id };
    if (status) {
      where.status = status;
    }

    const [evals, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          isPublic: true,
          totalTasks: true,
          completedTasks: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.evaluation.count({ where }),
    ]);

    return NextResponse.json({
      data: evals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/evals]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/evals
 * Create a new evaluation with prompts and models
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const limiter = rateLimits.api(session.user.id);
  if (!limiter.success) {
    return rateLimitResponse(limiter.resetAt);
  }

  try {
    const body = await req.json();

    // Validate request
    const validation = safeParse(evaluationCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    // Verify all providers exist AND belong to this user (or are public built-ins)
    const providerIds = Array.from(
      new Set(data.models.map((m) => m.providerId))
    );
    const providers = await prisma.provider.findMany({
      where: {
        id: { in: providerIds },
        OR: [
          { userId: session.user.id },
          { userId: null }, // built-in providers have no userId
        ],
      },
      select: { id: true },
    });

    if (providers.length !== providerIds.length) {
      return NextResponse.json(
        { error: "One or more providers not found or access denied" },
        { status: 404 }
      );
    }

    // Verify judge provider if specified — must also belong to user or be built-in
    if (data.judgeProviderId) {
      const judgeProvider = await prisma.provider.findFirst({
        where: {
          id: data.judgeProviderId,
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
        },
        select: { id: true },
      });

      if (!judgeProvider) {
        return NextResponse.json(
          { error: "Judge provider not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Create evaluation in transaction
    const evaluation = await prisma.$transaction(async (tx) => {
      // Create evaluation
      const eval_ = await tx.evaluation.create({
        data: {
          userId: session.user!.id,
          name: data.name,
          description: data.description,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          runsPerPrompt: data.runsPerPrompt,
          ...(data.judgeProviderId && { judgeProviderId: data.judgeProviderId }),
          ...(data.judgeModel && { judgeModel: data.judgeModel }),
          ...(data.judgePrompt && { judgePrompt: data.judgePrompt }),
          criteria: (data.criteria || []) as any,
          isPublic: false,
        } as any,
      });

      // Create prompts
      const prompts = await Promise.all(
        data.prompts.map((prompt, index) =>
          tx.evalPrompt.create({
            data: {
              evalId: eval_.id,
              content: prompt.content,
              order: index,
              category: prompt.category || "general",
            },
          })
        )
      );

      // Create eval models
      const evalModels = await Promise.all(
        data.models.map((m) =>
          tx.evalModel.create({
            data: {
              evalId: eval_.id,
              providerId: m.providerId,
              modelId: m.modelId,
              label: m.label,
            },
          })
        )
      );

      // Calculate total tasks
      const totalTasks =
        prompts.length * evalModels.length * data.runsPerPrompt;
      await tx.evaluation.update({
        where: { id: eval_.id },
        data: { totalTasks },
      });

      return {
        ...eval_,
        prompts,
        models: evalModels,
      };
    });

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/evals]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
