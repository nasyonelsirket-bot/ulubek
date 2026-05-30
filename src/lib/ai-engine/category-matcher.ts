import { categories } from "@/data/categories";

const KEYWORD_MAP: Record<string, string[]> = {
  gundem: ["hükümet", "meclis", "bakan", "cumhurbaşkan", "politika", "tbmm", "seçim", "anayasa"],
  ekonomi: ["ekonomi", "borsa", "faiz", "dolar", "enflasyon", "merkez bankası", "piyasa", "vergi"],
  spor: ["futbol", "spor", "takım", "maç", "galatasaray", "fenerbahçe", "beşiktaş", "milli takım"],
  teknoloji: ["teknoloji", "yapay zeka", "ai", "dijital", "apple", "google", "yazılım", "siber"],
  saglik: ["sağlık", "hastane", "doktor", "hastalık", "aşı", "tıp", "bakanlık sağlık"],
  dunya: ["abd", "avrupa", "bm", "rusya", "ukrayna", "dünya", "uluslararası", "nato"],
  "kultur-sanat": ["sinema", "film", "müzik", "sanat", "tiyatro", "kitap", "festival"],
};

export function matchCategory(title: string, content: string, sourceCategoryId?: string): string {
  const text = `${title} ${content}`.toLowerCase();
  let bestSlug = "gundem";
  let bestScore = 0;

  for (const [slug, keywords] of Object.entries(KEYWORD_MAP)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  if (bestScore === 0 && sourceCategoryId) {
    const cat = categories.find((c) => c.id === sourceCategoryId);
    if (cat) return cat.slug;
  }

  return bestSlug;
}

export function getCategoryIdBySlug(slug: string): string {
  return categories.find((c) => c.slug === slug)?.id ?? "1";
}
