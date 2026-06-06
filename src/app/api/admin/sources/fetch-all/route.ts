import { after } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { ensureDefaultRssSources } from "@/lib/db/ensure-sources";
import { runFullNewsSync } from "@/lib/news/sync-orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const rssSourcesRegistered = await ensureDefaultRssSources();

    after(async () => {
      try {
        await runFullNewsSync("manual");
      } catch (err) {
        console.error("[admin/sources/fetch-all background]", err);
      }
    });

    return adminOk({
      started: true,
      async: true,
      rssSourcesRegistered,
      message:
        "Haber taraması arka planda başlatıldı. RSS ve NewsAPI kaynakları taranıyor; 1–3 dakika içinde yeni haberler görünecek.",
    });
  } catch (err) {
    console.error("[admin/sources/fetch-all POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
