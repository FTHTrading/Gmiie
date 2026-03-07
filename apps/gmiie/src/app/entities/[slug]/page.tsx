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
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-text-muted font-mono mb-4">
        <Link href="/" className="hover:text-gold transition-colors">GMIIE</Link>
        <span>/</span>
        <Link href="/entities" className="hover:text-gold transition-colors">Entities</Link>
        <span>/</span>
        <span className="text-text-secondary">{entity.name}</span>
      </nav>

      {/* Entity header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <span className="text-label font-mono tracking-wider text-text-muted uppercase">
            {entity.entityType.replace(/_/g, " ")}
          </span>
          <h1 className="text-heading font-bold text-text-primary">{entity.name}</h1>
          {entity.shortName && (
            <p className="text-body-sm text-text-muted">{entity.shortName}</p>
          )}
        </div>
      </div>

      {entity.description && (
        <p className="text-body text-text-secondary leading-relaxed mb-6">
          {entity.description}
        </p>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-5 rounded-xl border border-border-subtle bg-surface/30 mb-6">
        {entity.headquarters && (
          <>
            <span className="text-label font-mono text-text-muted uppercase">HQ</span>
            <span className="text-body-sm text-text-secondary">{entity.headquarters}</span>
          </>
        )}
        {entity.country && (
          <>
            <span className="text-label font-mono text-text-muted uppercase">Country</span>
            <span className="text-body-sm text-text-secondary">{entity.country}</span>
          </>
        )}
        {entity.region && (
          <>
            <span className="text-label font-mono text-text-muted uppercase">Region</span>
            <span className="text-body-sm text-text-secondary">{entity.region}</span>
          </>
        )}
        {entity.founded && (
          <>
            <span className="text-label font-mono text-text-muted uppercase">Founded</span>
            <span className="text-body-sm text-text-secondary">{entity.founded}</span>
          </>
        )}
        {entity.website && (
          <>
            <span className="text-label font-mono text-text-muted uppercase">Website</span>
            <a
              href={entity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-gold hover:text-gold-light transition-colors"
            >
              {entity.website.replace(/^https?:\/\/(www\.)?/, "")} ↗
            </a>
          </>
        )}
        {entity.articleCount > 0 && (
          <>
            <span className="text-label font-mono text-text-muted uppercase">Articles</span>
            <span className="text-body-sm text-text-secondary">{entity.articleCount}</span>
            <span className="text-label font-mono text-text-muted uppercase">Events</span>
            <span className="text-body-sm text-text-secondary">{entity.timelineCount}</span>
          </>
        )}
      </div>

      {/* Why It Matters */}
      {entity.whyItMatters && (
        <div className="mb-6">
          <h2 className="text-body font-bold text-text-primary mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-gold" />
            Why It Matters
          </h2>
          <p className="text-body text-text-secondary leading-relaxed">
            {entity.whyItMatters}
          </p>
        </div>
      )}

      {/* Strategic Role */}
      {entity.strategicRole && (
        <div className="mb-6">
          <h2 className="text-body font-bold text-text-primary mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-gold" />
            Strategic Role
          </h2>
          <p className="text-body text-text-secondary leading-relaxed">
            {entity.strategicRole}
          </p>
        </div>
      )}

      {/* Long Description */}
      {entity.longDescription && (
        <div className="mb-6">
          <p className="text-body text-text-secondary leading-relaxed">
            {entity.longDescription}
          </p>
        </div>
      )}

      {/* Timeline */}
      {entity.timeline && entity.timeline.length > 0 && (
        <div className="mb-6">
          <h2 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-gold" />
            Key Developments
          </h2>
          <div className="relative pl-4 border-l border-border-subtle space-y-4">
            {entity.timeline.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-surface border-2 border-gold" />
                <div className="text-label font-mono text-gold mb-0.5">
                  {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </div>
                <p className="text-body-sm text-text-secondary font-medium">{event.title}</p>
                {event.description && (
                  <p className="text-caption text-text-muted mt-0.5">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Topics */}
      {entity.topics && entity.topics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-label font-mono tracking-wider text-text-muted uppercase mb-2">
            Related Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {entity.topics.map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className="px-2.5 py-1 rounded-lg text-caption bg-surface border border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {entity.articles && entity.articles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-label font-mono tracking-wider text-text-muted uppercase mb-3">
            Latest Intelligence
          </h3>
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
  );
}
