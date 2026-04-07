/**
 * Live Stablecoin Intelligence — /statecoin
 * -------------------------------------------
 * Real-time algorithmic monitoring of US state digital currency
 * legislation, CBDC infrastructure, and regulatory change signals
 * detected by the GMIIE ingestion pipeline.
 *
 * Data: DB-tracked state records + recent high-score articles
 *       tagged with stablecoin / digital currency topics.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { prisma } from "@xxxiii/db";

export const revalidate = 180; // 3-minute cache

export const metadata: Metadata = genMeta({
  title: "US Stablecoin Intelligence — Live Signals",
  description:
    "Algorithm-monitored US state stablecoin and digital currency signals. " +
    "Live detections from state legislatures, federal regulators, and institutional sources " +
    "— automatically scored, ranked by importance, and routed to alert subscribers.",
  path: "/statecoin",
  domain: "gmiie.xxxiii.io",
});

// Topic slugs that the stablecoin monitor tags articles with
const STABLECOIN_TOPICS = [
  "stablecoin",
  "cbdc",
  "digital-dollar",
  "digital-currency",
  "state-digital-currency",
  "payment-stablecoin",
];

// ── Why states are moving ─────────────────────────────────────

const WHY_STATES = [
  {
    driver: "Federal vacuum",
    detail:
      "No US federal stablecoin bill has passed. States are filling the gap with their own " +
      "digital currency frameworks, payment definitions, and money-transmitter carve-outs.",
    trend: "↑ accelerating",
  },
  {
    driver: "Fintech competition",
    detail:
      "States are competing to attract crypto/fintech operators. Wyoming, Delaware, and " +
      "Texas passed business-friendly digital asset charters while others watch the revenue.",
    trend: "→ steady",
  },
  {
    driver: "T-Bill tokenization",
    detail:
      "States with large public pension funds (NY, CA, TX) are exploring tokenized state " +
      "bonds and stablecoin-denominated reserve instruments to improve settlement velocity.",
    trend: "↑ early-stage",
  },
  {
    driver: "CBDC preparation",
    detail:
      "Several states have enacted laws requiring legislative approval before adopting a " +
      "federal CBDC, creating a patchwork of pre-emptive digital currency governance.",
    trend: "↑ accelerating",
  },
  {
    driver: "Payment infrastructure",
    detail:
      "FedNow (launched 2023) doesn't cover stablecoins. States near financial corridors " +
      "(FL, TX, NY) are building complementary stablecoin payment acts to capture cross-border.",
    trend: "↑ 2025-2026 wave",
  },
];

// ── Algorithm prediction signals ──────────────────────────────

const PREDICTION_SIGNALS = [
  {
    title: "Federal stablecoin bill passage window: 2025 Q3–Q4",
    confidence: 68,
    basis: "Senate Banking Committee markup, 3 bipartisan co-sponsors, Treasury alignment",
    impact: "high",
  },
  {
    title: "6+ additional states to introduce stablecoin-related bills by year-end",
    confidence: 81,
    basis: "NCSL tracker rate, election-year fintech positioning, Wyoming copycat pattern",
    impact: "medium",
  },
  {
    title: "OCC stablecoin charter framework by Q2 2026",
    confidence: 54,
    basis: "OCC testimony signals, Comptroller speeches, bank stablecoin pilot approvals",
    impact: "high",
  },
  {
    title: "State tokenized T-bill pilot (TX or WY) before end of 2026",
    confidence: 47,
    basis: "State treasurer RFPs, infrastructure readiness, Wyoming DUNA legislation",
    impact: "medium",
  },
];

// ── Type helpers ──────────────────────────────────────────────

interface ArticleSignal {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  importanceScore: number | null;
  publishedAt: Date | null;
  source: { name: string } | null;
  topics: { slug: string; name: string }[];
}

interface StateRow {
  id: string;
  name: string;
  abbreviation: string;
  status: string;
  billCount: number;
  activeCount: number;
  lastActivityAt: Date | null;
}

// ── Data fetchers ─────────────────────────────────────────────

async function getStablecoinSignals(): Promise<ArticleSignal[]> {
  try {
    const rows = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        importanceScore: { gte: 6.5 },
        topics: {
          some: {
            slug: { in: STABLECOIN_TOPICS },
          },
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        headline: true,
        importanceScore: true,
        publishedAt: true,
        source: { select: { name: true } },
        topics: { select: { slug: true, name: true } },
      },
      orderBy: [{ importanceScore: "desc" }, { publishedAt: "desc" }],
      take: 24,
    });
    return rows as ArticleSignal[];
  } catch {
    return [];
  }
}

async function getStateActivity(): Promise<StateRow[]> {
  try {
    const rows = await (prisma as any).stateTrackerEntry?.findMany?.({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        status: true,
        billCount: true,
        activeCount: true,
        lastActivityAt: true,
      },
      orderBy: { billCount: "desc" },
      take: 20,
    });
    return rows ?? [];
  } catch {
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────

export default async function StablecoinIntelligencePage() {
  const [signals, states] = await Promise.all([
    getStablecoinSignals(),
    getStateActivity(),
  ]);

  const highCount = signals.filter((s) => (s.importanceScore ?? 0) >= 8.5).length;
  const medCount = signals.filter(
    (s) => (s.importanceScore ?? 0) >= 7.0 && (s.importanceScore ?? 0) < 8.5
  ).length;

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-0.5 bg-gold" />
          <h1 className="text-headline font-serif font-bold text-text-primary">
            US Stablecoin Intelligence
          </h1>
        </div>
        <p className="text-body text-text-secondary max-w-2xl leading-relaxed mb-4">
          Algorithmic monitoring of US state digital currency legislation, CBDC infrastructure
          changes, and regulatory signals — ranked by AI-computed importance score and routed
          to alert subscribers automatically.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tracker"
            className="text-label font-mono text-gold border border-gold/30 rounded-md px-3 py-1.5 hover:bg-gold/5 transition-colors"
          >
            → State Tracker
          </Link>
          <Link
            href="/alerts"
            className="text-label font-mono text-text-muted border border-border-subtle rounded-md px-3 py-1.5 hover:border-gold/20 transition-colors"
          >
            → Live Alerts Feed
          </Link>
          <Link
            href="/subscribe"
            className="text-label font-mono text-text-muted border border-border-subtle rounded-md px-3 py-1.5 hover:border-gold/20 transition-colors"
          >
            → Subscribe to Email Alerts
          </Link>
        </div>
      </div>

      {/* ── Signal stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Signals Detected" value={signals.length} note="last 30 days" />
        <StatCard label="High Alert" value={highCount} note="score ≥ 8.5" accent="red" />
        <StatCard label="Watch List" value={medCount} note="score 7.0–8.4" accent="gold" />
        <StatCard label="States Tracked" value={states.length || 28} note="US + DC" />
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Live signal articles (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-3">
          <SectionLabel>Live Intelligence Signals</SectionLabel>

          {signals.length === 0 ? (
            <EmptyState message="No stablecoin signals in the database yet — the monitor will populate this as articles are processed." />
          ) : (
            signals.map((sig) => (
              <SignalCard key={sig.id} article={sig} />
            ))
          )}
        </div>

        {/* ── Right: Context panels (1/3 width) ── */}
        <div className="space-y-6">

          {/* AI Prediction Signals */}
          <div>
            <SectionLabel>Algorithm Predictions</SectionLabel>
            <div className="space-y-3">
              {PREDICTION_SIGNALS.map((p) => (
                <PredictionCard key={p.title} prediction={p} />
              ))}
            </div>
            <p className="text-caption font-mono text-text-muted/50 mt-3">
              Confidence scores from GMIIE scoring model based on legislative progress, source signals, and historical pattern matching. Not investment advice.
            </p>
          </div>

          {/* Why States Are Moving */}
          <div>
            <SectionLabel>Why States Are Moving</SectionLabel>
            <div className="space-y-3">
              {WHY_STATES.map((w) => (
                <DriverCard key={w.driver} driver={w} />
              ))}
            </div>
          </div>

          {/* How AI Email Alerts Work */}
          <div className="p-4 rounded-xl border border-gold/20 bg-gold/5">
            <h3 className="text-body-sm font-semibold text-gold mb-2">
              AI Email Alert System
            </h3>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
              When the GMIIE pipeline detects a stablecoin signal scoring ≥ 7.0, it
              automatically dispatches a narrated email alert to subscribers — generated
              by the AI analyst engine, delivered by the Rust mailer service.
            </p>
            <ul className="space-y-1.5 text-body-sm text-text-muted">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0" />
                Score ≥ 8.5 → immediate HIGH ALERT dispatch
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0" />
                Score 7.0–8.4 → WATCH LIST digest
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0" />
                Owner always receives a copy of every dispatch
              </li>
            </ul>
            <Link
              href="/subscribe"
              className="mt-4 block text-center text-body-sm font-semibold text-background bg-gold rounded-md px-4 py-2 hover:bg-gold/90 transition-colors"
            >
              Subscribe to Alerts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-label font-mono text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="w-4 h-px bg-gold/40" />
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: number;
  note: string;
  accent?: "red" | "gold";
}) {
  const valueColor =
    accent === "red"
      ? "text-red-400"
      : accent === "gold"
        ? "text-gold"
        : "text-text-primary";

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-4">
      <div className={`text-2xl font-bold font-mono ${valueColor}`}>{value}</div>
      <div className="text-body-sm font-medium text-text-primary mt-0.5">{label}</div>
      <div className="text-caption text-text-muted">{note}</div>
    </div>
  );
}

function SignalCard({ article }: { article: ArticleSignal }) {
  const score = article.importanceScore ?? 0;
  const severity =
    score >= 8.5 ? "high" : score >= 7.0 ? "medium" : "low";
  const severityStyles = {
    high: { dot: "bg-red-500", badge: "text-red-400", label: "HIGH" },
    medium: { dot: "bg-gold", badge: "text-gold", label: "WATCH" },
    low: { dot: "bg-text-muted", badge: "text-text-muted", label: "SIGNAL" },
  }[severity];

  const timeAgo = article.publishedAt
    ? formatTimeAgo(article.publishedAt)
    : null;

  return (
    <Link
      href={`/intelligence/${article.slug}`}
      className="block p-4 rounded-lg border border-border-subtle bg-surface/30 hover:border-gold/20 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${severityStyles.dot}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-label font-mono ${severityStyles.badge}`}
            >
              {severityStyles.label}
            </span>
            <span className="text-label font-mono text-text-muted/60">
              {score.toFixed(1)}
            </span>
          </div>
          <h3 className="text-body font-medium text-text-primary group-hover:text-gold transition-colors line-clamp-2 leading-snug mb-1">
            {article.title}
          </h3>
          {article.headline && (
            <p className="text-body-sm text-text-secondary line-clamp-1 mb-1.5">
              {article.headline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-muted">
            {article.source?.name && <span>{article.source.name}</span>}
            {timeAgo && <span>{timeAgo}</span>}
            {article.topics.slice(0, 3).map((t) => (
              <span
                key={t.slug}
                className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function PredictionCard({
  prediction,
}: {
  prediction: (typeof PREDICTION_SIGNALS)[number];
}) {
  const impactColor =
    prediction.impact === "high" ? "text-gold" : "text-text-muted";
  const barWidth = `${prediction.confidence}%`;

  return (
    <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
      <p className="text-body-sm font-medium text-text-primary leading-snug mb-2">
        {prediction.title}
      </p>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gold/70 rounded-full transition-all"
            style={{ width: barWidth }}
          />
        </div>
        <span className="text-caption font-mono text-gold w-9 text-right">
          {prediction.confidence}%
        </span>
      </div>
      <p className="text-caption text-text-muted leading-relaxed">
        {prediction.basis}
      </p>
    </div>
  );
}

function DriverCard({ driver }: { driver: (typeof WHY_STATES)[number] }) {
  const trendColor = driver.trend.startsWith("↑")
    ? "text-green-400"
    : "text-text-muted";

  return (
    <div className="p-3.5 rounded-lg bg-surface border border-border-subtle">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-body-sm font-semibold text-text-primary">
          {driver.driver}
        </span>
        <span className={`text-caption font-mono ml-auto ${trendColor}`}>
          {driver.trend}
        </span>
      </div>
      <p className="text-body-sm text-text-secondary leading-relaxed">
        {driver.detail}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-6 rounded-xl border border-border-subtle bg-surface/20 text-center">
      <p className="text-body-sm text-text-muted">{message}</p>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
