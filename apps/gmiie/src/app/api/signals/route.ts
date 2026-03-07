import { NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

export async function GET() {
  try {
    // Aggregate signal scores across recent published articles
    const recentSignals = await prisma.signal.findMany({
      where: {
        article: {
          status: "PUBLISHED",
          publishedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
          },
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
      orderBy: { generatedAt: "desc" },
      take: 100,
    });

    if (recentSignals.length === 0) {
      // Return defaults when no data exists yet
      return NextResponse.json({
        data: {
          signals: [
            { key: "institutional_adoption", label: "Institutional Adoption", score: 0, trend: null },
            { key: "regulatory_clarity", label: "Regulatory Clarity", score: 0, trend: null },
            { key: "market_readiness", label: "Market Readiness", score: 0, trend: null },
            { key: "infrastructure_maturity", label: "Infrastructure Maturity", score: 0, trend: null },
            { key: "settlement_impact", label: "Settlement Impact", score: 0, trend: null },
            { key: "compliance_intensity", label: "Compliance Intensity", score: 0, trend: null },
            { key: "cross_border_relevance", label: "Cross-Border Relevance", score: 0, trend: null },
            { key: "liquidity_significance", label: "Liquidity Significance", score: 0, trend: null },
            { key: "strategic_urgency", label: "Strategic Urgency", score: 0, trend: null },
          ],
          articleCount: 0,
          lastUpdated: null,
        },
      });
    }

    // Calculate averages
    type SignalRow = typeof recentSignals[number];
    const avg = (field: keyof SignalRow): number => {
      const values: number[] = recentSignals
        .map((s: SignalRow) => Number(s[field]) || 0)
        .filter((v: number) => v > 0);
      if (values.length === 0) return 0;
      return Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 10) / 10;
    };

    const signals = [
      { key: "institutional_adoption", label: "Institutional Adoption", score: avg("institutionalAdoption") },
      { key: "regulatory_clarity", label: "Regulatory Clarity", score: avg("regulatoryClarity") },
      { key: "market_readiness", label: "Market Readiness", score: avg("marketReadiness") },
      { key: "infrastructure_maturity", label: "Infrastructure Maturity", score: avg("infrastructureMaturity") },
      { key: "settlement_impact", label: "Settlement Impact", score: avg("settlementImpact") },
      { key: "compliance_intensity", label: "Compliance Intensity", score: avg("complianceIntensity") },
      { key: "cross_border_relevance", label: "Cross-Border Relevance", score: avg("crossBorderRelevance") },
      { key: "liquidity_significance", label: "Liquidity Significance", score: avg("liquiditySignificance") },
      { key: "strategic_urgency", label: "Strategic Urgency", score: avg("strategicUrgency") },
    ];

    return NextResponse.json({
      data: {
        signals,
        articleCount: recentSignals.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] signals error:", error);
    return NextResponse.json(
      { error: "Failed to compute signals" },
      { status: 500 }
    );
  }
}
