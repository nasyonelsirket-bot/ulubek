import { after } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { runFullNewsSync, runPortalFreshStart, triggerCronFallback } from "@/lib/news/sync-orchestrator";
import { getNewsSyncPhase, getPhaseLabel } from "@/config/news-sync-phase";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const body = await request.json().catch(() => ({}));
    const freshStart = Boolean((body as { freshStart?: boolean }).freshStart);

    const phase = getNewsSyncPhase();
    const phaseLabel = getPhaseLabel();

    after(async () => {
      try {
        if (freshStart) {
          await runPortalFreshStart();
        } else {
          await runFullNewsSync("manual");
        }
      } catch (err) {
        console.error("[admin/sources/fetch-all background]", err);
        await triggerCronFallback();
      }
    });

    return adminOk({
      started: true,
      async: true,
      freshStart,
      phase,
      phaseLabel,
      message: freshStart
        ? "Eski haberler siliniyor, geçmiş + güncel haberler arka planda yükleniyor (5–10 dk)."
        : `${phaseLabel}: tarama arka planda başladı. 1–2 dakika içinde yeni haberler görünecek.`,
    });
  } catch (err) {
    console.error("[admin/sources/fetch-all POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
