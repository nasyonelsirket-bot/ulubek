import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchAllSources } from "@/lib/services/admin";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const summary = await fetchAllSources();
  return NextResponse.json({
    ...summary,
    created: summary.imported,
    results: summary.sources,
  });
}
