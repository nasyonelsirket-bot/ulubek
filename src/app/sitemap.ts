import type { MetadataRoute } from "next";
import { getSiteUrl, STATIC_SEO_PAGES } from "@/lib/seo/config";
import { getArticlesForSitemap, getCategoriesForSitemap } from "@/lib/services/articles";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const [articles, categories] = await Promise.all([
    getArticlesForSitemap(),
    getCategoriesForSitemap(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_SEO_PAGES.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/haber/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
