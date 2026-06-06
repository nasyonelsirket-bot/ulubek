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
    <section className="mb-6 md:mb-8">
      {/* Ana manşet — mobilde kenardan kenara */}
      <article className="news-card -mx-4 mb-4 overflow-hidden rounded-none shadow-lg shadow-black/5 sm:mx-0 sm:rounded-2xl">
        <Link href={`/haber/${mainLead.slug}`} className="group relative block">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/10] md:aspect-[2/1]">
            <ArticleImage
              src={mainLead.image}
              alt={mainLead.title}
              categorySlug={mainLead.category?.slug ?? "gundem"}
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <div className="mb-2 flex flex-wrap items-center gap-2 md:mb-3">
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
              <h1 className="font-headline text-xl font-extrabold leading-[1.15] text-white sm:text-2xl md:text-4xl lg:text-[2.75rem] md:leading-[1.12]">
                {mainLead.title}
              </h1>
              {mainLead.excerpt && (
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/85 md:mt-3 md:text-base">
                  {mainLead.excerpt}
                </p>
              )}
              <RelativeTime date={mainLead.publishedAt} className="mt-2 block text-xs font-medium text-white/60 md:mt-3" />
            </div>
          </div>
        </Link>
      </article>

      {quickReads.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 px-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Hızlı Oku
          </p>
          <div className="mobile-scroll-x flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-none">
            {quickReads.map((article, i) => (
              <Link
                key={article.id}
                href={`/haber/${article.slug}`}
                className="news-card flex w-[min(calc(100vw-3rem),300px)] shrink-0 snap-start gap-3 p-2.5 sm:w-[300px]"
              >
                <div className="relative h-[4.5rem] w-20 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-24">
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
                  <h3 className="font-headline line-clamp-3 text-[13px] font-bold leading-snug text-[var(--navy)] sm:text-sm">
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
