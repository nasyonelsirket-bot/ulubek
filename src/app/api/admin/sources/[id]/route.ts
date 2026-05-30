import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSourceWithCategory, updateSource, deleteSource } from "@/lib/services/admin";

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
  const updated = await updateSource(id, body);

  if (!updated) {
    return NextResponse.json({ error: "Kaynak bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(updated);
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
  await deleteSource(id);
  return NextResponse.json({ success: true });
}
