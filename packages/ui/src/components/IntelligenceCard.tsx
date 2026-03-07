import { cn } from "../index";
import { Badge } from "./Badge";
import { EntityChip } from "./EntityChip";

export interface IntelligenceCardProps {
  title: string;
  summary: string;
  articleType: string;
  publishedAt: string;
  source?: string;
  importanceScore?: number;
  topics?: string[];
  entities?: string[];
  href: string;
  className?: string;
}

export function IntelligenceCard({
  title,
  summary,
  articleType,
  publishedAt,
  source,
  importanceScore,
  topics = [],
  entities = [],
  href,
  className,
}: IntelligenceCardProps) {
  const typeColors: Record<string, "gold" | "blue" | "green" | "red" | "purple" | "cyan"> = {
    brief: "blue",
    daily_digest: "gold",
    weekly_roundup: "gold",
    deep_dive: "purple",
    infra_analysis: "cyan",
    research_article: "green",
    regulator_tracker: "red",
  };

  return (
    <a
      href={href}
      className={cn(
        "block p-6 rounded-xl transition-all duration-300",
        "bg-surface border border-border-subtle",
        "hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5",
        "group",
        className
      )}
    >
      {/* Top meta row */}
      <div className="flex items-center gap-3 mb-3">
        <Badge variant={typeColors[articleType] || "default"} size="sm">
          {articleType.replace(/_/g, " ")}
        </Badge>
        {importanceScore && importanceScore >= 70 && (
          <Badge variant="gold" size="sm">
            High Impact
          </Badge>
        )}
        <span className="text-xs text-text-muted ml-auto">{publishedAt}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary group-hover:text-gold transition-colors duration-200 mb-2 line-clamp-2">
        {title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">
        {summary}
      </p>

      {/* Source */}
      {source && (
        <p className="text-xs text-text-muted mb-3">
          Source: {source}
        </p>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" size="sm">
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {/* Entities */}
      {entities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entities.slice(0, 4).map((entity) => (
            <EntityChip key={entity} name={entity} type="entity" size="sm" />
          ))}
        </div>
      )}
    </a>
  );
}
