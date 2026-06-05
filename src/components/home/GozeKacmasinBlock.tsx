import Link from "next/link";
import ArticleImage from "@/components/news/ArticleImage";
import { PortalArticleGrid } from "@/components/news/PortalArticleCard";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";

interface GozeKacmasinBlockProps {
  articles: PortalArticleItem[];
}

export default function GozeKacmasinBlock({ articles }: GozeKacmasinBlockProps) {
  if (articles.length < 2) return null;

  const [lead, ...rest] = articles;
  const categorySlug = lead.category?.slug ?? "gundem";

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between border-b-2 border-[var(--navy)] pb-2">
        <h2 className="font-headline text-lg font-bold text-[var(--navy)]">Gözden Kaçmasın</h2>
        <Link href="/arama" className="text-xs font-bold uppercase text-primary hover:underline">
          Tümünü Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <article className="group overflow-hidden border border-border bg-white lg:col-span-5">
          <Link href={`/haber/${lead.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden">
            <ArticleImage
              src={lead.image}
              alt={lead.title}
              categorySlug={categorySlug}
              priority
              sizes="(max-width:1024px) 100vw, 500px"
            />
          </Link>
          <div className="p-4">
            {lead.category && (
              <span className="mb-2 inline-block bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                {lead.category.name}
              </span>
            )}
            <Link href={`/haber/${lead.slug}`}>
              <h3 className="font-headline text-xl font-bold leading-tight text-[var(--navy)] group-hover:text-primary md:text-2xl">
                {lead.title}
              </h3>
            </Link>
            {lead.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{lead.excerpt}</p>
            )}
          </div>
        </article>

        <div className="lg:col-span-7">
          <PortalArticleGrid articles={rest.slice(0, 6)} columns={2} variant="compact" priorityCount={2} />
        </div>
      </div>
    </section>
  );
}
