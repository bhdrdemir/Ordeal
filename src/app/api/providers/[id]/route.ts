import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits } from "@/lib/rate-limit";
import { providerCreateSchema, safeParse } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/providers/[id]
 * Get provider details (verify ownership for custom providers)
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const provider = await prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        baseUrl: true,
        headers: true,
        bodyTemplate: true,
        authType: true,
        authConfig: true,
        customCode: true,
        models: true,
        isPublic: true,
        createdAt: true,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Public providers can be accessed by anyone
    if (provider.isPublic && provider.type === "BUILTIN") {
      return NextResponse.json(provider);
    }

    // Custom providers require ownership verification
    const session = await auth();
    if (provider.userId && provider.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error("[GET /api/providers/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/providers/[id]
 * Update a custom provider (verify ownership)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    const provider = await prisma.provider.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (provider.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Validate request
    const validation = safeParse(providerCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    // Update provider
    const updated = await prisma.provider.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        baseUrl: data.baseUrl,
        authType: data.authType,
        authConfig: (data.authConfig || {}) as any,
        headers: (data.headers || {}) as any,
        bodyTemplate: (data.bodyTemplate || {}) as any,
        models: (data.models || []) as any,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Provider with this slug already exists" },
        { status: 409 }
      );
    }
    console.error("[PUT /api/providers/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/providers/[id]
 * Delete a custom provider (verify ownership, cascade delete)
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
    const provider = await prisma.provider.findUnique({
      where: { id },
      select: { userId: true, type: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (provider.type === "BUILTIN") {
      return NextResponse.json(
        { error: "Cannot delete builtin providers" },
        { status: 400 }
      );
    }

    if (provider.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete provider (cascade handled by Prisma)
    await prisma.provider.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/providers/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
