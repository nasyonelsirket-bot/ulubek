import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
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

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      source: true,
    },
  });

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

  const existing = await prisma.article.findUnique({
    where: { id },
    select: { status: true, breaking: true },
  });

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.breaking !== undefined && { breaking: body.breaking }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
      ...(body.readTime !== undefined && { readTime: body.readTime }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  });

  const becamePublished =
    article.status === ArticleStatus.PUBLISHED &&
    existing?.status !== ArticleStatus.PUBLISHED;
  const breakingChanged =
    body.breaking !== undefined && body.breaking !== existing?.breaking;

  if (becamePublished || (article.status === ArticleStatus.PUBLISHED && breakingChanged)) {
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

  const { id } = await params;
  await prisma.article.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
