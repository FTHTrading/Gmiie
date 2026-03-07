import Link from "next/link";
import { SignalGauge } from "./SignalGauge";
import type {
  SignalDimension,
  TrendingTopicItem,
  TrendingEntityItem,
  CompositeIndexModel,
} from "@/lib/models";

// Entity type icons for visual scan
const ENTITY_TYPE_ICON: Record<string, string> = {
  REGULATOR: "⬡",
  CENTRAL_BANK: "◆",
  BANK: "◈",
  EXCHANGE: "◉",
  CUSTODIAN: "◎",
  ASSET_MANAGER: "▣",
  TOKENIZATION_FIRM: "◇",
  INFRASTRUCTURE_PROVIDER: "⬢",
  CLEARING_HOUSE: "◐",
  GOVERNMENT_AGENCY: "⬡",
};

// Default signals until API is wired
const DEFAULT_SIGNALS: SignalDimension[] = [
  { key: "tokenized_securities", label: "Tokenized Securities", score: 8.2 },
  { key: "stablecoin_regulation", label: "Stablecoin Regulation", score: 6.4 },
  { key: "cbdc_development", label: "CBDC Development", score: 7.1 },
  { key: "institutional_defi", label: "Institutional DeFi", score: 4.9 },
  { key: "settlement_infra", label: "Settlement Infra", score: 7.8 },
  { key: "digital_custody", label: "Digital Custody", score: 6.9 },
];

interface SignalsPanelProps {
  signals?: SignalDimension[];
  trendingTopics?: TrendingTopicItem[];
  trendingEntities?: TrendingEntityItem[];
  compositeIndex?: CompositeIndexModel | null;
  alerts?: { text: string; severity: "high" | "medium" | "low" }[];
}

export function SignalsPanel({
  signals = DEFAULT_SIGNALS,
  trendingTopics,
  trendingEntities,
  compositeIndex,
  alerts,
}: SignalsPanelProps) {
  const defaultTopics: TrendingTopicItem[] = [
    { name: "Tokenized Treasuries", slug: "tokenized-treasuries", count: 12 },
    { name: "Digital Euro", slug: "digital-euro", count: 9 },
    { name: "Cross-Chain Settlement", slug: "cross-chain-settlement", count: 7 },
    { name: "RWA Protocols", slug: "rwa-protocols", count: 6 },
    { name: "Custody Standards", slug: "custody-standards", count: 5 },
  ];

  const defaultAlerts = [
    { text: "SEC expected to release comprehensive framework for tokenized securities classification", severity: "high" as const },
    { text: "ECB digital euro pilot advancing through preparatory phase", severity: "medium" as const },
    { text: "DTCC advancing T+0 settlement testing for tokenized assets", severity: "medium" as const },
  ];

  const displayTopics = trendingTopics || defaultTopics;
  const displayAlerts = alerts || defaultAlerts;

  // Default trending entities when DB is empty
  const defaultEntities: TrendingEntityItem[] = [
    { name: "SEC", slug: "sec", type: "REGULATOR", count: 14 },
    { name: "BlackRock", slug: "blackrock", type: "ASSET_MANAGER", count: 11 },
    { name: "DTCC", slug: "dtcc", type: "CLEARING_HOUSE", count: 9 },
    { name: "Northern Trust", slug: "northern-trust", type: "CUSTODIAN", count: 7 },
    { name: "MUFG", slug: "mufg", type: "BANK", count: 6 },
    { name: "Kraken", slug: "kraken", type: "EXCHANGE", count: 5 },
  ];
  const displayEntities = trendingEntities || defaultEntities;

  // Composite index display
  const displayIndex = compositeIndex || {
    score: 7.4,
    sampleSize: 0,
    dimensions: [],
  };

  // Score color logic
  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "text-green";
    if (score >= 5.0) return "text-gold";
    return "text-red";
  };

  return (
    <aside className="w-[340px] h-[calc(100vh-76px)] sticky top-[76px] overflow-y-auto border-l border-border-subtle bg-background px-5 py-5 hidden xl:block">
      {/* ── GMIIE Composite Index ── */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase">
            GMIIE Market Infrastructure Index
          </h3>
          <Link
            href="/methodology"
            className="text-caption text-text-muted/60 hover:text-gold transition-colors"
            title="Weighted composite of regulatory clarity, institutional adoption, settlement infrastructure, token standards, custody readiness, cross-border capability, market liquidity, DeFi integration, and CBDC development"
          >
            Methodology ↗
          </Link>
        </div>
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-4xl font-mono font-bold ${getScoreColor(displayIndex.score)}`}>
              {displayIndex.score.toFixed(1)}
            </span>
            <span className="text-body font-mono text-text-muted">/ 10</span>
          </div>
          <p className="text-caption font-mono text-text-muted mb-1">
            Weighted composite of 9 signal dimensions
            {displayIndex.sampleSize > 0 && ` · ${displayIndex.sampleSize} signals`}
          </p>
          <p className="text-caption font-mono text-text-muted/60 mb-3">
            Confidence: model-generated · not investment advice
          </p>
          {displayIndex.dimensions.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              {displayIndex.dimensions.map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <span className="text-caption text-text-muted truncate mr-2">{d.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all"
                        style={{ width: `${(d.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-caption font-mono text-text-secondary w-8 text-right">
                      {Math.round(d.score)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Signals */}
      <div className="mb-7">
        <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
          Market Signals
        </h3>
        <div className="bg-surface rounded-xl border border-border-subtle p-4">
          {signals.map((signal) => (
            <SignalGauge
              key={signal.label}
              label={signal.label}
              score={signal.score * 10} // normalize 0-10 to 0-100
              compact
            />
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="mb-7">
        <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
          Trending Topics
        </h3>
        <div className="space-y-1.5">
          {displayTopics.map((topic, i) => {
            const inner = (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface hover:bg-surface-elevated transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="text-label font-mono text-text-muted w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body-sm text-text-secondary">{topic.name}</span>
                </div>
                <span className="text-caption font-mono text-text-muted">
                  {topic.count}
                </span>
              </div>
            );

            return topic.slug ? (
              <Link key={topic.slug} href={`/topics/${topic.slug}`}>
                {inner}
              </Link>
            ) : (
              <div key={topic.name}>{inner}</div>
            );
          })}
        </div>
      </div>

      {/* Trending Institutions */}
      <div className="mb-7">
        <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
          Trending Institutions
        </h3>
        <div className="space-y-1.5">
          {displayEntities.map((entity) => (
            <Link key={entity.slug} href={`/entities/${entity.slug}`}>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface hover:bg-surface-elevated transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="text-body-sm opacity-50">
                    {ENTITY_TYPE_ICON[entity.type] || "◉"}
                  </span>
                  <span className="text-body-sm text-text-secondary">{entity.name}</span>
                </div>
                <span className="text-caption font-mono text-text-muted">
                  {entity.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Regulatory Alerts */}
      <div className="mb-7">
        <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3">
          Regulatory Alerts
        </h3>
        <div className="space-y-2.5">
          {displayAlerts.map((alert, i) => (
            <div
              key={i}
              className="px-3 py-3 rounded-lg border border-border-subtle bg-surface"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.severity === "high"
                      ? "bg-red"
                      : alert.severity === "medium"
                        ? "bg-gold"
                        : "bg-text-muted"
                  }`}
                />
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  {alert.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-border-subtle">
        <p className="text-caption font-mono text-text-muted">
          Updated every 30 min · Model-generated scores
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-caption font-mono text-text-muted/50">
            GMIIE v2.0 · Not investment advice
          </p>
          <Link
            href="/methodology"
            className="text-caption font-mono text-text-muted/50 hover:text-gold transition-colors"
          >
            Methodology
          </Link>
        </div>
      </div>
    </aside>
  );
}
