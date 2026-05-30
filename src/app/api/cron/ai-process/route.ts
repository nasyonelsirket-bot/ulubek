import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processPendingArticles } from "@/lib/ai/processor";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
  }

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const results = await processPendingArticles(limit);

  return NextResponse.json({
    processed: results.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  });
}
