import { getSiteUrl, SITE_LANGUAGE, SITE_NAME } from "./config";
import type { ArticleMetadataInput } from "./metadata";

export function buildNewsArticleSchema(article: ArticleMetadataInput): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/haber/${article.slug}`;
  const headline = article.metaTitle || article.title;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": url,
    url,
    headline,
    description: article.metaDescription || article.excerpt || undefined,
    image: article.image ? [article.image] : [`${siteUrl}/logo.png`],
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    inLanguage: `${SITE_LANGUAGE}-TR`,
    isAccessibleForFree: true,
    articleSection: article.categoryName,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (article.tags.length > 0) {
    schema.keywords = article.tags.join(", ");
  }

  if (article.title !== headline) {
    schema.alternativeHeadline = article.title;
  }

  return schema;
}
