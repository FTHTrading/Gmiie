import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getArticleBySlug } from "@/lib/data";
import { SignalGauge } from "@/components/signals/SignalGauge";
import type { ArticleDetail } from "@/lib/models";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return genMeta({ title: "Article Not Found", description: "", path: `/intelligence/${slug}`, domain: "gmiie.xxxiii.io" });
  return genMeta({
    title: article.headline ?? "Untitled",
    description: article.dek || article.metaDescription || article.executiveSummary?.slice(0, 160) || "",
    path: `/intelligence/${slug}`,
    type: "article",
    domain: "gmiie.xxxiii.io",
    publishedAt: article.publishedAt ?? undefined,
    author: article.author?.name || "GMIIE Intelligence",
    section: "Intelligence",
    tags: article.topics?.map((t) => t.name) || [],
  });
}

/* ── Design Doctrine: Meaningful status colors only ── */
const TYPE_COLORS: Record<string, string> = {
  BRIEF: "border-blue text-blue",
  DEEP_DIVE: "border-purple text-purple",
  INFRA_ANALYSIS: "border-cyan text-cyan",
  REGULATOR_TRACKER: "border-red text-red",
  MARKET_MOVE: "border-gold text-gold",
  ENTITY_INTEL: "border-green text-green",
  RESEARCH: "border-text-secondary text-text-secondary",
};

/* ── Credibility tier labels ── */
const TIER_LABELS: Record<string, { label: string; className: string }> = {
  "1": { label: "Tier 1 — Official", className: "status-verified" },
  "2": { label: "Tier 2 — Major Media", className: "status-developing" },
  "3": { label: "Tier 3 — Crypto Native", className: "status-caveat" },
  "4": { label: "Tier 4 — Unverified", className: "status-historical" },
};

export default async function IntelligenceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: ArticleDetail | null = null;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    // DB not connected
  }

  if (!article) return notFound();

  const typeColor = TYPE_COLORS[article.articleType] || "border-border text-text-muted";
  const signal = article.signal;
  const tier = article.source?.credibilityTier
    ? TIER_LABELS[article.source.credibilityTier]
    : null;

  return (
    <article>
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-caption text-text-muted mb-5 font-mono">
        <Link href="/" className="hover:text-gold transition-colors">GMIIE</Link>
        <span className="opacity-40">/</span>
        <Link href="/intelligence" className="hover:text-gold transition-colors">Intelligence</Link>
        <span className="opacity-40">/</span>
        <span className="text-text-secondary truncate max-w-[200px]">{article.headline}</span>
      </nav>

      {/* ── Doctrine: Meta line — Type · Source basis · Date ── */}
      <div className="meta-line flex items-center gap-1.5 mb-3">
        <span className={`px-2 py-0.5 border rounded text-[11px] ${typeColor}`}>
          {article.articleType.replace(/_/g, " ")}
        </span>
        {tier && (
          <>
            <span className="opacity-40">·</span>
            <span className={tier.className}>{tier.label}</span>
          </>
        )}
        {signal && signal.overallScore && (
          <>
            <span className="opacity-40">·</span>
            <span className="text-gold font-semibold">Score {signal.overallScore.toFixed(0)}</span>
          </>
        )}
        {article.importanceScore && article.importanceScore >= 80 && (
          <>
            <span className="opacity-40">·</span>
            <span className="text-gold font-semibold">HIGH IMPACT</span>
          </>
        )}
      </div>

      {/* ── Doctrine: Headline — strong, serif-scale feel ── */}
      <h1 className="headline-hero text-text-primary mb-3">
        {article.headline}
      </h1>

      {/* ── Dek/subhead ── */}
      {article.dek && (
        <p className="text-body-lg text-text-secondary leading-relaxed mb-4">
          {article.dek}
        </p>
      )}

      {/* ── Byline + publication info ── */}
      <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-muted mb-6 pb-6 border-b-2 border-border">
        <span className="font-mono">
          {article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : "Draft"}
        </span>
        {article.author && (
          <>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="font-medium text-text-secondary">{article.author.name}</span>
          </>
        )}
        {article.source && (
          <>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>
              Source:{" "}
              {article.sourceUrl ? (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                  {article.source.name} ↗
                </a>
              ) : (
                article.source.name
              )}
            </span>
          </>
        )}
      </div>

      {/* ── Two-column: content + signal sidebar ── */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* ═══ Main content — Editorial doctrine ═══ */}
        <div className="space-y-8">
          {/* Executive Summary — highlighted callout */}
          {article.executiveSummary && (
            <div className="p-5 rounded-xl bg-surface border border-border-subtle border-l-4 border-l-gold">
              <h2 className="meta-line text-gold mb-2">
                Executive Summary
              </h2>
              <p className="text-body-lg text-text-primary leading-relaxed font-medium">
                {article.executiveSummary}
              </p>
            </div>
          )}

          {/* ── Doctrine: "What Happened" ── */}
          {article.whatHappened && (
            <section>
              <h2 className="text-body-lg font-bold text-text-primary mb-3 flex items-center gap-3">
                <span className="w-6 h-0.5 bg-gold" />
                What Happened
              </h2>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.whatHappened}
              </p>
            </section>
          )}

          {/* ── Doctrine: "Why It Matters" ── */}
          {article.whyItMatters && (
            <section>
              <h2 className="text-body-lg font-bold text-text-primary mb-3 flex items-center gap-3">
                <span className="w-6 h-0.5 bg-gold" />
                Why It Matters
              </h2>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.whyItMatters}
              </p>
            </section>
          )}

          {/* Market Implications */}
          {article.marketImplications && (
            <section>
              <h3 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-3">
                <span className="w-5 h-0.5 bg-blue" />
                Market Implications
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.marketImplications}
              </p>
            </section>
          )}

          {/* Infrastructure Implications */}
          {article.infraImplications && (
            <section>
              <h3 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-3">
                <span className="w-5 h-0.5 bg-cyan" />
                Infrastructure Implications
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.infraImplications}
              </p>
            </section>
          )}

          {/* Regulatory Implications */}
          {article.regulatoryImplications && (
            <section>
              <h3 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-3">
                <span className="w-5 h-0.5 bg-red" />
                Regulatory Implications
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.regulatoryImplications}
              </p>
            </section>
          )}

          {/* Full content fallback */}
          {!article.whyItMatters && !article.whatHappened && article.content && (
            <section>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.content}
              </p>
            </section>
          )}

          {/* ── Doctrine: Caveat / Trust disclosure ── */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-border-subtle">
            <p className="text-caption text-text-muted leading-relaxed">
              <span className="font-semibold text-text-secondary">Disclosure:</span>{" "}
              This intelligence is generated by GMIIE&apos;s AI analysis engine.
              {article.source?.credibilityTier && Number(article.source.credibilityTier) >= 3 && (
                <> Source credibility is rated {TIER_LABELS[article.source.credibilityTier]?.label}. Content should be independently verified.</>
              )}
              {" "}GMIIE intelligence is not financial advice.
            </p>
          </div>

          {/* Topics */}
          {article.topics && article.topics.length > 0 && (
            <div className="section-rule">
              <h3 className="meta-line mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.topics.map((at) => (
                  <Link
                    key={at.slug}
                    href={`/topics/${at.slug}`}
                    className="px-2.5 py-1.5 text-body-sm rounded-lg bg-surface border border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold transition-colors"
                  >
                    {at.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Entities */}
          {article.entities && article.entities.length > 0 && (
            <div>
              <h3 className="meta-line mb-3">Entities Referenced</h3>
              <div className="flex flex-wrap gap-2">
                {article.entities.map((ae) => (
                  <Link
                    key={ae.slug}
                    href={`/entities/${ae.slug}`}
                    className="px-2.5 py-1.5 text-body-sm rounded-lg bg-surface border border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold transition-colors"
                  >
                    {ae.name}
                    <span className="text-text-muted ml-1 text-label">
                      {ae.entityType.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Signal sidebar ═══ */}
        <aside className="space-y-4">
          {signal && (
            <>
              {/* Overall score — prominent */}
              <div className="p-5 rounded-xl bg-surface border border-border-subtle text-center">
                <div className="text-display font-bold text-gold mb-1">
                  {signal.overallScore?.toFixed(0) ?? "—"}
                </div>
                <div className="meta-line">
                  Overall Score
                </div>
              </div>

              {/* Individual signals */}
              <div className="p-5 rounded-xl bg-surface border border-border-subtle space-y-3">
                <h3 className="meta-line text-gold mb-2">
                  Signal Dimensions
                </h3>
                {signal.institutionalAdoption != null && (
                  <SignalGauge label="Institutional Adoption" score={signal.institutionalAdoption} compact />
                )}
                {signal.regulatoryClarity != null && (
                  <SignalGauge label="Regulatory Clarity" score={signal.regulatoryClarity} compact />
                )}
                {signal.marketReadiness != null && (
                  <SignalGauge label="Market Readiness" score={signal.marketReadiness} compact />
                )}
                {signal.infrastructureMaturity != null && (
                  <SignalGauge label="Infrastructure Maturity" score={signal.infrastructureMaturity} compact />
                )}
                {signal.settlementImpact != null && (
                  <SignalGauge label="Settlement Impact" score={signal.settlementImpact} compact />
                )}
                {signal.complianceIntensity != null && (
                  <SignalGauge label="Compliance Intensity" score={signal.complianceIntensity} compact />
                )}
                {signal.crossBorderRelevance != null && (
                  <SignalGauge label="Cross-Border Relevance" score={signal.crossBorderRelevance} compact />
                )}
                {signal.liquiditySignificance != null && (
                  <SignalGauge label="Liquidity Significance" score={signal.liquiditySignificance} compact />
                )}
                {signal.strategicUrgency != null && (
                  <SignalGauge label="Strategic Urgency" score={signal.strategicUrgency} compact />
                )}
              </div>
            </>
          )}

          {/* Metadata block */}
          <div className="p-5 rounded-xl bg-surface border border-border-subtle">
            <h3 className="meta-line mb-3">Article Metadata</h3>
            <dl className="space-y-2.5 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Published</dt>
                <dd className="text-text-secondary font-mono">
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Updated</dt>
                <dd className="text-text-secondary font-mono">
                  {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Type</dt>
                <dd className="text-text-secondary">{article.articleType.replace(/_/g, " ")}</dd>
              </div>
              {article.source && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Source</dt>
                  <dd className="text-text-secondary">{article.source.name}</dd>
                </div>
              )}
              {tier && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Credibility</dt>
                  <dd className={tier.className}>{tier.label}</dd>
                </div>
              )}
              {article.assetClass && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Asset Class</dt>
                  <dd className="text-text-secondary">{article.assetClass.replace(/_/g, " ")}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </article>
  );
}
