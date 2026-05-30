import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import AgendaBox from "@/components/home/AgendaBox";
import CategoryBlock from "@/components/home/CategoryBlock";
import HomeSonDakika from "@/components/home/HomeSonDakika";
import TrendBlock from "@/components/home/TrendBlock";
import PremiumArticleCard from "@/components/news/PremiumArticleCard";
import {
  getFeaturedArticles,
  getPublishedArticles,
  getArticlesByCategorySlug,
  getBreakingNews,
  getTrendingArticles,
} from "@/lib/services/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/config";
import { categories } from "@/data/categories";

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

import { HOME_CATEGORY_SLUGS, ARTICLES_PER_CATEGORY } from "@/config/navigation";

function mapArticle(a: Awaited<ReturnType<typeof getPublishedArticles>>[0]) {
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
  const [featured, latest, breaking, trending24h, trending7d, ...categoryResults] = await Promise.all([
    getFeaturedArticles(),
    getPublishedArticles(24),
    getBreakingNews(),
    getTrendingArticles(24, 6),
    getTrendingArticles(168, 6),
    ...HOME_CATEGORY_SLUGS.map((slug) => getArticlesByCategorySlug(slug, ARTICLES_PER_CATEGORY)),
  ]);

  const sliderSlides = (featured.length > 0 ? featured : latest).slice(0, 6).map(mapArticle);
  const breakingItems = breaking.slice(0, 4).map(mapArticle);
  const trend24 = trending24h.map(mapArticle);
  const trend7 = trending7d.map(mapArticle);
  const agendaItems = latest.slice(0, 10).map(mapArticle);
  const latestGrid = latest.slice(0, 8).map(mapArticle);

  const categoryBlocks = HOME_CATEGORY_SLUGS.map((slug, i) => {
    const articles = categoryResults[i].slice(0, ARTICLES_PER_CATEGORY).map(mapArticle);
    const cat = categories.find((c) => c.slug === slug);
    return {
      slug,
      name: cat?.name ?? slug,
      color: cat?.color ?? "#c41e1e",
      articles,
    };
  });

  return (
    <>
      <section className="w-full md:mx-auto md:max-w-[1400px] md:px-3 md:pt-4">
        <HeroSlider slides={sliderSlides} />
      </section>

      <div className="mx-auto max-w-[1400px] md:px-3 md:py-5">
        <HomeSonDakika items={breakingItems} />
        <TrendBlock articles24h={trend24} articles7d={trend7} />

        {categoryBlocks.map((block) => (
          <CategoryBlock
            key={block.slug}
            name={block.name}
            slug={block.slug}
            color={block.color}
            articles={block.articles}
          />
        ))}

        <section className="mb-8 hidden lg:block">
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center gap-3 border-b-2 border-primary pb-2">
                <h2 className="news-section-title text-xl text-foreground md:text-2xl">Son Haberler</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {latestGrid.map((article, i) => (
                  <PremiumArticleCard key={article.id} article={article} priority={i < 4} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <AgendaBox items={agendaItems} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
