import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimits } from "@/lib/rate-limit";
import { providerCreateSchema, safeParse } from "@/lib/validation";
import { BUILTIN_PROVIDERS } from "@/lib/providers/builtin";

/**
 * GET /api/providers
 * Returns user's custom providers + list of builtin providers
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [customProviders, builtinProviders] = await Promise.all([
      prisma.provider.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          type: true,
          baseUrl: true,
          authType: true,
          models: true,
          isPublic: true,
          createdAt: true,
        },
      }),
      Promise.resolve(
        BUILTIN_PROVIDERS.map((p) => ({
          id: p.slug,
          name: p.name,
          slug: p.slug,
          description: p.description,
          type: "BUILTIN" as const,
          baseUrl: p.baseUrl,
          authType: p.authType,
          models: p.models,
          isPublic: true,
          createdAt: new Date(),
        }))
      ),
    ]);

    return NextResponse.json({
      custom: customProviders,
      builtin: builtinProviders,
    });
  } catch (error) {
    console.error("[GET /api/providers]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/providers
 * Create a custom provider
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 API requests per minute
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
    const validation = safeParse(providerCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    // Check slug uniqueness within user's providers
    const existing = await prisma.provider.findFirst({
      where: {
        userId: session.user.id,
        slug: data.slug,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Provider with this slug already exists" },
        { status: 409 }
      );
    }

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        userId: session.user.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: "CUSTOM",
        baseUrl: data.baseUrl,
        authType: data.authType,
        authConfig: (data.authConfig || {}) as any,
        headers: (data.headers || {}) as any,
        bodyTemplate: (data.bodyTemplate || {}) as any,
        models: (data.models || []) as any,
        isPublic: false,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("[POST /api/providers]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
