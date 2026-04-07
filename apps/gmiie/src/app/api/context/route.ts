// ─────────────────────────────────────────────────────────────────────────────
// GET /api/context
// AI-agent-optimised intelligence briefing endpoint.
// Returns a structured JSON payload suitable for direct LLM context injection.
//
// Query params:
//   days=30   lookback window (1–90, default 30)
//   limit=10  article count   (1–50, default 10)
//   type=all  article type filter (ArticleType enum or "all")
//
// Use this endpoint to give an AI agent a concise, up-to-date picture of:
//   • Top intelligence articles with signal scores
//   • Aggregate GMIIE signal dimensions
//   • Most-referenced entities
//   • Active stablecoin legislation by US state
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export const dynamic = "force-dynamic";

// ── Types ──────────────────────────────────────────────────────────────────

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
};

function dimAvg(signals: SignalRow[], field: keyof SignalRow): number {
  const vals = signals.map((s) => Number(s[field]) || 0).filter((v) => v > 0);
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const days = Math.min(Math.max(parseInt(searchParams.get("days") ?? "30"), 1), 90);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "10"), 1), 50);
  const typeParam = (searchParams.get("type") ?? "all").toLowerCase();

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [articles, signals, topEntities, trackedStates] = await Promise.all([

      // ── Top intelligence articles ──
      prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { gte: since },
          ...(typeParam !== "all" && typeParam !== ""
            ? { articleType: typeParam.toUpperCase() as never }
            : {}),
        },
        select: {
          slug: true,
          title: true,
          headline: true,
          dek: true,
          executiveSummary: true,
          articleType: true,
          importanceScore: true,
          publishedAt: true,
          region: true,
          assetClass: true,
          source: { select: { name: true, sourceType: true } },
          topics: {
            select: { topic: { select: { name: true } } },
            take: 5,
          },
          entities: {
            select: { entity: { select: { name: true, entityType: true } } },
            take: 5,
          },
          signals: {
            orderBy: { generatedAt: "desc" },
            take: 1,
            select: {
              overallScore: true,
              institutionalAdoption: true,
              regulatoryClarity: true,
              marketReadiness: true,
              strategicUrgency: true,
            },
          },
        },
        orderBy: [{ importanceScore: "desc" }, { publishedAt: "desc" }],
        take: limit,
      }),

      // ── Aggregate signals (last N days) ──
      prisma.signal.findMany({
        where: {
          article: {
            status: "PUBLISHED",
            publishedAt: { gte: since },
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
        },
        take: 200,
      }),

      // ── Top entities by mention count ──
      prisma.entity.findMany({
        select: {
          name: true,
          entityType: true,
          country: true,
          region: true,
        },
        orderBy: { articles: { _count: "desc" } },
        take: 15,
      }),

      // ── Active stablecoin tracker states ──
      prisma.trackedState.findMany({
        where: {
          status: {
            in: [
              "ACTIVE_LEGISLATION",
              "PASSED_LEGISLATURE",
              "SIGNED_INTO_LAW",
              "EFFECTIVE",
            ] as never[],
          },
        },
        select: {
          name: true,
          abbreviation: true,
          status: true,
          summary: true,
          nextExpectedStep: true,
          lastActionDate: true,
        },
        orderBy: { lastActionDate: "desc" },
        take: 20,
      }),
    ]);

    // ── Build response ──────────────────────────────────────────────────────

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      period: {
        days,
        since: since.toISOString(),
      },

      // Intelligence articles
      intelligence: {
        count: articles.length,
        articles: articles.map((a) => ({
          url: `https://gmiie.xxxiii.io/intelligence/${a.slug}`,
          title: a.title,
          headline: a.headline ?? a.title,
          dek: a.dek ?? null,
          summary: a.executiveSummary ?? null,
          type: a.articleType,
          importance: a.importanceScore ?? 0,
          publishedAt: a.publishedAt?.toISOString() ?? null,
          region: a.region ?? null,
          assetClass: a.assetClass ?? null,
          source: a.source?.name ?? null,
          sourceType: a.source?.sourceType ?? null,
          topics: a.topics.map((t) => t.topic.name),
          entities: a.entities.map((e) => ({
            name: e.entity.name,
            type: e.entity.entityType,
          })),
          signal: a.signals[0]
            ? {
                overall: a.signals[0].overallScore ?? 0,
                institutional: a.signals[0].institutionalAdoption ?? 0,
                regulatory: a.signals[0].regulatoryClarity ?? 0,
                readiness: a.signals[0].marketReadiness ?? 0,
                urgency: a.signals[0].strategicUrgency ?? 0,
              }
            : null,
        })),
      },

      // Aggregate signal dimensions
      signals: {
        sampleSize: signals.length,
        dimensions: [
          { key: "institutional_adoption",  label: "Institutional Adoption",   score: dimAvg(signals, "institutionalAdoption") },
          { key: "regulatory_clarity",      label: "Regulatory Clarity",       score: dimAvg(signals, "regulatoryClarity") },
          { key: "market_readiness",        label: "Market Readiness",         score: dimAvg(signals, "marketReadiness") },
          { key: "infrastructure_maturity", label: "Infrastructure Maturity",  score: dimAvg(signals, "infrastructureMaturity") },
          { key: "settlement_impact",       label: "Settlement Impact",        score: dimAvg(signals, "settlementImpact") },
          { key: "compliance_intensity",    label: "Compliance Intensity",     score: dimAvg(signals, "complianceIntensity") },
          { key: "cross_border_relevance",  label: "Cross-Border Relevance",  score: dimAvg(signals, "crossBorderRelevance") },
          { key: "liquidity_significance",  label: "Liquidity Significance",  score: dimAvg(signals, "liquiditySignificance") },
          { key: "strategic_urgency",       label: "Strategic Urgency",        score: dimAvg(signals, "strategicUrgency") },
        ],
      },

      // Top entities
      entities: {
        count: topEntities.length,
        items: topEntities.map((e) => ({
          name: e.name,
          type: e.entityType,
          country: e.country ?? null,
          region: e.region ?? null,
        })),
      },

      // Active tracker states
      tracker: {
        activeCount: trackedStates.length,
        states: trackedStates.map((s) => ({
          name: s.name,
          abbreviation: s.abbreviation,
          status: s.status,
          summary: s.summary ?? null,
          nextStep: s.nextExpectedStep ?? null,
          lastAction: s.lastActionDate?.toISOString() ?? null,
        })),
      },
    });
  } catch (error) {
    console.error("[API] /api/context error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to build context" },
      { status: 500 }
    );
  }
}
