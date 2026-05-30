import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSources, addSource } from "@/lib/services/admin";
import type { SourceKind } from "@/data/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  return NextResponse.json(await getAllSources());
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const source = await addSource({
    name: body.name,
    url: body.url,
    kind: (body.kind || "MANUAL") as SourceKind,
    fetchType: body.fetchType,
    urlType: body.urlType,
    isActive: body.isActive ?? true,
    trustScore: body.trustScore ?? 0.8,
    categoryId: body.categoryId,
    fetchIntervalMin: body.fetchIntervalMin ?? 1,
  });

  return NextResponse.json(source, { status: 201 });
}
