import { NextRequest, NextResponse } from "next/server";
import { SourceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createSourceSchema = z.object({
  name: z.string().min(2, "Kaynak adı en az 2 karakter olmalı"),
  url: z.string().url("Geçerli bir RSS URL girin"),
  type: z.nativeEnum(SourceType).default(SourceType.RSS),
  trustScore: z.number().min(0).max(1).default(0.5),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  fetchIntervalMinutes: z.number().min(5).max(1440).default(30),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sources = await prisma.source.findMany({
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { articles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await request.json();
    const data = createSourceSchema.parse(body);

    const existing = await prisma.source.findFirst({
      where: { url: data.url },
    });
    if (existing) {
      return NextResponse.json({ error: "Bu RSS URL zaten kayıtlı" }, { status: 409 });
    }

    const source = await prisma.source.create({
      data: {
        name: data.name,
        url: data.url,
        type: data.type,
        trustScore: data.trustScore,
        isActive: data.isActive,
        categoryId: data.categoryId || null,
        fetchIntervalMinutes: data.fetchIntervalMinutes,
      },
      include: { category: true },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Kaynak oluşturulamadı" }, { status: 500 });
  }
}
