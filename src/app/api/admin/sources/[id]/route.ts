import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSourceWithCategory } from "@/lib/services/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const source = await getSourceWithCategory(id);

  if (!source) {
    return NextResponse.json({ error: "Kaynak bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(source);
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
  const existing = await getSourceWithCategory(id);

  if (!existing) {
    return NextResponse.json({ error: "Kaynak bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ ...existing, ...body });
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
