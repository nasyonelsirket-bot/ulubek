import { NextRequest } from "next/server";
import type { ArticleStatus } from "@/data/types";
import {
  adminErr,
  adminOk,
  parseJsonBody,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getAllArticlesForAdmin } from "@/lib/services/articles";
import { mockUpdateArticle } from "@/lib/services/admin";

export async function GET(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as ArticleStatus | null;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let articles = await getAllArticlesForAdmin();

    if (status) {
      articles = articles.filter((a) => a.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt?.toLowerCase().includes(q) ?? false)
      );
    }

    const total = articles.length;
    const skip = (page - 1) * limit;
    const paged = articles.slice(skip, skip + limit);

    return adminOk({
      articles: paged,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[admin/articles GET]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<{ id?: string } & Record<string, unknown>>(request);
    const { id, ...data } = body;

    if (!id) {
      return adminErr("Haber ID gerekli", 400);
    }

    const article = await mockUpdateArticle(id, data);
    if (!article) {
      return adminErr("Haber bulunamadı", 404);
    }

    return adminOk({ data: article });
  } catch (err) {
    console.error("[admin/articles PATCH]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return adminErr("Haber ID gerekli", 400);
    }

    return adminOk();
  } catch (err) {
    console.error("[admin/articles DELETE]", err);
    return adminErr(toErrorMessage(err));
  }
}
