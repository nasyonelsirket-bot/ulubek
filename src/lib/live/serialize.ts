import type { LiveArticle } from "./types";

interface ArticleLike {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: Date;
  readTime: number;
  breaking: boolean;
  featured: boolean;
  category: {
    name: string;
    slug: string;
    color: string;
  };
}

export function serializeLiveArticle(article: ArticleLike): LiveArticle {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    image: article.image,
    publishedAt: article.publishedAt.toISOString(),
    readTime: article.readTime,
    breaking: article.breaking,
    featured: article.featured,
    category: {
      name: article.category.name,
      slug: article.category.slug,
      color: article.category.color,
    },
  };
}
