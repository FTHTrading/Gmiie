import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cluster = searchParams.get("cluster");

  try {
    const where: Record<string, unknown> = { isActive: true };

    if (cluster) {
      where.cluster = { slug: cluster };
    }

    const topics = await prisma.topic.findMany({
      where,
      select: {
        name: true,
        slug: true,
        description: true,
        cluster: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { articles: true },
        },
      },
      orderBy: [
        { articles: { _count: "desc" } },
        { sortOrder: "asc" },
      ],
    });

    // Also fetch clusters with counts
    const clusters = await prisma.topicCluster.findMany({
      select: {
        name: true,
        slug: true,
        description: true,
        _count: { select: { topics: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: { topics, clusters },
    });
  } catch (error) {
    console.error("[API] topics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
