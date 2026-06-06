import { after } from "next/server";
import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { fetchSingleSource } from "@/lib/services/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { id } = await params;

    after(async () => {
      try {
        await fetchSingleSource(id);
      } catch (err) {
        console.error("[admin/sources/[id]/fetch background]", err);
      }
    });

    return adminOk({
      started: true,
      async: true,
      sourceId: id,
      message: "Kaynak taraması arka planda başlatıldı.",
    });
  } catch (err) {
    console.error("[admin/sources/[id]/fetch POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
