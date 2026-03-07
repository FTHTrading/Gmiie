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

/* ── Design Doctrine: Source basis labels ── */
const SOURCE_BASIS: Record<number, { label: string; color: string }> = {
  1: { label: "Official Source", color: "status-verified" },
  2: { label: "Major Media", color: "status-developing" },
  3: { label: "Crypto Native", color: "status-caveat" },
  4: { label: "Unverified", color: "status-historical" },
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className="block group"
    >
      {/* Meta line: Type · Source · Date */}
      <div className="meta-line flex items-center gap-1.5 mb-2">
        <span>{typeLabel}</span>
        <span className="opacity-40">·</span>
        {article.importanceScore && article.importanceScore >= 80 && (
          <>
            <span className="text-gold font-semibold">HIGH IMPACT</span>
            <span className="opacity-40">·</span>
          </>
        )}
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

      {/* Signal scores row */}
      {signal && signal.overallScore && (
        <div className="flex items-center gap-5 mb-3 py-3 border-t border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="meta-line">Overall</span>
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
          {signal.infrastructureMaturity != null && (
            <SignalPill label="Infrastructure" value={signal.infrastructureMaturity} />
          )}
        </div>
      )}

      {/* Entities + Topics */}
      <div className="flex items-center gap-2 flex-wrap">
        {article.entities.slice(0, 4).map((ae) => (
          <span
            key={ae.slug}
            className="text-label font-mono text-text-muted bg-surface-elevated px-2 py-0.5 rounded"
          >
            {ae.name}
          </span>
        ))}
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

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className={`block p-4 border-l-3 ${typeColor} bg-surface border border-border-subtle hover:border-gold/20 hover:bg-surface-elevated transition-all duration-200 group rounded-lg`}
    >
      {/* Meta line */}
      <div className="meta-line flex items-center gap-1.5 mb-1.5">
        <span>{typeLabel}</span>
        <span className="opacity-40">·</span>
        <span>{formatTimeAgo(article.publishedAt)}</span>
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

      {/* Entities */}
      {article.entities.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {article.entities.slice(0, 3).map((ae) => (
            <span
              key={ae.slug}
              className="text-label font-mono text-text-muted"
            >
              {ae.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPACT CARD — Feed items, the standard doctrine card
   Meta line → headline → what happened → why it matters → caveat
   ═══════════════════════════════════════════════════════════════ */
export function IntelligenceCardCompact({ article, variant = "default" }: IntelligenceCardCompactProps) {
  if (variant === "hero") return <HeroCard article={article} />;
  if (variant === "secondary") return <SecondaryCard article={article} />;

  const signal = article.signal;
  const typeColor = TYPE_COLORS[article.articleType] || "border-l-border";
  const typeLabel = TYPE_LABELS[article.articleType] || article.articleType.replace(/_/g, " ");

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className={`block p-5 rounded-xl border-l-3 ${typeColor} bg-surface border border-border-subtle hover:border-gold/20 hover:bg-surface-elevated transition-all duration-200 group`}
    >
      {/* ── Doctrine: Metadata line ── */}
      <div className="meta-line flex items-center gap-1.5 mb-2">
        <span>{typeLabel}</span>
        {article.importanceScore && article.importanceScore >= 80 && (
          <>
            <span className="opacity-40">·</span>
            <span className="text-gold font-semibold">HIGH IMPACT</span>
          </>
        )}
        <span className="opacity-40">·</span>
        <span>{formatTimeAgo(article.publishedAt)}</span>
      </div>

      {/* ── Doctrine: Headline ── */}
      <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors duration-150 leading-snug mb-2 line-clamp-2">
        {article.title}
      </h3>

      {/* ── Doctrine: "What happened" / Executive summary ── */}
      {article.executiveSummary && (
        <p className="text-body-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
          {article.executiveSummary}
        </p>
      )}

      {/* ── Doctrine: Signal scores (meaningful data, not decoration) ── */}
      {signal && signal.overallScore && (
        <div className="flex items-center gap-4 mb-2.5">
          {signal.institutionalAdoption != null && (
            <SignalPill label="Institutional" value={signal.institutionalAdoption} />
          )}
          {signal.regulatoryClarity != null && (
            <SignalPill label="Regulatory" value={signal.regulatoryClarity} />
          )}
          {signal.infrastructureMaturity != null && (
            <SignalPill label="Infrastructure" value={signal.infrastructureMaturity} />
          )}
        </div>
      )}

      {/* ── Doctrine: Entity + topic tags ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {article.entities.slice(0, 3).map((ae) => (
          <span
            key={ae.slug}
            className="text-label font-mono text-text-muted bg-surface-elevated px-2 py-0.5 rounded"
          >
            {ae.name}
          </span>
        ))}
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
