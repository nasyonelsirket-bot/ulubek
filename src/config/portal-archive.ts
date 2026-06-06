/** Portal kaynakları için geçmiş haber listeleme sayfaları (bootstrap). */
export const PORTAL_ARCHIVE_PAGES: Record<"haberler" | "sondakika", string[]> = {
  haberler: [
    "https://www.haberler.com/guncel/",
    "https://www.haberler.com/spor/",
    "https://www.haberler.com/ekonomi/",
    "https://www.haberler.com/magazin/",
    "https://www.haberler.com/teknoloji/",
  ],
  sondakika: [
    "https://www.sondakika.com/guncel/",
    "https://www.sondakika.com/spor/",
    "https://www.sondakika.com/ekonomi/",
    "https://www.sondakika.com/magazin/",
  ],
};

/** Fresh-start bootstrap için lookback (gün). */
export const PORTAL_BOOTSTRAP_LOOKBACK_DAYS = 14;

/** Bootstrap'ta kaynak başına en fazla kaç haber. */
export const PORTAL_BOOTSTRAP_MAX_IMPORT = 30;
