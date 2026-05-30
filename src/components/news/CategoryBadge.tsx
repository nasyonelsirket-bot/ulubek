import Link from "next/link";
import { Category } from "@/types";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  return (
    <Link
      href={`/kategori/${category.slug}`}
      className={`inline-block font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-80 ${
        size === "sm" ? "rounded px-2 py-0.5 text-xs" : "rounded-md px-3 py-1 text-sm"
      }`}
      style={{ backgroundColor: category.color }}
    >
      {category.name}
    </Link>
  );
}
