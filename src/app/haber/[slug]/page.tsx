import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getArticleBySlug, getAllArticles, getRelatedArticles } from "@/lib/data/articles";
import { getCategoryById } from "@/lib/data/categories";
import { getAuthorById } from "@/lib/data/authors";
import { formatDateTime } from "@/lib/utils/date";
import CategoryBadge from "@/components/news/CategoryBadge";
import ShareButtons from "@/components/news/ShareButtons";
import RelatedArticles from "@/components/news/RelatedArticles";
import Sidebar from "@/components/layout/Sidebar";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Haber Bulunamadı" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const category = getCategoryById(article.categoryId);
  const author = getAuthorById(article.authorId);
  const relatedArticles = getRelatedArticles(article);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ulubekmedya.com";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <article className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
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

            <div className="p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {category && <CategoryBadge category={category} size="md" />}
                {article.breaking && (
                  <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
                    Son Dakika
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
                {article.title}
              </h1>

              <p className="mt-4 text-lg leading-relaxed text-gray-600">{article.excerpt}</p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 py-4">
                {author && (
                  <div className="flex items-center gap-3">
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{author.name}</p>
                      <p className="text-sm text-gray-500">{author.role}</p>
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
                  <span className="mx-2">·</span>
                  <span>{article.readTime} dk okuma</span>
                </div>
              </div>

              <div
                className="prose-content mt-8 text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {article.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-gray-100 pt-6">
                <ShareButtons
                  title={article.title}
                  url={`${siteUrl}/haber/${article.slug}`}
                />
              </div>
            </div>
          </div>

          <RelatedArticles articles={relatedArticles} />
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </article>
    </div>
  );
}
