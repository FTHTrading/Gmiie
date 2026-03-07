import type { Metadata } from "next";
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

/* ── Report categories ── */
const REPORT_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Market Analysis", value: "market_analysis" },
  { label: "Infrastructure Assessment", value: "infra_assessment" },
  { label: "Regulatory Review", value: "regulatory_review" },
  { label: "Quarterly Outlook", value: "quarterly" },
  { label: "Special Reports", value: "special" },
] as const;

export default async function ReportsPage() {
  /* Pull REPORT-type articles; fall back to DEEP_DIVE if none exist */
  let reports: ArticleListItem[] = [];

  try {
    let raw = await getLatestArticles(20, "REPORT");
    if (raw.length === 0) {
      raw = await getLatestArticles(20, "DEEP_DIVE");
    }
    reports = raw;
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

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2.5 mb-6 pb-4 border-b border-border-subtle">
        <span className="text-label font-mono text-text-muted tracking-wider mr-1 self-center">
          CATEGORY
        </span>
        {REPORT_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
              cat.value === "all"
                ? "bg-gold/10 border-gold/30 text-gold"
                : "bg-surface border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {reports.length > 0 ? (
        <div className="space-y-3">
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
      ) : (
        <div className="text-center py-16 text-text-muted">
          <p className="text-body">No reports published yet.</p>
          <p className="text-body-sm mt-2">
            Deep-dive reports will appear here as they are published.
          </p>
        </div>
      )}

      {/* Enterprise CTA */}
      <div className="mt-8 p-6 rounded-xl border border-gold/20 bg-gold/5 text-center">
        <h3 className="text-body font-bold text-text-primary mb-1">
          Enterprise Research Access
        </h3>
        <p className="text-body-sm text-text-secondary mb-3">
          Institutional subscribers receive full access to all premium reports,
          custom research requests, and direct analyst briefings.
        </p>
        <span className="text-caption font-mono text-gold tracking-wider uppercase">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
