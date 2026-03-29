import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { decrypt } from "@/lib/crypto";
import { runEvaluation, EvalTask } from "@/lib/eval-engine";
import { getBuiltinProvider } from "@/lib/providers/builtin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/evals/[id]/run
 * Start an evaluation: set status to RUNNING, process tasks, save results
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 eval runs per minute
  const limiter = rateLimits.evalRun(session.user.id);
  if (!limiter.success) {
    return rateLimitResponse(limiter.resetAt);
  }

  try {
    // Fetch evaluation with all necessary data
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        prompts: true,
        models: {
          include: { provider: true },
        },
        results: true,
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ownership
    if (evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check status: only DRAFT, PENDING, or FAILED can be run
    if (
      !["DRAFT", "PENDING", "FAILED"].includes(evaluation.status)
    ) {
      return NextResponse.json(
        { error: `Cannot run evaluation with status ${evaluation.status}` },
        { status: 400 }
      );
    }

    // Set status to RUNNING immediately
    await prisma.evaluation.update({
      where: { id },
      data: {
        status: "RUNNING",
        completedTasks: 0,
      },
    });

    // Build evaluation tasks
    const tasks: EvalTask[] = [];

    for (const prompt of evaluation.prompts) {
      for (const evalModel of evaluation.models) {
        for (let runIndex = 0; runIndex < evaluation.runsPerPrompt; runIndex++) {
          const provider = evalModel.provider as any;

          // Get provider config
          let providerConfig: any;
          if (provider.type === "BUILTIN") {
            const builtinProvider = getBuiltinProvider(provider.slug);
            if (!builtinProvider) {
              throw new Error(`Builtin provider not found: ${provider.slug}`);
            }
            providerConfig = builtinProvider;
          } else {
            providerConfig = {
              baseUrl: provider.baseUrl,
              authType: provider.authType,
              authConfig: provider.authConfig || {},
              headers: provider.headers || {},
              bodyTemplate: provider.bodyTemplate || {},
            };
          }

          // Get API key
          const apiKeyRecord = await prisma.apiKey.findFirst({
            where: {
              providerId: provider.id,
              userId: session.user.id,
            },
          });

          if (!apiKeyRecord) {
            throw new Error(`No API key found for provider ${provider.id}`);
          }

          const decryptedKey = decrypt(apiKeyRecord.encryptedKey);

          tasks.push({
            promptId: prompt.id,
            promptContent: prompt.content,
            evalModelId: evalModel.id,
            modelId: evalModel.modelId,
            provider: {
              baseUrl: providerConfig.baseUrl,
              authType: providerConfig.authType,
              authConfig: providerConfig.authConfig,
              headers: providerConfig.headers || {},
              bodyTemplate: providerConfig.bodyTemplate || {},
              responseParser: providerConfig.responseParser || {
                content: "choices[0].message.content",
                inputTokens: "usage.prompt_tokens",
                outputTokens: "usage.completion_tokens",
              },
              models: providerConfig.models || [],
            },
            apiKey: decryptedKey,
            temperature: evaluation.temperature,
            maxTokens: evaluation.maxTokens,
            runIndex,
          });
        }
      }
    }

    // Run evaluation
    let completedCount = 0;
    let failedCount = 0;

    await runEvaluation(tasks, 3, async (_completed, _total, result) => {
      // Update progress
      completedCount++;

      // Save result to database
      try {
        // First check if result already exists
        const existingResult = await prisma.evalResult.findFirst({
          where: {
            evalId: id,
            promptId: result.promptId,
            evalModelId: result.evalModelId,
            runIndex: result.runIndex,
          },
        });

        if (existingResult) {
          await prisma.evalResult.update({
            where: { id: existingResult.id },
            data: {
              response: result.response,
              latency: result.latency,
              cost: result.cost,
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              error: result.error,
            },
          });
        } else {
          await prisma.evalResult.create({
            data: {
              evalId: id,
              promptId: result.promptId,
              evalModelId: result.evalModelId,
              response: result.response,
              latency: result.latency,
              cost: result.cost,
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              error: result.error,
              runIndex: result.runIndex,
            },
          });
        }

        if (result.error) {
          failedCount++;
        }
      } catch (error) {
        console.error("[eval run] Failed to save result:", error);
        failedCount++;
      }

      // Update evaluation progress
      try {
        await prisma.evaluation.update({
          where: { id },
          data: { completedTasks: completedCount },
        });
      } catch (error) {
        console.error("[eval run] Failed to update progress:", error);
      }
    });

    // Update final status
    const finalStatus = failedCount === 0 ? "COMPLETED" : "FAILED";
    const finalEval = await prisma.evaluation.update({
      where: { id },
      data: {
        status: finalStatus,
        completedTasks: completedCount,
      },
    });

    return NextResponse.json({
      success: true,
      evaluation: finalEval,
      stats: {
        total: tasks.length,
        completed: completedCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("[POST /api/evals/[id]/run]", error);

    // Update evaluation status to FAILED
    try {
      await prisma.evaluation.update({
        where: { id },
        data: { status: "FAILED" },
      });
    } catch (e) {
      console.error("[eval run] Failed to update status to FAILED:", e);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
