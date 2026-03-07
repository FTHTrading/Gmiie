import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const entity = await prisma.entity.findUnique({
      where: { slug },
      select: {
        slug: true,
        name: true,
        shortName: true,
        entityType: true,
        description: true,
        longDescription: true,
        whyItMatters: true,
        strategicRole: true,
        website: true,
        headquarters: true,
        country: true,
        region: true,
        founded: true,
        articles: {
          select: {
            article: {
              select: {
                slug: true,
                title: true,
                executiveSummary: true,
                articleType: true,
                importanceScore: true,
                publishedAt: true,
              },
            },
          },
          orderBy: { article: { publishedAt: "desc" } },
          take: 10,
        },
        topics: {
          select: {
            topic: { select: { name: true, slug: true } },
          },
        },
        timeline: {
          select: {
            title: true,
            description: true,
            date: true,
            sourceUrl: true,
          },
          orderBy: { date: "desc" },
          take: 20,
        },
        _count: {
          select: {
            articles: true,
            timeline: true,
          },
        },
      },
    });

    if (!entity) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: entity });
  } catch (error) {
    console.error("[API] entity detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entity" },
      { status: 500 }
    );
  }
}
