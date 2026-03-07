import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getTopicBySlug } from "@/lib/data";
import { IntelligenceCardCompact } from "@/components/intelligence/IntelligenceCard";
import type { TopicDetail } from "@/lib/models";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug).catch(() => null);
  if (!topic) return genMeta({ title: "Topic Not Found", description: "", path: `/topics/${slug}`, domain: "gmiie.xxxiii.io" });
  return genMeta({
    title: `${topic.name} — Topic Intelligence`,
    description: topic.description?.slice(0, 160) || `Intelligence coverage of ${topic.name}`,
    path: `/topics/${slug}`,
    domain: "gmiie.xxxiii.io",
    tags: [topic.name],
  });
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let topic: TopicDetail | null = null;
  try {
    topic = await getTopicBySlug(slug);
  } catch {
    // DB not connected
  }

  if (!topic) return notFound();

  const articles = topic.articles;
  const entities = topic.entities;

  return (
    <article>
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-caption text-text-muted mb-5 font-mono">
        <Link href="/" className="hover:text-gold transition-colors">GMIIE</Link>
        <span className="opacity-40">/</span>
        <Link href="/topics" className="hover:text-gold transition-colors">Topics</Link>
        <span className="opacity-40">/</span>
        <span className="text-text-secondary">{topic.name}</span>
      </nav>

      {/* ── Doctrine: Meta line — cluster + stats ── */}
      <div className="meta-line flex items-center gap-1.5 mb-3">
        {topic.cluster && (
          <>
            <span className="px-2 py-0.5 border border-border-subtle rounded text-[11px] text-text-muted">
              {topic.cluster.name}
            </span>
            <span className="opacity-40">·</span>
          </>
        )}
        <span>{articles.length} article{articles.length !== 1 ? "s" : ""}</span>
        <span className="opacity-40">·</span>
        <span>{entities.length} entit{entities.length !== 1 ? "ies" : "y"}</span>
      </div>

      {/* ── Doctrine: Headline ── */}
      <h1 className="headline-hero text-text-primary mb-3">
        {topic.name}
      </h1>

      {topic.description && (
        <p className="text-body-lg text-text-secondary leading-relaxed mb-6 pb-6 border-b-2 border-border max-w-3xl">
          {topic.description}
        </p>
      )}

      {/* ── Two-column: intelligence + entities sidebar ── */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* ═══ Main: Latest Intelligence ═══ */}
        <div>
          {articles.length > 0 ? (
            <>
              <h2 className="meta-line text-gold mb-4">Latest Intelligence</h2>
              <div className="space-y-3">
                {articles.slice(0, 15).map((article) => (
                  <IntelligenceCardCompact key={article.slug} article={article} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-text-muted">
              <p className="text-body">No intelligence coverage yet for this topic.</p>
              <p className="text-body-sm mt-2">Articles will appear here as they are published.</p>
            </div>
          )}
        </div>

        {/* ═══ Sidebar: Key Entities ═══ */}
        <aside className="space-y-4">
          {entities.length > 0 && (
            <div className="p-5 rounded-xl bg-surface border border-border-subtle">
              <h3 className="meta-line mb-3">Key Entities</h3>
              <div className="space-y-2">
                {entities.map((entity) => (
                  <Link
                    key={entity.slug}
                    href={`/entities/${entity.slug}`}
                    className="block p-3 rounded-lg bg-background hover:bg-surface-elevated border border-transparent hover:border-gold/20 transition-colors group"
                  >
                    <div className="text-body-sm font-semibold text-text-primary group-hover:text-gold transition-colors">
                      {entity.name}
                    </div>
                    <div className="text-label text-text-muted">
                      {entity.entityType.replace(/_/g, " ").toLowerCase()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topic metadata */}
          <div className="p-5 rounded-xl bg-surface border border-border-subtle">
            <h3 className="meta-line mb-3">Topic Profile</h3>
            <dl className="space-y-2.5 text-body-sm">
              {topic.cluster && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Cluster</dt>
                  <dd className="text-text-secondary">{topic.cluster.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-text-muted">Articles</dt>
                <dd className="text-text-secondary font-mono">{articles.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Entities</dt>
                <dd className="text-text-secondary font-mono">{entities.length}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </article>
  );
}
