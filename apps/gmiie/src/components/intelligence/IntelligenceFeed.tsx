import { IntelligenceCardCompact } from "./IntelligenceCard";
import type { ArticleListItem } from "@/lib/models";

interface IntelligenceFeedProps {
  articles: ArticleListItem[];
  title?: string;
  showFilters?: boolean;
}

const ARTICLE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Briefs", value: "BRIEF" },
  { label: "Deep Dives", value: "DEEP_DIVE" },
  { label: "Regulator Tracker", value: "REGULATOR_TRACKER" },
  { label: "Infra Analysis", value: "INFRA_ANALYSIS" },
  { label: "Research", value: "RESEARCH_ARTICLE" },
] as const;

export function IntelligenceFeed({
  articles,
  title = "Live Intelligence Feed",
  showFilters = true,
}: IntelligenceFeedProps) {
  return (
    <div>
      {/* Feed header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse-slow" />
          <h2 className="text-body font-mono font-semibold text-text-primary tracking-wide uppercase">
            {title}
          </h2>
          <span className="text-caption font-mono text-text-muted">
            {articles.length} items
          </span>
        </div>
      </div>

      {/* Filter pills */}
      {showFilters && (
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
          {ARTICLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className="px-3 py-1.5 text-label font-mono tracking-wider uppercase text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-elevated border border-border-subtle rounded-lg transition-colors whitespace-nowrap"
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Articles */}
      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <IntelligenceCardCompact key={article.slug} article={article} />
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-body text-text-muted">
              No intelligence articles yet.
            </p>
            <p className="text-body-sm text-text-muted mt-2">
              Articles will appear here as the ingestion pipeline publishes them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
