import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getQueueItems, getQueueStats } from "@/lib/ai-engine/queue";
import type { QueueStatus } from "@/data/types";

export async function GET(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const status = request.nextUrl.searchParams.get("status") as QueueStatus | null;
    return adminOk({
      stats: getQueueStats(),
      items: getQueueItems(status ?? undefined),
    });
  } catch (err) {
    console.error("[admin/queue GET]", err);
    return adminErr(toErrorMessage(err));
  }
}
