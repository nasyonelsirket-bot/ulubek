import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchAllRssSourcesForce } from "@/lib/rss/importer";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const results = await fetchAllRssSourcesForce();
  const summary = {
    sources: results.length,
    created: results.reduce((s, r) => s + r.created, 0),
    skipped: results.reduce((s, r) => s + r.skipped, 0),
    errors: results.reduce((s, r) => s + r.errors, 0),
    results,
  };

  return NextResponse.json(summary);
}
