import type { Category } from "./types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Gündem",
    slug: "gundem",
    description: "Türkiye ve dünyadan en güncel haberler",
    color: "#dc2626",
    sortOrder: 1,
  },
  {
    id: "2",
    name: "Ekonomi",
    slug: "ekonomi",
    description: "Piyasalar, finans ve iş dünyası haberleri",
    color: "#059669",
    sortOrder: 2,
  },
  {
    id: "3",
    name: "Spor",
    slug: "spor",
    description: "Futbol, basketbol ve tüm spor dallarından haberler",
    color: "#2563eb",
    sortOrder: 3,
  },
  {
    id: "4",
    name: "Teknoloji",
    slug: "teknoloji",
    description: "Yapay zeka, mobil ve dijital dünya haberleri",
    color: "#7c3aed",
    sortOrder: 4,
  },
  {
    id: "5",
    name: "Sağlık",
    slug: "saglik",
    description: "Sağlık, tıp ve yaşam haberleri",
    color: "#0891b2",
    sortOrder: 5,
  },
  {
    id: "6",
    name: "Dünya",
    slug: "dunya",
    description: "Uluslararası gelişmeler ve global haberler",
    color: "#d97706",
    sortOrder: 6,
  },
  {
    id: "7",
    name: "Kültür-Sanat",
    slug: "kultur-sanat",
    description: "Sinema, müzik, edebiyat ve sanat haberleri",
    color: "#db2777",
    sortOrder: 7,
  },
  {
    id: "8",
    name: "Magazin",
    slug: "magazin",
    description: "Magazin, yaşam, ünlüler ve eğlence haberleri",
    color: "#be185d",
    sortOrder: 8,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
