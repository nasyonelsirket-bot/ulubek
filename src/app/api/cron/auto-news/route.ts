import { NextRequest, NextResponse } from "next/server";
import { runAutoNewsPipeline, runBootstrapImport } from "@/lib/ai-engine/pipeline";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";
import { BOOTSTRAP_ARTICLE_TARGET } from "@/lib/ai-engine/runtime-init";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    let summary;
    if (getDynamicArticleCount() < BOOTSTRAP_ARTICLE_TARGET) {
      summary = await runBootstrapImport(3);
    } else {
      summary = await runAutoNewsPipeline({ respectInterval: true, trigger: "cron" });
    }

    return NextResponse.json({
      ok: true,
      databaseCount: getDynamicArticleCount(),
      ...summary,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Pipeline hatası" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
