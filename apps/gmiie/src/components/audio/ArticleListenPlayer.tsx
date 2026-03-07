"use client";

import { useMemo } from "react";
import { AudioPlayer } from "./AudioPlayer";
import type { ArticleDetail } from "@/lib/models";

/* ── Build a clean narration script from structured article fields ── */
function buildNarrationText(article: ArticleDetail): string {
  const parts: string[] = [];

  // Opening: headline
  if (article.headline) {
    parts.push(article.headline + ".");
  }

  // Dek / sub-headline
  if (article.dek) {
    parts.push(article.dek);
  }

  // Executive summary
  if (article.executiveSummary) {
    parts.push("Executive Summary. " + article.executiveSummary);
  }

  // What happened
  if (article.whatHappened) {
    parts.push("What happened. " + article.whatHappened);
  }

  // Why it matters
  if (article.whyItMatters) {
    parts.push("Why it matters. " + article.whyItMatters);
  }

  // Market implications
  if (article.marketImplications) {
    parts.push("Market implications. " + article.marketImplications);
  }

  // Infrastructure implications
  if (article.infraImplications) {
    parts.push("Infrastructure implications. " + article.infraImplications);
  }

  // Regulatory implications
  if (article.regulatoryImplications) {
    parts.push("Regulatory implications. " + article.regulatoryImplications);
  }

  // Fallback: use raw content if no structured fields
  if (parts.length <= 1 && article.content) {
    parts.push(article.content);
  }

  return parts.join("\n\n");
}

interface ArticleListenPlayerProps {
  article: ArticleDetail;
}

export function ArticleListenPlayer({ article }: ArticleListenPlayerProps) {
  const narrationText = useMemo(() => buildNarrationText(article), [article]);

  if (!narrationText.trim()) return null;

  return (
    <div className="mb-6 sm:mb-8">
      <AudioPlayer
        text={narrationText}
        title={article.headline ?? article.title}
        variant="full"
      />
    </div>
  );
}
