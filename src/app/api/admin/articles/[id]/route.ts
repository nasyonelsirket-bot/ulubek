import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  parseJsonBody,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getArticleById } from "@/lib/services/articles";
import { mockUpdateArticle } from "@/lib/services/admin";
import { notifyArticlePublished } from "@/lib/live/notify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
      return adminErr("Haber bulunamadı", 404);
    }

    return adminOk({ data: article });
  } catch (err) {
    console.error("[admin/articles/[id] GET]", err);
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

    const existing = await getArticleById(id);
    if (!existing) {
      return adminErr("Haber bulunamadı", 404);
    }

    const article = await mockUpdateArticle(id, body);
    if (!article) {
      return adminErr("Haber bulunamadı", 404);
    }

    const becamePublished = article.status === "PUBLISHED" && existing.status !== "PUBLISHED";
    const breakingChanged =
      body.breaking !== undefined && body.breaking !== existing.breaking;

    if (becamePublished || (article.status === "PUBLISHED" && breakingChanged)) {
      void notifyArticlePublished(article.id);
    }

    return adminOk({ data: article });
  } catch (err) {
    console.error("[admin/articles/[id] PATCH]", err);
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

    await params;
    return adminOk();
  } catch (err) {
    console.error("[admin/articles/[id] DELETE]", err);
    return adminErr(toErrorMessage(err));
  }
}
