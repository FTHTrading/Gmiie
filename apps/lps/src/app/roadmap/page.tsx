import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "LPS-1 protocol development roadmap — from core protocol to cross-protocol interoperability.",
};

const PHASES = [
  {
    phase: 1,
    title: "Core Protocol",
    status: "completed" as const,
    timeline: "Q3 2025 — Q1 2026",
    description: "Design, implement, audit, and deploy the foundational LPS-1 protocol with all six layers.",
    milestones: [
      { name: "Protocol specification v1.0", done: true },
      { name: "TypeScript reference implementation", done: true },
      { name: "Python reference implementation", done: true },
      { name: "Solidity Registry Contract", done: true },
      { name: "Trail of Bits security audit", done: true },
      { name: "Ethereum Mainnet deployment", done: true },
      { name: "Polygon PoS deployment", done: true },
      { name: "CLI tool v1.0 release", done: true },
      { name: "Protocol documentation site", done: true },
    ],
  },
  {
    phase: 2,
    title: "Multi-Chain Anchoring",
    status: "in-progress" as const,
    timeline: "Q1 2026 — Q3 2026",
    description: "Extend on-chain anchoring to additional chains and L2 networks for lower costs and wider reach.",
    milestones: [
      { name: "Arbitrum One deployment", done: true },
      { name: "Base deployment", done: false },
      { name: "Optimism deployment", done: false },
      { name: "Cross-chain verification SDK", done: false },
      { name: "Chain-agnostic manifest format", done: false },
      { name: "Gas cost optimization (batch anchoring)", done: false },
      { name: "Multi-chain explorer integration", done: false },
    ],
  },
  {
    phase: 3,
    title: "Institutional Integrations",
    status: "planned" as const,
    timeline: "Q3 2026 — Q1 2027",
    description: "Build integrations with major publishing platforms, CMS systems, and archival institutions.",
    milestones: [
      { name: "WordPress plugin for LPS-1 publishing", done: false },
      { name: "Ghost CMS integration", done: false },
      { name: "Substack export/verification tool", done: false },
      { name: "Academic publisher API partnerships", done: false },
      { name: "Library of Congress pilot program", done: false },
      { name: "News wire service integration", done: false },
      { name: "Enterprise SDK with SLA support", done: false },
    ],
  },
  {
    phase: 4,
    title: "AI Provenance Registry",
    status: "planned" as const,
    timeline: "Q1 2027 — Q3 2027",
    description: "Build a global registry for AI provenance, enabling machine-auditable disclosure across all LPS-1 publications.",
    milestones: [
      { name: "Global AI disclosure registry contract", done: false },
      { name: "AI model fingerprint database", done: false },
      { name: "Automated AI detection + disclosure comparison", done: false },
      { name: "Publisher compliance dashboard", done: false },
      { name: "Regulatory reporting API", done: false },
      { name: "AI provenance analytics and trends", done: false },
    ],
  },
  {
    phase: 5,
    title: "Cross-Protocol Interoperability",
    status: "planned" as const,
    timeline: "Q3 2027+",
    description: "Enable LPS-1 to interoperate with other content provenance standards, DID systems, and verifiable credential frameworks.",
    milestones: [
      { name: "C2PA (Coalition for Content Provenance) bridge", done: false },
      { name: "W3C Verifiable Credentials integration", done: false },
      { name: "DID-based author identity layer", done: false },
      { name: "IPTC photo/video metadata extension", done: false },
      { name: "Cross-standard verification toolkit", done: false },
      { name: "Universal content provenance query protocol", done: false },
    ],
  },
];

function StatusBadge({ status }: { status: "completed" | "in-progress" | "planned" }) {
  const config = {
    completed: { variant: "green" as const, label: "Completed" },
    "in-progress": { variant: "gold" as const, label: "In Progress" },
    planned: { variant: "outline" as const, label: "Planned" },
  };
  const { variant, label } = config[status];
  return <Badge variant={variant} size="sm">{label}</Badge>;
}

export default function RoadmapPage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Development
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Protocol Roadmap
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              LPS-1 is a living protocol. Here's where we've been and where we're going —
              from core publishing infrastructure to global content provenance.
            </p>
          </Container>
        </section>

        {/* ═══ TIMELINE ═══ */}
        <section className="py-16">
          <Container size="narrow">
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border-subtle hidden md:block" />

              <div className="space-y-12">
                {PHASES.map((phase) => (
                  <div key={phase.phase} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-0 hidden md:flex">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        phase.status === "completed"
                          ? "bg-green/10 border-green/30"
                          : phase.status === "in-progress"
                          ? "bg-gold/10 border-gold/30"
                          : "bg-surface border-border-subtle"
                      }`}>
                        <span className={`font-mono font-bold text-sm ${
                          phase.status === "completed"
                            ? "text-green"
                            : phase.status === "in-progress"
                            ? "text-gold"
                            : "text-text-muted"
                        }`}>
                          {phase.phase}
                        </span>
                      </div>
                    </div>

                    {/* Phase content */}
                    <div className="md:ml-16">
                      <Card
                        variant="bordered"
                        className={`p-0 overflow-hidden ${
                          phase.status === "completed"
                            ? "border-green/15"
                            : phase.status === "in-progress"
                            ? "border-gold/20"
                            : "border-border-subtle"
                        }`}
                      >
                        {/* Phase header */}
                        <div className={`px-6 py-4 border-b border-border-subtle ${
                          phase.status === "in-progress" ? "bg-gold/5" : "bg-surface-elevated/30"
                        }`}>
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <span className="font-mono text-sm text-text-muted md:hidden">Phase {phase.phase}</span>
                            <h3 className="text-lg font-bold text-text-primary">{phase.title}</h3>
                            <StatusBadge status={phase.status} />
                          </div>
                          <p className="text-xs font-mono text-text-muted">{phase.timeline}</p>
                        </div>

                        <CardContent className="p-6">
                          <p className="text-text-secondary text-sm mb-5">{phase.description}</p>

                          <div className="space-y-2">
                            {phase.milestones.map((m, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span className={`mt-0.5 font-mono text-xs flex-shrink-0 ${
                                  m.done ? "text-green" : "text-text-muted"
                                }`}>
                                  {m.done ? "✓" : "○"}
                                </span>
                                <span className={`text-sm ${
                                  m.done ? "text-text-secondary" : "text-text-muted"
                                }`}>
                                  {m.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Progress bar */}
                          <div className="mt-5 pt-4 border-t border-border-subtle">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-mono text-text-muted">Progress</span>
                              <span className="text-xs font-mono text-text-muted">
                                {phase.milestones.filter(m => m.done).length}/{phase.milestones.length}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  phase.status === "completed"
                                    ? "bg-green"
                                    : phase.status === "in-progress"
                                    ? "bg-gold"
                                    : "bg-text-muted"
                                }`}
                                style={{
                                  width: `${(phase.milestones.filter(m => m.done).length / phase.milestones.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-text-muted text-sm">
                Roadmap is subject to change based on community feedback and protocol governance.
              </p>
              <p className="text-text-muted text-xs font-mono mt-2">
                Last updated: March 2026
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
