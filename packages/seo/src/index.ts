// ═══════════════════════════════════════════════════════════════
// @xxxiii/seo — SEO & Structured Data Engine
// Schema markup, OG tags, sitemaps, metadata generation
// ═══════════════════════════════════════════════════════════════

import { BRAND, DOMAINS } from "@xxxiii/config";

// ─── Metadata Generators ───

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  section?: string;
  tags?: string[];
  domain?: string;
}

export function generateMetadata(meta: PageMeta) {
  const domain = meta.domain || DOMAINS.root;
  const url = `https://${domain}${meta.path}`;
  const image = meta.image || `https://${domain}/og-default.png`;

  return {
    title: `${meta.title} | ${BRAND.name}`,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: BRAND.fullName,
      images: [{ url: image, width: 1200, height: 630 }],
      locale: "en_US",
      type: meta.type || "website",
      ...(meta.publishedAt && { publishedTime: meta.publishedAt }),
      ...(meta.updatedAt && { modifiedTime: meta.updatedAt }),
      ...(meta.section && { section: meta.section }),
      ...(meta.tags && { tags: meta.tags }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: meta.title,
      description: meta.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
  };
}

// ─── JSON-LD Structured Data ───

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.fullName,
    url: `https://${DOMAINS.root}`,
    logo: `https://${DOMAINS.root}/logo.png`,
    description: BRAND.description,
    sameAs: [
      "https://github.com/xxxiii-io",
      "https://twitter.com/xxxiii_io",
    ],
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  section?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": article.author === "GMIIE Intelligence" ? "Organization" : "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.fullName,
      logo: {
        "@type": "ImageObject",
        url: `https://${DOMAINS.root}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
    ...(article.section && { articleSection: article.section }),
  };
}

export function topicSchema(topic: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description: topic.description,
    url: topic.url,
    isPartOf: {
      "@type": "WebSite",
      name: BRAND.fullName,
      url: `https://${DOMAINS.gmiie}`,
    },
  };
}

export function entitySchema(entity: {
  name: string;
  type: string;
  description: string;
  url: string;
  website?: string;
  headquarters?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: entity.name,
    description: entity.description,
    url: entity.url,
    ...(entity.website && { sameAs: [entity.website] }),
    ...(entity.headquarters && {
      address: {
        "@type": "PostalAddress",
        addressLocality: entity.headquarters,
      },
    }),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Sitemap Helpers ───

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>
    <loc>${e.url}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}
    ${e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""}
    ${e.priority !== undefined ? `<priority>${e.priority}</priority>` : ""}
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

export function generateNewsSitemapXml(
  articles: {
    url: string;
    title: string;
    publishedAt: string;
    keywords?: string[];
  }[]
): string {
  const urls = articles
    .map(
      (a) =>
        `  <url>
    <loc>${a.url}</loc>
    <news:news>
      <news:publication>
        <news:name>${BRAND.fullName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
      ${a.keywords ? `<news:keywords>${a.keywords.join(", ")}</news:keywords>` : ""}
    </news:news>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
