import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEngineStats } from "@/lib/services/admin";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  return NextResponse.json(await getEngineStats());
}
