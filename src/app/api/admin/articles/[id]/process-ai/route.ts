import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { mockProcessArticleWithAI } from "@/lib/services/admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const result = await mockProcessArticleWithAI(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result);
}
