import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Mock RSS taraması tamamlandı",
    imported: 0,
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
