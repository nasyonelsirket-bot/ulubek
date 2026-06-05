import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import BreakingNewsSidebar from "@/components/home/BreakingNewsSidebar";
import InfiniteNewsFeed from "@/components/home/InfiniteNewsFeed";
import TrendBlock from "@/components/home/TrendBlock";
import CategoryBlock from "@/components/home/CategoryBlock";
import HomeSonDakika from "@/components/home/HomeSonDakika";
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
  const [featured, breaking, trending24, trending7d, ...categoryResults] = await Promise.all([
    getFeaturedArticles(),
    getBreakingNews(),
    getTrendingArticles(24, 8),
    getTrendingArticles(168, 8),
    ...HOME_CATEGORY_SLUGS.map((slug) =>
      getArticlesByCategorySlug(slug, ARTICLES_PER_CATEGORY)
    ),
  ]);

  let sliderSlides = featured.slice(0, 6).map(mapArticle);
  if (sliderSlides.length === 0) {
    const { articles } = await getPublishedArticlesPage(1, 6);
    sliderSlides = articles.map(mapArticle);
  }

  const heroIds = sliderSlides.map((a) => a.id);
  const breakingItems = breaking.slice(0, 10).map(mapArticle);
  const sidebarBreaking =
    breakingItems.length > 0
      ? breakingItems
      : (await getPublishedArticlesPage(1, 10, heroIds)).articles.map(mapArticle);

  const excludeIds = [...new Set([...heroIds, ...sidebarBreaking.map((a) => a.id)])];

  const { articles: feedInitial, hasMore: feedHasMore } = await getPublishedArticlesPage(
    1,
    FEED_PAGE_SIZE,
    excludeIds
  );

  return (
    <div className="mx-auto max-w-[1400px] px-3 pt-3 pb-0">
      <HomeSonDakika items={sidebarBreaking} />

      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-8">
          <HeroSlider slides={sliderSlides} />
        </div>
        <div className="hidden lg:col-span-4 lg:block">
          <BreakingNewsSidebar items={sidebarBreaking} />
        </div>
      </section>

      <TrendBlock
        articles24h={trending24.map(mapArticle)}
        articles7d={trending7d.map(mapArticle)}
      />

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

      <section className="mb-6 mt-2">
        <div className="portal-section-head mb-4">
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
