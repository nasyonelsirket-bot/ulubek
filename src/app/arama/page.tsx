import type { Metadata } from "next";
import SearchContent from "./SearchContent";

export const metadata: Metadata = {
  title: "Arama",
  description: "Ulubek Medya haber arama",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SearchContent />
    </div>
  );
}
