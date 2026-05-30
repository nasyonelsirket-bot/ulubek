import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCategories } from "@/lib/services/articles";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const categories = await getAllCategories();
  return NextResponse.json(categories);
}
