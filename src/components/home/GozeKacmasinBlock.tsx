import Link from "next/link";
import ArticleImage from "@/components/news/ArticleImage";
import { PortalArticleGrid } from "@/components/news/PortalArticleCard";
import NewsSectionHead from "@/components/home/NewsSectionHead";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";

interface GozeKacmasinBlockProps {
  articles: PortalArticleItem[];
}

export default function GozeKacmasinBlock({ articles }: GozeKacmasinBlockProps) {
  if (articles.length < 2) return null;

  const [lead, ...rest] = articles;
  const categorySlug = lead.category?.slug ?? "gundem";

  return (
    <section className="mb-8 md:mb-10">
      <NewsSectionHead title="Kaçırma" href="/arama" linkLabel="Hepsi" badge="Hot" />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
        <article className="news-card group overflow-hidden">
          <Link href={`/haber/${lead.slug}`} className="relative block aspect-[16/10] overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:min-h-[320px] lg:h-full">
            <ArticleImage
              src={lead.image}
              alt={lead.title}
              categorySlug={categorySlug}
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-4 sm:p-5">
              {lead.category && (
                <span
                  className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: lead.category.color }}
                >
                  {lead.category.name}
                </span>
              )}
              <h3 className="font-headline text-lg font-extrabold leading-tight text-white sm:text-xl md:text-2xl">
                {lead.title}
              </h3>
            </div>
          </Link>
        </article>

        <div className="flex flex-col gap-3">
          <PortalArticleGrid articles={rest.slice(0, 4)} columns={2} variant="compact" priorityCount={2} />
        </div>
      </div>
    </section>
  );
}
