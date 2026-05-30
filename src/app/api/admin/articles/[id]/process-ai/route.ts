import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processArticleWithAI } from "@/lib/ai/processor";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const result = await processArticleWithAI(id);

  if (!result.success) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}
