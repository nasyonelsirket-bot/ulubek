import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Clock, User } from "lucide-react";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/services/articles";
import { formatDateTime } from "@/lib/utils/date";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import { buildNewsArticleSchema } from "@/lib/seo/news-article-schema";
import { getSiteUrl } from "@/lib/seo/config";
import { enrichArticleHtml } from "@/lib/ai/content-formatter";
import JsonLd from "@/components/seo/JsonLd";
import ShareButtons from "@/components/news/ShareButtons";
import RelatedArticles from "@/components/news/RelatedArticles";
import TableOfContents from "@/components/news/TableOfContents";
import AgendaBox from "@/components/home/AgendaBox";

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

  const relatedArticles = await getRelatedArticles(article.id, article.categoryId);
  const siteUrl = getSiteUrl();
  const seoInput = toSeoInput(article);
  const tags = seoInput.tags;
  const jsonLd = buildNewsArticleSchema(seoInput);
  const authorName = "Ulubek Medya Editör";
  const articleHtml = enrichArticleHtml(article.content);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Kapak görseli — tam genişlik */}
      {article.image && (
        <div className="relative aspect-[21/9] max-h-[520px] w-full overflow-hidden bg-secondary">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Ana içerik */}
          <article className="lg:col-span-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
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

            <h1 className="font-headline text-3xl font-black leading-tight text-foreground md:text-5xl md:leading-[1.15]">
              {article.title}
            </h1>

            {article.excerpt && (
              <div className="mt-5 border-l-4 border-primary pl-5">
                <p className="text-base leading-[1.9] text-muted-foreground md:text-lg">{article.excerpt}</p>
              </div>
            )}

            {/* Yazar + meta */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDateTime(article.publishedAt.toISOString())}
                </time>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime} dk okuma
                </span>
              </div>
            </div>

            <div
              className="prose-content mt-8 max-w-none text-base md:text-lg"
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

            <RelatedArticles
              articles={relatedArticles.map((a) => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                image: a.image,
                publishedAt: a.publishedAt,
                readTime: a.readTime,
                category: a.category,
              }))}
            />
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
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
