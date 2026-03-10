import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge, Button } from "@xxxiii/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Implementation Guide",
  description: "Step-by-step developer guide for integrating LPS-1 into your application.",
};

export default function ImplementPage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Developer Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Implement LPS-1
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              A step-by-step guide for integrating the LPS-1 protocol into your publishing
              platform, application, or workflow. TypeScript examples throughout.
            </p>
          </Container>
        </section>

        {/* ═══ PREREQUISITES ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">0</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Prerequisites</h2>
            </div>

            <div className="space-y-3 text-text-secondary leading-relaxed mb-6">
              <p>Before you begin, ensure you have the following:</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: "Node.js", version: "≥ 18.0", desc: "Runtime for the TypeScript SDK" },
                { name: "npm or pnpm", version: "Latest", desc: "Package manager for dependency installation" },
                { name: "IPFS Pinning API Key", version: "Pinata / web3.storage", desc: "Required for L3 (IPFS storage)" },
                { name: "Ethereum Wallet", version: "Private key", desc: "Required for L4 (on-chain anchoring)" },
              ].map((item) => (
                <Card key={item.name} variant="bordered" className="p-4">
                  <CardContent>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                      <Badge variant="outline" size="sm">{item.version}</Badge>
                    </div>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ STEP 1: INSTALLATION ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">1</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Installation</h2>
            </div>

            <p className="text-text-secondary mb-4">Install the LPS-1 SDK and CLI tools.</p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm mb-6 overflow-x-auto">
              <pre className="text-text-secondary">{`# Install the SDK for programmatic use
npm install @lps1/sdk

# Install the CLI for command-line publishing
npm install -g @lps1/cli

# Verify installation
lps --version
# → @lps1/cli v1.0.0`}</pre>
            </div>

            <p className="text-text-secondary mb-4">Configure environment variables:</p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`# .env
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=0x_your_wallet_private_key

# Optional: Ethereum mainnet (higher gas costs)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 2: CONTENT PREPARATION ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">2</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Content Preparation</h2>
            </div>

            <p className="text-text-secondary mb-4">
              Load your content and define its metadata. LPS-1 works with any text content — articles,
              chapters, research papers, or entire books.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import fs from "fs";
import { LPS, type ContentMetadata, type AIDisclosure } from "@lps1/sdk";

// Load content — can be a single file or multiple sections
const content = fs.readFileSync("my-article.md", "utf-8");

// Define metadata
const metadata: ContentMetadata = {
  title: "The Future of Digital Publishing",
  author: "Your Name",
  type: "article",                    // "article" | "book" | "paper" | "report"
  language: "en",
  sections: [                         // Optional: define logical sections
    { title: "Introduction", start: 0 },
    { title: "Background", start: 1024 },
    { title: "Analysis", start: 3072 },
    { title: "Conclusion", start: 5120 },
  ],
};

// Define AI disclosure
const aiDisclosure: AIDisclosure = {
  usage: "none",                       // "none" | "assisted" | "generated" | "mixed"
  humanInterventionRatio: 1.0,         // 1.0 = fully human
  statement: "This work was written entirely by the author without AI assistance.",
};`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 3: NORMALIZE & HASH ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">3</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Normalize & Hash (L0–L1)</h2>
            </div>

            <p className="text-text-secondary mb-4">
              Normalize the content to its canonical form, then compute the SHA-256 hash.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import { normalize, hash } from "@lps1/sdk";

// L0: Normalize content
const normalized = normalize(content);
console.log("Normalized byte length:", Buffer.byteLength(normalized, "utf-8"));
// → Normalized byte length: 6234

// L1: Compute SHA-256 hash
const contentHash = hash(normalized);
console.log("Content hash:", contentHash);
// → Content hash: a3f2b8c91d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0

// You can also normalize and hash each section individually
const sections = splitSections(normalized, metadata.sections);
const sectionHashes = sections.map((section) => hash(section));
console.log("Section hashes:", sectionHashes);`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 4: MERKLE TREE ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">4</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Build Merkle Tree (L2)</h2>
            </div>

            <p className="text-text-secondary mb-4">
              Construct a binary Merkle tree from the section hashes. The Merkle root commits
              to every section's integrity in a single hash.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import { buildMerkleTree } from "@lps1/sdk";

// Build the Merkle tree from section hashes
const tree = buildMerkleTree(sectionHashes);

console.log("Merkle root:", tree.root);
// → Merkle root: b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4

console.log("Tree depth:", tree.depth);
// → Tree depth: 3

console.log("Leaf count:", tree.leafCount);
// → Leaf count: 4

// Verify a specific section's proof
const proofValid = tree.verifyProof(0); // Verify section 0
console.log("Section 0 proof valid:", proofValid);
// → Section 0 proof valid: true

// Get the proof path for a section (useful for selective verification)
const proofPath = tree.getProofPath(0);
console.log("Proof path:", JSON.stringify(proofPath, null, 2));`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 5: IPFS PINNING ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">5</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Pin to IPFS (L3)</h2>
            </div>

            <p className="text-text-secondary mb-4">
              Pin the publication manifest to IPFS for permanent, decentralized storage.
              The CID becomes the universal identifier for this publication's proof.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import { composeManifest, pinToIPFS } from "@lps1/sdk";

// Compose the manifest from all layer outputs
const manifest = composeManifest({
  content: metadata,
  l0: { normalized: true, encoding: "utf-8", byteLength: Buffer.byteLength(normalized) },
  l1: { algorithm: "sha256", hash: contentHash },
  l2: { root: tree.root, depth: tree.depth, leafCount: tree.leafCount, leaves: sectionHashes },
  l5: aiDisclosure,
});

// Pin to IPFS
const ipfsResult = await pinToIPFS(manifest, {
  gateway: "https://gateway.pinata.cloud",
  apiKey: process.env.PINATA_API_KEY!,
  secretKey: process.env.PINATA_SECRET_KEY!,
  pinName: \`lps1_\${manifest.id}\`,
});

console.log("IPFS CID:", ipfsResult.cid);
// → IPFS CID: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi

console.log("Gateway URL:", ipfsResult.gatewayUrl);
// → Gateway URL: https://gateway.pinata.cloud/ipfs/bafybeigdyrzt5sfp7...`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 6: ON-CHAIN ANCHORING ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">6</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Anchor On-Chain (L4)</h2>
            </div>

            <p className="text-text-secondary mb-4">
              Anchor the Merkle root and IPFS CID on-chain. This creates the immutable timestamp
              proof — the final layer of the LPS-1 pipeline.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import { anchorOnChain } from "@lps1/sdk";

// Anchor on Polygon (recommended — lower gas costs)
const anchor = await anchorOnChain({
  merkleRoot: tree.root,
  ipfsCid: ipfsResult.cid,
  metadataHash: hash(JSON.stringify(metadata)),
  chain: "polygon",
  rpcUrl: process.env.POLYGON_RPC_URL!,
  privateKey: process.env.PRIVATE_KEY!,
});

console.log("Transaction hash:", anchor.txHash);
// → Transaction hash: 0xabcdef1234567890...

console.log("Block number:", anchor.blockNumber);
// → Block number: 52341267

console.log("Timestamp:", new Date(anchor.timestamp * 1000).toISOString());
// → Timestamp: 2026-03-01T12:00:00.000Z

// Update manifest with anchor data
manifest.l3 = { ipfsCid: ipfsResult.cid, pinned: true, pinServices: ["Pinata"] };
manifest.l4 = {
  chain: "polygon",
  chainId: 137,
  contractAddress: anchor.contractAddress,
  transactionHash: anchor.txHash,
  blockNumber: anchor.blockNumber,
  timestamp: anchor.timestamp,
};`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 7: VERIFICATION ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">7</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Verify Publication</h2>
            </div>

            <p className="text-text-secondary mb-4">
              After publishing, verify the work to confirm all layers are intact. This is the same
              process any third party would use to verify your publication.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import { LPSVerifier } from "@lps1/sdk";

const verifier = new LPSVerifier({
  ipfsGateway: "https://gateway.pinata.cloud",
  rpcUrl: process.env.POLYGON_RPC_URL!,
});

// Full verification — all 6 layers
const result = await verifier.verify({
  content: fs.readFileSync("my-article.md", "utf-8"),
  manifestCid: ipfsResult.cid,
});

if (result.verified) {
  console.log("✓ Publication verified successfully");
  console.log("  Content hash:", result.layers.l1.hash);
  console.log("  Merkle root:", result.layers.l2.root);
  console.log("  IPFS CID:", result.layers.l3.cid);
  console.log("  Block:", result.layers.l4.blockNumber);
  console.log("  AI usage:", result.layers.l5?.usage || "not declared");
} else {
  console.error("✗ Verification failed");
  for (const failure of result.failures) {
    console.error(\`  \${failure.layer}: \${failure.message}\`);
  }
}`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ STEP 8: COMPLETE EXAMPLE ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-mono text-xs font-bold">★</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary font-mono">Complete Example</h2>
            </div>

            <p className="text-text-secondary mb-4">
              Here's the entire LPS-1 publishing pipeline in a single script:
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import fs from "fs";
import { LPS } from "@lps1/sdk";
import "dotenv/config";

async function publish() {
  // Initialize LPS client
  const lps = new LPS({
    ipfs: {
      gateway: "https://gateway.pinata.cloud",
      apiKey: process.env.PINATA_API_KEY!,
      secretKey: process.env.PINATA_SECRET_KEY!,
    },
    chain: {
      network: "polygon",
      rpcUrl: process.env.POLYGON_RPC_URL!,
      privateKey: process.env.PRIVATE_KEY!,
    },
  });

  // Publish — handles all 6 layers automatically
  const manifest = await lps.publish({
    content: fs.readFileSync("my-article.md", "utf-8"),
    metadata: {
      title: "The Future of Digital Publishing",
      author: "Your Name",
      type: "article",
    },
    aiDisclosure: {
      usage: "assisted",
      humanInterventionRatio: 0.9,
      models: [
        { provider: "Anthropic", model: "claude-3-opus", scope: "research" },
      ],
      statement: "AI was used for research assistance only.",
    },
  });

  // Output
  console.log("═══════════════════════════════════════");
  console.log("  LPS-1 Publication Complete");
  console.log("═══════════════════════════════════════");
  console.log(\`  Title:       \${manifest.content.title}\`);
  console.log(\`  Hash:        \${manifest.l1.hash}\`);
  console.log(\`  Merkle Root: \${manifest.l2.root}\`);
  console.log(\`  IPFS CID:    \${manifest.l3.ipfsCid}\`);
  console.log(\`  Tx Hash:     \${manifest.l4.transactionHash}\`);
  console.log(\`  Block:       \${manifest.l4.blockNumber}\`);
  console.log(\`  AI Usage:    \${manifest.l5.usage}\`);
  console.log("═══════════════════════════════════════");

  // Save manifest locally
  fs.writeFileSync(
    "manifest.json",
    JSON.stringify(manifest, null, 2)
  );
  console.log("Manifest saved to manifest.json");
}

publish().catch(console.error);`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ BEST PRACTICES ═══ */}
        <section className="py-16">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-8 font-mono">Best Practices</h2>

            <div className="space-y-4">
              {[
                {
                  title: "Always normalize before hashing",
                  desc: "Never hash raw content directly. L0 normalization ensures deterministic results regardless of source encoding or formatting.",
                },
                {
                  title: "Pin to multiple IPFS services",
                  desc: "Use at least two independent pinning services (e.g., Pinata + web3.storage) to ensure content permanence. A single pinning service is a single point of failure.",
                },
                {
                  title: "Use Polygon for cost efficiency",
                  desc: "Polygon PoS offers significantly lower gas costs (~$0.01 per anchor) compared to Ethereum Mainnet (~$2-5). Use Ethereum only when maximum security is required.",
                },
                {
                  title: "Store manifests alongside content",
                  desc: "Keep a local copy of every Publication Manifest. While the manifest is on IPFS, maintaining a local backup ensures you can always verify and re-pin if needed.",
                },
                {
                  title: "Disclose AI usage honestly",
                  desc: "LPS-1 is a trust protocol. Inaccurate AI disclosure undermines the entire system. When in doubt, declare 'assisted' with a detailed scope description.",
                },
                {
                  title: "Version your content before publishing",
                  desc: "Once a work is published through LPS-1, any modification creates a new, different hash. Treat publication as a finalization step — edits require a new publication.",
                },
                {
                  title: "Verify after publishing",
                  desc: "Always run verification after publishing to confirm every layer was processed correctly. This catches IPFS propagation delays and on-chain confirmation issues.",
                },
                {
                  title: "Keep your private key secure",
                  desc: "The wallet used for on-chain anchoring is associated with your publication history. Protect it like any other signing key — use hardware wallets for production.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-0.5">
                    <span className="text-gold font-mono text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                    <p className="text-text-muted text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-border-subtle text-center">
              <p className="text-text-secondary text-sm mb-6">
                Ready to start building? Check the reference implementations for production-ready code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/reference">
                  <Button variant="gold" size="lg">
                    Reference Implementations
                  </Button>
                </Link>
                <a href="https://github.com/xxxiii-io" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
