import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Compliance Matrix",
  description: "LPS-1 L0–L5 compliance matrix — requirements, status indicators, and compliance tiers.",
};

const MATRIX = [
  {
    level: "L0",
    name: "Content Normalization",
    requirements: [
      { req: "UTF-8 encoding with NFC normalization", minimum: true, recommended: true, full: true },
      { req: "Whitespace collapsing (sequences → single space)", minimum: true, recommended: true, full: true },
      { req: "Line ending normalization (→ LF)", minimum: true, recommended: true, full: true },
      { req: "BOM stripping", minimum: true, recommended: true, full: true },
      { req: "Control character removal", minimum: true, recommended: true, full: true },
    ],
  },
  {
    level: "L1",
    name: "Cryptographic Hashing",
    requirements: [
      { req: "SHA-256 hash of normalized content", minimum: true, recommended: true, full: true },
      { req: "Hash over raw bytes (not string)", minimum: true, recommended: true, full: true },
      { req: "64-character lowercase hex output", minimum: true, recommended: true, full: true },
      { req: "Hash recorded in manifest", minimum: true, recommended: true, full: true },
    ],
  },
  {
    level: "L2",
    name: "Merkle Tree Construction",
    requirements: [
      { req: "Binary Merkle tree from section hashes", minimum: true, recommended: true, full: true },
      { req: "SHA-256 internal node hashing", minimum: true, recommended: true, full: true },
      { req: "Odd-leaf duplication", minimum: true, recommended: true, full: true },
      { req: "Proof paths for each leaf", minimum: true, recommended: true, full: true },
      { req: "Tree depth recorded in manifest", minimum: true, recommended: true, full: true },
    ],
  },
  {
    level: "L3",
    name: "IPFS Storage",
    requirements: [
      { req: "Manifest pinned to IPFS", minimum: false, recommended: true, full: true },
      { req: "CIDv1 with dag-pb or raw codec", minimum: false, recommended: true, full: true },
      { req: "Minimum 2 pinning services", minimum: false, recommended: true, full: true },
      { req: "Content optionally pinned", minimum: false, recommended: false, full: true },
    ],
  },
  {
    level: "L4",
    name: "On-Chain Anchoring",
    requirements: [
      { req: "Merkle root anchored via Registry Contract", minimum: false, recommended: true, full: true },
      { req: "IPFS CID recorded on-chain", minimum: false, recommended: true, full: true },
      { req: "Transaction hash in manifest", minimum: false, recommended: true, full: true },
      { req: "Block number and timestamp in manifest", minimum: false, recommended: true, full: true },
    ],
  },
  {
    level: "L5",
    name: "AI Disclosure",
    requirements: [
      { req: 'AI usage declaration (none/assisted/generated/mixed)', minimum: false, recommended: false, full: true },
      { req: "Model identifiers and providers", minimum: false, recommended: false, full: true },
      { req: "Human intervention ratio (0.0–1.0)", minimum: false, recommended: false, full: true },
      { req: "Section-level AI usage granularity", minimum: false, recommended: false, full: true },
      { req: "Human-readable disclosure statement", minimum: false, recommended: false, full: true },
    ],
  },
];

function StatusIcon({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="text-green font-mono text-sm font-bold">✓</span>
  ) : (
    <span className="text-text-muted font-mono text-sm">—</span>
  );
}

export default function CompliancePage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Compliance
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Compliance Matrix
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              LPS-1 defines three compliance tiers. Use this matrix to determine which requirements
              apply to your implementation.
            </p>
          </Container>
        </section>

        {/* ═══ TIERS OVERVIEW ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card variant="bordered" className="p-6">
                <CardContent>
                  <Badge variant="outline" size="md" className="mb-3">Minimum Viable</Badge>
                  <h3 className="text-lg font-bold text-text-primary mb-2">L0–L2</h3>
                  <p className="text-text-secondary text-sm mb-3">Content Integrity</p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Normalization, hashing, and Merkle tree construction. Proves content integrity without
                    permanent storage or timestamping. Suitable for internal workflows, drafts, and offline
                    verification.
                  </p>
                </CardContent>
              </Card>

              <Card variant="bordered" className="p-6 border-gold/20">
                <CardContent>
                  <Badge variant="gold" size="md" className="mb-3">Recommended</Badge>
                  <h3 className="text-lg font-bold text-text-primary mb-2">L0–L4</h3>
                  <p className="text-text-secondary text-sm mb-3">Full Provenance</p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Adds IPFS storage and on-chain anchoring. Provides permanent, independently verifiable proof
                    of publication with immutable timestamps. Recommended for all public publications,
                    journalism, and academic work.
                  </p>
                </CardContent>
              </Card>

              <Card variant="bordered" className="p-6 border-green/20">
                <CardContent>
                  <Badge variant="green" size="md" className="mb-3">Complete</Badge>
                  <h3 className="text-lg font-bold text-text-primary mb-2">L0–L5</h3>
                  <p className="text-text-secondary text-sm mb-3">Full Provenance + AI Disclosure</p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Includes structured AI disclosure metadata. Required for works involving any AI assistance.
                    The gold standard for content provenance in the AI era.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* ═══ DETAILED MATRIX ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container>
            <h2 className="text-2xl font-bold text-text-primary mb-8 font-mono text-center">
              Detailed Requirements Matrix
            </h2>

            <div className="max-w-5xl mx-auto border border-border-subtle rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-elevated/50 border-b border-border-subtle">
                      <th className="px-4 py-3 text-left font-mono text-xs text-gold uppercase tracking-wider w-16">Level</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-gold uppercase tracking-wider">Requirement</th>
                      <th className="px-4 py-3 text-center font-mono text-xs text-text-muted uppercase tracking-wider w-24">Minimum</th>
                      <th className="px-4 py-3 text-center font-mono text-xs text-gold uppercase tracking-wider w-24">Recommended</th>
                      <th className="px-4 py-3 text-center font-mono text-xs text-green uppercase tracking-wider w-24">Complete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX.map((layer) => (
                      <>
                        {/* Layer header row */}
                        <tr key={`header-${layer.level}`} className="bg-surface/50 border-t border-border-subtle">
                          <td className="px-4 py-2 font-mono font-bold text-gold text-sm">{layer.level}</td>
                          <td colSpan={4} className="px-4 py-2 font-semibold text-text-primary text-sm">{layer.name}</td>
                        </tr>
                        {/* Requirement rows */}
                        {layer.requirements.map((r, i) => (
                          <tr key={`${layer.level}-${i}`} className="border-t border-border-subtle/50 hover:bg-surface-elevated/20 transition-colors">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-text-secondary text-sm font-mono">{r.req}</td>
                            <td className="px-4 py-2 text-center"><StatusIcon pass={r.minimum} /></td>
                            <td className="px-4 py-2 text-center"><StatusIcon pass={r.recommended} /></td>
                            <td className="px-4 py-2 text-center"><StatusIcon pass={r.full} /></td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Container>
        </section>

        {/* ═══ PARTIAL COMPLIANCE ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Partial Compliance Scenarios</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed mb-8">
              <p>
                Not all implementations need full L0–L5 compliance. Here are common partial compliance
                scenarios and when they are appropriate.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  scenario: "Internal Content Pipeline",
                  layers: "L0–L2",
                  badge: "outline" as const,
                  desc: "A newsroom or publisher uses LPS-1 internally to hash and verify content before publication. No IPFS or on-chain anchoring needed — the Merkle root provides an internal integrity check.",
                  note: "Cannot be independently verified by external parties without access to the internal manifest.",
                },
                {
                  scenario: "Archival Publication",
                  layers: "L0–L4",
                  badge: "gold" as const,
                  desc: "A research institution publishes papers with full provenance. IPFS provides permanent storage and on-chain anchoring provides timestamp proof. AI disclosure is optional if no AI was involved.",
                  note: "This is the recommended tier for most public publications.",
                },
                {
                  scenario: "AI-Assisted Journalism",
                  layers: "L0–L5",
                  badge: "green" as const,
                  desc: "A journalist uses AI for research assistance and fact-checking. Full L5 AI disclosure is required, declaring the models used, scope of AI involvement, and human intervention ratio.",
                  note: "Required for any publication that involves AI assistance, to maintain reader trust.",
                },
                {
                  scenario: "AI-Generated Content",
                  layers: "L0–L5",
                  badge: "green" as const,
                  desc: "Fully AI-generated content (e.g., synthetic data reports, AI-authored summaries). L5 disclosure must declare usage as 'generated' with humanInterventionRatio of 0.0.",
                  note: "Even fully AI-generated works benefit from LPS-1 provenance tracking.",
                },
              ].map((item, i) => (
                <Card key={i} variant="bordered" className="p-5">
                  <CardContent>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={item.badge} size="sm">{item.layers}</Badge>
                      <h3 className="text-sm font-semibold text-text-primary">{item.scenario}</h3>
                    </div>
                    <p className="text-text-secondary text-sm mb-2">{item.desc}</p>
                    <p className="text-text-muted text-xs font-mono">Note: {item.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ COMPLIANCE DECLARATION ═══ */}
        <section className="py-16">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Declaring Compliance</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed mb-6">
              <p>
                Implementations SHOULD declare their compliance tier in the Publication Manifest using the
                <code className="text-gold font-mono text-xs mx-1">compliance</code> field.
              </p>
            </div>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`{
  "lps": "1.0",
  "compliance": {
    "tier": "complete",        // "minimum" | "recommended" | "complete"
    "layers": ["L0", "L1", "L2", "L3", "L4", "L5"],
    "verified": true,          // true if self-verification passed
    "verifiedAt": "2026-03-01T12:00:00.000Z"
  },
  // ... rest of manifest
}`}</pre>
            </div>

            <div className="mt-8 border-t border-border-subtle pt-8">
              <p className="text-text-muted text-xs font-mono">
                Compliance is self-declared and can be independently verified by any party with access to
                the original content and the manifest CID. The protocol itself enforces compliance — an
                implementation either produces valid artifacts at each layer or it doesn't.
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
