import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Protocol Stack",
  description: "Layer-by-layer architecture visualization of the LPS-1 protocol stack.",
};

const LAYERS = [
  {
    id: "L5",
    name: "AI Disclosure",
    color: "purple",
    description: "Structured, machine-readable declaration of AI involvement in work creation.",
    inputs: "Author declarations, model identifiers, usage scope per section",
    outputs: "AIDisclosure object: usage type, model entries, human intervention ratio",
    implementation: [
      "Accepted values for usage: none | assisted | generated | mixed",
      "humanInterventionRatio is a float from 0.0 (fully AI) to 1.0 (fully human)",
      "Each model entry includes: provider, model identifier, scope of usage",
      "Section-level granularity is optional but recommended for mixed-use works",
    ],
    orthogonal: true,
  },
  {
    id: "L4",
    name: "On-Chain Anchoring",
    color: "gold",
    description: "Immutable, timestamped record on a public blockchain proving content existed at a specific time.",
    inputs: "Merkle root hash, IPFS CID, content metadata hash",
    outputs: "Transaction hash, block number, chain ID, timestamp",
    implementation: [
      "Call anchorRoot() on the LPS-1 Registry Contract",
      "Supported chains: Ethereum Mainnet (chainId: 1), Polygon PoS (chainId: 137)",
      "Gas-optimized: single storage slot per anchor using packed encoding",
      "Event emitted: AnchorCreated(bytes32 merkleRoot, string ipfsCid, uint256 timestamp)",
    ],
  },
  {
    id: "L3",
    name: "IPFS Storage",
    color: "cyan",
    description: "Content-addressed decentralized storage for permanent, trustless retrieval.",
    inputs: "Publication Manifest JSON, optionally L0-normalized content",
    outputs: "IPFS CID (Content Identifier) — content-addressed hash",
    implementation: [
      "Use CIDv1 with dag-pb or raw codec",
      "Pin to at least 2 independent pinning services for redundancy",
      "Manifest CID is recorded in the L4 on-chain anchor",
      "Content can be retrieved by anyone with the CID — no authentication required",
    ],
  },
  {
    id: "L2",
    name: "Merkle Tree Construction",
    color: "blue",
    description: "Binary hash tree enabling selective verification of individual content sections.",
    inputs: "Array of L1 section hashes (one per content section)",
    outputs: "Merkle root (64-char hex), proof paths for each leaf node",
    implementation: [
      "Leaf nodes: SHA-256 hash of each normalized content section",
      "Internal nodes: SHA-256(left_child || right_child) — concatenation then hash",
      "Odd leaf count: duplicate the last leaf to create an even set",
      "Record tree depth and leaf count in manifest for verification",
    ],
  },
  {
    id: "L1",
    name: "Cryptographic Hashing",
    color: "green",
    description: "SHA-256 fingerprint of normalized content — any change produces a completely different hash.",
    inputs: "L0-normalized UTF-8 byte sequence",
    outputs: "SHA-256 hash — 64-character lowercase hexadecimal string",
    implementation: [
      "Algorithm: SHA-256 per FIPS 180-4",
      "Hash computed over raw byte representation, not string encoding",
      "Deterministic: same input always produces same output",
      "Collision-resistant: computationally infeasible to find two inputs with same hash",
    ],
  },
  {
    id: "L0",
    name: "Content Normalization",
    color: "gold",
    description: "Transforms raw content into a canonical, deterministic representation for consistent downstream processing.",
    inputs: "Raw text content in any encoding, with any whitespace/formatting",
    outputs: "Canonical UTF-8 text (NFC-normalized, trimmed, LF line endings)",
    implementation: [
      "Convert to UTF-8 with NFC Unicode normalization",
      "Collapse whitespace sequences to single spaces",
      "Trim leading/trailing whitespace per line",
      "Normalize line endings to LF (\\n)",
      "Strip BOM and null bytes",
    ],
  },
];

const badgeVariant = (color: string) => {
  const map: Record<string, "gold" | "blue" | "green" | "purple" | "cyan" | "outline"> = {
    gold: "gold",
    blue: "blue",
    green: "green",
    purple: "purple",
    cyan: "cyan",
  };
  return map[color] || "outline";
};

export default function StackPage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Architecture
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Protocol Stack
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Six deterministic layers, each producing a verifiable artifact. Content flows bottom-up
              from raw input to permanent on-chain proof.
            </p>
          </Container>
        </section>

        {/* ═══ VISUAL STACK ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Stack Diagram */}
              <div className="relative">
                {LAYERS.map((layer, i) => (
                  <div key={layer.id} className="relative">
                    {/* Connection line */}
                    {i < LAYERS.length - 1 && !layer.orthogonal && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-px h-4 bg-border hidden md:block" />
                    )}

                    <div className={`relative mb-4 ${layer.orthogonal ? "ml-0 md:ml-16 opacity-90" : ""}`}>
                      {/* Layer card */}
                      <Card
                        variant="bordered"
                        className={`p-0 overflow-hidden ${
                          layer.orthogonal
                            ? "border-purple/20 border-dashed"
                            : "border-border-subtle hover:border-gold/30"
                        } transition-all duration-300`}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Layer ID Column */}
                          <div className={`flex-shrink-0 w-full md:w-24 flex items-center justify-center py-4 md:py-0 ${
                            layer.orthogonal ? "bg-purple/5" : "bg-surface-elevated/50"
                          }`}>
                            <div className="text-center">
                              <span className={`font-mono font-bold text-2xl ${
                                layer.color === "gold" ? "text-gold" :
                                layer.color === "blue" ? "text-blue" :
                                layer.color === "green" ? "text-green" :
                                layer.color === "purple" ? "text-purple" :
                                layer.color === "cyan" ? "text-cyan" : "text-text-primary"
                              }`}>
                                {layer.id}
                              </span>
                            </div>
                          </div>

                          {/* Content Column */}
                          <CardContent className="flex-1 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-text-primary">{layer.name}</h3>
                              {layer.orthogonal && (
                                <Badge variant="purple" size="sm">Orthogonal</Badge>
                              )}
                            </div>
                            <p className="text-text-secondary text-sm mb-4">{layer.description}</p>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-xs font-mono text-gold uppercase tracking-wider">Input</span>
                                <p className="text-text-muted text-sm mt-1">{layer.inputs}</p>
                              </div>
                              <div>
                                <span className="text-xs font-mono text-gold uppercase tracking-wider">Output</span>
                                <p className="text-text-muted text-sm mt-1">{layer.outputs}</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border-subtle">
                              <span className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 block">
                                Implementation Notes
                              </span>
                              <ul className="space-y-1">
                                {layer.implementation.map((note, j) => (
                                  <li key={j} className="text-text-secondary text-sm flex items-start gap-2">
                                    <span className="text-gold mt-1 text-xs">▸</span>
                                    <span className="font-mono text-xs">{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </div>

                    {/* Arrow between layers */}
                    {i < LAYERS.length - 1 && !layer.orthogonal && (
                      <div className="flex justify-center my-1">
                        <span className="text-text-muted text-lg">▲</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ═══ DATA FLOW ═══ */}
        <section className="py-20">
          <Container size="narrow">
            <div className="text-center mb-12">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Data Flow
              </span>
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Content Pipeline
              </h2>
              <p className="text-text-secondary">
                How content moves through the LPS-1 protocol from raw input to permanent proof.
              </p>
            </div>

            <div className="bg-[#1A1A25] rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary leading-relaxed">{`
  ┌──────────────────────────────────────────────────────────────┐
  │                      RAW CONTENT                             │
  │   "My article text with various formatting..."               │
  └──────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  L0  NORMALIZE                                               │
  │   → UTF-8 NFC · Collapse whitespace · LF endings             │
  │   Output: canonical_text (deterministic bytes)                │
  └──────────────────┬───────────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │  Split into  │
              │   sections   │
              └──────┬──────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  L1  HASH                                                    │
  │   → SHA-256 of each section + full content                   │
  │   Output: content_hash, section_hashes[]                     │
  └──────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  L2  MERKLE                                                  │
  │   → Build binary hash tree from section_hashes               │
  │   Output: merkle_root, proof_paths[]                         │
  └──────────────────┬───────────────────────────────────────────┘
                     │
                ┌────┴────┐
                │ Compose  │
                │ Manifest │◀─── L5 AI Disclosure (attached)
                └────┬────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  L3  STORE                                                   │
  │   → Pin manifest + content to IPFS                           │
  │   Output: ipfs_cid                                           │
  └──────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  L4  ANCHOR                                                  │
  │   → anchorRoot(merkle_root, ipfs_cid) on-chain               │
  │   Output: tx_hash, block_number, timestamp                   │
  └──────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │                  PUBLICATION MANIFEST                         │
  │   Complete, verifiable proof of publication                   │
  │   Retrievable via IPFS CID · Anchored on-chain               │
  └──────────────────────────────────────────────────────────────┘
`}</pre>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {[
                { label: "Deterministic", desc: "Same content always produces the same proof, regardless of when or where it's processed." },
                { label: "Verifiable", desc: "Any party can independently verify the proof with only the content and manifest CID." },
                { label: "Permanent", desc: "IPFS storage + on-chain anchoring ensure the proof persists indefinitely." },
              ].map((item) => (
                <Card key={item.label} variant="bordered" className="p-5">
                  <CardContent>
                    <h3 className="text-sm font-semibold text-gold mb-1 font-mono">{item.label}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
