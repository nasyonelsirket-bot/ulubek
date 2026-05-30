export interface AIProcessedResult {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  breaking: boolean;
  analysis: {
    topic: string;
    neutralityScore: number;
    confidence: number;
  };
}

export interface AIProcessInput {
  title: string;
  content: string;
  excerpt?: string;
  sourceName?: string;
  categories: Array<{ slug: string; name: string; description?: string | null }>;
}
