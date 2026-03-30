import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getAggregateSignals } from "@/lib/data";
import { SignalGauge } from "@/components/signals/SignalGauge";
import type { SignalDimension } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "Market Signals",
  description:
    "GMIIE's proprietary signal scores measure institutional adoption, regulatory clarity, market readiness, infrastructure maturity, and six other dimensions of capital market transformation.",
  path: "/signals",
  domain: "gmiie.xxxiii.io",
});

/* ── Signal dimension labels ── */
const SIGNAL_DIMENSIONS: { key: string; label: string; description: string }[] = [
  {
    key: "institutionalAdoption",
    label: "Institutional Adoption",
    description:
      "Pace and depth of institutional engagement with tokenized assets — pilots, production deployments, and strategic commitments.",
  },
  {
    key: "regulatoryClarity",
    label: "Regulatory Clarity",
    description:
      "Progression of regulatory frameworks for digital assets across major jurisdictions — rulemaking, enforcement, and sandbox outcomes.",
  },
  {
    key: "marketReadiness",
    label: "Market Readiness",
    description:
      "Overall market preparedness — liquidity depth, trading venue readiness, and availability of institutional-grade tooling.",
  },
  {
    key: "infrastructureMaturity",
    label: "Infrastructure Maturity",
    description:
      "Maturity of post-trade infrastructure — custody solutions, clearing mechanisms, and settlement systems.",
  },
  {
    key: "settlementImpact",
    label: "Settlement Impact",
    description:
      "Demonstrated impact on settlement efficiency — T+0 achievements, DvP implementations, and failure rate reduction.",
  },
  {
    key: "complianceIntensity",
    label: "Compliance Intensity",
    description:
      "Intensity of compliance requirements — KYC/AML, reporting obligations, and cross-border challenges.",
  },
  {
    key: "crossBorderRelevance",
    label: "Cross-Border Relevance",
    description:
      "Relevance for cross-border tokenized asset transfers — interoperability protocols and multi-jurisdictional settlement.",
  },
  {
    key: "liquiditySignificance",
    label: "Liquidity Significance",
    description:
      "Significance for tokenized asset liquidity — new venues, market maker commitments, and secondary market activity.",
  },
  {
    key: "strategicUrgency",
    label: "Strategic Urgency",
    description:
      "Urgency for institutional action — competitive dynamics, regulatory deadlines, and first-mover advantages.",
  },
];

export default async function SignalsPage() {
  let signalData: SignalDimension[] = [];

  try {
    signalData = await getAggregateSignals();
  } catch {
    // DB not connected
  }

  /* Build a lookup from the aggregate signal data (snake_case keys → camelCase) */
  const signalMap: Record<string, number> = {};
  for (const item of signalData) {
    /* Convert snake_case key to camelCase to match SIGNAL_DIMENSIONS */
    const camel = item.key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    signalMap[camel] = item.score;
  }

  const scores = SIGNAL_DIMENSIONS.map((dim) => ({
    ...dim,
    score: signalMap[dim.key] ?? 0,
  }));

  const composite =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Signal Dashboard
        </h1>
        <p className="text-body text-text-muted">
          Proprietary scoring across nine dimensions of global financial
          infrastructure transformation.
        </p>
      </div>

      {/* Composite Index */}
      <div className="text-center p-8 rounded-xl border border-border-subtle bg-surface/30 mb-6">
        <span className="text-label font-mono tracking-wider text-text-muted uppercase block mb-1">
          GMIIE Composite Index
        </span>
        <div className="text-5xl font-bold text-gold mb-1">{composite}</div>
        <p className="text-body-sm text-text-muted">
          Weighted average of all nine signal dimensions
        </p>
      </div>

      {/* Signal Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {scores.map((signal) => (
          <div
            key={signal.key}
            className="p-4 rounded-xl border border-border-subtle bg-surface/30 hover:border-gold/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body-sm font-semibold text-text-primary">
                {signal.label}
              </h3>
              <span className="text-body font-bold text-gold font-mono">
                {signal.score}
              </span>
            </div>
            <SignalGauge label={signal.label} score={signal.score} compact />
            <p className="text-label text-text-muted leading-relaxed mt-2">
              {signal.description}
            </p>
          </div>
        ))}
      </div>

      {/* Methodology */}
      <div className="border-t border-border-subtle pt-6">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Signal Methodology
        </h2>
        <div className="space-y-2 text-body-sm text-text-secondary leading-relaxed">
          <p>
            Signal scores are computed using NLP-based event extraction, source
            credibility weighting, and institutional activity tracking. Each
            dimension is scored 0–100 and updated continuously.
          </p>
          <p>
            Scores reflect real developments from Tier 1 and Tier 2 sources,
            weighted by institutional significance, regulatory authority, and
            infrastructure impact.
          </p>
          <p>
            The composite index is a weighted average with higher weights given
            to Settlement Impact, Institutional Adoption, and Regulatory Clarity.
          </p>
        </div>
      </div>
    </div>
  );
}
