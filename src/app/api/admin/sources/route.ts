import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  parseJsonBody,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getAllSources, addSource } from "@/lib/services/admin";
import type { SourceKind } from "@/data/types";

export async function GET() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const sources = await getAllSources();
    return adminOk({ data: sources });
  } catch (err) {
    console.error("[admin/sources GET]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<{
      name?: string;
      url?: string;
      kind?: SourceKind;
      fetchType?: string;
      urlType?: string;
      isActive?: boolean;
      trustScore?: number;
      categoryId?: string;
      fetchIntervalMin?: number;
    }>(request);

    if (!body.name?.trim() || !body.url?.trim() || !body.categoryId) {
      return adminErr("Ad, URL ve kategori gerekli", 400);
    }

    const source = await addSource({
      name: body.name.trim(),
      url: body.url.trim(),
      kind: (body.kind || "MANUAL") as SourceKind,
      fetchType: body.fetchType as import("@/data/types").SourceFetchType | undefined,
      urlType: body.urlType as import("@/data/types").SourceUrlType | undefined,
      isActive: body.isActive ?? true,
      trustScore: body.trustScore ?? 0.8,
      categoryId: body.categoryId,
      fetchIntervalMin: body.fetchIntervalMin ?? 1,
    });

    return adminOk({ ...source }, 201);
  } catch (err) {
    console.error("[admin/sources POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
