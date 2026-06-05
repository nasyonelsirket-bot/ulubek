import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  parseJsonBody,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getAllCategories } from "@/lib/services/articles";
import {
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  listAllCategoriesFromDb,
} from "@/lib/db/categories";
import { checkDatabaseConnection } from "@/lib/db/prisma";

export async function GET() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    if (await checkDatabaseConnection()) {
      const rows = await listAllCategoriesFromDb();
      return adminOk({
        data: rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          color: r.color,
          sortOrder: r.sortOrder,
          articleCount: r._count.articles,
        })),
      });
    }

    const cats = await getAllCategories();
    return adminOk({ data: cats.map((c) => ({ ...c, articleCount: 0 })) });
  } catch (err) {
    console.error("[admin/categories GET]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    if (!(await checkDatabaseConnection())) {
      return adminErr("Kategori eklemek için veritabanı bağlantısı gerekli", 503);
    }

    const body = await parseJsonBody<{
      name?: string;
      slug?: string;
      description?: string;
      color?: string;
      sortOrder?: number;
    }>(request);

    if (!body.name?.trim() || !body.slug?.trim()) {
      return adminErr("Ad ve slug gerekli", 400);
    }

    const created = await createCategoryInDb({
      name: body.name.trim(),
      slug: body.slug.trim().toLowerCase(),
      description: body.description?.trim(),
      color: body.color,
      sortOrder: body.sortOrder,
    });

    return adminOk({ data: created }, 201);
  } catch (err) {
    console.error("[admin/categories POST]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    if (!(await checkDatabaseConnection())) {
      return adminErr("Veritabanı bağlantısı gerekli", 503);
    }

    const body = await parseJsonBody<{
      id?: string;
      name?: string;
      slug?: string;
      description?: string;
      color?: string;
      sortOrder?: number;
    }>(request);

    if (!body.id) return adminErr("Kategori ID gerekli", 400);

    const updated = await updateCategoryInDb(body.id, {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.slug ? { slug: body.slug.trim().toLowerCase() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.color ? { color: body.color } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    });

    return adminOk({ data: updated });
  } catch (err) {
    console.error("[admin/categories PATCH]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    if (!(await checkDatabaseConnection())) {
      return adminErr("Veritabanı bağlantısı gerekli", 503);
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) return adminErr("Kategori ID gerekli", 400);

    await deleteCategoryInDb(id);
    return adminOk();
  } catch (err) {
    console.error("[admin/categories DELETE]", err);
    return adminErr(toErrorMessage(err));
  }
}
