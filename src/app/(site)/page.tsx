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

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

const HOME_CATEGORIES = ["gundem", "ekonomi", "teknoloji", "dunya", "spor", "saglik"] as const;

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
    getPublishedArticles(20),
    ...HOME_CATEGORIES.map((slug) => getArticlesByCategorySlug(slug)),
  ]);

  const sliderSlides = featured.slice(0, 5).map(mapArticle);
  const agendaItems = latest.slice(0, 8).map(mapArticle);
  const latestGrid = latest.slice(0, 6).map(mapArticle);

  const categoryBlocks = HOME_CATEGORIES.map((slug, i) => {
    const articles = categoryResults[i].slice(0, 4).map(mapArticle);
    const cat = articles[0]?.category ?? categoryResults[i][0]?.category;
    return {
      slug,
      name: cat?.name ?? slug,
      color: cat?.color ?? "#c41e1e",
      articles,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      {/* Hero + Gündem */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeroSlider slides={sliderSlides} />
        </div>
        <div className="lg:col-span-1">
          <AgendaBox items={agendaItems} />
        </div>
      </div>

      {/* Son Haberler grid */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-primary pb-2">
          <h2 className="text-xl font-black uppercase tracking-wide text-foreground md:text-2xl">
            Son Haberler
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestGrid.map((article, i) => (
            <PremiumArticleCard key={article.id} article={article} priority={i < 3} />
          ))}
        </div>
      </section>

      {/* Kategori blokları */}
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
