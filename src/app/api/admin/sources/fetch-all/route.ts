import { after } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { runFullNewsSync, triggerCronFallback } from "@/lib/news/sync-orchestrator";
import { getNewsSyncPhase, getPhaseLabel } from "@/config/news-sync-phase";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const phase = getNewsSyncPhase();
    const phaseLabel = getPhaseLabel(phase);

    // Anında JSON dön — hiç DB/pipeline işi bekleme (Netlify timeout önlemi)
    after(async () => {
      try {
        await runFullNewsSync("manual");
      } catch (err) {
        console.error("[admin/sources/fetch-all background]", err);
        await triggerCronFallback();
      }
    });

    return adminOk({
      started: true,
      async: true,
      phase,
      phaseLabel,
      message: `${phaseLabel}: tarama arka planda başladı. 1–2 dakika içinde yeni haberler görünecek.`,
    });
  } catch (err) {
    console.error("[admin/sources/fetch-all POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
