import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import HeroTopTrio from "@/components/home/HeroTopTrio";
import HeroSidebarList from "@/components/home/HeroSidebarList";
import HeroMarketsBar from "@/components/home/HeroMarketsBar";
import GozeKacmasinBlock from "@/components/home/GozeKacmasinBlock";
import InfiniteNewsFeed from "@/components/home/InfiniteNewsFeed";
import CategoryBlock from "@/components/home/CategoryBlock";
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

  const topTrio = allFeatured.slice(0, 3);
  const sliderSlides = allFeatured.slice(3, 9);
  const heroIds = [...topTrio, ...sliderSlides].map((a) => a.id);

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

  const gozeKacmasinArticles =
    trending24.length > 0
      ? trending24.map(mapArticle)
      : (await getPublishedArticlesPage(1, 7, excludeIds)).articles.map(mapArticle);

  return (
    <div className="mx-auto max-w-[1280px] px-3 pt-3 pb-0">
      {/* Hero — Hürriyet tarzı */}
      <section className="mb-6">
        <HeroTopTrio items={topTrio} />

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:gap-3">
          <div className="lg:col-span-8">
            <HeroSlider slides={sliderSlides.length > 0 ? sliderSlides : allFeatured.slice(0, 6)} />
          </div>
          <div className="lg:col-span-4">
            <HeroSidebarList items={sidebarItems} title="Son Dakika" />
          </div>
        </div>

        <HeroMarketsBar />
      </section>

      {/* Gözden Kaçmasın */}
      <GozeKacmasinBlock articles={gozeKacmasinArticles} />

      {/* Kategori gridleri — 4 sütun */}
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

      {/* Haber akışı */}
      <section className="mb-6 mt-2">
        <div className="mb-3 flex items-center justify-between border-b-2 border-[var(--navy)] pb-2">
          <h2 className="font-headline text-lg font-bold text-[var(--navy)]">Haber Akışı</h2>
        </div>
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
