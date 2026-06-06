import { categories } from "@/data/categories";
import Header from "./Header";

export default function SiteHeader() {
  const navCategories = [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name, slug }) => ({ id, name, slug }));

  return <Header categories={navCategories} />;
}
