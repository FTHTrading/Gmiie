"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

type ArticleResult = {
  slug: string;
  title: string;
  articleType: string;
  publishedAt: string | null;
  importanceScore: number | null;
};

type EntityResult = {
  slug: string;
  name: string;
  shortName: string | null;
  entityType: string;
  _count: { articles: number };
};

type TopicResult = {
  slug: string;
  name: string;
  description: string | null;
  _count: { articles: number };
};

type SearchResults = {
  articles: ArticleResult[];
  entities: EntityResult[];
  topics: TopicResult[];
};

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  BRIEF: "Brief",
  DEEP_DIVE: "Deep Dive",
  INFRA_ANALYSIS: "Infra Analysis",
  REGULATOR_TRACKER: "Regulatory",
  MARKET_MOVE: "Market Move",
  ENTITY_INTEL: "Entity Intel",
  RESEARCH_ARTICLE: "Research",
  STRATEGIC_MEMO: "Strategic Memo",
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  REGULATOR: "text-red",
  CENTRAL_BANK: "text-blue",
  BANK: "text-cyan",
  EXCHANGE: "text-gold",
  CUSTODIAN: "text-purple",
  ASSET_MANAGER: "text-green",
  TOKENIZATION_FIRM: "text-gold",
  INFRASTRUCTURE_PROVIDER: "text-cyan",
  CLEARING_HOUSE: "text-blue",
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const totalResults = results
    ? results.articles.length + results.entities.length + results.topics.length
    : 0;

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Search unavailable. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasResults = results && totalResults > 0;
  const noResults = results && totalResults === 0 && debouncedQuery.length >= 2 && !loading;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <p className="meta-line mb-2">INTELLIGENCE SEARCH</p>
        <h1 className="text-heading-lg font-bold text-text-primary mb-1">Search</h1>
        <p className="text-body-sm text-text-muted">
          Search across intelligence articles, institutions, and topics.
        </p>
      </div>

      {/* ── Search input ── */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for institutions, regulations, asset classes..."
          className="w-full rounded-xl border border-border-subtle bg-surface pl-11 pr-4 py-3.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── Suggested searches (idle state) ── */}
      {!query && (
        <div>
          <p className="meta-line mb-3">Suggested searches</p>
          <div className="flex flex-wrap gap-2">
            {["BlackRock", "SEC tokenized securities", "CBDC", "DTCC settlement", "stablecoin regulation", "MAS Singapore", "Kraken Federal Reserve"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-body-sm text-text-secondary hover:border-gold/40 hover:text-text-primary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="p-4 rounded-lg border border-red/30 bg-red/5 text-body-sm text-red">
          {error}
        </div>
      )}

      {/* ── No results ── */}
      {noResults && (
        <div className="text-center py-12">
          <p className="text-body text-text-muted mb-2">No results for &ldquo;{debouncedQuery}&rdquo;</p>
          <p className="text-body-sm text-text-muted">
            Try a different term or browse the{" "}
            <Link href="/intelligence" className="text-gold hover:underline">intelligence feed</Link>
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {hasResults && (
        <div className="space-y-8">
          {/* Result count */}
          <p className="meta-line">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;
          </p>

          {/* Articles */}
          {results.articles.length > 0 && (
            <section>
              <h2 className="text-body font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-gold" />
                Intelligence Articles
                <span className="text-label text-text-muted font-mono ml-1">({results.articles.length})</span>
              </h2>
              <div className="space-y-2">
                {results.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/intelligence/${article.slug}`}
                    className="block p-4 rounded-xl border border-border-subtle bg-surface hover:border-gold/30 transition-colors group"
                  >
                    <div className="meta-line mb-1.5 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded border border-border text-[11px] text-text-muted">
                        {ARTICLE_TYPE_LABELS[article.articleType] || article.articleType.replace(/_/g, " ")}
                      </span>
                      {article.publishedAt && (
                        <span className="text-text-muted/60">{formatDate(article.publishedAt)}</span>
                      )}
                      {article.importanceScore && article.importanceScore >= 80 && (
                        <span className="text-gold font-semibold text-[11px]">HIGH IMPACT</span>
                      )}
                    </div>
                    <h3 className="text-body font-medium text-text-primary group-hover:text-gold transition-colors leading-snug">
                      {article.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Entities */}
          {results.entities.length > 0 && (
            <section>
              <h2 className="text-body font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-blue" />
                Institutions
                <span className="text-label text-text-muted font-mono ml-1">({results.entities.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {results.entities.map((entity) => (
                  <Link
                    key={entity.slug}
                    href={`/entities/${entity.slug}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface hover:border-gold/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-semibold text-text-primary group-hover:text-gold transition-colors truncate">
                        {entity.name}
                        {entity.shortName && entity.shortName !== entity.name && (
                          <span className="text-text-muted font-normal ml-1.5">({entity.shortName})</span>
                        )}
                      </div>
                      <div className="meta-line mt-0.5">
                        <span className={ENTITY_TYPE_COLORS[entity.entityType] || "text-text-muted"}>
                          {entity.entityType.replace(/_/g, " ").toLowerCase()}
                        </span>
                        <span className="ml-2 text-text-muted/60">{entity._count.articles} articles</span>
                      </div>
                    </div>
                    <span className="text-text-muted group-hover:text-gold text-caption transition-colors flex-shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Topics */}
          {results.topics.length > 0 && (
            <section>
              <h2 className="text-body font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-cyan" />
                Topics
                <span className="text-label text-text-muted font-mono ml-1">({results.topics.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {results.topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topics/${topic.slug}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface hover:border-gold/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-semibold text-text-primary group-hover:text-gold transition-colors">
                        {topic.name}
                      </div>
                      {topic.description && (
                        <p className="text-caption text-text-muted mt-0.5 line-clamp-1">{topic.description}</p>
                      )}
                      <div className="meta-line mt-0.5 text-text-muted/60">{topic._count.articles} articles</div>
                    </div>
                    <span className="text-text-muted group-hover:text-gold text-caption transition-colors flex-shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Explore more */}
          <div className="pt-2 border-t border-border-subtle">
            <p className="meta-line mb-3">Explore by category</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/intelligence" className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-body-sm text-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
                All Articles →
              </Link>
              <Link href="/entities" className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-body-sm text-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
                All Entities →
              </Link>
              <Link href="/topics" className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-body-sm text-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
                All Topics →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
