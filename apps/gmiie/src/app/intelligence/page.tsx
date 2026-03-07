import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getLatestArticles } from "@/lib/data";
import { IntelligenceFeed } from "@/components/intelligence/IntelligenceFeed";
import type { ArticleListItem } from "@/lib/models";

export const metadata: Metadata = genMeta({
  title: "Intelligence Hub",
  description:
    "The live intelligence feed tracking tokenized assets, financial infrastructure, regulation, and institutional blockchain adoption across global capital markets.",
  path: "/intelligence",
  domain: "gmiie.xxxiii.io",
});

export const revalidate = 300;

export default async function IntelligenceHubPage() {
  let articles: ArticleListItem[] = [];

  try {
    const raw = await getLatestArticles(50);
    articles = raw;
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Intelligence Hub
        </h1>
        <p className="text-body text-text-muted">
          Real-time coverage of tokenization, financial infrastructure,
          regulation, and institutional adoption.
        </p>
      </div>

      <IntelligenceFeed articles={articles} />
    </div>
  );
}
