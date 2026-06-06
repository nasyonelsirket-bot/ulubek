import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
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
  const articleHtml = enrichArticleHtml(article.content);
  const viewCount = estimateViewCount(article.id, article.publishedAt);
  const categorySlug = article.category.slug;

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="safe-bottom mx-auto max-w-3xl px-4 pb-10 pt-0 md:max-w-4xl md:px-6 md:pt-4">
        {/* Kapak görseli */}
        <div className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:rounded-2xl">
          <div className="relative aspect-[4/3] w-full md:aspect-[16/9]">
            <ArticleImage
              src={article.image}
              alt={article.title}
              categorySlug={categorySlug}
              priority
              sizes="100vw"
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
          {article.breaking && (
            <span className="news-badge news-badge-live">Son Dakika</span>
          )}
        </div>

        <h1 className="font-headline text-2xl font-extrabold leading-[1.15] text-[var(--navy)] md:text-4xl md:leading-[1.12]">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-4 text-lg font-medium leading-relaxed text-muted-foreground">{article.excerpt}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-border py-4 text-sm text-muted-foreground">
          <time dateTime={article.publishedAt.toISOString()}>{formatDateTime(article.publishedAt.toISOString())}</time>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} dk
          </span>
          <span>{formatViewCount(viewCount)} okunma</span>
          {article.source && <span>Kaynak: {article.source.name}</span>}
        </div>

        <div
          className="prose-content mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />

        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-5">
          <p className="mb-3 text-sm font-bold text-[var(--navy)]">Paylaş</p>
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
    </>
  );
}
