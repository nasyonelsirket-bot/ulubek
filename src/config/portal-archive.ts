/** Portal kaynakları için geçmiş haber listeleme sayfaları (bootstrap). */

function paginateCategory(path: string, pages = 5): string[] {
  const base = path.endsWith("/") ? path : `${path}/`;
  const urls = [base];
  for (let p = 2; p <= pages; p++) urls.push(`${base}${p}/`);
  return urls;
}

export const PORTAL_ARCHIVE_PAGES: Record<"haberler" | "sondakika", string[]> = {
  haberler: [
    ...paginateCategory("https://www.haberler.com/guncel/"),
    ...paginateCategory("https://www.haberler.com/spor/"),
    ...paginateCategory("https://www.haberler.com/ekonomi/"),
    ...paginateCategory("https://www.haberler.com/magazin/"),
    ...paginateCategory("https://www.haberler.com/teknoloji/"),
    ...paginateCategory("https://www.haberler.com/dunya/"),
  ],
  sondakika: [
    ...paginateCategory("https://www.sondakika.com/guncel/"),
    ...paginateCategory("https://www.sondakika.com/spor/"),
    ...paginateCategory("https://www.sondakika.com/ekonomi/"),
    ...paginateCategory("https://www.sondakika.com/magazin/"),
    ...paginateCategory("https://www.sondakika.com/dunya/"),
  ],
};

/** Fresh-start bootstrap için lookback (gün). */
export const PORTAL_BOOTSTRAP_LOOKBACK_DAYS = 30;

/** Bootstrap'ta kaynak başına en fazla kaç haber içe aktarılır. */
export const PORTAL_BOOTSTRAP_MAX_IMPORT = 100;

/** Bootstrap hedef toplam haber (2 kaynak × 100). */
export const PORTAL_BOOTSTRAP_TOTAL_TARGET = 200;

/** Bootstrap'ta kaynak başına taranacak link üst sınırı (duplicate/skip payı). */
export const PORTAL_BOOTSTRAP_LINK_LIMIT = 130;

/** Arşiv sayfası başına çekilecek link sayısı (bootstrap). */
export const PORTAL_ARCHIVE_LINKS_PER_PAGE = 50;
