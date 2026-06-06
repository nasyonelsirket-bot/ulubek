import { after } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { runNewsApiPipeline } from "@/lib/newsapi/pipeline";
import { isNewsApiConfigured } from "@/lib/newsapi/client";
import { getSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    if (!getSettings().newsApiEnabled) {
      return adminErr("NewsAPI devre dışı", 400);
    }
    if (!isNewsApiConfigured()) {
      return adminErr("NewsAPI anahtarı eksik", 400);
    }

    after(async () => {
      try {
        await runNewsApiPipeline({ force: true, trigger: "manual" });
      } catch (err) {
        console.error("[admin/newsapi/sync background]", err);
      }
    });

    return adminOk({
      started: true,
      async: true,
      message: "NewsAPI senkronizasyonu arka planda başlatıldı.",
    });
  } catch (err) {
    console.error("[admin/newsapi/sync POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
