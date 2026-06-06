import { NextRequest, NextResponse } from "next/server";
import { runAutoNewsPipeline, runBootstrapImport } from "@/lib/ai-engine/pipeline";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";
import { BOOTSTRAP_ARTICLE_TARGET } from "@/lib/ai-engine/runtime-init";
import { runNewsApiPipeline } from "@/lib/newsapi/pipeline";
import { countArticlesInDb } from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { ensureDefaultRssSources } from "@/lib/db/ensure-sources";

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
    const rssSourceCount = await ensureDefaultRssSources();
    const count = await getArticleCount();

    const [newsApiSummary, rssSummary] = await Promise.all([
      runNewsApiPipeline({ trigger: "cron" }),
      count < BOOTSTRAP_ARTICLE_TARGET
        ? runBootstrapImport(2)
        : runAutoNewsPipeline({ respectInterval: true, trigger: "cron", fastTrack: true }),
    ]);

    return NextResponse.json({
      ok: true,
      databaseCount: await getArticleCount(),
      rssSourcesRegistered: rssSourceCount,
      newsApi: newsApiSummary,
      ...rssSummary,
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
