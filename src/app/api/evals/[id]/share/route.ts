import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits, rateLimitResponse } from "@/lib/rate-limit";
import { nanoid } from "nanoid";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/evals/[id]/share
 * Create a public share link for an evaluation
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 share link creations per minute
  const limiter = rateLimits.share(session.user.id);
  if (!limiter.success) {
    return rateLimitResponse(limiter.resetAt);
  }

  try {
    // Verify evaluation exists and user owns it
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

    if (evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upsert share link — atomic, avoids race condition on concurrent requests
    const slug = nanoid(12);
    const shareLink = await prisma.shareLink.upsert({
      where: { evalId: id },
      update: {}, // keep existing slug if already created
      create: { evalId: id, slug },
    });

    // Update evaluation to be public
    await prisma.evaluation.update({
      where: { id },
      data: { isPublic: true },
    });

    return NextResponse.json(
      {
        evalId: shareLink.evalId,
        slug: shareLink.slug,
        shareUrl: `/share/${shareLink.slug}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/evals/[id]/share]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/evals/[id]/share
 * Revoke a share link (evaluation becomes private)
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const limiter = rateLimits.share(session.user.id);
  if (!limiter.success) {
    return rateLimitResponse(limiter.resetAt);
  }

  try {
    // Verify evaluation exists and user owns it
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

    if (evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete share link
    await prisma.shareLink.deleteMany({
      where: { evalId: id },
    });

    // Update evaluation to be private
    await prisma.evaluation.update({
      where: { id },
      data: { isPublic: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/evals/[id]/share]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
