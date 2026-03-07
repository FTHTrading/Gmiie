import { BRAND, DOMAINS, ROOT_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent } from "@xxxiii/ui";
import { organizationSchema } from "@xxxiii/seo";
import { LinkButton } from "@/components/LinkButton";

export default function HomePage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema()),
        }}
      />

      <Header variant="root" navigation={ROOT_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid-pattern opacity-40" />
          <div className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent" />

          <Container size="default" className="relative z-10 py-24">
            <div className="max-w-4xl mx-auto text-center">
              {/* Monogram */}
              <div className="mb-8 animate-fade-in">
                <span className="text-gold font-mono font-bold text-5xl md:text-7xl tracking-[0.3em]">
                  XXXIII
                </span>
              </div>

              {/* Tagline */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6 animate-slide-up">
                {BRAND.tagline}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                {BRAND.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <LinkButton variant="gold" size="lg" href={`https://${DOMAINS.gmiie}`}>
                  Explore GMIIE Intelligence
                </LinkButton>
                <LinkButton variant="outline" size="lg" href={`https://${DOMAINS.lps}`}>
                  LPS-1 Protocol Standard
                </LinkButton>
              </div>
            </div>
          </Container>
        </section>

        {/* ═══ ECOSYSTEM OVERVIEW ═══ */}
        <section className="py-24 border-t border-border-subtle">
          <Container>
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Ecosystem
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Two Systems. One Mission.
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                XXXIII operates two foundational systems: a global intelligence engine for capital markets,
                and an open standard for verifiable digital publishing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* GMIIE Card */}
              <Card variant="bordered" hover className="p-8">
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-gold font-mono font-bold text-lg">GMIIE</span>
                    <span className="text-xs text-text-muted font-mono">gmiie.xxxiii.io</span>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Global Monetary Infrastructure Intelligence Engine
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    AI-powered global intelligence platform tracking tokenized assets, financial
                    infrastructure, settlement modernization, digital regulation, and institutional
                    blockchain adoption. Transforms developments into structured knowledge, market
                    signals, and editorial intelligence.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Tokenized Securities", "Regulation", "Settlement", "Custody", "Stablecoins"].map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated text-text-muted border border-border-subtle">
                        {t}
                      </span>
                    ))}
                  </div>
                  <LinkButton variant="primary" size="sm" href={`https://${DOMAINS.gmiie}`}>
                    Enter GMIIE →
                  </LinkButton>
                </CardContent>
              </Card>

              {/* LPS Card */}
              <Card variant="bordered" hover className="p-8">
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-gold font-mono font-bold text-lg">LPS-1</span>
                    <span className="text-xs text-text-muted font-mono">lps.xxxiii.io</span>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Open Provenance Standard for Verifiable Publishing
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    A deterministic protocol that proves authorship, content integrity, and AI disclosure
                    using cryptographic hashing, Merkle trees, IPFS, and on-chain anchoring.
                    Verify any work in under 90 seconds. No platform. No trust. Just math.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Cryptographic Proof", "IPFS", "On-Chain", "AI Provenance", "Merkle Trees"].map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated text-text-muted border border-border-subtle">
                        {t}
                      </span>
                    ))}
                  </div>
                  <LinkButton variant="primary" size="sm" href={`https://${DOMAINS.lps}`}>
                    Read the Spec →
                  </LinkButton>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* ═══ WHY NOW ═══ */}
        <section className="py-24 border-t border-border-subtle bg-surface/50">
          <Container size="narrow">
            <div className="text-center mb-12">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Context
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Why This Matters Now
              </h2>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: "Trillions in assets are moving on-chain",
                  desc: "BlackRock, Franklin Templeton, JPMorgan, and dozens of institutions are tokenizing funds, bonds, and real estate. The market infrastructure of the next decade is being built right now.",
                },
                {
                  title: "Regulators are moving faster than expected",
                  desc: "The SEC, MiCA, MAS, VARA, and dozens of global regulators are creating frameworks for digital securities. The compliance landscape is evolving weekly.",
                },
                {
                  title: "AI is flooding content channels with noise",
                  desc: "As AI generates more content, provenance, authorship verification, and institutional-grade intelligence become existentially important.",
                },
                {
                  title: "The old infrastructure can't keep up",
                  desc: "Settlement systems, transfer agencies, custody platforms, and clearing houses are being redesigned. Understanding these shifts is a strategic advantage.",
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

        {/* ═══ DOMAIN ARCHITECTURE ═══ */}
        <section className="py-24 border-t border-border-subtle">
          <Container>
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
                Architecture
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                The XXXIII Network
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                A modular ecosystem of intelligence, standards, and infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { domain: "gmiie.xxxiii.io", label: "Intelligence Platform", desc: "AI-driven market intelligence" },
                { domain: "lps.xxxiii.io", label: "Protocol Standard", desc: "Verifiable publishing protocol" },
                { domain: "news.xxxiii.io", label: "AI Newsroom", desc: "Automated intelligence feed" },
                { domain: "research.xxxiii.io", label: "Deep Research", desc: "Long-form reports & whitepapers" },
                { domain: "signals.xxxiii.io", label: "Market Signals", desc: "Live scoring dashboards" },
                { domain: "studio.xxxiii.io", label: "Editorial Studio", desc: "Internal publishing system" },
              ].map((sub) => (
                <div
                  key={sub.domain}
                  className="p-5 rounded-xl bg-surface border border-border-subtle hover:border-gold/20 transition-colors"
                >
                  <p className="text-xs font-mono text-gold mb-2">{sub.domain}</p>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">{sub.label}</h4>
                  <p className="text-xs text-text-muted">{sub.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-24 border-t border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              Get Involved
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Partner With Us
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-8">
              We work with institutions, regulators, developers, and researchers building
              the next generation of financial infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton variant="gold" size="lg" href="mailto:partnerships@xxxiii.io">
                Contact Partnerships
              </LinkButton>
              <LinkButton variant="outline" size="lg" href="/subscribe">
                Subscribe to Intelligence
              </LinkButton>
            </div>
          </Container>
        </section>
      </main>

      <Footer variant="root" />
    </>
  );
}
