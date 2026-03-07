import type { Metadata } from "next";
import { BRAND, LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Specification",
  description: "Full LPS-1 protocol specification — the open standard for verifiable digital publishing.",
};

export default function SpecPage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ TITLE BLOCK ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow">
            <div className="text-center mb-10">
              <Badge variant="gold" size="md" className="mb-4">Version 1.0</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                LPS-1 Specification
              </h1>
              <p className="text-text-secondary text-lg">
                Literary Publishing Standard — Revision 1.0
              </p>
              <p className="text-text-muted text-sm font-mono mt-2">
                Published by XXXIII.IO · Status: <span className="text-green">ACTIVE</span>
              </p>
            </div>

            {/* Table of Contents */}
            <Card variant="bordered" className="p-6">
              <CardContent>
                <h2 className="text-sm font-mono text-gold tracking-wider uppercase mb-4">Table of Contents</h2>
                <nav className="space-y-1 font-mono text-sm">
                  {[
                    { id: "abstract", label: "1. Abstract" },
                    { id: "overview", label: "2. Protocol Overview" },
                    { id: "layers", label: "3. Layer Specification" },
                    { id: "data-structures", label: "4. Data Structures" },
                    { id: "manifest-schema", label: "5. Manifest Schema" },
                    { id: "verification", label: "6. Verification Algorithm" },
                    { id: "compliance", label: "7. Compliance Requirements" },
                  ].map((item) => (
                    <a key={item.id} href={`#${item.id}`} className="block text-text-secondary hover:text-gold transition-colors">
                      {item.label}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </Container>
        </section>

        {/* ═══ 1. ABSTRACT ═══ */}
        <section id="abstract" className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">1. Abstract</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                LPS-1 (Literary Publishing Standard, Revision 1) defines a deterministic, six-layer protocol
                for establishing verifiable authorship, content integrity, and AI disclosure for digital
                published works. The protocol operates without reliance on centralized authorities, platform-specific
                APIs, or trusted third parties.
              </p>
              <p>
                By combining content normalization, cryptographic hashing (SHA-256), Merkle tree construction,
                decentralized storage (IPFS), on-chain anchoring (Ethereum / Polygon), and structured AI disclosure
                metadata, LPS-1 produces a tamper-evident, machine-auditable, and permanently retrievable proof
                of publication.
              </p>
              <p>
                This specification is intended for implementers, platform developers, archivists, publishers,
                and regulatory bodies seeking a common standard for digital content provenance in the age of
                generative AI.
              </p>
            </div>
          </Container>
        </section>

        {/* ═══ 2. PROTOCOL OVERVIEW ═══ */}
        <section id="overview" className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">2. Protocol Overview</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                LPS-1 processes a digital work through six sequential layers (L0–L5). Each layer accepts the
                output of the preceding layer and produces a deterministic, verifiable artifact. The composition
                of all layer outputs constitutes a <em className="text-text-primary">Publication Manifest</em> — a
                self-contained proof package.
              </p>
              <p>
                The protocol is designed for <strong className="text-text-primary">unidirectional processing</strong>:
                content enters at L0 and produces a final anchored proof at L4. L5 (AI Disclosure) operates as an
                orthogonal metadata layer that can be attached at any point during processing.
              </p>
            </div>

            <div className="mt-8 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm text-text-secondary overflow-x-auto">
              <pre>{`┌─────────────────────────────────────────────────────────────┐
│                    LPS-1 PROTOCOL FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Raw Content                                               │
│       │                                                     │
│       ▼                                                     │
│   ┌──────────────────┐                                      │
│   │  L0  Normalize   │  → Canonical UTF-8 text              │
│   └──────────────────┘                                      │
│       │                                                     │
│       ▼                                                     │
│   ┌──────────────────┐                                      │
│   │  L1  Hash        │  → SHA-256 content hash              │
│   └──────────────────┘                                      │
│       │                                                     │
│       ▼                                                     │
│   ┌──────────────────┐                                      │
│   │  L2  Merkle      │  → Merkle root + proof tree          │
│   └──────────────────┘                                      │
│       │                                                     │
│       ▼                                                     │
│   ┌──────────────────┐                                      │
│   │  L3  Store       │  → IPFS CID (content-addressed)      │
│   └──────────────────┘                                      │
│       │                                                     │
│       ▼                                                     │
│   ┌──────────────────┐                                      │
│   │  L4  Anchor      │  → On-chain transaction hash         │
│   └──────────────────┘                                      │
│                                                             │
│   ┌──────────────────┐                                      │
│   │  L5  AI Disclose │  → AI usage metadata (orthogonal)    │
│   └──────────────────┘                                      │
│                                                             │
│   Output: Publication Manifest (JSON)                       │
└─────────────────────────────────────────────────────────────┘`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ 3. LAYER SPECIFICATION ═══ */}
        <section id="layers" className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-8 font-mono">3. Layer Specification</h2>

            {/* L0 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-mono font-bold text-sm">L0</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Content Normalization</h3>
              </div>
              <div className="space-y-3 text-text-secondary leading-relaxed pl-[52px]">
                <p>
                  L0 transforms raw input content into a canonical, deterministic representation. This ensures
                  that identical semantic content always produces the same downstream outputs regardless of
                  encoding, whitespace, or platform formatting differences.
                </p>
                <h4 className="text-text-primary font-semibold text-sm">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Convert all text to UTF-8 encoding (NFC normalization)</li>
                  <li>Collapse all whitespace sequences to single spaces</li>
                  <li>Trim leading and trailing whitespace from each line</li>
                  <li>Normalize line endings to <code className="text-gold font-mono text-xs">\n</code> (LF)</li>
                  <li>Strip BOM (Byte Order Mark) if present</li>
                  <li>Remove null bytes and control characters (except newlines)</li>
                  <li>Output: canonical text string</li>
                </ul>
              </div>
            </div>

            {/* L1 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-mono font-bold text-sm">L1</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Cryptographic Hashing (SHA-256)</h3>
              </div>
              <div className="space-y-3 text-text-secondary leading-relaxed pl-[52px]">
                <p>
                  L1 computes a SHA-256 hash of the L0-normalized content. This hash serves as the unique,
                  collision-resistant fingerprint of the work. Any modification to the content — even a single
                  character — produces a completely different hash.
                </p>
                <h4 className="text-text-primary font-semibold text-sm">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Algorithm: SHA-256 (FIPS 180-4)</li>
                  <li>Input: L0-normalized UTF-8 byte sequence</li>
                  <li>Output: 64-character lowercase hexadecimal string</li>
                  <li>The hash MUST be computed over the raw byte representation, not a string encoding</li>
                </ul>
                <div className="mt-4 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-text-muted">{`# Example
Input:  "The quick brown fox jumps over the lazy dog"
Output: d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592`}</pre>
                </div>
              </div>
            </div>

            {/* L2 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-mono font-bold text-sm">L2</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Merkle Tree Construction</h3>
              </div>
              <div className="space-y-3 text-text-secondary leading-relaxed pl-[52px]">
                <p>
                  L2 constructs a binary Merkle tree from the content sections (chapters, articles, or logical
                  divisions of the work). The Merkle root provides a single hash that commits to the integrity
                  of every individual section. This enables selective verification — a verifier can prove a
                  single chapter belongs to the work without processing the entire document.
                </p>
                <h4 className="text-text-primary font-semibold text-sm">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Leaf nodes: SHA-256 hash of each content section (post-L0 normalization)</li>
                  <li>Internal nodes: SHA-256(left_child || right_child)</li>
                  <li>If odd number of leaves, duplicate the last leaf</li>
                  <li>Tree depth MUST be recorded in the manifest</li>
                  <li>Output: Merkle root hash (64-character hex), proof paths for each leaf</li>
                </ul>
                <div className="mt-4 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-text-muted">{`           ┌──────────┐
           │  Root    │  ← Merkle Root (recorded on-chain)
           └────┬─────┘
          ┌─────┴─────┐
     ┌────┴───┐  ┌────┴───┐
     │  H(AB) │  │  H(CD) │
     └───┬────┘  └───┬────┘
    ┌────┴──┐   ┌────┴──┐
    │ H(A)  │   │ H(C)  │
    │ H(B)  │   │ H(D)  │
    └───────┘   └───────┘
    Sections:   A   B   C   D`}</pre>
                </div>
              </div>
            </div>

            {/* L3 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-mono font-bold text-sm">L3</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">IPFS Storage</h3>
              </div>
              <div className="space-y-3 text-text-secondary leading-relaxed pl-[52px]">
                <p>
                  L3 pins the Publication Manifest and optionally the normalized content to IPFS (InterPlanetary
                  File System). IPFS provides content-addressed storage — the CID (Content Identifier) is derived
                  from the content itself, making retrieval trustless and tamper-evident.
                </p>
                <h4 className="text-text-primary font-semibold text-sm">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Pin the Publication Manifest JSON to IPFS</li>
                  <li>Optionally pin the L0-normalized content</li>
                  <li>Use CIDv1 with dag-pb or raw codec</li>
                  <li>Record the manifest CID in the on-chain anchor</li>
                  <li>Recommended: pin to at least 2 independent pinning services</li>
                  <li>Output: IPFS CID (e.g., <code className="text-gold font-mono text-xs">bafybeigdyrzt5sfp7...</code>)</li>
                </ul>
              </div>
            </div>

            {/* L4 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-mono font-bold text-sm">L4</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">On-Chain Anchoring</h3>
              </div>
              <div className="space-y-3 text-text-secondary leading-relaxed pl-[52px]">
                <p>
                  L4 anchors the Merkle root and IPFS CID to a public blockchain. This creates an immutable,
                  timestamped record that proves the content existed in its exact form at a specific point in
                  time. The on-chain anchor is the final, irrefutable proof of publication.
                </p>
                <h4 className="text-text-primary font-semibold text-sm">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Call the LPS-1 Registry Contract's <code className="text-gold font-mono text-xs">anchorRoot()</code> function</li>
                  <li>Parameters: Merkle root hash, IPFS CID, content metadata hash</li>
                  <li>Supported chains: Ethereum Mainnet, Polygon PoS</li>
                  <li>Record the transaction hash and block number in the manifest</li>
                  <li>Output: transaction hash, block number, chain ID</li>
                </ul>
              </div>
            </div>

            {/* L5 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-mono font-bold text-sm">L5</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">AI Disclosure</h3>
              </div>
              <div className="space-y-3 text-text-secondary leading-relaxed pl-[52px]">
                <p>
                  L5 provides a structured, machine-readable declaration of AI involvement in the creation
                  of the work. This layer is orthogonal to L0–L4 and can be attached at any point during
                  processing. It enables automated compliance checks and transparent provenance tracking.
                </p>
                <h4 className="text-text-primary font-semibold text-sm">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Declare AI usage: <code className="text-gold font-mono text-xs">none</code>, <code className="text-gold font-mono text-xs">assisted</code>, <code className="text-gold font-mono text-xs">generated</code>, or <code className="text-gold font-mono text-xs">mixed</code></li>
                  <li>If AI was used, specify: model identifier, provider, usage scope</li>
                  <li>Declare human intervention ratio (0.0–1.0)</li>
                  <li>List specific sections where AI was involved</li>
                  <li>Output: structured AI disclosure object in the manifest</li>
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* ═══ 4. DATA STRUCTURES ═══ */}
        <section id="data-structures" className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">4. Data Structures</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                LPS-1 defines the following core data structures. All structures are serialized as JSON
                and MUST conform to the schemas specified below.
              </p>
            </div>

            <div className="mt-6 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-text-muted mb-2">// ContentHash</div>
              <pre className="text-text-secondary">{`interface ContentHash {
  algorithm: "sha256";
  value: string;        // 64-char hex
  encoding: "utf-8";
  normalized: boolean;  // true if L0 normalization was applied
}`}</pre>
            </div>

            <div className="mt-4 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-text-muted mb-2">// MerkleProof</div>
              <pre className="text-text-secondary">{`interface MerkleProof {
  root: string;               // Merkle root hash (64-char hex)
  depth: number;              // Tree depth
  leafCount: number;          // Number of leaf nodes
  leaves: ContentHash[];      // Ordered leaf hashes
  proofs: ProofPath[];        // Proof paths for each leaf
}

interface ProofPath {
  leaf: string;               // Leaf hash
  siblings: SiblingNode[];    // Sibling hashes along path to root
  index: number;              // Leaf index
}

interface SiblingNode {
  hash: string;
  position: "left" | "right";
}`}</pre>
            </div>

            <div className="mt-4 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-text-muted mb-2">// AnchorRecord</div>
              <pre className="text-text-secondary">{`interface AnchorRecord {
  chain: "ethereum" | "polygon";
  chainId: number;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;          // Unix timestamp from block
  merkleRoot: string;
  ipfsCid: string;
}`}</pre>
            </div>

            <div className="mt-4 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-text-muted mb-2">// AIDisclosure</div>
              <pre className="text-text-secondary">{`interface AIDisclosure {
  usage: "none" | "assisted" | "generated" | "mixed";
  models?: AIModelEntry[];
  humanInterventionRatio: number;  // 0.0 to 1.0
  sections?: AISectionEntry[];
  statement?: string;              // Human-readable disclosure
}

interface AIModelEntry {
  provider: string;           // e.g., "OpenAI"
  model: string;              // e.g., "gpt-4-turbo"
  scope: string;              // e.g., "drafting", "editing", "research"
}

interface AISectionEntry {
  sectionIndex: number;
  usage: "none" | "assisted" | "generated";
  model?: string;
}`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ 5. MANIFEST SCHEMA ═══ */}
        <section id="manifest-schema" className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">5. Manifest Schema</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed mb-6">
              <p>
                The Publication Manifest is the final output of the LPS-1 pipeline. It encapsulates all layer
                outputs into a single JSON document that can be independently verified.
              </p>
            </div>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`{
  "lps": "1.0",
  "id": "lps1_a1b2c3d4e5f6...",
  "created": "2026-03-01T00:00:00.000Z",
  "content": {
    "title": "On the Nature of Digital Permanence",
    "author": "Elena Vasquez",
    "type": "article",
    "sections": 4,
    "wordCount": 3842,
    "language": "en"
  },
  "l0": {
    "normalized": true,
    "encoding": "utf-8",
    "normalization": "NFC",
    "byteLength": 22451
  },
  "l1": {
    "algorithm": "sha256",
    "hash": "a3f2b8c91d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
  },
  "l2": {
    "root": "b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4",
    "depth": 3,
    "leafCount": 4,
    "leaves": [
      "e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
      "f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
      "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
      "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5"
    ]
  },
  "l3": {
    "ipfsCid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "pinned": true,
    "pinServices": ["Pinata", "web3.storage"]
  },
  "l4": {
    "chain": "polygon",
    "chainId": 137,
    "contractAddress": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "blockNumber": 52341267,
    "timestamp": 1709251200
  },
  "l5": {
    "usage": "assisted",
    "models": [
      {
        "provider": "Anthropic",
        "model": "claude-3-opus",
        "scope": "research and fact-checking"
      }
    ],
    "humanInterventionRatio": 0.85,
    "statement": "AI was used for research assistance. All writing and editorial decisions were made by the author."
  },
  "signature": {
    "manifest_hash": "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
  }
}`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ 6. VERIFICATION ALGORITHM ═══ */}
        <section id="verification" className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">6. Verification Algorithm</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Verification is the process of independently confirming that a work's claimed provenance is
                authentic. A verifier needs only the original content and the Publication Manifest (or its
                IPFS CID) to perform full verification.
              </p>
            </div>

            <div className="mt-6 bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`VERIFY(content, manifest):

  // Step 1: Normalize content
  normalized ← L0_NORMALIZE(content)

  // Step 2: Compute content hash
  hash ← SHA256(normalized)
  ASSERT hash == manifest.l1.hash
    → "Content hash mismatch: content has been modified"

  // Step 3: Verify Merkle inclusion
  sections ← SPLIT_SECTIONS(normalized)
  FOR EACH section IN sections:
    leaf ← SHA256(section)
    proof ← manifest.l2.proofs[section.index]
    ASSERT VERIFY_MERKLE_PROOF(leaf, proof, manifest.l2.root)
      → "Merkle proof failed for section {section.index}"

  // Step 4: Retrieve from IPFS
  ipfs_manifest ← IPFS_GET(manifest.l3.ipfsCid)
  ASSERT ipfs_manifest == manifest
    → "IPFS manifest does not match provided manifest"

  // Step 5: Verify on-chain anchor
  anchor ← CONTRACT_CALL(
    manifest.l4.contractAddress,
    "getAnchor",
    manifest.l2.root
  )
  ASSERT anchor.merkleRoot == manifest.l2.root
    → "On-chain anchor not found or mismatched"
  ASSERT anchor.ipfsCid == manifest.l3.ipfsCid
    → "On-chain IPFS CID mismatch"
  ASSERT anchor.timestamp <= manifest.l4.timestamp
    → "Timestamp inconsistency"

  // Step 6: Validate AI disclosure (if present)
  IF manifest.l5:
    ASSERT manifest.l5.usage IN ["none","assisted","generated","mixed"]
    ASSERT 0.0 <= manifest.l5.humanInterventionRatio <= 1.0
    IF manifest.l5.usage == "none":
      ASSERT manifest.l5.humanInterventionRatio == 1.0

  RETURN VERIFIED ✓`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ 7. COMPLIANCE REQUIREMENTS ═══ */}
        <section id="compliance" className="py-16">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">7. Compliance Requirements</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed mb-8">
              <p>
                LPS-1 defines three compliance tiers. Implementations MUST declare which tier they target
                and MUST satisfy all requirements of that tier.
              </p>
            </div>

            <div className="space-y-4">
              <Card variant="bordered" className="p-6">
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline">Minimum</Badge>
                    <span className="text-text-primary font-semibold">L0–L2: Content Integrity</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Content normalization, SHA-256 hashing, and Merkle tree construction. Proves content integrity
                    but does not provide permanent storage or timestamping. Suitable for internal workflows and
                    draft verification.
                  </p>
                </CardContent>
              </Card>

              <Card variant="bordered" className="p-6">
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="gold">Recommended</Badge>
                    <span className="text-text-primary font-semibold">L0–L4: Full Provenance</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Adds IPFS storage and on-chain anchoring to the minimum tier. Provides permanent, independently
                    verifiable proof of publication with immutable timestamps. Recommended for all public publications.
                  </p>
                </CardContent>
              </Card>

              <Card variant="bordered" className="p-6">
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="green">Complete</Badge>
                    <span className="text-text-primary font-semibold">L0–L5: Full Provenance + AI Disclosure</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Includes all layers plus structured AI disclosure metadata. Required for works that involve
                    any AI assistance. Recommended for all new publications to establish comprehensive provenance
                    records for the AI era.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 border-t border-border-subtle pt-8">
              <p className="text-text-muted text-xs font-mono">
                LPS-1 Specification v1.0 · Published by XXXIII.IO · This specification is released under the
                MIT License and may be freely implemented by any party.
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
