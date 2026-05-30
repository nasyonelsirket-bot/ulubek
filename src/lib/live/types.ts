export interface LiveArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: string;
  readTime: number;
  breaking: boolean;
  featured: boolean;
  category: {
    name: string;
    slug: string;
    color: string;
  };
}

export type LiveEventType = "BREAKING_NEWS" | "NEW_ARTICLE" | "CONNECTED";

export interface LiveEvent {
  type: LiveEventType;
  article?: LiveArticle;
  timestamp: string;
}
