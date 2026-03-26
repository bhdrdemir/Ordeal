import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/providers/builtin
 * Returns list of builtin providers from DB (public, no auth required)
 */
export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      where: { type: "BUILTIN", isPublic: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        baseUrl: true,
        authType: true,
        models: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("[GET /api/providers/builtin]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
