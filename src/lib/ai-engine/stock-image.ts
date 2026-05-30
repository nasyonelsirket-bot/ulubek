/**
 * Kategori bazlı profesyonel stok görseller (Unsplash, 1200x675 WebP).
 */

const STOCK_PARAMS = "w=1600&h=900&fit=crop&q=90&auto=format";

const CATEGORY_STOCK: Record<string, string[]> = {
  gundem: [
    "photo-1529107386315-e1a2ed48a620",
    "photo-1577962917302-cd8740064236",
    "photo-1557804506-669a67965ba0",
    "photo-1504711434969-e33886168f5c",
    "photo-1495020689067-6b7ff369a2b8",
  ],
  ekonomi: [
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1642790106117-e829e1728949",
    "photo-1590283603385-17ffb3a7f29f",
    "photo-1460925895917-afdab827c52f",
    "photo-1579621970563-ebec7560ff3e",
  ],
  saglik: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1519494026892-80bbd02d6afd",
    "photo-1586773866623-47de685069c0",
    "photo-1631217868264-e5b90bb5e233",
    "photo-1538108149393-fbbd81827907",
  ],
  teknoloji: [
    "photo-1677442136019-21780ecad995",
    "photo-1485827404703-89b55fcc595e",
    "photo-1518770660439-4636190af475",
    "photo-1451187580459-43490279c0fa",
    "photo-1550751827-4bd374c3f58b",
  ],
  spor: [
    "photo-1574629810360-7efbc5751737",
    "photo-1579952363873-27f3bade9f55",
    "photo-1519869327854-7835a4c4a2a0",
    "photo-1546519638-68ebb0a5b778",
    "photo-1508098682752-f46b89e9b3af",
  ],
  dunya: [
    "photo-1569163139394-de4798aa62b4",
    "photo-1524661135-423995f22d0b",
    "photo-1526778548025-fa2cf459cd4c",
    "photo-1486406146926-c627a92ad1ab",
    "photo-1526304640581-d334cdbbf45e",
  ],
  magazin: [
    "photo-1524504388940-b1c1722653e1",
    "photo-1516450360450-6be0667a7a7a",
    "photo-1492684223066-81342ee5ff30",
    "photo-1470229722913-7c0e2dbbafd3",
    "photo-1514525253161-7a46d19cd819",
  ],
  "kultur-sanat": [
    "photo-1493225457124-a3eb161ffa5f",
    "photo-1514320291840-755e54c43510",
    "photo-1511379934352-8e7e747e10d6",
    "photo-1507003211169-0a1dd7228f2d",
  ],
};

const DEFAULT_STOCK = CATEGORY_STOCK.gundem;

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getStockImageUrl(categorySlug: string, title: string): string {
  const pool = CATEGORY_STOCK[categorySlug] ?? DEFAULT_STOCK;
  const index = hashString(title) % pool.length;
  return `https://images.unsplash.com/${pool[index]}?${STOCK_PARAMS}`;
}

export async function fetchStockImage(categorySlug: string, title: string): Promise<string | null> {
  return getStockImageUrl(categorySlug, title);
}
