import { getAllCategories } from "@/lib/services/articles";
import Header from "./Header";

export default async function SiteHeader() {
  const categories = await getAllCategories();
  return <Header categories={categories} />;
}
