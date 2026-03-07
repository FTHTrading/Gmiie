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
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-text-muted mb-4 font-mono">
        <Link href="/" className="hover:text-gold transition-colors">GMIIE</Link>
        <span>/</span>
        <Link href="/topics" className="hover:text-gold transition-colors">Topics</Link>
        <span>/</span>
        <span className="text-text-secondary">{topic.name}</span>
      </nav>

      {topic.cluster && (
        <span className="inline-block px-2.5 py-1 text-label font-mono uppercase tracking-wider border border-border-subtle rounded-lg text-text-muted mb-3">
          {topic.cluster.name}
        </span>
      )}

      <h1 className="text-heading font-bold text-text-primary mb-2">
        {topic.name}
      </h1>

      {topic.description && (
        <p className="text-body text-text-secondary leading-relaxed mb-4 max-w-3xl">
          {topic.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-body-sm text-text-muted mb-6 pb-6 border-b border-border-subtle">
        <span className="font-mono">{articles.length} articles</span>
        <span className="w-1 h-1 rounded-full bg-border-subtle" />
        <span>{entities.length} entities</span>
      </div>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-body font-mono tracking-[0.15em] text-text-muted uppercase mb-4">
            Latest Intelligence
          </h2>
          <div className="space-y-3">
            {articles.slice(0, 10).map((article) => (
              <IntelligenceCardCompact key={article.slug} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Key Entities */}
      {entities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-body font-mono tracking-[0.15em] text-text-muted uppercase mb-4">
            Key Entities
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {entities.map((entity) => (
              <Link
                key={entity.slug}
                href={`/entities/${entity.slug}`}
                className="p-3.5 rounded-xl bg-surface border border-border-subtle hover:border-gold/20 transition-colors group"
              >
                <div className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors">
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

      {/* Empty state */}
      {articles.length === 0 && entities.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-body">No intelligence coverage yet for this topic.</p>
          <p className="text-body-sm mt-2">Articles will appear here as they are published.</p>
        </div>
      )}
    </div>
  );
}
