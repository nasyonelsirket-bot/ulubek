import Link from "next/link";
import ArticleImage from "@/components/news/ArticleImage";
import RelativeTime from "@/components/ui/RelativeTime";
import HeroMarketsBar from "@/components/home/HeroMarketsBar";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";

interface YouthHeroProps {
  lead?: PortalArticleItem;
  secondary: PortalArticleItem[];
  sidebar: PortalArticleItem[];
}

export default function YouthHero({ lead, secondary, sidebar }: YouthHeroProps) {
  const mainLead = lead ?? secondary[0];
  if (!mainLead) return null;

  const quickReads = [...secondary.filter((a) => a.id !== mainLead.id), ...sidebar].slice(0, 4);

  return (
    <section className="mb-8">
      {/* Ana manşet — mobilde tam ekran hissi */}
      <article className="news-card mb-4 overflow-hidden shadow-lg shadow-black/5">
        <Link href={`/haber/${mainLead.slug}`} className="group relative block">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[2/1]">
            <ArticleImage
              src={mainLead.image}
              alt={mainLead.title}
              categorySlug={mainLead.category?.slug ?? "gundem"}
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {mainLead.breaking && (
                  <span className="news-badge news-badge-live bg-red-500/20 text-white backdrop-blur-sm">
                    Son Dakika
                  </span>
                )}
                {mainLead.category && (
                  <span
                    className="news-badge news-badge-cat rounded-full"
                    style={{ backgroundColor: mainLead.category.color }}
                  >
                    {mainLead.category.name}
                  </span>
                )}
              </div>
              <h1 className="font-headline text-2xl font-extrabold leading-[1.12] text-white sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                {mainLead.title}
              </h1>
              {mainLead.excerpt && (
                <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                  {mainLead.excerpt}
                </p>
              )}
              <RelativeTime date={mainLead.publishedAt} className="mt-3 block text-xs font-medium text-white/60" />
            </div>
          </div>
        </Link>
      </article>

      {/* Hızlı oku — yatay kaydırma */}
      {quickReads.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 px-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Hızlı Oku
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {quickReads.map((article, i) => (
              <Link
                key={article.id}
                href={`/haber/${article.slug}`}
                className="news-card flex w-[280px] shrink-0 gap-3 p-2 sm:w-[320px]"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                  <ArticleImage
                    src={article.image}
                    alt={article.title}
                    categorySlug={article.category?.slug ?? "gundem"}
                    priority={i === 0}
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  {article.category && (
                    <span className="text-[10px] font-bold uppercase text-primary">{article.category.name}</span>
                  )}
                  <h3 className="font-headline line-clamp-3 text-sm font-bold leading-snug text-[var(--navy)]">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <HeroMarketsBar />
    </section>
  );
}
