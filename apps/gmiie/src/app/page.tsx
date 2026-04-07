import { getLatestArticles, getDashboardCounts, getAggregateSignals, getCompositeIndex } from "@/lib/data";
import { IntelligenceCardCompact } from "@/components/intelligence/IntelligenceCard";
import { MobileSignalsSummary } from "@/components/signals/MobileSignalsSummary";
import type { ArticleListItem } from "@/lib/models";
import Link from "next/link";

export const revalidate = 300;

/* ── Design Doctrine: Section classification ── */
const SECTION_MAP: Record<string, { title: string; order: number }> = {
  REGULATOR_TRACKER: { title: "Regulatory Watch", order: 1 },
  INFRA_ANALYSIS: { title: "Market Infrastructure", order: 2 },
  DEEP_DIVE: { title: "Institutional Adoption", order: 3 },
  RESEARCH_ARTICLE: { title: "Research & Context", order: 4 },
  STRATEGIC_MEMO: { title: "Strategic Intelligence", order: 5 },
  MARKET_MAP: { title: "Market Maps", order: 6 },
};

export default async function GmiieHomePage() {
  let articles: ArticleListItem[] = [];
  let counts = { articles: 0, entities: 0, topics: 0, sources: 0 };
  let aggregateSignals: Awaited<ReturnType<typeof getAggregateSignals>> = [];
  let compositeIndex: Awaited<ReturnType<typeof getCompositeIndex>> = null;

  try {
    const [rawArticles, rawCounts, rawSignals, rawIndex] = await Promise.all([
      getLatestArticles(30),
      getDashboardCounts(),
      getAggregateSignals(),
      getCompositeIndex(),
    ]);
    articles = rawArticles;
    counts = rawCounts;
    aggregateSignals = rawSignals;
    compositeIndex = rawIndex;
  } catch {
    // Database not connected yet — show empty state
  }

  // ── Doctrine: Separate hero, secondary, and feed articles ──
  const hero = articles[0] ?? null;
  const secondary = articles.slice(1, 3);
  const feedArticles = articles.slice(3);

  // ── Doctrine: Group feed articles by section ──
  const sections = new Map<string, ArticleListItem[]>();
  const unsectioned: ArticleListItem[] = [];

  for (const article of feedArticles) {
    const section = SECTION_MAP[article.articleType];
    if (section) {
      const existing = sections.get(section.title) || [];
      existing.push(article);
      sections.set(section.title, existing);
    } else {
      unsectioned.push(article);
    }
  }

  // Sort sections by order
  const sortedSections = [...sections.entries()].sort((a, b) => {
    const orderA = Object.values(SECTION_MAP).find((s) => s.title === a[0])?.order ?? 99;
    const orderB = Object.values(SECTION_MAP).find((s) => s.title === b[0])?.order ?? 99;
    return orderA - orderB;
  });

  return (
    <div>      {/* ╌╌╌ CINEMATIC HERO ╌╌╌ */}
      <div className="relative overflow-hidden rounded-xl mb-7 bg-[#0F1419] border border-[#D4AF37]/20">
        {/* Decorative rings */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
          <div className="hero-stream" style={{ width: "55%", top: "38%", left: "30%" }} />
          <div className="hero-stream" style={{ width: "35%", top: "62%", left: "50%", animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 max-w-3xl">
          {/* Live status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/8 text-[#D4AF37] text-[10px] font-mono uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] signal-dot-live" />
            Intelligence Pipeline Live
          </div>

          <h1 className="text-3xl md:text-[2.6rem] lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
            Track how central banks
            <br />are rewiring
            <br /><span style={{ color: "#D4AF37" }}>global finance</span>
          </h1>

          <p className="text-white/55 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            GMIIE monitors 40+ official sources — regulators, central banks, and
            market infrastructure providers — then scores every development for
            what it means to institutional capital flows.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-black"
              style={{ background: "#D4AF37" }}
            >
              Get Daily Intelligence →
            </Link>
            <Link
              href="/mail"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/15 hover:border-[#D4AF37]/40 hover:text-white transition-colors"
            >
              ✉ Mail Command Center
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/15 hover:border-[#D4AF37]/40 hover:text-white transition-colors"
            >
              How the Algorithms Work
            </Link>
          </div>
        </div>
      </div>

      {/* ╌╌╌ PLAIN-ENGLISH EXPLAINER ╌╌╌ */}
      <div className="grid sm:grid-cols-3 gap-3 mb-7">
        <div className="explainer-card">
          <span className="explainer-number">01 — Watch</span>
          <h3 className="text-sm font-bold text-text-primary leading-snug">
            We ingest 40+ official sources
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            SEC, Federal Reserve, ECB, BIS, BoE, MAS and 34 more regulators and
            central banks — scraped every 15 minutes, deduplicated, and
            normalised.
          </p>
        </div>
        <div className="explainer-card">
          <span className="explainer-number">02 — Score</span>
          <h3 className="text-sm font-bold text-text-primary leading-snug">
            Our AI rates each signal 0–100
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every item is classified by urgency, jurisdiction, and market impact.
            Only scores above 60 surface in the intelligence feed — everything
            else is filtered out.
          </p>
        </div>
        <div className="explainer-card">
          <span className="explainer-number">03 — Signal</span>
          <h3 className="text-sm font-bold text-text-primary leading-snug">
            You get the intelligence, not the noise
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Structured briefs and deep dives — organised by Regulatory Watch,
            Infrastructure, Adoption, and Research — delivered daily at market
            open.
          </p>
        </div>
      </div>
      {/* ═══ Utility bar: Dashboard stats ═══ */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue" />
          <span className="meta-line">Monitored</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-wrap">
          <StatPill label="Articles" value={counts.articles} />
          <StatPill label="Entities" value={counts.entities} />
          <StatPill label="Topics" value={counts.topics} />
          <StatPill label="Sources" value={counts.sources} />
        </div>
        <span className="meta-line ml-auto hidden md:block">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="mb-5 sm:mb-7 flex flex-wrap items-center gap-3">
        <Link
          href="/subscribe"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-black text-body-sm font-semibold"
        >
          Register for Daily Insights
          <span className="text-caption">→</span>
        </Link>
        <Link
          href="/methodology"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle text-body-sm font-medium text-text-secondary hover:text-text-primary"
        >
          How The Algorithms Work
        </Link>
      </div>

      {/* Mobile signals summary — shown when sidebar signal panel is hidden */}
      <MobileSignalsSummary
        signals={aggregateSignals.length > 0 ? aggregateSignals : undefined}
        compositeIndex={compositeIndex}
      />

      {articles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-body text-text-muted">No intelligence articles yet.</p>
          <p className="text-body-sm text-text-muted mt-2">
            Articles will appear here as the ingestion pipeline publishes them.
          </p>
        </div>
      )}

      {articles.length > 0 && (
        <>
          {/* ═══ HERO ZONE — Lead story + intelligence panel ═══ */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border-subtle">
            {/* Lead story */}
            <div>
              {hero && <IntelligenceCardCompact article={hero} variant="hero" />}
            </div>

            {/* Intelligence panel — latest headlines (visible on mobile as compact list) */}
            <div className="border-t lg:border-t-0 lg:border-l border-border-subtle pt-4 lg:pt-0 lg:pl-6">
              <h3 className="meta-line mb-3 sm:mb-4">Latest Headlines</h3>
              <div className="space-y-3 sm:space-y-4">
                {articles.slice(1, 6).map((article) => (
                  <Link
                    key={article.slug}
                    href={`/intelligence/${article.slug}`}
                    className="block group"
                  >
                    <div className="meta-line mb-0.5">
                      {article.articleType.replace(/_/g, " ")} · {formatDate(article.publishedAt)}
                    </div>
                    <h4 className="text-body-sm font-semibold text-text-primary group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ SECONDARY STORIES — stack on mobile, 2-up on md+ ═══ */}
          {secondary.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border-subtle">
              {secondary.map((article) => (
                <IntelligenceCardCompact key={article.slug} article={article} variant="secondary" />
              ))}
            </div>
          )}

          {/* ═══ SECTIONED FEED — Doctrine: organized by coverage area ═══ */}
          {sortedSections.map(([title, sectionArticles]) => (
            <div key={title} className="section-rule">
              <h2 className="text-heading-sm font-bold text-text-primary mb-1 flex items-center gap-2 sm:gap-3">
                <span className="w-4 sm:w-6 h-0.5 bg-gold" />
                {title}
              </h2>
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                {sectionArticles.slice(0, 5).map((article) => (
                  <IntelligenceCardCompact key={article.slug} article={article} />
                ))}
              </div>
            </div>
          ))}

          {/* ═══ REMAINING — Top Developments (unsectioned) ═══ */}
          {unsectioned.length > 0 && (
            <div className="section-rule">
              <h2 className="text-heading-sm font-bold text-text-primary mb-1 flex items-center gap-2 sm:gap-3">
                <span className="w-4 sm:w-6 h-0.5 bg-gold" />
                Top Developments
              </h2>
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                {unsectioned.slice(0, 10).map((article) => (
                  <IntelligenceCardCompact key={article.slug} article={article} />
                ))}
              </div>
            </div>
          )}

          {/* ═══ VIEW ALL ═══ */}
          <div className="section-rule text-center">
            <Link
              href="/intelligence"
              className="inline-flex items-center gap-2 px-6 py-3 text-body-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-colors"
            >
              View All Intelligence
              <span className="text-caption">→</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-heading-sm font-mono font-bold text-text-primary">
        {value.toLocaleString()}
      </span>
      <span className="meta-line">{label}</span>
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
