import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/services/articles";
import { formatDateTime } from "@/lib/utils/date";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import { buildNewsArticleSchema } from "@/lib/seo/news-article-schema";
import { getSiteUrl } from "@/lib/seo/config";
import JsonLd from "@/components/seo/JsonLd";
import ShareButtons from "@/components/news/ShareButtons";
import RelatedArticles from "@/components/news/RelatedArticles";
import Sidebar from "@/components/layout/Sidebar";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <JsonLd data={jsonLd} />
      <article className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            {article.image && (
              <div className="relative aspect-[16/9]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span
                  className="inline-block rounded-md px-3 py-1 text-sm font-semibold uppercase text-white"
                  style={{ backgroundColor: article.category.color }}
                >
                  {article.category.name}
                </span>
                {article.breaking && (
                  <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
                    Son Dakika
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="mt-4 text-lg leading-relaxed text-gray-600">{article.excerpt}</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 py-4">
                {article.source && (
                  <p className="text-sm text-gray-500">
                    Kaynak: <span className="font-medium text-gray-700">{article.source.name}</span>
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  <time dateTime={article.publishedAt.toISOString()}>
                    {formatDateTime(article.publishedAt.toISOString())}
                  </time>
                  <span className="mx-2">·</span>
                  <span>{article.readTime} dk okuma</span>
                </div>
              </div>

              <div
                className="prose-content mt-8 text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-gray-100 pt-6">
                <ShareButtons title={article.title} url={`${siteUrl}/haber/${article.slug}`} />
              </div>
            </div>
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
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </article>
    </div>
  );
}
