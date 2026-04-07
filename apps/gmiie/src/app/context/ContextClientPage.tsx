"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

type ContextPreview = {
  ok: boolean;
  generatedAt: string;
  period: { days: number; since: string };
  intelligence: { count: number; articles: unknown[] };
  signals: { sampleSize: number; dimensions: { key: string; label: string; score: number }[] };
  entities: { count: number; items: unknown[] };
  tracker: { activeCount: number };
};

// ── UI helpers ─────────────────────────────────────────────────────────────

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative rounded-lg bg-surface-100 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-200">
        <span className="text-caption text-text-muted uppercase tracking-wider">{lang}</span>
        <button
          onClick={copy}
          className="text-caption text-text-muted hover:text-text-primary transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm text-text-secondary overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ParamRow({
  name,
  type,
  defaultVal,
  description,
}: {
  name: string;
  type: string;
  defaultVal: string;
  description: string;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <code className="text-gold text-sm">{name}</code>
      </td>
      <td className="py-3 pr-4">
        <span className="text-caption text-text-muted">{type}</span>
      </td>
      <td className="py-3 pr-4">
        <code className="text-cyan text-sm">{defaultVal}</code>
      </td>
      <td className="py-3 text-body-sm text-text-secondary">{description}</td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ContextClientPage() {
  const [preview, setPreview] = useState<ContextPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);
  const [limit, setLimit] = useState(5);

  async function fetchPreview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/context?days=${days}&limit=${limit}`);
      const data = await res.json();
      setPreview(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exampleCurlDays = days;
  const exampleCurlLimit = limit;

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 space-y-12">

      {/* Header */}
      <div>
        <p className="meta-line mb-3">AGENT API</p>
        <h1 className="text-heading-lg sm:text-display-sm font-bold text-text-primary mb-4">
          GMIIE Context API
        </h1>
        <p className="text-body text-text-secondary max-w-2xl">
          A single endpoint that returns a structured, LLM-ready intelligence briefing — top articles,
          signal scores, entity rankings, and live tracker states. Feed it directly to Claude, GPT, or
          any MCP-compatible agent.
        </p>
      </div>

      {/* Endpoint overview */}
      <section className="space-y-4">
        <h2 className="text-heading-sm font-semibold text-text-primary">Endpoint</h2>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-100 border border-border">
          <span className="shrink-0 text-caption font-bold text-green bg-green/10 px-2 py-1 rounded">GET</span>
          <code className="text-body-sm text-text-primary">/api/context</code>
          <span className="text-caption text-text-muted ml-auto">No authentication required</span>
        </div>

        <h3 className="text-body font-medium text-text-primary pt-2">Query Parameters</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface-100">
                <th className="py-3 px-4 text-caption text-text-muted uppercase tracking-wider">Param</th>
                <th className="py-3 px-4 text-caption text-text-muted uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-caption text-text-muted uppercase tracking-wider">Default</th>
                <th className="py-3 px-4 text-caption text-text-muted uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="px-4">
              <ParamRow name="days" type="integer" defaultVal="30" description="Lookback window in days (1–90). Articles and signals within this period are included." />
              <ParamRow name="limit" type="integer" defaultVal="10" description="Maximum number of articles to return (1–50). Articles sorted by importance score descending." />
              <ParamRow name="type" type="string" defaultVal="all" description={`Filter by article type. Options: all, brief, deep_dive, research_article, report, regulator_tracker, strategic_memo.`} />
            </tbody>
          </table>
        </div>
      </section>

      {/* Usage examples */}
      <section className="space-y-4">
        <h2 className="text-heading-sm font-semibold text-text-primary">Usage Examples</h2>

        <div className="space-y-6">
          <div>
            <p className="text-body-sm text-text-muted mb-2">cURL — last {exampleCurlDays} days, top {exampleCurlLimit} articles</p>
            <CodeBlock
              lang="bash"
              code={`curl "https://gmiie.xxxiii.io/api/context?days=${exampleCurlDays}&limit=${exampleCurlLimit}"`}
            />
          </div>

          <div>
            <p className="text-body-sm text-text-muted mb-2">Claude system prompt injection</p>
            <CodeBlock
              lang="javascript"
              code={`const ctx = await fetch("https://gmiie.xxxiii.io/api/context?days=7&limit=10").then(r => r.json());

const systemPrompt = \`You are a capital markets analyst.
Use the following live GMIIE intelligence data in your analysis:
\${JSON.stringify(ctx, null, 2)}\`;`}
            />
          </div>

          <div>
            <p className="text-body-sm text-text-muted mb-2">MCP tool definition (tools array)</p>
            <CodeBlock
              lang="json"
              code={`{
  "name": "gmiie_context",
  "description": "Fetch live capital market intelligence from GMIIE. Returns articles, signal scores, entities, and stablecoin tracker states.",
  "parameters": {
    "type": "object",
    "properties": {
      "days": { "type": "integer", "description": "Lookback in days (1-90)", "default": 30 },
      "limit": { "type": "integer", "description": "Max articles (1-50)", "default": 10 },
      "type": { "type": "string", "description": "Article type filter", "default": "all" }
    }
  }
}`}
            />
          </div>
        </div>
      </section>

      {/* Response schema */}
      <section className="space-y-4">
        <h2 className="text-heading-sm font-semibold text-text-primary">Response Schema</h2>
        <CodeBlock
          lang="typescript"
          code={`{
  ok: boolean;
  generatedAt: string;        // ISO 8601
  period: { days: number; since: string };

  intelligence: {
    count: number;
    articles: Array<{
      url: string;             // Full URL on gmiie.xxxiii.io
      title: string;
      headline: string;
      dek: string | null;
      summary: string | null; // Executive summary
      type: ArticleType;
      importance: number;     // 0–10 editorial score
      publishedAt: string;
      region: string | null;
      assetClass: AssetClass | null;
      source: string | null;
      topics: string[];
      entities: { name: string; type: EntityType }[];
      signal: {
        overall: number;       // 0–100
        institutional: number;
        regulatory: number;
        readiness: number;
        urgency: number;
      } | null;
    }>;
  };

  signals: {
    sampleSize: number;
    dimensions: Array<{
      key: string;             // e.g. "institutional_adoption"
      label: string;
      score: number;           // 0–100 30-day average
    }>;
  };

  entities: {
    count: number;
    items: Array<{
      name: string;
      type: EntityType;
      country: string | null;
      region: string | null;
    }>;
  };

  tracker: {
    activeCount: number;
    states: Array<{
      name: string;            // e.g. "Florida"
      abbreviation: string;   // e.g. "FL"
      status: StateTrackerStatus;
      summary: string | null;
      nextStep: string | null;
      lastAction: string | null;
    }>;
  };
}`}
        />
      </section>

      {/* Live preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-heading-sm font-semibold text-text-primary">Live Preview</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-body-sm text-text-secondary">
              <span>Days</span>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-surface-100 border border-border rounded px-2 py-1 text-body-sm text-text-primary focus:outline-none focus:border-gold"
              >
                <option value={7}>7</option>
                <option value={14}>14</option>
                <option value={30}>30</option>
                <option value={90}>90</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-body-sm text-text-secondary">
              <span>Limit</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-surface-100 border border-border rounded px-2 py-1 text-body-sm text-text-primary focus:outline-none focus:border-gold"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
            <button
              onClick={fetchPreview}
              disabled={loading}
              className="px-4 py-1.5 text-body-sm rounded border border-gold text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "Run"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="h-48 rounded-lg bg-surface-100 border border-border flex items-center justify-center">
            <span className="text-body-sm text-text-muted animate-pulse">Fetching context…</span>
          </div>
        )}

        {!loading && preview && (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Articles", value: preview.intelligence.count },
                { label: "Signal Samples", value: preview.signals.sampleSize },
                { label: "Entities", value: preview.entities.count },
                { label: "Active States", value: preview.tracker.activeCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-surface-100 p-4 text-center"
                >
                  <div className="text-heading-sm font-bold text-gold">{stat.value}</div>
                  <div className="text-caption text-text-muted mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Signal bars */}
            {preview.signals.sampleSize > 0 && (
              <div className="rounded-lg border border-border bg-surface-100 p-4 space-y-2">
                <p className="text-caption text-text-muted uppercase tracking-wider mb-3">Signal Dimensions</p>
                {preview.signals.dimensions.map((d) => (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="w-44 text-body-sm text-text-secondary truncate">{d.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold/60"
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-caption text-text-muted">{d.score}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Raw JSON */}
            <div>
              <p className="text-body-sm text-text-muted mb-2">Raw response</p>
              <CodeBlock code={JSON.stringify(preview, null, 2)} lang="json" />
            </div>
          </div>
        )}

        {!loading && !preview && (
          <div className="h-48 rounded-lg bg-surface-100 border border-border flex items-center justify-center">
            <p className="text-body-sm text-text-muted">No data — click Run to fetch a live preview.</p>
          </div>
        )}
      </section>

      {/* Related */}
      <section className="border-t border-border pt-8">
        <p className="text-caption text-text-muted uppercase tracking-wider mb-4">Related tools</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Backtest Engine", href: "/backtest" },
            { label: "Scenarios", href: "/scenarios" },
            { label: "Live Alerts", href: "/alerts" },
            { label: "Intelligence Feed", href: "/intelligence" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-sm text-text-secondary hover:text-gold transition-colors border border-border hover:border-gold/50 rounded px-3 py-1.5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
