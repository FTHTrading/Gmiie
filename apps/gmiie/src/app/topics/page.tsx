import type { Metadata } from "next";
import Link from "next/link";
import { TOPIC_CLUSTERS } from "@xxxiii/config";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getTopics, getTopicClusters } from "@/lib/data";
import type { TopicListItem, TopicClusterItem } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "Topics",
  description:
    "Explore the GMIIE topic taxonomy — structured intelligence across tokenization, digital assets, infrastructure, regulation, market structure, payments, and global financial systems.",
  path: "/topics",
  domain: "gmiie.xxxiii.io",
});

export default async function TopicsPage() {
  let dbTopics: TopicListItem[] = [];
  let dbClusters: TopicClusterItem[] = [];

  try {
    [dbTopics, dbClusters] = await Promise.all([getTopics(), getTopicClusters()]);
  } catch {
    // DB not connected — fall back to config clusters
  }

  // Build cluster map from DB or config
  const clusters: TopicClusterItem[] = dbClusters.length > 0
    ? dbClusters
    : TOPIC_CLUSTERS.map((c) => ({
        ...c,
        topics: dbTopics
          .filter((t) => t.clusterSlug === c.slug)
          .map((t) => ({ name: t.name, slug: t.slug, articleCount: t.articleCount })),
        topicCount: 0,
      }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Topic Taxonomy
        </h1>
        <p className="text-body text-text-muted">
          Intelligence structured around every dimension of global financial
          infrastructure transformation.
        </p>
      </div>

      {/* Topic Clusters */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {clusters.map((cluster) => (
          <div
            key={cluster.slug}
            className="p-5 rounded-xl bg-surface border border-border-subtle hover:border-gold/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-body font-semibold text-text-primary">
                {cluster.name}
              </h2>
              {cluster.topicCount > 0 && (
                <span className="text-label font-mono text-text-muted">
                  {cluster.topicCount} topics
                </span>
              )}
            </div>
            <p className="text-body-sm text-text-muted mb-3 line-clamp-2">
              {cluster.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {cluster.topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topics/${topic.slug}`}
                    className="px-2.5 py-1 text-caption rounded-lg bg-surface-elevated border border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold transition-colors"
                  >
                    {topic.name}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* All Topics */}
      <div className="border-t border-border-subtle pt-6">
        <h2 className="text-body font-mono tracking-[0.15em] text-text-muted uppercase mb-4">
          All Topics
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(dbTopics.length > 0 ? dbTopics : []).map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-subtle hover:border-gold/20 transition-colors group"
            >
              <span className="text-body-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {topic.name}
              </span>
              <span className="text-label text-text-muted font-mono">
                {topic.articleCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
