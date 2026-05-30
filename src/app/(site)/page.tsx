import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import BreakingNewsSidebar from "@/components/home/BreakingNewsSidebar";
import InfiniteNewsFeed from "@/components/home/InfiniteNewsFeed";
import {
  getFeaturedArticles,
  getPublishedArticlesPage,
  getBreakingNews,
} from "@/lib/services/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

const FEED_PAGE_SIZE = 16;

function mapArticle(a: Awaited<ReturnType<typeof getPublishedArticlesPage>>["articles"][0]) {
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
  const [featured, breaking] = await Promise.all([getFeaturedArticles(), getBreakingNews()]);

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
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-8">
          <HeroSlider slides={sliderSlides} />
        </div>
        <div className="lg:col-span-4">
          <BreakingNewsSidebar items={sidebarBreaking} />
        </div>
      </section>

      <InfiniteNewsFeed
        initialArticles={feedInitial.map(mapArticle)}
        initialHasMore={feedHasMore}
        excludeIds={excludeIds}
        pageSize={FEED_PAGE_SIZE}
      />
    </div>
  );
}
