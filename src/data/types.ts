export type ArticleStatus = "PUBLISHED" | "DRAFT" | "HIDDEN" | "ARCHIVED";

export type UserRole = "ADMIN" | "EDITOR";

export type SourceType = "RSS" | "MANUAL";

export type SourceKind = "RSS" | "MINISTRY" | "MANUAL";

export type SourceFetchType = "RSS" | "WEB";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  sortOrder: number;
}

export interface RawArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  image: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  featured: boolean;
  breaking: boolean;
  tags: string[];
  status?: ArticleStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
  sourceName?: string | null;
  aiProcessed?: boolean;
  aiProcessingError?: string | null;
}

export interface ArticleWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  readTime: number;
  publishedAt: Date;
  updatedAt: Date;
  createdAt: Date;
  categoryId: string;
  category: Category;
  tags: { tag: { id: string; name: string; slug: string } }[];
  source: { id: string; name: string } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  aiProcessed: boolean;
  aiProcessingError: string | null;
}

export type QueueStatus = "SCANNED" | "PENDING" | "PUBLISHED" | "REJECTED";

export interface QueueItem {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  originalTitle: string;
  originalContent: string;
  status: QueueStatus;
  articleId?: string;
  imagePrompt?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface MockSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  kind?: SourceKind;
  fetchType?: SourceFetchType;
  isActive: boolean;
  trustScore: number;
  categoryId: string;
  lastFetchedAt: string | null;
  fetchIntervalMin: number;
  lastFetchError?: string | null;
  articlesImported?: number;
}

export interface MockAdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}
