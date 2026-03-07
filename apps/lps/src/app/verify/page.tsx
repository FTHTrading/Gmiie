import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Verification Guide",
  description: "How to verify LPS-1 publications — CLI commands, web verification, and result interpretation.",
};

export default function VerifyPage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Verification
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Verify a Work
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Independent verification is the foundation of LPS-1. Any party can confirm authorship,
              content integrity, and AI disclosure using only the original content and a manifest CID.
            </p>
          </Container>
        </section>

        {/* ═══ WHAT VERIFICATION MEANS ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">
              What Verification Means
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                LPS-1 verification is a deterministic process that answers three questions:
              </p>
              <div className="grid gap-4 mt-6">
                {[
                  {
                    q: "Is this the original content?",
                    a: "The SHA-256 hash of the normalized content must match the hash recorded in the manifest. Any modification — even a single character — causes verification to fail.",
                  },
                  {
                    q: "Was this content published when claimed?",
                    a: "The on-chain anchor provides an immutable, blockchain-timestamped record. The block timestamp proves the content existed at that specific point in time.",
                  },
                  {
                    q: "Was AI involved in creating this work?",
                    a: "The L5 AI disclosure provides a structured, machine-readable declaration of AI involvement, including model identifiers and human intervention ratios.",
                  },
                ].map((item, i) => (
                  <Card key={i} variant="bordered" className="p-5">
                    <CardContent>
                      <h3 className="text-sm font-semibold text-gold mb-2">{item.q}</h3>
                      <p className="text-text-muted text-sm">{item.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ═══ CLI VERIFICATION ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono">
              CLI Verification
            </h2>
            <p className="text-text-secondary mb-8">
              The fastest way to verify. Install the LPS-1 CLI and verify any work in under 90 seconds.
            </p>

            <h3 className="text-sm font-mono text-gold uppercase tracking-wider mb-4">Step 1 — Install the CLI</h3>
            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm mb-8 overflow-x-auto">
              <pre className="text-text-secondary">{`# Install globally via npm
npm install -g @lps1/cli

# Or use npx for one-time verification
npx @lps1/cli verify <file> <manifest-cid>`}</pre>
            </div>

            <h3 className="text-sm font-mono text-gold uppercase tracking-wider mb-4">Step 2 — Verify a work</h3>
            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm mb-8 overflow-x-auto">
              <pre className="text-text-secondary">{`# Full verification (all layers)
lps verify article.md bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi

# Verify only content integrity (L0-L2, no network required)
lps verify --offline article.md manifest.json

# Verify with verbose output
lps verify -v article.md bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi`}</pre>
            </div>

            <h3 className="text-sm font-mono text-gold uppercase tracking-wider mb-4">Step 3 — Interpret results</h3>
            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto">
              <pre className="text-text-secondary">{`# Successful verification output
$ lps verify article.md bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi

  LPS-1 Verification Report
  ═════════════════════════════════════════════════════

  Content:    "On the Nature of Digital Permanence"
  Author:     Elena Vasquez
  Manifest:   bafybeigdyrzt5sfp7udm7hu76uh...

  ┌─────────────────────────────────────────────────┐
  │  L0  Content Normalization     ✓ PASS           │
  │      Encoding: UTF-8 NFC                        │
  │      Byte length: 22,451                        │
  ├─────────────────────────────────────────────────┤
  │  L1  Cryptographic Hash        ✓ PASS           │
  │      SHA-256: a3f2b8c91d4e...                   │
  │      Match: manifest.l1.hash ✓                  │
  ├─────────────────────────────────────────────────┤
  │  L2  Merkle Tree               ✓ PASS           │
  │      Root: b4c3d2e1f0a9...                      │
  │      Leaves: 4/4 verified                       │
  │      Depth: 3                                   │
  ├─────────────────────────────────────────────────┤
  │  L3  IPFS Storage              ✓ PASS           │
  │      CID: bafybeigdyrzt5sfp7udm...              │
  │      Pinned: Pinata, web3.storage               │
  ├─────────────────────────────────────────────────┤
  │  L4  On-Chain Anchor           ✓ PASS           │
  │      Chain: Polygon (137)                       │
  │      Block: 52,341,267                          │
  │      Time: 2026-03-01T00:00:00Z                 │
  │      Tx: 0xabcdef1234...                        │
  ├─────────────────────────────────────────────────┤
  │  L5  AI Disclosure             ✓ PRESENT        │
  │      Usage: assisted                            │
  │      Human ratio: 0.85                          │
  │      Model: claude-3-opus (Anthropic)           │
  └─────────────────────────────────────────────────┘

  Result: ✓ VERIFIED
  All 6 layers passed verification.
  Elapsed: 4.2s`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ WEB VERIFICATION ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono">
              Web Verification
            </h2>
            <p className="text-text-secondary mb-8">
              For users who prefer a browser-based experience, the LPS-1 web verifier provides the same
              verification pipeline with a visual interface.
            </p>

            <div className="space-y-6">
              {[
                { step: "1", title: "Upload or paste content", desc: "Drag and drop a file or paste the text content you want to verify." },
                { step: "2", title: "Enter the manifest CID", desc: "Paste the IPFS CID from the publication's manifest. This is typically provided by the publisher." },
                { step: "3", title: "Run verification", desc: "The verifier normalizes your content, computes hashes, retrieves the manifest from IPFS, and checks the on-chain anchor." },
                { step: "4", title: "Review results", desc: "Each layer shows PASS or FAIL with detailed diagnostics. Failed layers include specific error messages explaining what didn't match." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <span className="text-gold font-mono text-sm font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                    <p className="text-text-muted text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ PROGRAMMATIC VERIFICATION ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono">
              Programmatic Verification
            </h2>
            <p className="text-text-secondary mb-8">
              Integrate verification directly into your application using the TypeScript SDK.
            </p>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-text-secondary">{`import { LPSVerifier } from "@lps1/sdk";

const verifier = new LPSVerifier({
  ipfsGateway: "https://gateway.pinata.cloud",
  rpcUrl: "https://polygon-rpc.com",
});

// Full verification
const result = await verifier.verify({
  content: fs.readFileSync("article.md", "utf-8"),
  manifestCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
});

console.log(result.verified);     // true
console.log(result.layers);       // { l0: "pass", l1: "pass", ... }
console.log(result.anchor);       // { chain: "polygon", block: 52341267, ... }
console.log(result.aiDisclosure); // { usage: "assisted", ratio: 0.85, ... }

// Offline verification (L0-L2 only)
const offlineResult = await verifier.verifyOffline({
  content: fs.readFileSync("article.md", "utf-8"),
  manifest: JSON.parse(fs.readFileSync("manifest.json", "utf-8")),
});`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ COMMON FAILURE MODES ═══ */}
        <section className="py-16">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono">
              Common Failure Modes
            </h2>
            <p className="text-text-secondary mb-8">
              When verification fails, the error message indicates exactly which layer and check failed.
              Here are the most common failure modes and what they mean.
            </p>

            <div className="space-y-4">
              {[
                {
                  error: "L1 FAIL: Content hash mismatch",
                  meaning: "The content you provided does not match the content that was originally published. This could mean the content was modified after publication, or you have a different version of the file.",
                  fix: "Ensure you are verifying the exact original file. Even whitespace changes, encoding differences, or a single changed character will cause this failure.",
                },
                {
                  error: "L2 FAIL: Merkle proof invalid for section N",
                  meaning: "A specific section of the content doesn't match the Merkle tree. This could indicate a targeted modification to one section while the rest remains intact.",
                  fix: "The section index in the error tells you exactly which section was modified. Compare section N against the original.",
                },
                {
                  error: "L3 FAIL: Manifest not found on IPFS",
                  meaning: "The publication manifest could not be retrieved from IPFS. This may indicate the content has been unpinned or the IPFS CID is incorrect.",
                  fix: "Try an alternative IPFS gateway. If the content was recently published, it may still be propagating. If the CID is correct but content is unreachable, the pinning service may have removed it.",
                },
                {
                  error: "L4 FAIL: Anchor not found on-chain",
                  meaning: "No matching anchor was found in the LPS-1 Registry Contract. The Merkle root may not have been anchored, or the wrong chain was queried.",
                  fix: "Verify you're checking the correct chain (Ethereum Mainnet vs. Polygon). Check the contract address matches the official LPS-1 Registry.",
                },
                {
                  error: "L4 FAIL: Timestamp inconsistency",
                  meaning: "The block timestamp from the on-chain anchor is later than the timestamp in the manifest. This could indicate the manifest was backdated.",
                  fix: "This is a serious integrity issue. The on-chain timestamp is the authoritative record. Treat the manifest timestamp as unreliable.",
                },
                {
                  error: "L5 WARN: AI disclosure missing",
                  meaning: "The publication does not include an L5 AI disclosure layer. This is a warning, not a failure — L5 is optional for minimum and recommended compliance tiers.",
                  fix: "No action needed for verification. However, the absence of AI disclosure means the work's AI provenance cannot be confirmed.",
                },
              ].map((item, i) => (
                <Card key={i} variant="bordered" className="p-0 overflow-hidden">
                  <div className="bg-surface-elevated/50 px-5 py-3 border-b border-border-subtle">
                    <code className="text-red font-mono text-sm">{item.error}</code>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <span className="text-xs font-mono text-gold uppercase tracking-wider">What it means</span>
                      <p className="text-text-secondary text-sm mt-1">{item.meaning}</p>
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gold uppercase tracking-wider">How to resolve</span>
                      <p className="text-text-muted text-sm mt-1">{item.fix}</p>
                    </div>
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
