import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  parseJsonBody,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getSourceWithCategory, updateSource, deleteSource } from "@/lib/services/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const source = await getSourceWithCategory(id);

    if (!source) {
      return adminErr("Kaynak bulunamadı", 404);
    }

    return adminOk({ data: source });
  } catch (err) {
    console.error("[admin/sources/[id] GET]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await parseJsonBody(request);
    const updated = await updateSource(id, body);

    if (!updated) {
      return adminErr("Kaynak bulunamadı", 404);
    }

    return adminOk({ data: updated });
  } catch (err) {
    console.error("[admin/sources/[id] PATCH]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    await deleteSource(id);
    return adminOk();
  } catch (err) {
    console.error("[admin/sources/[id] DELETE]", err);
    return adminErr(toErrorMessage(err));
  }
}
