import { NextRequest, NextResponse } from "next/server";
import { SourceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const updateSourceSchema = z.object({
  name: z.string().min(2).optional(),
  url: z.string().url().optional(),
  type: z.nativeEnum(SourceType).optional(),
  trustScore: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  fetchIntervalMinutes: z.number().min(5).max(1440).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const source = await prisma.source.findUnique({
    where: { id },
    include: {
      category: true,
      _count: { select: { articles: true } },
    },
  });

  if (!source) return NextResponse.json({ error: "Kaynak bulunamadı" }, { status: 404 });
  return NextResponse.json(source);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateSourceSchema.parse(body);

    if (data.url) {
      const duplicate = await prisma.source.findFirst({
        where: { url: data.url, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Bu RSS URL başka bir kaynakta kullanılıyor" }, { status: 409 });
      }
    }

    const source = await prisma.source.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.trustScore !== undefined && { trustScore: data.trustScore }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.fetchIntervalMinutes !== undefined && { fetchIntervalMinutes: data.fetchIntervalMinutes }),
      },
      include: { category: true },
    });

    return NextResponse.json(source);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  await prisma.source.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
