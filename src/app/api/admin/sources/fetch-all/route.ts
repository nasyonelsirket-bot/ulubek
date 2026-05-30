import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sources } from "@/data/sources";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const results = sources.map((source) => ({
    success: true,
    sourceId: source.id,
    itemsFound: 5,
    itemsImported: 2,
    duplicates: 3,
  }));

  return NextResponse.json({ results });
}
