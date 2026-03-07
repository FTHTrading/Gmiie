import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge, Button } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Reference Implementations",
  description: "Official LPS-1 reference implementations — TypeScript CLI, Python library, and Solidity contracts.",
};

const IMPLEMENTATIONS = [
  {
    name: "TypeScript / Node.js CLI",
    package: "@lps1/cli",
    repo: "https://github.com/xxxiii-io/lps-cli",
    language: "TypeScript",
    badge: "gold" as const,
    description: "Full-featured CLI for publishing and verifying LPS-1 works. Covers all six layers including IPFS pinning and on-chain anchoring.",
    install: `# Install globally
npm install -g @lps1/cli

# Or add to project
npm install @lps1/sdk`,
    quickstart: `import { LPS } from "@lps1/sdk";

const lps = new LPS({
  ipfs: { gateway: "https://gateway.pinata.cloud", apiKey: process.env.PINATA_KEY },
  chain: { rpcUrl: "https://polygon-rpc.com", privateKey: process.env.PRIVATE_KEY },
});

// Publish a work
const manifest = await lps.publish({
  content: fs.readFileSync("article.md", "utf-8"),
  metadata: {
    title: "My Article",
    author: "Author Name",
    type: "article",
  },
  aiDisclosure: {
    usage: "none",
    humanInterventionRatio: 1.0,
  },
});

console.log(manifest.l3.ipfsCid);  // IPFS CID
console.log(manifest.l4.txHash);   // On-chain tx hash`,
  },
  {
    name: "Python Library",
    package: "lps1",
    repo: "https://github.com/xxxiii-io/lps-python",
    language: "Python",
    badge: "blue" as const,
    description: "Python implementation of the LPS-1 protocol. Ideal for scripting, data pipelines, and integration with research workflows.",
    install: `# Install via pip
pip install lps1

# With IPFS and chain support
pip install lps1[full]`,
    quickstart: `from lps1 import LPS, AIDisclosure

lps = LPS(
    ipfs_gateway="https://gateway.pinata.cloud",
    ipfs_api_key=os.environ["PINATA_KEY"],
    rpc_url="https://polygon-rpc.com",
    private_key=os.environ["PRIVATE_KEY"],
)

# Publish a work
with open("article.md", "r") as f:
    content = f.read()

manifest = lps.publish(
    content=content,
    title="My Article",
    author="Author Name",
    ai_disclosure=AIDisclosure(
        usage="assisted",
        human_intervention_ratio=0.9,
        models=[{"provider": "Anthropic", "model": "claude-3", "scope": "research"}],
    ),
)

print(f"IPFS CID: {manifest.l3.ipfs_cid}")
print(f"Tx Hash:  {manifest.l4.tx_hash}")`,
  },
  {
    name: "Solidity Contracts",
    package: "@lps1/contracts",
    repo: "https://github.com/xxxiii-io/lps-contracts",
    language: "Solidity",
    badge: "purple" as const,
    description: "Verified smart contracts for the LPS-1 on-chain registry. Deployed on Ethereum Mainnet and Polygon PoS.",
    install: `# Install via npm (for integration)
npm install @lps1/contracts

# Clone for development
git clone https://github.com/xxxiii-io/lps-contracts.git
cd lps-contracts
npm install`,
    quickstart: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@lps1/contracts/ILPSRegistry.sol";

contract MyPublisher {
    ILPSRegistry public immutable registry;

    constructor(address _registry) {
        registry = ILPSRegistry(_registry);
    }

    function publishWork(
        bytes32 merkleRoot,
        string calldata ipfsCid,
        bytes32 metadataHash
    ) external {
        registry.anchorRoot(merkleRoot, ipfsCid, metadataHash);
    }

    function checkWork(bytes32 merkleRoot) external view returns (bool) {
        return registry.verifyRoot(merkleRoot);
    }
}`,
  },
];

export default function ReferencePage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Implementations
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Reference Implementations
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Official, audited implementations of the LPS-1 protocol. Open source, permissively
              licensed, and ready for production use.
            </p>
          </Container>
        </section>

        {/* ═══ IMPLEMENTATIONS ═══ */}
        {IMPLEMENTATIONS.map((impl, i) => (
          <section key={impl.package} className={`py-16 ${i < IMPLEMENTATIONS.length - 1 ? "border-b border-border-subtle" : ""}`}>
            <Container size="narrow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-text-primary">{impl.name}</h2>
                <Badge variant={impl.badge} size="sm">{impl.language}</Badge>
              </div>
              <p className="text-text-secondary mb-4">{impl.description}</p>
              <div className="flex gap-3 mb-8">
                <a
                  href={impl.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold hover:text-gold-light transition-colors font-mono"
                >
                  GitHub →
                </a>
                <span className="text-border">|</span>
                <span className="text-sm text-text-muted font-mono">{impl.package}</span>
              </div>

              {/* Install */}
              <h3 className="text-sm font-mono text-gold uppercase tracking-wider mb-3">Installation</h3>
              <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm mb-8 overflow-x-auto">
                <pre className="text-text-secondary">{impl.install}</pre>
              </div>

              {/* Quick Start */}
              <h3 className="text-sm font-mono text-gold uppercase tracking-wider mb-3">Quick Start</h3>
              <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-text-secondary">{impl.quickstart}</pre>
              </div>
            </Container>
          </section>
        ))}

        {/* ═══ COMMON OPERATIONS ═══ */}
        <section className="py-16 border-t border-border-subtle">
          <Container size="narrow">
            <div className="text-center mb-12">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Operations
              </span>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Common Operations
              </h2>
              <p className="text-text-secondary">
                Code snippets for the most common LPS-1 operations using the TypeScript SDK.
              </p>
            </div>

            {/* Hash content */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Hash Content (L0 → L1)</h3>
              <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-text-secondary">{`import { normalize, hash } from "@lps1/sdk";

const raw = fs.readFileSync("chapter-01.md", "utf-8");
const normalized = normalize(raw);       // L0: canonical UTF-8
const contentHash = hash(normalized);     // L1: SHA-256
// → "a3f2b8c91d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"`}</pre>
              </div>
            </div>

            {/* Build Merkle tree */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Build Merkle Tree (L2)</h3>
              <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-text-secondary">{`import { buildMerkleTree } from "@lps1/sdk";

const sectionHashes = [
  hash(normalize(chapter1)),
  hash(normalize(chapter2)),
  hash(normalize(chapter3)),
  hash(normalize(chapter4)),
];

const tree = buildMerkleTree(sectionHashes);
console.log(tree.root);       // Merkle root hash
console.log(tree.depth);      // 3
console.log(tree.proofs[0]);  // Proof path for chapter 1`}</pre>
              </div>
            </div>

            {/* Pin to IPFS */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Pin to IPFS (L3)</h3>
              <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-text-secondary">{`import { pinToIPFS } from "@lps1/sdk";

const cid = await pinToIPFS(manifest, {
  gateway: "https://gateway.pinata.cloud",
  apiKey: process.env.PINATA_KEY!,
  pinName: \`lps1_\${manifest.id}\`,
});
// → "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"`}</pre>
              </div>
            </div>

            {/* Anchor on-chain */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Anchor On-Chain (L4)</h3>
              <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-text-secondary">{`import { anchorOnChain } from "@lps1/sdk";

const anchor = await anchorOnChain({
  merkleRoot: tree.root,
  ipfsCid: cid,
  metadataHash: hash(JSON.stringify(manifest.content)),
  chain: "polygon",
  rpcUrl: "https://polygon-rpc.com",
  privateKey: process.env.PRIVATE_KEY!,
});

console.log(anchor.txHash);      // Transaction hash
console.log(anchor.blockNumber); // Block number
console.log(anchor.timestamp);   // Unix timestamp`}</pre>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
