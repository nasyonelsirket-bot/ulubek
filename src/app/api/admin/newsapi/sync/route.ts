import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { runNewsApiPipeline } from "@/lib/newsapi/pipeline";
import { countArticlesInDb } from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const summary = await runNewsApiPipeline({ force: true, trigger: "manual" });

    if (!summary) {
      return adminErr("NewsAPI devre dışı veya anahtar eksik", 400);
    }

    const dbCount = (await checkDatabaseConnection())
      ? await countArticlesInDb()
      : getDynamicArticleCount();

    return adminOk({
      ...summary,
      databaseCount: dbCount,
    });
  } catch (err) {
    console.error("[admin/newsapi/sync POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
