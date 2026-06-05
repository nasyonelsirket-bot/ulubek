import { listAllCategoriesFromDb } from "@/lib/db/categories";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { getAllCategories } from "@/lib/services/articles";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    color: string;
    sortOrder: number;
    articleCount?: number;
  }> = [];

  if (await checkDatabaseConnection()) {
    const rows = await listAllCategoriesFromDb();
    categories = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      color: r.color,
      sortOrder: r.sortOrder,
      articleCount: r._count.articles,
    }));
  } else {
    const staticCats = await getAllCategories();
    categories = staticCats.map((c) => ({ ...c, articleCount: 0 }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Haber kategorilerini oluşturun, düzenleyin ve yönetin.
        </p>
      </div>
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
