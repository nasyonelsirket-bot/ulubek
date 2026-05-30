import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import AgendaBox from "@/components/home/AgendaBox";
import CategoryBlock from "@/components/home/CategoryBlock";
import PremiumArticleCard from "@/components/news/PremiumArticleCard";
import {
  getFeaturedArticles,
  getPublishedArticles,
  getArticlesByCategorySlug,
} from "@/lib/services/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/config";
import { categories } from "@/data/categories";

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

const HOME_CATEGORIES = ["gundem", "ekonomi", "dunya", "teknoloji", "saglik", "spor"] as const;
const ARTICLES_PER_CATEGORY = 8;

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
  const [featured, latest, ...categoryResults] = await Promise.all([
    getFeaturedArticles(),
    getPublishedArticles(24),
    ...HOME_CATEGORIES.map((slug) => getArticlesByCategorySlug(slug, ARTICLES_PER_CATEGORY)),
  ]);

  const sliderSlides = featured.slice(0, 6).map(mapArticle);
  const agendaItems = latest.slice(0, 10).map(mapArticle);
  const latestGrid = latest.slice(0, 8).map(mapArticle);

  const categoryBlocks = HOME_CATEGORIES.map((slug, i) => {
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
    <div className="mx-auto max-w-[1400px] px-3 py-4 md:py-5">
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HeroSlider slides={sliderSlides} />
        </div>
        <div className="lg:col-span-4">
          <AgendaBox items={agendaItems} />
        </div>
      </div>

      <section className="mb-6">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-primary pb-2">
          <h2 className="news-section-title text-xl text-foreground md:text-2xl">Son Haberler</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestGrid.map((article, i) => (
            <PremiumArticleCard key={article.id} article={article} priority={i < 4} />
          ))}
        </div>
      </section>

      {categoryBlocks.map((block) => (
        <CategoryBlock
          key={block.slug}
          name={block.name}
          slug={block.slug}
          color={block.color}
          articles={block.articles}
        />
      ))}
    </div>
  );
}
