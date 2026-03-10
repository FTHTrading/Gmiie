import { BRAND, LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Button, Card, CardContent } from "@xxxiii/ui";
import Link from "next/link";

export default function LpsHomePage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-grid-pattern opacity-20" />

          <Container size="narrow" className="relative z-10 py-24 text-center">
            <div className="mb-8 animate-fade-in">
              <span className="text-gold font-mono font-bold text-5xl md:text-7xl tracking-[0.3em]">
                XXXIII
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-text-primary leading-tight mb-6 animate-slide-up">
              The Open Standard for Verifiable Digital Publishing
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              A deterministic protocol that proves authorship, content integrity,
              and AI disclosure using cryptographic hashing, Merkle trees, IPFS,
              and on-chain anchoring.
            </p>

            <p className="text-gold font-mono text-sm tracking-wider mb-10 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              Verify any work in under 90 seconds. No platform. No trust. Just math.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/spec">
                <Button variant="gold" size="lg">
                  Read the Specification
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" size="lg">
                  Verify a Work
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* ═══ PROTOCOL OVERVIEW ═══ */}
        <section className="py-24 border-t border-border-subtle">
          <Container>
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                LPS-1 Protocol
              </span>
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                What LPS-1 Does
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                A five-layer deterministic publishing protocol for permanent authorship proof.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {[
                { layer: "L0", name: "Content", desc: "Raw text normalization and canonical preparation" },
                { layer: "L1", name: "Hash", desc: "SHA-256 cryptographic hash of normalized content" },
                { layer: "L2", name: "Merkle", desc: "Merkle tree construction for structural integrity" },
                { layer: "L3", name: "Storage", desc: "IPFS pinning for permanent decentralized storage" },
                { layer: "L4", name: "Anchor", desc: "On-chain anchoring for immutable timestamp proof" },
              ].map((layer, i) => (
                <Card key={layer.layer} variant="bordered" className="p-5 text-center">
                  <CardContent>
                    <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-gold font-mono font-bold text-sm">{layer.layer}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{layer.name}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{layer.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ WHY IT MATTERS ═══ */}
        <section className="py-24 border-t border-border-subtle bg-surface/30">
          <Container size="narrow">
            <div className="text-center mb-12">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Why It Matters
              </span>
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                The First Global AI Provenance Standard
              </h2>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: "Prove authorship without a platform",
                  desc: "Any writer, researcher, or institution can cryptographically prove they authored a work — without depending on any centralized platform, timestamp service, or certificate authority.",
                },
                {
                  title: "Verify AI disclosure transparently",
                  desc: "LPS-1 embeds AI usage flags, model identifiers, and human intervention ratios directly into the content manifest. Machine-auditable AI provenance.",
                },
                {
                  title: "Create permanent, citable records",
                  desc: "Every published work gets an IPFS CID and on-chain anchor. These records are permanent, tamper-proof, and universally verifiable.",
                },
                {
                  title: "Build trust infrastructure for the AI era",
                  desc: "As AI-generated content floods every channel, LPS-1 provides the cryptographic foundation for distinguishing verified human work from synthetic content.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <span className="text-gold font-mono text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ NAVIGATION GRID ═══ */}
        <section className="py-24 border-t border-border-subtle">
          <Container>
            <div className="text-center mb-12">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Explore
              </span>
              <h2 className="text-2xl font-bold text-text-primary">
                Protocol Documentation
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { href: "/spec", title: "Specification", desc: "Full LPS-1 protocol specification" },
                { href: "/stack", title: "Protocol Stack", desc: "Layer-by-layer architecture" },
                { href: "/verify", title: "Verify", desc: "CLI + verification guide" },
                { href: "/reference", title: "Reference", desc: "Reference implementations" },
                { href: "/contracts", title: "Contracts", desc: "Verified smart contracts" },
                { href: "/compliance", title: "Compliance", desc: "L0-L5 compliance matrix" },
                { href: "/roadmap", title: "Roadmap", desc: "Protocol development roadmap" },
                { href: "/implement", title: "Implement", desc: "Developer integration guide" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="p-5 rounded-xl bg-surface border border-border-subtle hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 group"
                >
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-24 border-t border-border-subtle">
          <Container size="narrow" className="text-center">
            <p className="text-text-secondary mb-8">
              LPS-1 is open source and free to implement. Build verifiable publishing into your platform, archive, or workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/xxxiii-io" target="_blank" rel="noopener noreferrer">
                <Button variant="gold" size="lg">
                  View on GitHub
                </Button>
              </a>
              <Link href="/implement">
                <Button variant="outline" size="lg">
                  Developer Guide
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
