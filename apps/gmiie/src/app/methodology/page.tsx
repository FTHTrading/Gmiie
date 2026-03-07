import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";

export const metadata: Metadata = genMeta({
  title: "Methodology",
  description:
    "How GMIIE scores, verifies, and classifies institutional intelligence across nine dimensions of capital market transformation.",
  path: "/methodology",
  domain: "gmiie.xxxiii.io",
});

/* ── Source tiers ── */
const SOURCE_TIERS = [
  {
    tier: "Tier 1",
    label: "Primary Official",
    description:
      "Regulators, central banks, clearing houses, and infrastructure operators publishing directly. Examples: SEC filings, ECB announcements, DTCC press releases.",
    weight: "Highest",
    badge: "Verified",
  },
  {
    tier: "Tier 2",
    label: "Secondary Reporting",
    description:
      "Established financial media with editorial standards and sourcing requirements. Examples: Bloomberg, Financial Times, Reuters, Wall Street Journal.",
    weight: "High",
    badge: "Verified with caveat",
  },
  {
    tier: "Tier 3",
    label: "Crypto Native",
    description:
      "Industry-focused publications and research firms with domain expertise. Examples: The Block, Ledger Insights, RWA.xyz, Galaxy Research.",
    weight: "Moderate",
    badge: "Developing",
  },
  {
    tier: "Tier 4",
    label: "Unverified",
    description:
      "Social media, forums, anonymous sources, and unconfirmed reports. Used for context only, never as a standalone basis for scoring.",
    weight: "Low",
    badge: "Historical context",
  },
];

/* ── Signal dimensions ── */
const SIGNAL_DIMENSIONS = [
  {
    name: "Institutional Adoption",
    description:
      "Measures the pace of institutional engagement — pilot programs, production deployments, AUM milestones, and strategic commitments from banks, asset managers, and custodians.",
    weight: "Standard",
  },
  {
    name: "Regulatory Clarity",
    description:
      "Tracks the progression of regulatory frameworks — formal rulemaking, enforcement actions, sandbox outcomes, and cross-jurisdictional harmonization efforts.",
    weight: "Elevated",
  },
  {
    name: "Market Readiness",
    description:
      "Assesses overall market preparedness — liquidity depth, trading venue availability, institutional-grade tooling, and participant onboarding.",
    weight: "Standard",
  },
  {
    name: "Infrastructure Maturity",
    description:
      "Evaluates post-trade infrastructure — custody solutions, clearing mechanisms, settlement systems, and their operational reliability at institutional scale.",
    weight: "Standard",
  },
  {
    name: "Settlement Impact",
    description:
      "Quantifies demonstrated settlement efficiency gains — T+0 achievements, atomic DvP implementations, failure rate reductions, and cost savings.",
    weight: "Elevated",
  },
  {
    name: "Compliance Intensity",
    description:
      "Measures the intensity of compliance requirements — KYC/AML integration, reporting obligations, cross-border regulatory challenges, and enforcement activity.",
    weight: "Standard",
  },
  {
    name: "Cross-Border Relevance",
    description:
      "Gauges significance for cross-border tokenized asset transfers — interoperability protocols, multi-jurisdictional settlement, and recognition agreements.",
    weight: "Standard",
  },
  {
    name: "Liquidity Significance",
    description:
      "Tracks tokenized asset liquidity developments — new venue launches, market maker commitments, secondary market activity, and order book depth.",
    weight: "Standard",
  },
  {
    name: "Strategic Urgency",
    description:
      "Reflects urgency for institutional action — competitive dynamics, regulatory deadlines, first-mover advantages, and market timing pressures.",
    weight: "Standard",
  },
];

/* ── Verification states ── */
const VERIFICATION_STATES = [
  {
    label: "Verified",
    condition: "Tier 1 source with confidence ≥ 50",
    meaning:
      "The event or claim is confirmed by a primary official source and the system has high confidence the reported facts are accurate.",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    label: "Verified with caveat",
    condition: "Tier 1 source (any confidence) or Tier 2 source with confidence ≥ 60",
    meaning:
      "The event is reported by a credible source, but some details may be incomplete, evolving, or subject to subsequent clarification.",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    label: "Developing",
    condition: "Tier 2 source (any confidence) or confidence ≥ 40",
    meaning:
      "The story is actively evolving. Key facts are reported but may change materially. Treat as directional intelligence, not confirmed fact.",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    label: "Historical context",
    condition: "Tier 3 or Tier 4 source",
    meaning:
      "Background or contextual information from industry sources. Useful for framing but not treated as independently verified.",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Methodology
        </h1>
        <p className="text-body text-text-muted leading-relaxed">
          How GMIIE monitors, scores, and classifies institutional intelligence
          across global capital markets. This page explains the framework behind
          every score, badge, and assessment on the platform.
        </p>
      </div>

      {/* ── Section 1: Intelligence Pipeline ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Intelligence Pipeline
        </h2>
        <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed">
          <p>
            GMIIE monitors institutional activity across tokenized securities,
            digital settlement, regulatory frameworks, and digital currency
            infrastructure. Content is sourced from regulatory filings,
            institutional press releases, financial media, and industry research.
          </p>
          <p>
            Each article undergoes a structured extraction process:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-2 text-text-secondary">
            <li>
              <strong className="text-text-primary">Source identification</strong> — article is
              attributed to a classified source with a known credibility tier
            </li>
            <li>
              <strong className="text-text-primary">Structured extraction</strong> — key fields are
              populated: what happened, why it matters, market implications,
              infrastructure implications, and regulatory implications
            </li>
            <li>
              <strong className="text-text-primary">Signal scoring</strong> — nine dimensions are
              scored 0–100 based on the article&apos;s relevance and impact
            </li>
            <li>
              <strong className="text-text-primary">Confidence assessment</strong> — a 0–100
              confidence score reflects the system&apos;s certainty in the
              reported facts, derived from source tier, corroboration, and
              specificity
            </li>
            <li>
              <strong className="text-text-primary">Verification classification</strong> — the
              article receives a verification state badge based on source tier
              and confidence score
            </li>
          </ol>
        </div>
      </section>

      {/* ── Section 2: Source Credibility Tiers ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Source Credibility Tiers
        </h2>
        <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
          Every source in the GMIIE system is classified into one of four
          credibility tiers. The tier determines the weight given to information
          from that source and influences the verification state assigned to
          articles.
        </p>
        <div className="space-y-3">
          {SOURCE_TIERS.map((t) => (
            <div
              key={t.tier}
              className="p-4 rounded-lg border border-border-subtle bg-surface/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-label font-mono px-2 py-0.5 rounded-lg bg-gold/10 text-gold border border-gold/20 uppercase tracking-wider">
                  {t.tier}
                </span>
                <span className="text-body-sm font-semibold text-text-primary">
                  {t.label}
                </span>
                <span className="ml-auto text-caption text-text-muted font-mono">
                  Weight: {t.weight}
                </span>
              </div>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                {t.description}
              </p>
              <p className="text-caption text-text-muted mt-1.5">
                Default badge: <span className="font-medium">{t.badge}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Verification States ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Verification States
        </h2>
        <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
          Every article on GMIIE carries a verification badge reflecting the
          system&apos;s assessment of factual reliability. Verification state is
          derived from the combination of source credibility tier and confidence
          score — not editorial opinion.
        </p>
        <div className="space-y-3">
          {VERIFICATION_STATES.map((v) => (
            <div
              key={v.label}
              className="p-4 rounded-lg border border-border-subtle bg-surface/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-caption font-medium px-2 py-0.5 rounded-full border ${v.color}`}
                >
                  {v.label}
                </span>
                <span className="text-caption text-text-muted font-mono">
                  {v.condition}
                </span>
              </div>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                {v.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Signal Dimensions ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Nine Signal Dimensions
        </h2>
        <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
          Each article generates scores across nine dimensions that measure
          different facets of capital market transformation. Scores are 0–100,
          derived from the article&apos;s content, source, and contextual
          significance.
        </p>
        <div className="space-y-2">
          {SIGNAL_DIMENSIONS.map((dim) => (
            <div
              key={dim.name}
              className="p-3 rounded-lg border border-border-subtle bg-surface/30"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-body-sm font-semibold text-text-primary">
                  {dim.name}
                </h3>
                {dim.weight === "Elevated" && (
                  <span className="text-caption font-mono text-gold">
                    Elevated weight
                  </span>
                )}
              </div>
              <p className="text-caption text-text-secondary leading-relaxed">
                {dim.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Composite Index ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Composite Index
        </h2>
        <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed">
          <p>
            The <strong className="text-text-primary">GMIIE Composite Index</strong> is a
            weighted average of all nine signal dimensions. Settlement Impact,
            Institutional Adoption, and Regulatory Clarity receive elevated
            weighting to reflect their outsized influence on institutional
            decision-making.
          </p>
          <p>
            The composite index is updated continuously as new articles are
            processed. It represents the system&apos;s aggregate assessment of
            the current state of global financial infrastructure transformation.
          </p>
        </div>
      </section>

      {/* ── Section 6: Confidence Scoring ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Confidence Scoring
        </h2>
        <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed">
          <p>
            Every article receives a <strong className="text-text-primary">confidence score</strong>{" "}
            from 0 to 100 reflecting the system&apos;s certainty in the
            accuracy of the reported facts. The score is influenced by:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Source credibility tier (higher tier → higher base confidence)</li>
            <li>Specificity of claims (named sources, dates, figures)</li>
            <li>Corroboration across multiple sources</li>
            <li>Recency and timeliness of the information</li>
            <li>Whether the event is confirmed, projected, or speculative</li>
          </ul>
          <p>
            Confidence scores below 50 generally indicate developing stories
            where key facts remain unconfirmed. Scores above 80 indicate well-
            sourced, corroborated reporting from credible institutions.
          </p>
        </div>
      </section>

      {/* ── Section 7: Update Cadence ── */}
      <section className="mb-10">
        <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Update Cadence &amp; Limitations
        </h2>
        <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed">
          <p>
            GMIIE monitors sources continuously and processes new intelligence
            as it becomes available. Signal scores reflect the most recent data
            from the trailing 30-day window, with decay applied to older events.
          </p>
          <p>
            <strong className="text-text-primary">Limitations:</strong> GMIIE is an intelligence
            monitoring platform, not a prediction service. Scores reflect
            observed developments, not forecasts. The platform does not provide
            investment advice, and verification badges indicate source
            reliability — not the certainty of future outcomes.
          </p>
          <p>
            All intelligence should be treated as one input among many in a
            professional decision-making process.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="border-t border-border-subtle pt-4 mt-8">
        <p className="text-caption text-text-muted">
          Questions about methodology? Contact{" "}
          <span className="text-gold">research@xxxiii.io</span>
        </p>
      </div>
    </div>
  );
}
