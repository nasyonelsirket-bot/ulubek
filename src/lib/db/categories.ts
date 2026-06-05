import { prisma, checkDatabaseConnection } from "./prisma";

export async function listAllCategoriesFromDb() {
  if (!(await checkDatabaseConnection())) return [];
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}

export async function createCategoryInDb(data: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color ?? "#dc2626",
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updateCategoryInDb(
  id: string,
  data: Partial<{ name: string; slug: string; description: string; color: string; sortOrder: number }>
) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategoryInDb(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function resolveDbCategoryIdByStaticId(staticId: string): Promise<string | null> {
  const { categories: staticCategories } = await import("@/data/categories");
  const slug = staticCategories.find((c) => c.id === staticId)?.slug;
  if (!slug) return null;
  const cat = await prisma.category.findUnique({ where: { slug } });
  return cat?.id ?? null;
}
