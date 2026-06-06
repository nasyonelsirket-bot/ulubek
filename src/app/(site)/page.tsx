import type { Metadata } from "next";
import YouthHero from "@/components/home/YouthHero";
import TrendStrip from "@/components/home/TrendStrip";
import GozeKacmasinBlock from "@/components/home/GozeKacmasinBlock";
import InfiniteNewsFeed from "@/components/home/InfiniteNewsFeed";
import CategoryBlock from "@/components/home/CategoryBlock";
import NewsSectionHead from "@/components/home/NewsSectionHead";
import {
  getFeaturedArticles,
  getPublishedArticlesPage,
  getBreakingNews,
  getTrendingArticles,
  getArticlesByCategorySlug,
} from "@/lib/services/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/config";
import { HOME_CATEGORY_SLUGS, ARTICLES_PER_CATEGORY } from "@/config/navigation";
import { categories } from "@/data/categories";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

const FEED_PAGE_SIZE = 16;

function mapArticle(a: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  publishedAt: Date;
  readTime: number;
  breaking: boolean;
  category: { name: string; slug: string; color: string };
}) {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    image: a.image,
    publishedAt: a.publishedAt,
    readTime: a.readTime,
    breaking: a.breaking,
    category: a.category,
  };
}

export default async function HomePage() {
  const [featured, breaking, trending24, ...categoryResults] = await Promise.all([
    getFeaturedArticles(),
    getBreakingNews(),
    getTrendingArticles(24, 10),
    ...HOME_CATEGORY_SLUGS.map((slug) =>
      getArticlesByCategorySlug(slug, ARTICLES_PER_CATEGORY)
    ),
  ]);

  let allFeatured = featured.map(mapArticle);
  if (allFeatured.length === 0) {
    const { articles } = await getPublishedArticlesPage(1, 12);
    allFeatured = articles.map(mapArticle);
  }

  const lead = allFeatured[0];
  const secondary = allFeatured.slice(1, 4);
  const heroIds = allFeatured.slice(0, 6).map((a) => a.id);

  const breakingItems = breaking.slice(0, 10).map(mapArticle);
  const sidebarItems =
    breakingItems.length > 0
      ? breakingItems
      : (await getPublishedArticlesPage(1, 6, heroIds)).articles.map(mapArticle);

  const excludeIds = [...new Set([...heroIds, ...sidebarItems.map((a) => a.id)])];

  const { articles: feedInitial, hasMore: feedHasMore } = await getPublishedArticlesPage(
    1,
    FEED_PAGE_SIZE,
    excludeIds
  );

  const trending =
    trending24.length > 0
      ? trending24.map(mapArticle)
      : allFeatured.slice(1, 9);

  const editorPicks =
    trending24.length > 0
      ? trending24.map(mapArticle)
      : (await getPublishedArticlesPage(1, 7, excludeIds)).articles.map(mapArticle);

  return (
    <div className="safe-bottom mx-auto max-w-6xl px-4 pt-4 md:px-6 md:pt-6">
      <YouthHero lead={lead} secondary={secondary} sidebar={sidebarItems} />

      <TrendStrip articles={trending} />

      <GozeKacmasinBlock articles={editorPicks} />

      {HOME_CATEGORY_SLUGS.map((slug, i) => {
        const cat = categories.find((c) => c.slug === slug);
        const articles = categoryResults[i] ?? [];
        if (!cat || articles.length === 0) return null;
        return (
          <CategoryBlock
            key={slug}
            name={cat.name}
            slug={slug}
            color={cat.color}
            articles={articles.map(mapArticle)}
          />
        );
      })}

      <section className="mb-10">
        <NewsSectionHead title="Akış" badge="Yeni" />
        <InfiniteNewsFeed
          initialArticles={feedInitial.map(mapArticle)}
          initialHasMore={feedHasMore}
          excludeIds={excludeIds}
          pageSize={FEED_PAGE_SIZE}
        />
      </section>
    </div>
  );
}
