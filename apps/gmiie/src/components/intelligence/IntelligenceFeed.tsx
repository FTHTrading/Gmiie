"use client";

import { useState } from "react";
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
  { label: "Strategic Memo", value: "STRATEGIC_MEMO" },
] as const;

type FilterValue = (typeof ARTICLE_FILTERS)[number]["value"];

export function IntelligenceFeed({
  articles,
  title = "Live Intelligence Feed",
  showFilters = true,
}: IntelligenceFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const filtered =
    activeFilter === "all"
      ? articles
      : articles.filter((a) => a.articleType === activeFilter);

  return (
    <div>
      {/* ── Doctrine: Section header with live indicator ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse-slow" />
          <h2 className="meta-line text-gold">
            {title}
          </h2>
          <span className="text-caption font-mono text-text-muted">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            {activeFilter !== "all" && (
              <span className="ml-1 opacity-60">of {articles.length}</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Filter pills — doctrine underline style ── */}
      {showFilters && (
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1 border-b border-border-subtle">
          {ARTICLE_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count =
              filter.value === "all"
                ? articles.length
                : articles.filter((a) => a.articleType === filter.value).length;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-2 text-label font-mono tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-gold border-gold"
                    : "text-text-muted border-transparent hover:text-gold hover:border-gold/40"
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span className={`ml-1.5 ${isActive ? "text-gold/70" : "text-text-muted/50"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Articles ── */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((article) => (
            <IntelligenceCardCompact key={article.slug} article={article} />
          ))
        ) : articles.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-body text-text-muted">
              No {ARTICLE_FILTERS.find((f) => f.value === activeFilter)?.label.toLowerCase()} articles yet.
            </p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-body-sm text-gold hover:underline"
            >
              View all articles
            </button>
          </div>
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
