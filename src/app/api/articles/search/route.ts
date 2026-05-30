import { NextRequest, NextResponse } from "next/server";
import { searchPublishedArticles } from "@/lib/services/articles";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const articles = await searchPublishedArticles(q);

  return NextResponse.json(
    articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      image: a.image,
      publishedAt: a.publishedAt,
      readTime: a.readTime,
      category: a.category,
    }))
  );
}
