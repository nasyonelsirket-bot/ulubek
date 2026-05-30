import { NextRequest, NextResponse } from "next/server";
import { fetchAllActiveRssSources } from "@/lib/rss/importer";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const results = await fetchAllActiveRssSources();

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    sourcesProcessed: results.length,
    created: results.reduce((s, r) => s + r.created, 0),
    skipped: results.reduce((s, r) => s + r.skipped, 0),
    errors: results.reduce((s, r) => s + r.errors, 0),
    results,
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
