import { getLatestArticles, getDashboardCounts } from "@/lib/data";
import { IntelligenceFeed } from "@/components/intelligence/IntelligenceFeed";
import type { ArticleListItem } from "@/lib/models";

export const revalidate = 300;

export default async function GmiieHomePage() {
  let articles: ArticleListItem[] = [];
  let counts = { articles: 0, entities: 0, topics: 0, sources: 0 };

  try {
    const [rawArticles, rawCounts] = await Promise.all([
      getLatestArticles(20),
      getDashboardCounts(),
    ]);
    articles = rawArticles;
    counts = rawCounts;
  } catch {
    // Database not connected yet — show empty state
  }

  return (
    <div>
      {/* Dashboard stats bar */}
      <div className="flex items-center gap-6 mb-6 pb-4 border-b border-border-subtle">
        <StatPill label="Articles" value={counts.articles} />
        <StatPill label="Entities" value={counts.entities} />
        <StatPill label="Topics" value={counts.topics} />
        <StatPill label="Sources" value={counts.sources} />
      </div>

      {/* Main feed */}
      <IntelligenceFeed articles={articles} />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-heading-sm font-mono font-bold text-text-primary">
        {value.toLocaleString()}
      </span>
      <span className="text-label font-mono text-text-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
