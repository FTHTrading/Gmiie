// ─────────────────────────────────────────────────────────────
// POST /api/backtest
// Runs a historical backtest against the Signal database.
// Given a dimension, threshold, and date range — returns articles
// whose signal crossed the threshold and their actual importance.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";
import { z } from "zod";

const VALID_DIMS = [
  "institutionalAdoption",
  "regulatoryClarity",
  "marketReadiness",
  "infrastructureMaturity",
  "settlementImpact",
  "complianceIntensity",
  "crossBorderRelevance",
  "liquiditySignificance",
  "strategicUrgency",
  "overallScore",
] as const;

type SignalDim = (typeof VALID_DIMS)[number];

const BodySchema = z.object({
  dimension: z.enum(VALID_DIMS),
  threshold: z.number().min(0).max(100),
  daysBack: z.number().min(7).max(365),
  articleType: z.string().optional(),
});

type SignalRow = {
  institutionalAdoption: number | null;
  regulatoryClarity: number | null;
  marketReadiness: number | null;
  infrastructureMaturity: number | null;
  settlementImpact: number | null;
  complianceIntensity: number | null;
  crossBorderRelevance: number | null;
  liquiditySignificance: number | null;
  strategicUrgency: number | null;
  overallScore: number | null;
  generatedAt: Date;
  article: {
    slug: string;
    title: string;
    articleType: string;
    importanceScore: number | null;
    publishedAt: Date | null;
    source: { name: string } | null;
  } | null;
};

function getDimScore(s: Record<string, unknown>, dim: SignalDim): number {
  return (s[dim] as number) ?? 0;
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { dimension, threshold, daysBack, articleType } = body;

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  try {
    const signals = await prisma.signal.findMany({
      where: {
        generatedAt: { gte: since },
        article: {
          status: "PUBLISHED",
          ...(articleType && articleType !== "all" ? { articleType: articleType as any } : {}),
        },
      },
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
        generatedAt: true,
        article: {
          select: {
            slug: true,
            title: true,
            articleType: true,
            importanceScore: true,
            publishedAt: true,
            source: { select: { name: true } },
          },
        },
      },
      orderBy: { generatedAt: "desc" },
      take: 500,
    });

    const triggered = signals.filter((s) => getDimScore(s, dimension) >= threshold);
    const baseline = signals.filter((s) => getDimScore(s, dimension) < threshold);

    const avgImportance = (arr: SignalRow[]) => {
      if (!arr.length) return 0;
      const sum = arr.reduce((acc, s) => acc + (s.article?.importanceScore ?? 0), 0);
      return Math.round((sum / arr.length) * 10) / 10;
    };

    const topHits = [...triggered]
      .sort((a, b) => (b.article?.importanceScore ?? 0) - (a.article?.importanceScore ?? 0))
      .slice(0, 20)
      .map((s) => ({
        slug: s.article?.slug ?? "",
        title: s.article?.title ?? "",
        articleType: s.article?.articleType ?? "",
        importanceScore: s.article?.importanceScore ?? 0,
        signalScore: Math.round(getDimScore(s, dimension) * 10) / 10,
        publishedAt: s.article?.publishedAt?.toISOString() ?? null,
        source: s.article?.source?.name ?? "",
      }));

    return NextResponse.json({
      dimension,
      threshold,
      daysBack,
      totalSignals: signals.length,
      triggered: triggered.length,
      baseline: baseline.length,
      hitRate:
        signals.length > 0
          ? Math.round((triggered.length / signals.length) * 1000) / 10
          : 0,
      avgImportanceTriggered: avgImportance(triggered),
      avgImportanceBaseline: avgImportance(baseline),
      topHits,
    });
  } catch (err) {
    console.error("[backtest]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
