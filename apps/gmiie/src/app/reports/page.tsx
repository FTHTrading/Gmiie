import type { Metadata } from "next";
import Link from "next/link";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getLatestArticles } from "@/lib/data";
import type { ArticleListItem } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "Reports",
  description:
    "Institutional-grade research reports, market analyses, and infrastructure assessments from GMIIE.",
  path: "/reports",
  domain: "gmiie.xxxiii.io",
});

/* ── Planned coverage areas ── */
const COVERAGE_AREAS = [
  {
    title: "Tokenized Securities Market Map",
    description: "Comprehensive mapping of tokenized securities issuance platforms, regulatory regimes, and institutional adoption across 12 jurisdictions.",
    status: "In Research",
    quarter: "Q2 2026",
  },
  {
    title: "Stablecoin Regulatory Landscape",
    description: "Comparative analysis of stablecoin frameworks: US (GENIUS Act), EU (MiCA), UK (FCA), Singapore (MAS) — requirements, timelines, and market impact.",
    status: "In Research",
    quarter: "Q2 2026",
  },
  {
    title: "Digital Settlement Infrastructure",
    description: "Assessment of T+0 settlement pilots, DLT-based clearing platforms, and the evolving role of CSDs and CCPs in digital asset markets.",
    status: "Planned",
    quarter: "Q3 2026",
  },
  {
    title: "Institutional Custody Standards",
    description: "Review of qualified custody requirements, multi-party computation approaches, and insurance frameworks for digital asset custody.",
    status: "Planned",
    quarter: "Q3 2026",
  },
] as const;

export default async function ReportsPage() {
  /* Pull REPORT-type articles; fall back to DEEP_DIVE if none exist */
  let reports: ArticleListItem[] = [];
  let latestIntelligence: ArticleListItem[] = [];

  try {
    let raw = await getLatestArticles(20, "REPORT");
    if (raw.length === 0) {
      raw = await getLatestArticles(20, "DEEP_DIVE");
    }
    reports = raw;

    /* Pull latest editorial for cross-reference */
    const editorial = await getLatestArticles(5);
    latestIntelligence = editorial.filter(
      (a) => !reports.some((r) => r.slug === a.slug)
    ).slice(0, 3);
  } catch {
    // DB not connected
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Reports & Research
        </h1>
        <p className="text-body text-text-muted">
          Institutional-grade research, market analyses, and infrastructure
          assessments for strategic decision-making.
        </p>
      </div>

      {/* Published Reports */}
      {reports.length > 0 && (
        <>
          <h2 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
            Published Reports
          </h2>
          <div className="space-y-3 mb-8">
            {reports.map((report) => (
              <a
                key={report.slug}
                href={`/intelligence/${report.slug}`}
                className="block p-4 rounded-lg border border-border-subtle bg-surface/30 hover:border-gold/20 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-label font-mono px-2 py-0.5 rounded-lg bg-gold/10 text-gold border border-gold/20 uppercase">
                        Report
                      </span>
                      <span className="text-label font-mono text-text-muted">
                        {report.publishedAt
                          ? new Date(report.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Draft"}
                      </span>
                    </div>
                    <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors mb-1 line-clamp-1">
                      {report.headline ?? report.title}
                    </h3>
                    {report.executiveSummary && (
                      <p className="text-body-sm text-text-secondary line-clamp-2">
                        {report.executiveSummary}
                      </p>
                    )}
                  </div>
                  <span className="text-body-sm text-text-muted shrink-0 self-center">
                    {report.source?.name ?? "GMIIE"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Research Coverage Roadmap */}
      <div className="mb-8">
        <h2 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
          Research Coverage Roadmap
        </h2>
        <p className="text-body-sm text-text-muted mb-4">
          Upcoming reports in the GMIIE research pipeline. Coverage areas are
          selected based on institutional relevance and regulatory momentum.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COVERAGE_AREAS.map((area) => (
            <div
              key={area.title}
              className="p-4 rounded-lg border border-border-subtle bg-surface/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-label font-mono px-2 py-0.5 rounded-lg border uppercase ${
                    area.status === "In Research"
                      ? "bg-gold/10 text-gold border-gold/20"
                      : "bg-surface text-text-muted border-border-subtle"
                  }`}
                >
                  {area.status}
                </span>
                <span className="text-label font-mono text-text-muted">
                  {area.quarter}
                </span>
              </div>
              <h3 className="text-body font-semibold text-text-primary mb-1">
                {area.title}
              </h3>
              <p className="text-body-sm text-text-secondary line-clamp-3">
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Intelligence Cross-reference */}
      {latestIntelligence.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase">
              Latest Intelligence
            </h2>
            <Link
              href="/"
              className="text-caption font-mono text-gold hover:text-gold/80 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {latestIntelligence.map((article) => (
              <a
                key={article.slug}
                href={`/intelligence/${article.slug}`}
                className="block px-4 py-3 rounded-lg border border-border-subtle bg-surface/20 hover:border-gold/20 transition-colors group"
              >
                <h3 className="text-body-sm font-medium text-text-secondary group-hover:text-gold transition-colors line-clamp-1">
                  {article.headline ?? article.title}
                </h3>
                <span className="text-caption font-mono text-text-muted">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Methodology + Enterprise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/methodology"
          className="p-5 rounded-xl border border-border-subtle bg-surface/30 hover:border-gold/20 transition-colors group"
        >
          <h3 className="text-body font-bold text-text-primary mb-1 group-hover:text-gold transition-colors">
            Our Methodology
          </h3>
          <p className="text-body-sm text-text-secondary">
            How GMIIE sources, verifies, and scores market intelligence —
            including our 9-dimension signal framework and confidence scoring.
          </p>
        </Link>

        <div className="p-5 rounded-xl border border-gold/20 bg-gold/5">
          <h3 className="text-body font-bold text-text-primary mb-1">
            Enterprise Research Access
          </h3>
          <p className="text-body-sm text-text-secondary mb-2">
            Custom research requests, direct analyst briefings, and early
            access to all premium reports.
          </p>
          <span className="text-caption font-mono text-gold tracking-wider uppercase">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
