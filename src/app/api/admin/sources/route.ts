import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSources } from "@/lib/services/admin";
import { categories } from "@/data/categories";
import type { SourceType } from "@/data/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const allSources = await getAllSources();
  return NextResponse.json(allSources);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();

  const source = {
    id: `src-${Date.now()}`,
    name: body.name,
    url: body.url,
    type: (body.type || "RSS") as SourceType,
    isActive: body.isActive ?? true,
    trustScore: body.trustScore ?? 0.8,
    categoryId: body.categoryId,
    lastFetchedAt: null,
    fetchIntervalMin: body.fetchIntervalMin ?? 60,
    category: categories.find((c) => c.id === body.categoryId) ?? {
      id: body.categoryId,
      name: "Genel",
    },
  };

  return NextResponse.json(source, { status: 201 });
}
