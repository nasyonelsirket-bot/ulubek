import { runAutoNewsPipeline, type PipelineSummary } from "@/lib/ai-engine/pipeline";
import { countArticlesInDb, deleteAllArticlesFromDb } from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { clearPipelineRuntimeState, getDynamicArticleCount } from "@/lib/ai-engine/store";
import {
  ensureDefaultRssSources,
  ensurePortalLiveSources,
  resetPortalSourceFetchState,
} from "@/lib/db/ensure-sources";
import { getNewsSyncPhase, getPhaseLabel, getPhaseLimits } from "@/config/news-sync-phase";
import {
  PORTAL_BOOTSTRAP_LOOKBACK_DAYS,
  PORTAL_BOOTSTRAP_MAX_IMPORT,
  PORTAL_BOOTSTRAP_TOTAL_TARGET,
} from "@/config/portal-archive";
import { revalidatePath } from "next/cache";

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
    fullAiRewrite: false,
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

/** Eski haberleri sil, geçmiş + güncel portal haberlerini yeniden doldur. */
export async function runPortalFreshStart() {
  const phase = getNewsSyncPhase();
  const limits = getPhaseLimits();

  const deletedCount = await deleteAllArticlesFromDb();
  clearPipelineRuntimeState();

  const [rssDeactivated, portalSourcesRegistered] = await Promise.all([
    ensureDefaultRssSources(),
    ensurePortalLiveSources(),
    resetPortalSourceFetchState(),
  ]);

  const summary = await runPortalBootstrapFill();

  revalidatePath("/");
  revalidatePath("/kategori/gundem");

  return {
    phase,
    phaseLabel: getPhaseLabel(),
    freshStart: true,
    deletedCount,
    rssDeactivated,
    portalSourcesRegistered,
    lookbackDays: PORTAL_BOOTSTRAP_LOOKBACK_DAYS,
    bootstrapTarget: PORTAL_BOOTSTRAP_TOTAL_TARGET,
    databaseCount: await getArticleCount(),
    newsApi: null,
    ...summary,
  };
}

/** Kaynaklardan son N haberi tur tur doldurur (timeout riskine karşı). */
async function runPortalBootstrapFill(): Promise<PipelineSummary> {
  const limits = getPhaseLimits();
  let lastSummary: PipelineSummary = {
    processed: 0,
    imported: 0,
    skipped: 0,
    found: 0,
    sources: [],
    timestamp: new Date().toISOString(),
    bootstrap: true,
  };

  let rounds = 0;
  const maxRounds = 5;

  while ((await getArticleCount()) < PORTAL_BOOTSTRAP_TOTAL_TARGET && rounds < maxRounds) {
    const round = await runAutoNewsPipeline({
      force: true,
      bootstrap: true,
      respectInterval: false,
      trigger: "bootstrap",
      fastTrack: true,
      fullAiRewrite: false,
      maxSourcesPerRun: limits.maxSourcesPerRun,
      maxImportPerSource: PORTAL_BOOTSTRAP_MAX_IMPORT,
      lookbackDays: PORTAL_BOOTSTRAP_LOOKBACK_DAYS,
    });

    lastSummary = {
      processed: lastSummary.processed + round.processed,
      imported: lastSummary.imported + round.imported,
      skipped: lastSummary.skipped + round.skipped,
      found: lastSummary.found + round.found,
      sources: [...lastSummary.sources, ...round.sources],
      timestamp: round.timestamp,
      bootstrap: true,
    };

    rounds++;
    if (round.imported === 0) break;
  }

  return lastSummary;
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
