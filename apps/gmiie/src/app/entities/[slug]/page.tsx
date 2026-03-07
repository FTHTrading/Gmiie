import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getEntityBySlug } from "@/lib/data";
import { IntelligenceCardCompact } from "@/components/intelligence/IntelligenceCard";
import type { EntityDetail } from "@/lib/models";

export const revalidate = 60;

const TYPE_ICONS: Record<string, string> = {
  BANK: "🏦",
  CENTRAL_BANK: "🏛️",
  REGULATOR: "⚖️",
  MARKET_INFRASTRUCTURE: "🔗",
  EXCHANGE: "📊",
  ASSET_MANAGER: "💼",
  TECHNOLOGY_PROVIDER: "⚙️",
  CUSTODIAN: "🔒",
  ISSUER: "📄",
  PROTOCOL: "🌐",
  CONSORTIUM: "🤝",
  RATING_AGENCY: "📈",
  INDEX_PROVIDER: "📉",
  LAW_FIRM: "⚖️",
  AUDITOR: "🔍",
  CONSULTING: "📋",
  DATA_PROVIDER: "📡",
  OTHER: "●",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug).catch(() => null);
  const name = entity?.name ?? slug;
  return genMeta({
    title: `${name} — Entity Profile`,
    description: entity?.description?.slice(0, 160) ?? "",
    path: `/entities/${slug}`,
    type: "profile",
    domain: "gmiie.xxxiii.io",
  });
}

export default async function EntityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let entity: EntityDetail | null = null;
  try {
    entity = await getEntityBySlug(slug);
  } catch {
    // DB not connected
  }

  if (!entity) return notFound();

  const icon = TYPE_ICONS[entity.entityType] ?? "●";

  return (
    <article>
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-caption text-text-muted font-mono mb-5">
        <Link href="/" className="hover:text-gold transition-colors">GMIIE</Link>
        <span className="opacity-40">/</span>
        <Link href="/entities" className="hover:text-gold transition-colors">Entities</Link>
        <span className="opacity-40">/</span>
        <span className="text-text-secondary">{entity.name}</span>
      </nav>

      {/* ── Doctrine: Meta line — entity taxonomy ── */}
      <div className="meta-line flex items-center gap-1.5 mb-3">
        <span className="text-lg leading-none">{icon}</span>
        <span className="px-2 py-0.5 border border-border-subtle rounded text-[11px] text-text-muted">
          {entity.entityType.replace(/_/g, " ")}
        </span>
        {entity.region && (
          <>
            <span className="opacity-40">·</span>
            <span>{entity.region}</span>
          </>
        )}
        {entity.articleCount > 0 && (
          <>
            <span className="opacity-40">·</span>
            <span>{entity.articleCount} article{entity.articleCount !== 1 ? "s" : ""}</span>
          </>
        )}
      </div>

      {/* ── Doctrine: Headline ── */}
      <h1 className="headline-hero text-text-primary mb-1">
        {entity.name}
      </h1>
      {entity.shortName && (
        <p className="text-body text-text-muted mb-4">{entity.shortName}</p>
      )}

      {entity.description && (
        <p className="text-body-lg text-text-secondary leading-relaxed mb-6 pb-6 border-b-2 border-border">
          {entity.description}
        </p>
      )}

      {/* ── Two-column: content + profile sidebar ── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* ═══ Main content ═══ */}
        <div className="space-y-6">
          {/* Why It Matters — highlighted callout */}
          {entity.whyItMatters && (
            <div className="p-5 rounded-xl bg-surface border border-border-subtle border-l-4 border-l-gold">
              <h2 className="meta-line text-gold mb-2">Why It Matters</h2>
              <p className="text-body text-text-primary leading-relaxed font-medium">
                {entity.whyItMatters}
              </p>
            </div>
          )}

          {/* Strategic Role */}
          {entity.strategicRole && (
            <section>
              <h2 className="text-body-lg font-bold text-text-primary mb-3 flex items-center gap-3">
                <span className="w-6 h-0.5 bg-gold" />
                Strategic Role
              </h2>
              <p className="text-body text-text-secondary leading-relaxed">
                {entity.strategicRole}
              </p>
            </section>
          )}

          {/* Long Description */}
          {entity.longDescription && (
            <section>
              <p className="text-body text-text-secondary leading-relaxed">
                {entity.longDescription}
              </p>
            </section>
          )}

          {/* ── Timeline — Bloomberg-style event log ── */}
          {entity.timeline && entity.timeline.length > 0 && (
            <section className="section-rule">
              <h2 className="text-body-lg font-bold text-text-primary mb-4 flex items-center gap-3">
                <span className="w-6 h-0.5 bg-gold" />
                Key Developments
              </h2>
              <div className="relative pl-5 border-l-2 border-border space-y-5">
                {entity.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-background border-2 border-gold" />
                    <div className="meta-line text-gold mb-1">
                      {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                    <p className="text-body-sm text-text-primary font-semibold">{event.title}</p>
                    {event.description && (
                      <p className="text-caption text-text-muted mt-1 leading-relaxed">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Topics */}
          {entity.topics && entity.topics.length > 0 && (
            <div className="section-rule">
              <h3 className="meta-line mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {entity.topics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className="px-2.5 py-1.5 text-body-sm rounded-lg bg-surface border border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold transition-colors"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Intelligence */}
          {entity.articles && entity.articles.length > 0 && (
            <div className="section-rule">
              <h3 className="meta-line mb-3">Latest Intelligence</h3>
              <div className="space-y-2">
                {entity.articles.slice(0, 10).map((article) => (
                  <IntelligenceCardCompact
                    key={article.slug}
                    article={article}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Profile sidebar ═══ */}
        <aside className="space-y-4">
          {/* Entity profile card */}
          <div className="p-5 rounded-xl bg-surface border border-border-subtle">
            <h3 className="meta-line mb-3">Entity Profile</h3>
            <dl className="space-y-2.5 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Type</dt>
                <dd className="text-text-secondary">{entity.entityType.replace(/_/g, " ")}</dd>
              </div>
              {entity.headquarters && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Headquarters</dt>
                  <dd className="text-text-secondary">{entity.headquarters}</dd>
                </div>
              )}
              {entity.country && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Country</dt>
                  <dd className="text-text-secondary">{entity.country}</dd>
                </div>
              )}
              {entity.region && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Region</dt>
                  <dd className="text-text-secondary">{entity.region}</dd>
                </div>
              )}
              {entity.founded && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Founded</dt>
                  <dd className="text-text-secondary font-mono">{entity.founded}</dd>
                </div>
              )}
              {entity.website && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Website</dt>
                  <dd>
                    <a
                      href={entity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      {entity.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Coverage stats */}
          {entity.articleCount > 0 && (
            <div className="p-5 rounded-xl bg-surface border border-border-subtle">
              <h3 className="meta-line mb-3">Coverage</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-background">
                  <div className="text-heading font-bold text-gold">{entity.articleCount}</div>
                  <div className="text-label text-text-muted">Articles</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <div className="text-heading font-bold text-gold">{entity.timelineCount}</div>
                  <div className="text-label text-text-muted">Events</div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
