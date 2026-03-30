"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  articles: {
    slug: string;
    title: string;
    articleType: string;
    publishedAt: string | null;
    importanceScore: number | null;
  }[];
  entities: {
    slug: string;
    name: string;
    shortName: string | null;
    entityType: string;
    _count: { articles: number };
  }[];
  topics: {
    slug: string;
    name: string;
    _count: { articles: number };
  }[];
}

const TYPE_LABELS: Record<string, string> = {
  REGULATORY_UPDATE: "Regulatory",
  MARKET_ANALYSIS: "Market",
  INFRASTRUCTURE_DEEP_DIVE: "Infrastructure",
  INSTITUTIONAL_MOVE: "Institutional",
  PROTOCOL_ANALYSIS: "Protocol",
  CBDC_TRACKER: "CBDC",
  LEGAL_FRAMEWORK: "Legal",
  SETTLEMENT_REPORT: "Settlement",
  RISK_ASSESSMENT: "Risk",
  CROSS_BORDER: "Cross-Border",
  CUSTODY_EVOLUTION: "Custody",
  STABLECOIN_MONITOR: "Stablecoin",
  DEFI_INSTITUTIONAL: "DeFi",
  EXECUTIVE_BRIEF: "Brief",
};

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  // Flatten results for keyboard navigation
  const flatItems = results
    ? [
        ...results.articles.map((a) => ({
          type: "article" as const,
          href: `/intelligence/${a.slug}`,
          label: a.title,
          meta: TYPE_LABELS[a.articleType] || a.articleType,
        })),
        ...results.entities.map((e) => ({
          type: "entity" as const,
          href: `/entities/${e.slug}`,
          label: e.name,
          meta: `${e.entityType.replace(/_/g, " ")} · ${e._count.articles} articles`,
        })),
        ...results.topics.map((t) => ({
          type: "topic" as const,
          href: `/topics/${t.slug}`,
          label: t.name,
          meta: `${t._count.articles} articles`,
        })),
      ]
    : [];

  // Cmd/Ctrl + K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        setResults(await res.json());
        setSelectedIndex(0);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatItems[selectedIndex]) {
      e.preventDefault();
      navigate(flatItems[selectedIndex].href);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 px-3 min-h-[44px] rounded-lg border border-border-subtle bg-surface hover:bg-surface-elevated transition-colors"
        aria-label="Search"
      >
        <svg
          className="w-4 h-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <span className="text-caption font-mono text-text-muted hidden lg:inline">
          Search
        </span>
        <kbd className="hidden lg:inline text-label font-mono text-text-muted bg-background px-1.5 py-0.5 rounded border border-border-subtle">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-0 top-0 z-[101] flex justify-center pt-[15vh]">
        <div className="w-full max-w-lg mx-4 bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
            <svg
              className="w-5 h-5 text-text-muted flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search intelligence, entities, topics..."
              className="flex-1 bg-transparent text-body text-text-primary placeholder:text-text-muted outline-none"
            />
            {loading && (
              <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            )}
            <kbd className="text-label font-mono text-text-muted bg-background px-2 py-1 rounded border border-border-subtle">
              ESC
            </kbd>
          </div>

          {/* Results */}
          {results && flatItems.length > 0 && (
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {results.articles.length > 0 && (
                <div className="px-4 pt-3 pb-1.5">
                  <span className="text-label font-mono font-semibold tracking-[0.1em] text-text-muted uppercase">
                    Intelligence
                  </span>
                </div>
              )}
              {results.articles.map((article, i) => {
                const idx = i;
                return (
                  <button
                    key={article.slug}
                    onClick={() => navigate(`/intelligence/${article.slug}`)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left flex items-center justify-between px-5 py-2.5 text-body-sm transition-colors ${
                      selectedIndex === idx
                        ? "bg-gold/10 text-text-primary"
                        : "text-text-secondary hover:bg-surface-elevated"
                    }`}
                  >
                    <span className="truncate mr-3">{article.title}</span>
                    <span className="text-label font-mono text-text-muted flex-shrink-0">
                      {TYPE_LABELS[article.articleType] || article.articleType}
                    </span>
                  </button>
                );
              })}

              {results.entities.length > 0 && (
                <div className="px-4 pt-4 pb-1.5">
                  <span className="text-label font-mono font-semibold tracking-[0.1em] text-text-muted uppercase">
                    Entities
                  </span>
                </div>
              )}
              {results.entities.map((entity, i) => {
                const idx = results.articles.length + i;
                return (
                  <button
                    key={entity.slug}
                    onClick={() => navigate(`/entities/${entity.slug}`)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left flex items-center justify-between px-5 py-2.5 text-body-sm transition-colors ${
                      selectedIndex === idx
                        ? "bg-gold/10 text-text-primary"
                        : "text-text-secondary hover:bg-surface-elevated"
                    }`}
                  >
                    <span className="truncate mr-3">{entity.name}</span>
                    <span className="text-label font-mono text-text-muted flex-shrink-0">
                      {entity.entityType.replace(/_/g, " ")}
                    </span>
                  </button>
                );
              })}

              {results.topics.length > 0 && (
                <div className="px-4 pt-4 pb-1.5">
                  <span className="text-label font-mono font-semibold tracking-[0.1em] text-text-muted uppercase">
                    Topics
                  </span>
                </div>
              )}
              {results.topics.map((topic, i) => {
                const idx = results.articles.length + results.entities.length + i;
                return (
                  <button
                    key={topic.slug}
                    onClick={() => navigate(`/topics/${topic.slug}`)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left flex items-center justify-between px-5 py-2.5 text-body-sm transition-colors ${
                      selectedIndex === idx
                        ? "bg-gold/10 text-text-primary"
                        : "text-text-secondary hover:bg-surface-elevated"
                    }`}
                  >
                    <span className="truncate mr-3">{topic.name}</span>
                    <span className="text-label font-mono text-text-muted flex-shrink-0">
                      {topic._count.articles} articles
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {results && flatItems.length === 0 && query.length >= 2 && (
            <div className="px-5 py-10 text-center">
              <p className="text-body text-text-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-body-sm text-text-muted mt-2">
                Try searching for entities, topics, or intelligence reports
              </p>
            </div>
          )}

          {/* Hint when empty */}
          {!results && query.length < 2 && (
            <div className="px-5 py-8 text-center">
              <p className="text-body-sm text-text-muted">
                Type at least 2 characters to search across all intelligence
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
            <div className="flex items-center gap-2.5 text-label font-mono text-text-muted">
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border-subtle">↑↓</kbd>
              navigate
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border-subtle ml-1.5">↵</kbd>
              open
            </div>
            <span className="text-label font-mono text-text-muted">
              GMIIE Search
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
