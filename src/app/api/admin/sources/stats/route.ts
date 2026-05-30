import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getEngineStats } from "@/lib/services/admin";

export async function GET() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    return adminOk({ data: await getEngineStats() });
  } catch (err) {
    console.error("[admin/sources/stats GET]", err);
    return adminErr(toErrorMessage(err));
  }
}
