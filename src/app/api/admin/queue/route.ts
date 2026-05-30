import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getQueueItems, getQueueStats } from "@/lib/ai-engine/queue";
import type { QueueStatus } from "@/data/types";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") as QueueStatus | null;
  return NextResponse.json({
    stats: getQueueStats(),
    items: getQueueItems(status ?? undefined),
  });
}
