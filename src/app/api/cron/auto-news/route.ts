import { NextRequest, NextResponse } from "next/server";
import { runAutoNewsPipeline, runBootstrapImport } from "@/lib/ai-engine/pipeline";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";
import { BOOTSTRAP_ARTICLE_TARGET } from "@/lib/ai-engine/runtime-init";
import { runNewsApiPipeline } from "@/lib/newsapi/pipeline";
import { countArticlesInDb } from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function getArticleCount(): Promise<number> {
  if (await checkDatabaseConnection()) return countArticlesInDb();
  return getDynamicArticleCount();
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const newsApiSummary = await runNewsApiPipeline({ trigger: "cron" });

    let summary;
    const count = await getArticleCount();
    if (count < BOOTSTRAP_ARTICLE_TARGET) {
      summary = await runBootstrapImport(3);
    } else {
      summary = await runAutoNewsPipeline({ respectInterval: true, trigger: "cron" });
    }

    return NextResponse.json({
      ok: true,
      databaseCount: await getArticleCount(),
      newsApi: newsApiSummary,
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
