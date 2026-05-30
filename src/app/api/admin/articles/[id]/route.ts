import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getArticleById } from "@/lib/services/articles";
import { mockUpdateArticle } from "@/lib/services/admin";
import { notifyArticlePublished } from "@/lib/live/notify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await getArticleById(id);
  if (!existing) {
    return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
  }

  const article = await mockUpdateArticle(id, body);
  if (!article) {
    return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
  }

  const becamePublished = article.status === "PUBLISHED" && existing.status !== "PUBLISHED";
  const breakingChanged =
    body.breaking !== undefined && body.breaking !== existing.breaking;

  if (becamePublished || (article.status === "PUBLISHED" && breakingChanged)) {
    void notifyArticlePublished(article.id);
  }

  return NextResponse.json(article);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  await params;

  return NextResponse.json({ success: true });
}
