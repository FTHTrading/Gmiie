import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const topic = searchParams.get("topic");
  const entity = searchParams.get("entity");
  const lang = searchParams.get("lang");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (type && type !== "all") {
      where.articleType = type;
    }

    if (topic) {
      where.topics = {
        some: { topic: { slug: topic } },
      };
    }

    if (entity) {
      where.entities = {
        some: { entity: { slug: entity } },
      };
    }

    // Filter by language — "en" also matches rows with no language set (legacy)
    if (lang && lang !== "all") {
      where.language = lang;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          slug: true,
          title: true,
          headline: true,
          executiveSummary: true,
          articleType: true,
          importanceScore: true,
          publishedAt: true,
          language: true,
          source: { select: { name: true } },
          topics: {
            select: {
              topic: { select: { name: true, slug: true } },
            },
            take: 3,
          },
          entities: {
            select: {
              entity: { select: { name: true, slug: true } },
            },
            take: 4,
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
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      data: articles,
      meta: { total, limit, offset },
    });
  } catch (error) {
    console.error("[API] articles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
