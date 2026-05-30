import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { mockProcessArticleWithAI } from "@/lib/services/admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const result = await mockProcessArticleWithAI(id);

    if (!result.success) {
      return adminErr(result.error || "İşlem başarısız", 404);
    }

    return adminOk(result);
  } catch (err) {
    console.error("[admin/articles/[id]/process-ai POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
