import { runAutoNewsPipeline } from "@/lib/ai-engine/pipeline";
import { countArticlesInDb } from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";
import { ensureDefaultRssSources, ensurePortalLiveSources } from "@/lib/db/ensure-sources";
import { getNewsSyncPhase, getPhaseLabel, getPhaseLimits } from "@/config/news-sync-phase";

async function getArticleCount(): Promise<number> {
  if (await checkDatabaseConnection()) return countArticlesInDb();
  return getDynamicArticleCount();
}

/** Faz limitleriyle hafif senkronizasyon (cron + arka plan). */
export async function runFullNewsSync(trigger: "cron" | "manual" = "manual") {
  const phase = getNewsSyncPhase();
  const limits = getPhaseLimits();

  const [rssDeactivated, portalSourcesRegistered] = await Promise.all([
    ensureDefaultRssSources(),
    ensurePortalLiveSources(),
  ]);

  const rssSummary = await runAutoNewsPipeline({
    respectInterval: trigger === "cron",
    force: trigger === "manual",
    trigger,
    fastTrack: true,
    fullAiRewrite: true,
    maxSourcesPerRun: limits.maxSourcesPerRun,
    maxImportPerSource: limits.maxImportPerSource,
  });

  return {
    phase,
    phaseLabel: getPhaseLabel(),
    rssDeactivated,
    portalSourcesRegistered,
    databaseCount: await getArticleCount(),
    newsApi: null,
    ...rssSummary,
  };
}

/** Netlify after() yedek — cron endpoint'ini tetikler. */
export async function triggerCronFallback(): Promise<void> {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!base || !process.env.CRON_SECRET) return;

  try {
    await fetch(`${base.replace(/\/$/, "")}/api/cron/auto-news`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      signal: AbortSignal.timeout(280000),
    });
  } catch (err) {
    console.error("[triggerCronFallback]", err);
  }
}
