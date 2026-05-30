import { NextRequest, NextResponse } from "next/server";
import type { ArticleStatus } from "@/data/types";
import { getSession } from "@/lib/auth";
import { getAllArticlesForAdmin } from "@/lib/services/articles";
import { mockUpdateArticle } from "@/lib/services/admin";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") as ArticleStatus | null;
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let articles = await getAllArticlesForAdmin();

  if (status) {
    articles = articles.filter((a) => a.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt?.toLowerCase().includes(q) ?? false)
    );
  }

  const total = articles.length;
  const skip = (page - 1) * limit;
  const paged = articles.slice(skip, skip + limit);

  return NextResponse.json({
    articles: paged,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "Haber ID gerekli" }, { status: 400 });
  }

  const article = await mockUpdateArticle(id, data);
  if (!article) {
    return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Haber ID gerekli" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
