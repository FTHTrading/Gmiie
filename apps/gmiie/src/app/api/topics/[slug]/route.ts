import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        description: true,
        longDescription: true,
        metaTitle: true,
        metaDescription: true,
        cluster: {
          select: { name: true, slug: true, description: true },
        },
        articles: {
          where: { article: { status: "PUBLISHED" } },
          select: {
            article: {
              select: {
                slug: true,
                title: true,
                executiveSummary: true,
                articleType: true,
                importanceScore: true,
                publishedAt: true,
                source: { select: { name: true } },
                entities: {
                  select: {
                    entity: { select: { name: true, slug: true } },
                  },
                  take: 3,
                },
                signals: {
                  select: {
                    institutionalAdoption: true,
                    regulatoryClarity: true,
                    infrastructureMaturity: true,
                    overallScore: true,
                  },
                  take: 1,
                },
              },
            },
          },
          orderBy: { article: { publishedAt: "desc" } },
          take: 20,
        },
        entities: {
          select: {
            entity: {
              select: {
                name: true,
                slug: true,
                entityType: true,
                description: true,
                _count: { select: { articles: true } },
              },
            },
          },
          take: 10,
        },
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: topic });
  } catch (error) {
    console.error("[API] topic detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}
