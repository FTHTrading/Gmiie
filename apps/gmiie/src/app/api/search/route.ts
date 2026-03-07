import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ articles: [], entities: [], topics: [] });
  }

  const [articles, entities, topics] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { headline: { contains: q, mode: "insensitive" } },
          { executiveSummary: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        slug: true,
        title: true,
        articleType: true,
        publishedAt: true,
        importanceScore: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.entity.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { shortName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        slug: true,
        name: true,
        shortName: true,
        entityType: true,
        _count: { select: { articles: true } },
      },
      orderBy: { articles: { _count: "desc" } },
      take: 5,
    }),
    prisma.topic.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        slug: true,
        name: true,
        _count: { select: { articles: true } },
      },
      orderBy: { articles: { _count: "desc" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({ articles, entities, topics });
}
