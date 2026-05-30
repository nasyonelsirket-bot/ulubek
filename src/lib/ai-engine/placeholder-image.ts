import { categories } from "@/data/categories";

const COLORS: Record<string, string> = {
  gundem: "#c41e1e",
  ekonomi: "#1e40af",
  spor: "#15803d",
  teknoloji: "#7c3aed",
  saglik: "#0891b2",
  dunya: "#b45309",
};

export function generatePlaceholderCover(title: string, categorySlug: string): string {
  const cat = categories.find((c) => c.slug === categorySlug);
  const color = cat?.color ?? COLORS[categorySlug] ?? "#c41e1e";
  const safeTitle = title.slice(0, 80).replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1"/>
    </linearGradient></defs>
    <rect width="1200" height="675" fill="url(#g)"/>
    <text x="60" y="580" fill="#ffffff" font-family="Arial,sans-serif" font-size="28" font-weight="bold">ULUBEK MEDYA</text>
    <text x="60" y="120" fill="#ffffff" font-family="Arial,sans-serif" font-size="42" font-weight="bold">${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
