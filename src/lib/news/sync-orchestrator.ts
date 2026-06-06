import { runAutoNewsPipeline, runBootstrapImport } from "@/lib/ai-engine/pipeline";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";
import { BOOTSTRAP_ARTICLE_TARGET } from "@/lib/ai-engine/runtime-init";
import { runNewsApiPipeline } from "@/lib/newsapi/pipeline";
import { countArticlesInDb } from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { ensureDefaultRssSources } from "@/lib/db/ensure-sources";

async function getArticleCount(): Promise<number> {
  if (await checkDatabaseConnection()) return countArticlesInDb();
  return getDynamicArticleCount();
}

/** NewsAPI + RSS tam senkronizasyon (cron ve arka plan işleri). */
export async function runFullNewsSync(trigger: "cron" | "manual" = "manual") {
  const rssSourcesRegistered = await ensureDefaultRssSources();
  const count = await getArticleCount();

  const [newsApiSummary, rssSummary] = await Promise.all([
    runNewsApiPipeline({ force: trigger === "manual", trigger }),
    count < BOOTSTRAP_ARTICLE_TARGET
      ? runBootstrapImport(2)
      : runAutoNewsPipeline({
          respectInterval: trigger === "cron",
          force: trigger === "manual",
          trigger,
          fastTrack: true,
          maxSourcesPerRun: trigger === "manual" ? 20 : 16,
        }),
  ]);

  return {
    rssSourcesRegistered,
    databaseCount: await getArticleCount(),
    newsApi: newsApiSummary,
    ...rssSummary,
  };
}
