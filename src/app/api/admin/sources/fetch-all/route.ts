import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { fetchAllSources } from "@/lib/services/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const summary = await fetchAllSources();
    const found =
      summary.sources?.reduce((n: number, s: { found?: number }) => n + (s.found ?? 0), 0) ?? 0;

    return adminOk({
      ...summary,
      created: summary.imported,
      found,
      results: summary.sources,
      databaseCount: summary.databaseCount,
    });
  } catch (err) {
    console.error("[admin/sources/fetch-all POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
