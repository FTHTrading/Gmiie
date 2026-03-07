import Link from "next/link";
import type { ArticleListItem } from "@/lib/models";

/** @deprecated Use ArticleListItem from @/lib/models directly */
export type IntelligenceCardData = ArticleListItem;

interface IntelligenceCardCompactProps {
  article: ArticleListItem;
  variant?: "default" | "hero" | "secondary";
}

/* ── Design Doctrine: Color by type (meaningful, not decorative) ── */
const TYPE_COLORS: Record<string, string> = {
  BRIEF: "border-l-blue",
  DEEP_DIVE: "border-l-purple",
  INFRA_ANALYSIS: "border-l-cyan",
  REGULATOR_TRACKER: "border-l-red",
  RESEARCH_ARTICLE: "border-l-green",
  DAILY_DIGEST: "border-l-gold",
  WEEKLY_ROUNDUP: "border-l-gold",
  ENTITY_UPDATE: "border-l-cyan",
  MARKET_MAP: "border-l-blue",
  STRATEGIC_MEMO: "border-l-purple",
};

const TYPE_LABELS: Record<string, string> = {
  BRIEF: "Brief",
  DEEP_DIVE: "Deep Dive",
  INFRA_ANALYSIS: "Infra Analysis",
  REGULATOR_TRACKER: "Regulator Tracker",
  RESEARCH_ARTICLE: "Research",
  DAILY_DIGEST: "Daily Digest",
  WEEKLY_ROUNDUP: "Weekly Roundup",
  ENTITY_UPDATE: "Entity Update",
  MARKET_MAP: "Market Map",
  STRATEGIC_MEMO: "Strategic Memo",
};

/* ── Design Doctrine: Trust instrumentation ── */

/** Verification state tooltip explanations */
const VERIFICATION_TOOLTIPS: Record<string, string> = {
  "Verified": "Confirmed by primary official source with high confidence. Treat as established fact.",
  "Verified with caveat": "Reported by credible source, but some details may be incomplete or evolving.",
  "Developing": "Actively evolving story. Key facts reported but may change materially.",
  "Historical context": "Background information from industry sources. Not independently verified.",
};

/** Verification status derived from confidence score + source tier */
function getVerificationState(article: ArticleListItem): {
  label: string;
  className: string;
  tooltip: string;
} {
  const tier = article.source?.credibilityTier;
  const confidence = article.confidenceScore ?? 0;

  // Tier 1 sources with decent confidence → Verified
  if (tier === "TIER_1" && confidence >= 50) {
    return { label: "Verified", className: "status-verified", tooltip: VERIFICATION_TOOLTIPS["Verified"] };
  }
  // Tier 1 with low confidence or Tier 2 with good confidence → Verified with caveat
  if (tier === "TIER_1" || (tier === "TIER_2" && confidence >= 60)) {
    return { label: "Verified with caveat", className: "status-caveat", tooltip: VERIFICATION_TOOLTIPS["Verified with caveat"] };
  }
  // Tier 2 or recent articles → Developing
  if (tier === "TIER_2" || confidence >= 40) {
    return { label: "Developing", className: "status-developing", tooltip: VERIFICATION_TOOLTIPS["Developing"] };
  }
  // Tier 3+ or low confidence → Historical context
  if (tier === "TIER_3" || tier === "TIER_4") {
    return { label: "Historical context", className: "status-historical", tooltip: VERIFICATION_TOOLTIPS["Historical context"] };
  }
  return { label: "Developing", className: "status-developing", tooltip: VERIFICATION_TOOLTIPS["Developing"] };
}

/** Source basis label from credibility tier */
function getSourceBasis(tier: string | undefined): string {
  switch (tier) {
    case "TIER_1": return "Primary official";
    case "TIER_2": return "Secondary reporting";
    case "TIER_3": return "Crypto native";
    case "TIER_4": return "Unverified";
    default: return "Internal analysis";
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ═══════════════════════════════════════════════════════════════
   HERO CARD — Lead story, WSJ front-page style
   Large headline, full summary, prominent signal scores
   ═══════════════════════════════════════════════════════════════ */
function HeroCard({ article }: { article: ArticleListItem }) {
  const typeLabel = TYPE_LABELS[article.articleType] || article.articleType.replace(/_/g, " ");
  const signal = article.signal;
  const verification = getVerificationState(article);
  const sourceBasis = getSourceBasis(article.source?.credibilityTier);

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className="block group"
    >
      {/* Doctrine meta line: Type · Verification · Source basis · Date */}
      <div className="meta-line flex items-center gap-1.5 mb-2 flex-wrap">
        <span>{typeLabel}</span>
        <span className="opacity-40">·</span>
        <span className={verification.className} title={verification.tooltip}>{verification.label}</span>
        <span className="opacity-40">·</span>
        <span>{sourceBasis}</span>
        <span className="opacity-40">·</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>

      {/* Hero headline */}
      <h2 className="headline-hero text-text-primary group-hover:text-gold transition-colors duration-150 mb-3">
        {article.title}
      </h2>

      {/* Executive summary — full display */}
      {article.executiveSummary && (
        <p className="text-body-lg text-text-secondary leading-relaxed mb-4 line-clamp-4">
          {article.executiveSummary}
        </p>
      )}

      {/* Signal score — single overall, not cluttered */}
      {signal && signal.overallScore && (
        <div className="flex items-center gap-5 mb-3 py-3 border-t border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="meta-line">Score</span>
            <span className="font-mono font-bold text-body text-gold">
              {signal.overallScore.toFixed(0)}
            </span>
          </div>
          {signal.institutionalAdoption != null && (
            <SignalPill label="Institutional" value={signal.institutionalAdoption} />
          )}
          {signal.regulatoryClarity != null && (
            <SignalPill label="Regulatory" value={signal.regulatoryClarity} />
          )}
        </div>
      )}

      {/* Entities max 2 + overflow, Topics max 2 */}
      <div className="flex items-center gap-2 flex-wrap">
        {article.entities.slice(0, 2).map((ae) => (
          <span
            key={ae.slug}
            className="text-label font-mono text-text-muted bg-surface-elevated px-2 py-0.5 rounded"
          >
            {ae.name}
          </span>
        ))}
        {article.entities.length > 2 && (
          <span className="text-label font-mono text-text-muted">
            +{article.entities.length - 2}
          </span>
        )}
        {article.topics.slice(0, 2).map((at) => (
          <span
            key={at.slug}
            className="text-caption text-gold/70"
          >
            {at.name}
          </span>
        ))}
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECONDARY CARD — Used in 2-up grids below hero
   Medium headline, 2-line summary
   ═══════════════════════════════════════════════════════════════ */
function SecondaryCard({ article }: { article: ArticleListItem }) {
  const typeColor = TYPE_COLORS[article.articleType] || "border-l-border";
  const typeLabel = TYPE_LABELS[article.articleType] || article.articleType.replace(/_/g, " ");
  const verification = getVerificationState(article);

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className={`block p-4 border-l-3 ${typeColor} bg-surface border border-border-subtle hover:border-gold/20 hover:bg-surface-elevated transition-all duration-200 group rounded-lg`}
    >
      {/* Meta line: Type · Verification · Date */}
      <div className="meta-line flex items-center gap-1.5 mb-1.5">
        <span>{typeLabel}</span>
        <span className="opacity-40">·</span>
        <span className={verification.className} title={verification.tooltip}>{verification.label}</span>
        <span className="opacity-40">·</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>

      {/* Headline */}
      <h3 className="headline-secondary text-text-primary group-hover:text-gold transition-colors duration-150 mb-2 line-clamp-2">
        {article.title}
      </h3>

      {/* Summary */}
      {article.executiveSummary && (
        <p className="text-body-sm text-text-secondary leading-relaxed line-clamp-2 mb-2">
          {article.executiveSummary}
        </p>
      )}

      {/* Entities — max 2 */}
      {article.entities.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {article.entities.slice(0, 2).map((ae) => (
            <span
              key={ae.slug}
              className="text-label font-mono text-text-muted"
            >
              {ae.name}
            </span>
          ))}
          {article.entities.length > 2 && (
            <span className="text-label font-mono text-text-muted">
              +{article.entities.length - 2}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPACT CARD — Feed items, the standard doctrine card
   Type · Verification · Source basis · Date → headline → summary
   ═══════════════════════════════════════════════════════════════ */
export function IntelligenceCardCompact({ article, variant = "default" }: IntelligenceCardCompactProps) {
  if (variant === "hero") return <HeroCard article={article} />;
  if (variant === "secondary") return <SecondaryCard article={article} />;

  const signal = article.signal;
  const typeColor = TYPE_COLORS[article.articleType] || "border-l-border";
  const typeLabel = TYPE_LABELS[article.articleType] || article.articleType.replace(/_/g, " ");
  const verification = getVerificationState(article);
  const sourceBasis = getSourceBasis(article.source?.credibilityTier);

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className={`block p-5 rounded-xl border-l-3 ${typeColor} bg-surface border border-border-subtle hover:border-gold/20 hover:bg-surface-elevated transition-all duration-200 group`}
    >
      {/* ── Doctrine: Type · Verification · Source basis · Date ── */}
      <div className="meta-line flex items-center gap-1.5 mb-2 flex-wrap">
        <span>{typeLabel}</span>
        <span className="opacity-40">·</span>
        <span className={verification.className} title={verification.tooltip}>{verification.label}</span>
        <span className="opacity-40">·</span>
        <span>{sourceBasis}</span>
        <span className="opacity-40">·</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>

      {/* ── Doctrine: Headline ── */}
      <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors duration-150 leading-snug mb-2 line-clamp-2">
        {article.title}
      </h3>

      {/* ── Doctrine: Executive summary ── */}
      {article.executiveSummary && (
        <p className="text-body-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
          {article.executiveSummary}
        </p>
      )}

      {/* ── Doctrine: Compact footer — score + max 2 entities + max 2 topics ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {signal && signal.overallScore && (
          <span className="font-mono text-caption font-bold text-gold">
            Score {signal.overallScore.toFixed(0)}
          </span>
        )}
        {article.entities.slice(0, 2).map((ae) => (
          <span
            key={ae.slug}
            className="text-label font-mono text-text-muted bg-surface-elevated px-2 py-0.5 rounded"
          >
            {ae.name}
          </span>
        ))}
        {article.entities.length > 2 && (
          <span className="text-label font-mono text-text-muted">
            +{article.entities.length - 2}
          </span>
        )}
        {article.topics.slice(0, 2).map((at) => (
          <span
            key={at.slug}
            className="text-caption text-gold/70"
          >
            {at.name}
          </span>
        ))}
      </div>
    </Link>
  );
}

/* ── Signal pill — compact score display ── */
function SignalPill({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return "text-green";
    if (v >= 60) return "text-gold";
    if (v >= 40) return "text-blue";
    return "text-text-muted";
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-caption text-text-muted">{label}</span>
      <span className={`text-caption font-mono font-bold ${getColor(value)}`}>
        {value.toFixed(0)}
      </span>
    </div>
  );
}
