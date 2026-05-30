const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

export function slugify(text: string): string {
  let slug = text;
  for (const [from, to] of Object.entries(TR_MAP)) {
    slug = slug.replace(new RegExp(from, "g"), to);
  }
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function normalizeTitle(title: string): string {
  let normalized = title.toLowerCase();
  for (const [from, to] of Object.entries(TR_MAP)) {
    normalized = normalized.replace(new RegExp(from, "g"), to);
  }
  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
