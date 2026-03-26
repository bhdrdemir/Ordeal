import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { rateLimits } from "@/lib/rate-limit";
import { apiKeyCreateSchema, safeParse } from "@/lib/validation";

/**
 * GET /api/keys
 * List user's API keys (mask the actual key)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        providerId: true,
        label: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(keys);
  } catch (error) {
    console.error("[GET /api/keys]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/keys
 * Create a new API key (encrypted storage)
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 key operations per minute
  const limiter = rateLimits.keys(session.user.id);
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Validate request
    const validation = safeParse(apiKeyCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    // Verify provider exists and user has access
    const provider = await prisma.provider.findUnique({
      where: { id: data.providerId },
      select: { id: true, userId: true, type: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // User can add keys to their own custom providers or to public providers
    if (
      provider.type === "CUSTOM" &&
      provider.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Encrypt the API key
    const encryptedKey = encrypt(data.key);

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        providerId: data.providerId,
        encryptedKey,
        label: data.label,
      },
      select: {
        id: true,
        providerId: true,
        label: true,
        createdAt: true,
      },
    });

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error("[POST /api/keys]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
