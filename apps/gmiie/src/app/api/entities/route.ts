import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const where: Record<string, unknown> = { isActive: true };

    if (type && type !== "all") {
      where.entityType = type;
    }

    const [entities, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        select: {
          slug: true,
          name: true,
          shortName: true,
          entityType: true,
          description: true,
          headquarters: true,
          country: true,
          _count: {
            select: {
              articles: true,
              timeline: true,
            },
          },
        },
        orderBy: [
          { articles: { _count: "desc" } },
          { name: "asc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.entity.count({ where }),
    ]);

    return NextResponse.json({
      data: entities,
      meta: { total, limit, offset },
    });
  } catch (error) {
    console.error("[API] entities error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}
