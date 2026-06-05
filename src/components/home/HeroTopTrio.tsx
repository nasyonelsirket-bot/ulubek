import Link from "next/link";
import ArticleImage from "@/components/news/ArticleImage";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";

interface HeroTopTrioProps {
  items: PortalArticleItem[];
}

export default function HeroTopTrio({ items }: HeroTopTrioProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
      {items.slice(0, 3).map((article, i) => {
        const categorySlug = article.category?.slug ?? "gundem";
        return (
          <article key={article.id} className="group relative overflow-hidden bg-black">
            <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] w-full">
              <ArticleImage
                src={article.image}
                alt={article.title}
                categorySlug={categorySlug}
                priority={i === 0}
                sizes="(max-width:640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {article.category && (
                  <span className="mb-1 inline-block bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    {article.category.name}
                  </span>
                )}
                <h3 className="font-headline line-clamp-2 text-sm font-bold leading-snug text-white group-hover:underline md:text-[15px]">
                  {article.title}
                </h3>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
