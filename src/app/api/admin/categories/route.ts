import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getAllCategories } from "@/lib/services/articles";

export async function GET() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const categories = await getAllCategories();
    return adminOk({ data: categories });
  } catch (err) {
    console.error("[admin/categories GET]", err);
    return adminErr(toErrorMessage(err));
  }
}
