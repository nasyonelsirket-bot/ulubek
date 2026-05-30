import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, User } from "lucide-react";
import {
  getArticleBySlug,
  getRelatedArticles,
  getNextArticle,
} from "@/lib/services/articles";
import { formatDateTime } from "@/lib/utils/date";
import { formatViewCount, estimateViewCount } from "@/lib/utils/view-count";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import { buildNewsArticleSchema } from "@/lib/seo/news-article-schema";
import { getSiteUrl } from "@/lib/seo/config";
import { enrichArticleHtml } from "@/lib/ai/content-formatter";
import JsonLd from "@/components/seo/JsonLd";
import ShareButtons from "@/components/news/ShareButtons";
import RelatedArticles from "@/components/news/RelatedArticles";
import NextArticle from "@/components/news/NextArticle";
import TableOfContents from "@/components/news/TableOfContents";
import AgendaBox from "@/components/home/AgendaBox";
import ArticleImage from "@/components/news/ArticleImage";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function toSeoInput(article: NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>) {
  return {
    slug: article.slug,
    title: article.title,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    excerpt: article.excerpt,
    image: article.image,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    categoryName: article.category.name,
    tags: article.tags.map((t) => t.tag.name),
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Haber Bulunamadı" };
  return buildArticleMetadata(toSeoInput(article));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [relatedArticles, nextArticle] = await Promise.all([
    getRelatedArticles(article.id, article.categoryId),
    getNextArticle(article.id, article.categoryId),
  ]);

  const siteUrl = getSiteUrl();
  const seoInput = toSeoInput(article);
  const tags = seoInput.tags;
  const jsonLd = buildNewsArticleSchema(seoInput);
  const authorName = "Ulubek Medya Editör";
  const articleHtml = enrichArticleHtml(article.content);
  const viewCount = estimateViewCount(article.id, article.publishedAt);
  const categorySlug = article.category.slug;

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="relative w-full overflow-hidden bg-black md:max-h-[560px]">
        <div className="relative aspect-[4/3] min-h-[45vh] w-full md:aspect-[21/9] md:min-h-[360px]">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={categorySlug}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent md:from-background/80 md:to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
            <span
              className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
            <h1 className="font-headline line-clamp-3 text-2xl font-black leading-tight text-white">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-4 md:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <div className="mb-4 hidden flex-wrap items-center gap-3 md:flex">
              <span
                className="rounded px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
              {article.breaking && (
                <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
                  Son Dakika
                </span>
              )}
            </div>

            <h1 className="font-headline hidden text-3xl font-black leading-tight text-foreground md:block md:text-5xl md:leading-[1.15]">
              {article.title}
            </h1>

            {article.excerpt && (
              <div className="mt-4 border-l-4 border-primary pl-4 md:mt-5 md:pl-5">
                <p className="text-base font-medium leading-[1.85] text-foreground/90 md:text-lg">{article.excerpt}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-border py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{authorName}</p>
                  {article.source && (
                    <p className="text-xs text-muted-foreground">Kaynak: {article.source.name}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDateTime(article.publishedAt.toISOString())}
                </time>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime} dk okuma
                </span>
                <span>{formatViewCount(viewCount)} okunma</span>
              </div>
            </div>

            <div
              className="prose-content mt-6 max-w-none text-base md:mt-8 md:text-lg"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-border pt-6">
              <ShareButtons title={article.title} url={`${siteUrl}/haber/${article.slug}`} />
            </div>

            {nextArticle && (
              <NextArticle
                article={{
                  title: nextArticle.title,
                  slug: nextArticle.slug,
                  image: nextArticle.image,
                  category: nextArticle.category,
                }}
              />
            )}

            <RelatedArticles
              articles={relatedArticles.map((a) => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                excerpt: a.excerpt,
                image: a.image,
                publishedAt: a.publishedAt,
                readTime: a.readTime,
                category: a.category,
              }))}
            />
          </article>

          <aside className="hidden space-y-6 lg:col-span-4 lg:block">
            <TableOfContents content={articleHtml} />
            <AgendaBox
              items={relatedArticles.slice(0, 5).map((a) => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                publishedAt: a.publishedAt,
                category: { name: a.category.name, color: a.category.color },
              }))}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
