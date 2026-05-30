import { NextRequest, NextResponse } from "next/server";
import { getPublishedArticlesPage } from "@/lib/services/articles";

export async function GET(request: NextRequest) {
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1", 10));
  const limit = Math.min(24, Math.max(4, parseInt(request.nextUrl.searchParams.get("limit") || "12", 10)));
  const excludeParam = request.nextUrl.searchParams.get("exclude") || "";
  const excludeIds = excludeParam.split(",").map((s) => s.trim()).filter(Boolean);

  const { articles, hasMore, total } = await getPublishedArticlesPage(page, limit, excludeIds);

  return NextResponse.json({
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      image: a.image,
      publishedAt: a.publishedAt,
      readTime: a.readTime,
      category: a.category,
    })),
    hasMore,
    total,
    page,
  });
}
