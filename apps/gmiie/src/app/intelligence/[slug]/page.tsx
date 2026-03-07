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

const TYPE_COLORS: Record<string, string> = {
  BRIEF: "border-blue text-blue",
  DEEP_DIVE: "border-purple text-purple",
  INFRA_ANALYSIS: "border-cyan text-cyan",
  REGULATOR_TRACKER: "border-red text-red",
  MARKET_MOVE: "border-gold text-gold",
  ENTITY_INTEL: "border-green text-green",
  RESEARCH: "border-text-secondary text-text-secondary",
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

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-text-muted mb-4 font-mono">
        <Link href="/" className="hover:text-gold transition-colors">GMIIE</Link>
        <span>/</span>
        <Link href="/intelligence" className="hover:text-gold transition-colors">Intelligence</Link>
        <span>/</span>
        <span className="text-text-secondary truncate max-w-[200px]">{article.headline}</span>
      </nav>

      {/* Type badge + importance */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-2.5 py-1 text-label font-mono uppercase tracking-wider border rounded-lg ${typeColor}`}>
          {article.articleType.replace(/_/g, " ")}
        </span>
        {signal && (
          <span className="text-body-sm font-mono text-gold">
            Score: {signal.overallScore?.toFixed(0) ?? "—"}
          </span>
        )}
      </div>

      {/* Headline */}
      <h1 className="text-heading-lg md:text-display font-bold text-text-primary leading-tight mb-3">
        {article.headline}
      </h1>

      {/* Dek */}
      {article.dek && (
        <p className="text-body-lg text-text-secondary leading-relaxed mb-4">
          {article.dek}
        </p>
      )}

      {/* Meta line */}
      <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-muted mb-6 pb-6 border-b border-border-subtle">
        <span className="font-mono">
          {article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : "Draft"}
        </span>
        {article.author && (
          <>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>{article.author.name}</span>
          </>
        )}
        {article.source && (
          <>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>
              Source:{" "}
              {article.sourceUrl ? (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                  {article.source.name}
                </a>
              ) : (
                article.source.name
              )}
            </span>
          </>
        )}
        {article.source?.credibilityTier && (
          <>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span className="px-2 py-0.5 border border-border-subtle rounded-lg text-label">
              Tier {article.source.credibilityTier}
            </span>
          </>
        )}
      </div>

      {/* Two-column: content + signal sidebar */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Main content */}
        <div className="space-y-8">
          {/* Executive Summary */}
          {article.executiveSummary && (
            <div className="p-5 rounded-xl bg-surface border border-border-subtle border-l-3 border-l-gold">
              <h2 className="text-caption font-mono tracking-[0.15em] text-gold uppercase mb-2">
                Executive Summary
              </h2>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.executiveSummary}
              </p>
            </div>
          )}

          {/* Body sections */}
          {/* Editorial sections (direct fields) */}
          {article.whyItMatters && (
            <div>
              <h2 className="text-body-lg font-bold text-text-primary mb-3 flex items-center gap-3">
                <span className="w-6 h-px bg-gold" />
                Why It Matters
              </h2>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.whyItMatters}
              </p>
            </div>
          )}
          {article.whatHappened && (
            <div>
              <h2 className="text-body-lg font-bold text-text-primary mb-3 flex items-center gap-3">
                <span className="w-6 h-px bg-gold" />
                What Happened
              </h2>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.whatHappened}
              </p>
            </div>
          )}
          {article.marketImplications && (
            <div>
              <h3 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-3">
                <span className="w-5 h-px bg-blue" />
                Market Implications
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.marketImplications}
              </p>
            </div>
          )}
          {article.infraImplications && (
            <div>
              <h3 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-3">
                <span className="w-5 h-px bg-cyan" />
                Infrastructure Implications
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.infraImplications}
              </p>
            </div>
          )}
          {article.regulatoryImplications && (
            <div>
              <h3 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-3">
                <span className="w-5 h-px bg-red" />
                Regulatory Implications
              </h3>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.regulatoryImplications}
              </p>
            </div>
          )}

          {/* Full content fallback if no editorial sections */}
          {!article.whyItMatters && !article.whatHappened && article.content && (
            <div>
              <p className="text-body text-text-secondary leading-relaxed">
                {article.content}
              </p>
            </div>
          )}

          {/* Topics */}
          {article.topics && article.topics.length > 0 && (
            <div>
              <h3 className="text-caption font-mono tracking-[0.15em] text-text-muted uppercase mb-3">
                Topics
              </h3>
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
              <h3 className="text-caption font-mono tracking-[0.15em] text-text-muted uppercase mb-3">
                Entities
              </h3>
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

        {/* Signal sidebar */}
        <aside className="space-y-4">
          {signal && (
            <>
              {/* Overall score */}
              <div className="p-5 rounded-xl bg-surface border border-border-subtle text-center">
                <div className="text-display font-bold text-gold mb-1">
                  {signal.overallScore?.toFixed(0) ?? "—"}
                </div>
                <div className="text-label font-mono text-text-muted tracking-wider uppercase">
                  Overall Score
                </div>
              </div>

              {/* Individual signals */}
              <div className="p-5 rounded-xl bg-surface border border-border-subtle space-y-3">
                <h3 className="text-caption font-mono tracking-[0.15em] text-gold uppercase mb-2">
                  Signal Scores
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

          {/* Meta block */}
          <div className="p-5 rounded-xl bg-surface border border-border-subtle">
            <h3 className="text-caption font-mono tracking-[0.15em] text-text-muted uppercase mb-3">
              Metadata
            </h3>
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
              {article.source?.credibilityTier && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Credibility</dt>
                  <dd className="text-text-secondary">Tier {article.source.credibilityTier}</dd>
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
    </div>
  );
}
