import type { Metadata } from "next";
import YouthHero from "@/components/home/YouthHero";
import TrendStrip from "@/components/home/TrendStrip";
import GozeKacmasinBlock from "@/components/home/GozeKacmasinBlock";
import InfiniteNewsFeed from "@/components/home/InfiniteNewsFeed";
import CategoryBlock from "@/components/home/CategoryBlock";
import NewsSectionHead from "@/components/home/NewsSectionHead";
import { getHomePageData, FEED_PAGE_SIZE } from "@/lib/services/home-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/config";
import { HOME_CATEGORY_SLUGS } from "@/config/navigation";
import { categories } from "@/data/categories";

export const revalidate = 120;

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

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
  const data = await getHomePageData();
  if (!data) {
    return (
      <div className="safe-bottom mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
        Henüz haber yok — birazdan burada olur.
      </div>
    );
  }

  const { lead, secondary, sidebar, trending, editorPicks, categoryArticles, feedInitial, feedHasMore, excludeIds } = data;

  return (
    <div className="safe-bottom page-shell py-4 pt-3 md:py-6 md:pt-6">
      <YouthHero
        lead={lead ? mapArticle(lead) : undefined}
        secondary={secondary.map(mapArticle)}
        sidebar={sidebar.map(mapArticle)}
      />

      <TrendStrip articles={trending.map(mapArticle)} />

      <GozeKacmasinBlock articles={editorPicks.map(mapArticle)} />

      {HOME_CATEGORY_SLUGS.map((slug) => {
        const cat = categories.find((c) => c.slug === slug);
        const articles = categoryArticles[slug] ?? [];
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
