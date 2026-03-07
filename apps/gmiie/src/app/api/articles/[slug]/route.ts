import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        headline: true,
        dek: true,
        executiveSummary: true,
        content: true,
        whyItMatters: true,
        whatHappened: true,
        marketImplications: true,
        infraImplications: true,
        regulatoryImplications: true,
        articleType: true,
        status: true,
        importanceScore: true,
        confidenceScore: true,
        sentimentScore: true,
        assetClass: true,
        region: true,
        publishedAt: true,
        sourcePublishedAt: true,
        sourceUrl: true,
        metaTitle: true,
        metaDescription: true,
        source: { select: { name: true, slug: true, credibilityTier: true } },
        author: { select: { name: true, slug: true, isAI: true } },
        topics: {
          select: {
            relevance: true,
            topic: { select: { name: true, slug: true } },
          },
        },
        entities: {
          select: {
            role: true,
            entity: {
              select: { name: true, slug: true, entityType: true },
            },
          },
        },
        signals: {
          select: {
            institutionalAdoption: true,
            regulatoryClarity: true,
            marketReadiness: true,
            infrastructureMaturity: true,
            settlementImpact: true,
            complianceIntensity: true,
            crossBorderRelevance: true,
            liquiditySignificance: true,
            strategicUrgency: true,
            overallScore: true,
          },
          take: 1,
        },
        tags: {
          select: { tag: { select: { name: true, slug: true } } },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("[API] article detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
