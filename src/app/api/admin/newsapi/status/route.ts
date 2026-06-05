import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getNewsApiStatusForAdmin } from "@/lib/newsapi/pipeline";

export async function GET() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;
    return adminOk({ data: getNewsApiStatusForAdmin() });
  } catch (err) {
    console.error("[admin/newsapi/status GET]", err);
    return adminErr(toErrorMessage(err));
  }
}
