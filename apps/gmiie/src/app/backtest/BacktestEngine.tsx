"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type TopHit = {
  slug: string;
  title: string;
  articleType: string;
  importanceScore: number;
  signalScore: number;
  publishedAt: string | null;
  source: string;
};

type BacktestResult = {
  dimension: string;
  threshold: number;
  daysBack: number;
  totalSignals: number;
  triggered: number;
  baseline: number;
  hitRate: number;
  avgImportanceTriggered: number;
  avgImportanceBaseline: number;
  topHits: TopHit[];
};

// ── Dimension options ──────────────────────────────────────────────────────
const DIMENSIONS = [
  { value: "institutionalAdoption", label: "Institutional Adoption" },
  { value: "regulatoryClarity", label: "Regulatory Clarity" },
  { value: "marketReadiness", label: "Market Readiness" },
  { value: "infrastructureMaturity", label: "Infrastructure Maturity" },
  { value: "settlementImpact", label: "Settlement Impact" },
  { value: "complianceIntensity", label: "Compliance Intensity" },
  { value: "crossBorderRelevance", label: "Cross-Border Relevance" },
  { value: "liquiditySignificance", label: "Liquidity Significance" },
  { value: "strategicUrgency", label: "Strategic Urgency" },
  { value: "overallScore", label: "Overall Score (Composite)" },
];

const ARTICLE_TYPES = [
  { value: "all", label: "All types" },
  { value: "BRIEF", label: "Brief" },
  { value: "DEEP_DIVE", label: "Deep Dive" },
  { value: "DAILY_DIGEST", label: "Daily Digest" },
  { value: "INFRA_ANALYSIS", label: "Infra Analysis" },
  { value: "REGULATOR_TRACKER", label: "Regulator Tracker" },
  { value: "RESEARCH_ARTICLE", label: "Research Article" },
  { value: "STRATEGIC_MEMO", label: "Strategic Memo" },
];

const DAYS_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 8) return "text-red-400";
  if (score >= 6) return "text-amber-400";
  return "text-text-muted";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function articleTypeLabel(raw: string): string {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Component ─────────────────────────────────────────────────────────────
export function BacktestEngine() {
  const [dimension, setDimension] = useState("institutionalAdoption");
  const [threshold, setThreshold] = useState(60);
  const [daysBack, setDaysBack] = useState(30);
  const [articleType, setArticleType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runBacktest() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dimension, threshold, daysBack, articleType }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Request failed");
      }

      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const dimLabel = DIMENSIONS.find((d) => d.value === dimension)?.label ?? dimension;

  return (
    <div className="space-y-6">
      {/* ── Control panel ─────────────────────────────────────────── */}
      <div className="p-5 rounded-xl border border-border-subtle bg-surface/30">
        <h2 className="text-body font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Parameters
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {/* Dimension */}
          <div>
            <label className="block text-label text-text-muted mb-1.5">
              Signal Dimension
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-body-sm text-text-primary focus:outline-none focus:border-gold/40"
            >
              {DIMENSIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Days back */}
          <div>
            <label className="block text-label text-text-muted mb-1.5">
              Lookback Window
            </label>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-body-sm text-text-primary focus:outline-none focus:border-gold/40"
            >
              {DAYS_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Article type */}
          <div>
            <label className="block text-label text-text-muted mb-1.5">
              Article Type
            </label>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-body-sm text-text-primary focus:outline-none focus:border-gold/40"
            >
              {ARTICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-label text-text-muted mb-1.5">
              Threshold:{" "}
              <span className="font-mono text-gold">{threshold}</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
            <div className="flex justify-between text-caption text-text-muted mt-0.5">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-gold/10 border border-gold/30 text-gold text-body-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Running…" : "Run Backtest"}
        </button>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-body-sm">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-border-subtle bg-surface/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Signals"
              value={result.totalSignals.toLocaleString()}
            />
            <StatCard
              label="Above Threshold"
              value={result.triggered.toLocaleString()}
              sub={`${result.hitRate}% hit rate`}
            />
            <StatCard
              label="Avg Importance (Triggered)"
              value={result.avgImportanceTriggered.toFixed(1)}
              accent
            />
            <StatCard
              label="Avg Importance (Baseline)"
              value={result.avgImportanceBaseline.toFixed(1)}
            />
          </div>

          {/* Lift summary */}
          {result.triggered > 0 && result.baseline > 0 && (
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 text-body-sm text-text-secondary">
              Articles where{" "}
              <span className="text-gold font-medium">{dimLabel}</span> scored ≥{" "}
              <span className="font-mono text-gold">{threshold}</span> had{" "}
              <span className="font-medium text-text-primary">
                {result.avgImportanceTriggered > result.avgImportanceBaseline
                  ? `${(
                      ((result.avgImportanceTriggered - result.avgImportanceBaseline) /
                        Math.max(result.avgImportanceBaseline, 0.1)) *
                      100
                    ).toFixed(0)}% higher`
                  : "similar"}
              </span>{" "}
              average importance scores compared to below-threshold articles over the
              past {result.daysBack} days.
            </div>
          )}

          {/* No data */}
          {result.totalSignals === 0 && (
            <div className="p-6 rounded-xl border border-border-subtle bg-surface/20 text-center">
              <p className="text-body-sm text-text-muted">
                No signals found for these parameters. Try expanding the lookback
                window or lowering the threshold.
              </p>
            </div>
          )}

          {/* Top hits table */}
          {result.topHits.length > 0 && (
            <div>
              <h3 className="text-body font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-5 h-px bg-gold" />
                Top Triggered Articles{" "}
                <span className="text-label text-text-muted font-normal">
                  (by importance score)
                </span>
              </h3>

              <div className="rounded-xl border border-border-subtle overflow-hidden">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface/50">
                      <th className="text-left px-4 py-2.5 text-label text-text-muted font-medium">
                        Article
                      </th>
                      <th className="text-right px-4 py-2.5 text-label text-text-muted font-medium hidden sm:table-cell">
                        Type
                      </th>
                      <th className="text-right px-4 py-2.5 text-label text-text-muted font-medium">
                        Signal
                      </th>
                      <th className="text-right px-4 py-2.5 text-label text-text-muted font-medium">
                        Importance
                      </th>
                      <th className="text-right px-4 py-2.5 text-label text-text-muted font-medium hidden md:table-cell">
                        Published
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.topHits.map((hit, i) => (
                      <tr
                        key={i}
                        className="border-b border-border-subtle/50 hover:bg-surface/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/intelligence/${hit.slug}`}
                            className="text-text-primary hover:text-gold transition-colors line-clamp-1"
                          >
                            {hit.title}
                          </Link>
                          {hit.source && (
                            <span className="text-caption text-text-muted block">
                              {hit.source}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <span className="text-caption text-text-muted">
                            {articleTypeLabel(hit.articleType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className="text-gold font-medium">
                            {hit.signalScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={scoreColor(hit.importanceScore)}>
                            {hit.importanceScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-caption text-text-muted hidden md:table-cell">
                          {formatDate(hit.publishedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!result && !loading && !error && (
        <div className="p-8 rounded-xl border border-border-subtle bg-surface/20 text-center">
          <p className="text-body-sm text-text-muted">
            Select a signal dimension and threshold above, then run the backtest to
            see how that signal correlated with article importance scores.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Stat card subcomponent ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl border border-border-subtle bg-surface/30">
      <p className="text-caption text-text-muted mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-mono ${
          accent ? "text-gold" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-caption text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}
