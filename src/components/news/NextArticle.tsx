import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ArticleImage from "@/components/news/ArticleImage";

interface NextArticleProps {
  article: {
    title: string;
    slug: string;
    image?: string | null;
    category?: { slug: string; name: string };
  };
}

export default function NextArticle({ article }: NextArticleProps) {
  const categorySlug = article.category?.slug ?? "gundem";

  return (
    <section className="mt-10 border-t border-border pt-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sonraki Haber</p>
      <Link
        href={`/haber/${article.slug}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:flex-row"
      >
        <div className="relative aspect-video w-full shrink-0 md:aspect-[16/10] md:w-72 lg:w-80">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={categorySlug}
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>
        <div className="flex flex-1 items-center gap-3 p-4 md:p-6">
          <h3 className="font-headline line-clamp-3 flex-1 text-lg font-black leading-snug text-[var(--navy)] group-hover:text-primary md:text-xl">
            {article.title}
          </h3>
          <ChevronRight className="h-6 w-6 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </section>
  );
}
