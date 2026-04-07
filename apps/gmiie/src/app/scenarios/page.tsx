import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import Link from "next/link";
import { prisma } from "@xxxiii/db";

export const revalidate = 600;

export const metadata: Metadata = genMeta({
  title: "Scenario Cascade Chains",
  description:
    "Explore how macro trigger events cascade through GMIIE signal dimensions — from regulatory shifts to institutional adoption waves. See which articles correspond to each stage.",
  path: "/scenarios",
  domain: "gmiie.xxxiii.io",
});

// ── Static scenario chain definitions ────────────────────────────────────
// Each chain defines: trigger, cascade steps, and prisma filters
// for pulling relevant observed articles from the DB.
const SCENARIO_CHAINS = [
  {
    id: "cbdc-rollout",
    title: "CBDC Rollout Effect",
    trigger: "A major central bank formally launches a retail or wholesale CBDC",
    description:
      "When a G10 or major emerging market central bank officially launches a CBDC program, the effects cascade across the settlement infrastructure, regulatory frameworks, and ultimately institutional adoption timelines.",
    color: "border-blue-500/30 bg-blue-500/5",
    badgeColor: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    steps: [
      {
        order: 1,
        dimension: "Settlement Impact",
        direction: "up" as const,
        description:
          "Wholesale CBDC deployments immediately pressure existing T+2 settlement rails. Banks must evaluate whether their clearing infrastructure can interoperate with the new sovereign ledger.",
        articleType: "INFRA_ANALYSIS",
      },
      {
        order: 2,
        dimension: "Regulatory Clarity",
        direction: "up" as const,
        description:
          "A live CBDC forces companion legislation — digital wallet regulations, AML frameworks for programmable money, and cross-border CBDC interoperability agreements accelerate.",
        articleType: "REGULATOR_TRACKER",
      },
      {
        order: 3,
        dimension: "Institutional Adoption",
        direction: "up" as const,
        description:
          "With a sovereign settlement rail live, custodians and prime brokers begin tokenizing assets against the CBDC rail, accelerating institutional on-chain adoption.",
        articleType: "BRIEF",
      },
      {
        order: 4,
        dimension: "Cross-Border Relevance",
        direction: "up" as const,
        description:
          "Trading partners evaluate multi-CBDC bridge networks (mBridge, Project Dunbar successors). FX settlement corridors become the next competitive battleground.",
        articleType: "DEEP_DIVE",
      },
    ],
  },
  {
    id: "enforcement-wave",
    title: "Regulatory Enforcement Cascade",
    trigger: "A major regulator issues a significant enforcement action against a digital asset firm",
    description:
      "Enforcement actions by tier-1 regulators (SEC, FCA, ESMA, MAS) create immediate compliance chilling effects followed by market consolidation and ultimately clearer operating standards.",
    color: "border-red-500/30 bg-red-500/5",
    badgeColor: "text-red-400 border-red-500/20 bg-red-500/10",
    steps: [
      {
        order: 1,
        dimension: "Compliance Intensity",
        direction: "up" as const,
        description:
          "Enforcement precedent forces immediate compliance reviews across all major asset managers, custodians, and tokenization platforms operating in the jurisdiction.",
        articleType: "REGULATOR_TRACKER",
      },
      {
        order: 2,
        dimension: "Market Readiness",
        direction: "down" as const,
        description:
          "Deal pipelines pause as legal counsel reviews exposure. New product launches are delayed 2–6 months while firms assess their regulatory standing.",
        articleType: "BRIEF",
      },
      {
        order: 3,
        dimension: "Regulatory Clarity",
        direction: "up" as const,
        description:
          "Post-enforcement, regulators typically publish guidance letters, no-action frameworks, or safe harbor rules to prevent market freeze. This actually improves long-run clarity.",
        articleType: "REGULATOR_TRACKER",
      },
      {
        order: 4,
        dimension: "Strategic Urgency",
        direction: "up" as const,
        description:
          "Firms that invested in compliance infrastructure early gain competitive advantage. First-mover compliant platforms capture flows from firms sidelined by enforcement.",
        articleType: "STRATEGIC_MEMO",
      },
    ],
  },
  {
    id: "rwa-tokenization-wave",
    title: "RWA Tokenization Adoption Wave",
    trigger: "A top-5 global asset manager announces a production tokenized fund on a major chain",
    description:
      "When a BlackRock, Fidelity, or Franklin-scale manager puts a live tokenized product on-chain at scale, it validates the entire infrastructure stack and triggers a second wave of institutional entrants.",
    color: "border-amber-500/30 bg-amber-500/5",
    badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    steps: [
      {
        order: 1,
        dimension: "Institutional Adoption",
        direction: "up" as const,
        description:
          "Tier-1 name entry signals safety of the infrastructure. Competitors move from pilot to production to avoid losing first-mover positioning with institutional clients.",
        articleType: "BRIEF",
      },
      {
        order: 2,
        dimension: "Infrastructure Maturity",
        direction: "up" as const,
        description:
          "Custody, transfer agent, and prime brokerage infrastructure gets stress-tested at scale. Surviving platforms receive institutional certification, failed ones are replaced.",
        articleType: "INFRA_ANALYSIS",
      },
      {
        order: 3,
        dimension: "Liquidity Significance",
        direction: "up" as const,
        description:
          "Secondary market venues (Archax, SDX, tZERO) report volume surges as tokenized assets trade. Market makers commit capital to tokenized equity and bond pools.",
        articleType: "MARKET_MAP",
      },
      {
        order: 4,
        dimension: "Market Readiness",
        direction: "up" as const,
        description:
          "Investor demand resets expectations. Retail-accessible tokenized funds launch. The infrastructure necessary for broader participation is now live and proven.",
        articleType: "DEEP_DIVE",
      },
    ],
  },
  {
    id: "rate-shock",
    title: "Rate Shock Transmission",
    trigger: "A major central bank signals a faster-than-expected rate cycle reversal",
    description:
      "Unexpected rate movements affect tokenized asset markets disproportionately by repricing tokenized bonds and treasuries, altering the economics of on-chain lending, and shifting institutional re-allocation timelines.",
    color: "border-emerald-500/30 bg-emerald-500/5",
    badgeColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    steps: [
      {
        order: 1,
        dimension: "Liquidity Significance",
        direction: "up" as const,
        description:
          "Tokenized short-duration treasuries see AUM inflows as institutions seek yield with on-chain settlement speed. Money market tokenization volumes spike.",
        articleType: "BRIEF",
      },
      {
        order: 2,
        dimension: "Cross-Border Relevance",
        direction: "up" as const,
        description:
          "Rate divergence between jurisdictions accelerates cross-border tokenized repo and FX settlement demand. Multi-CBDC corridors gain urgency.",
        articleType: "INFRA_ANALYSIS",
      },
      {
        order: 3,
        dimension: "Market Readiness",
        direction: "up" as const,
        description:
          "Tokenized bond issuance windows open as institutional demand for programmable fixed income surges. New sovereign and corporate digital debt issuances follow.",
        articleType: "RESEARCH_ARTICLE",
      },
      {
        order: 4,
        dimension: "Infrastructure Maturity",
        direction: "up" as const,
        description:
          "The settlement efficiency advantage of tokenized assets is most visible in high-velocity markets. Infrastructure providers report transaction record volumes.",
        articleType: "INFRA_ANALYSIS",
      },
    ],
  },
];

// ── Helper ────────────────────────────────────────────────────────────────
function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function directionBadge(dir: "up" | "down") {
  return dir === "up" ? (
    <span className="inline-flex items-center gap-1 text-caption px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
      ↑ Rises
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-caption px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
      ↓ Falls
    </span>
  );
}

// ── DB fetch for related articles ────────────────────────────────────────
async function getRelatedArticles(articleType: string, limit: number) {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED", articleType: articleType as never },
      select: {
        slug: true,
        title: true,
        importanceScore: true,
        publishedAt: true,
        source: { select: { name: true } },
      },
      orderBy: [{ importanceScore: "desc" }, { publishedAt: "desc" }],
      take: limit,
    });
  } catch {
    return [];
  }
}

// ── Page ─────────────────────────────────────────────────────────────────
export default async function ScenariosPage() {
  // Fetch 2 related articles per step across all scenarios (parallelised)
  const allStepTypes = Array.from(
    new Set(SCENARIO_CHAINS.flatMap((c) => c.steps.map((s) => s.articleType)))
  );

  const articlesByType = await Promise.all(
    allStepTypes.map(async (t) => {
      const articles = await getRelatedArticles(t, 4);
      return [t, articles] as const;
    })
  );

  const articleMap = Object.fromEntries(articlesByType);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Scenario Cascade Chains
        </h1>
        <p className="text-body text-text-muted">
          Macro trigger events don&apos;t affect signal dimensions in isolation
          — they cascade sequentially through the GMIIE framework. Each scenario
          maps a trigger to its downstream effects on signal scores, with observed
          articles at each stage.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-7 p-3 rounded-lg border border-border-subtle bg-surface/20">
        <span className="text-label text-text-muted">Cascade direction:</span>
        <span className="inline-flex items-center gap-1.5 text-caption text-emerald-400">
          <span className="w-3 h-px bg-emerald-400 inline-block" />
          Signal rises
        </span>
        <span className="inline-flex items-center gap-1.5 text-caption text-red-400">
          <span className="w-3 h-px bg-red-400 inline-block" />
          Signal falls (short-term)
        </span>
        <span className="text-caption text-text-muted ml-auto">
          Related articles shown at each stage where available
        </span>
      </div>

      {/* Scenario chains */}
      <div className="space-y-8">
        {SCENARIO_CHAINS.map((chain) => {
          return (
            <div
              key={chain.id}
              className={`rounded-xl border p-5 ${chain.color}`}
            >
              {/* Chain header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-body font-bold text-text-primary mb-1">
                    {chain.title}
                  </h2>
                  <p className="text-body-sm text-text-muted">
                    {chain.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-label font-mono px-2 py-1 rounded-full border ${chain.badgeColor} uppercase tracking-wider whitespace-nowrap`}
                >
                  {chain.steps.length} stages
                </span>
              </div>

              {/* Trigger */}
              <div className="mb-4 p-3 rounded-lg border border-border-subtle bg-surface/40">
                <span className="text-caption text-text-muted uppercase tracking-wider block mb-1">
                  Trigger Event
                </span>
                <p className="text-body-sm text-text-primary font-medium">
                  {chain.trigger}
                </p>
              </div>

              {/* Cascade steps */}
              <div className="space-y-3">
                {chain.steps.map((step, idx) => {
                  const related = (
                    articleMap[step.articleType] ?? []
                  ).slice(0, 2);

                  return (
                    <div key={step.order} className="relative">
                      {/* Connector line */}
                      {idx < chain.steps.length - 1 && (
                        <div className="absolute left-5 top-full w-px h-3 bg-border-subtle z-10" />
                      )}

                      <div className="rounded-lg border border-border-subtle bg-surface/50 p-3">
                        <div className="flex items-start gap-3 mb-2">
                          {/* Step number */}
                          <span className="shrink-0 w-6 h-6 rounded-full bg-surface/70 border border-border-subtle text-caption text-text-muted font-mono flex items-center justify-center">
                            {step.order}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-body-sm font-semibold text-text-primary">
                                {step.dimension}
                              </span>
                              {directionBadge(step.direction)}
                            </div>
                            <p className="text-caption text-text-secondary leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Related articles */}
                        {related.length > 0 && (
                          <div className="mt-2 ml-9 space-y-1.5">
                            <p className="text-caption text-text-muted uppercase tracking-wider">
                              Observed:
                            </p>
                            {related.map((a) => (
                              <Link
                                key={a.slug}
                                href={`/intelligence/${a.slug}`}
                                className="flex items-start gap-2 group"
                              >
                                <span className="shrink-0 w-1 h-1 rounded-full bg-gold/50 mt-1.5" />
                                <div className="min-w-0">
                                  <span className="text-caption text-text-secondary group-hover:text-gold transition-colors line-clamp-1">
                                    {a.title}
                                  </span>
                                  <span className="text-caption text-text-muted block">
                                    {a.source?.name ?? ""}
                                    {a.publishedAt
                                      ? ` · ${timeAgo(a.publishedAt.toISOString())}`
                                      : ""}
                                    {a.importanceScore != null &&
                                    a.importanceScore > 0
                                      ? ` · ${a.importanceScore.toFixed(1)}`
                                      : ""}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {related.length === 0 && (
                          <p className="mt-2 ml-9 text-caption text-text-muted italic">
                            No published articles of this type yet
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-8 border-t border-border-subtle pt-5">
        <h2 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          About Cascade Chains
        </h2>
        <div className="space-y-2 text-body-sm text-text-secondary leading-relaxed">
          <p>
            Cascade chains represent GMIIE&apos;s model of how macro trigger events
            propagate through signal dimensions sequentially. They are not
            predictions — they are structural frameworks for interpreting how
            observed developments relate to each other.
          </p>
          <p>
            Each stage maps to a signal dimension and shows whether that dimension
            is expected to rise or compress in the short-to-medium term following
            the trigger. Articles shown at each stage are the highest-importance
            observed content matching that type from the pipeline.
          </p>
          <p>
            New scenario chains are added as GMIIE identifies recurring causal
            patterns in the institutional infrastructure data.
          </p>
        </div>
      </div>
    </div>
  );
}
