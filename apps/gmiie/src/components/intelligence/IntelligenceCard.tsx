import Link from "next/link";
import type { ArticleListItem } from "@/lib/models";

/** @deprecated Use ArticleListItem from @/lib/models directly */
export type IntelligenceCardData = ArticleListItem;

interface IntelligenceCardCompactProps {
  article: ArticleListItem;
}

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

export function IntelligenceCardCompact({ article }: IntelligenceCardCompactProps) {
  const signal = article.signal;
  const typeColor = TYPE_COLORS[article.articleType] || "border-l-border";
  const typeLabel = TYPE_LABELS[article.articleType] || article.articleType.replace(/_/g, " ");

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className={`block p-5 rounded-xl border-l-3 ${typeColor} bg-surface border border-border-subtle hover:border-gold/20 hover:bg-surface-elevated transition-all duration-200 group`}
    >
      {/* Meta row */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="text-label font-mono uppercase tracking-wider text-text-muted bg-surface-elevated px-2 py-1 rounded">
          {typeLabel}
        </span>
        {article.importanceScore && article.importanceScore >= 80 && (
          <span className="text-label font-mono text-gold bg-gold/10 px-2 py-1 rounded font-semibold">
            HIGH IMPACT
          </span>
        )}
        <span className="text-caption font-mono text-text-muted ml-auto">
          {formatTimeAgo(article.publishedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors duration-150 leading-snug mb-2 line-clamp-2">
        {article.title}
      </h3>

      {/* Summary */}
      {article.executiveSummary && (
        <p className="text-body-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
          {article.executiveSummary}
        </p>
      )}

      {/* Signal scores row */}
      {signal && signal.overallScore && (
        <div className="flex items-center gap-4 mb-2.5">
          {signal.institutionalAdoption != null && (
            <ScorePill label="Institutional" value={signal.institutionalAdoption} />
          )}
          {signal.regulatoryClarity != null && (
            <ScorePill label="Regulatory" value={signal.regulatoryClarity} />
          )}
          {signal.infrastructureMaturity != null && (
            <ScorePill label="Infrastructure" value={signal.infrastructureMaturity} />
          )}
        </div>
      )}

      {/* Entities + Topics */}
      <div className="flex items-center gap-2 flex-wrap">
        {article.entities.slice(0, 3).map((ae) => (
          <span
            key={ae.slug}
            className="text-label font-mono text-text-muted bg-surface-elevated px-2 py-1 rounded"
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

function ScorePill({ label, value }: { label: string; value: number }) {
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
        {value.toFixed(1)}
      </span>
    </div>
  );
}
