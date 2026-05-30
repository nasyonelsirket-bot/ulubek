export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId: string;
  image: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  breaking: boolean;
  tags: string[];
}
