/** Türkiye'nin büyük haber kaynakları — RSS (ücretsiz, anlık, NewsAPI kotası yok). */
export interface TurkishRssFeed {
  name: string;
  url: string;
  categorySlug: string;
  trustScore: number;
  fetchIntervalMin?: number;
}

export const TURKISH_RSS_FEEDS: TurkishRssFeed[] = [
  // Anadolu Ajansı
  { name: "AA — Gündem", url: "https://www.aa.com.tr/tr/rss/default?cat=guncel", categorySlug: "gundem", trustScore: 0.96 },
  { name: "AA — Ekonomi", url: "https://www.aa.com.tr/tr/rss/default?cat=ekonomi", categorySlug: "ekonomi", trustScore: 0.96 },
  { name: "AA — Spor", url: "https://www.aa.com.tr/tr/rss/default?cat=spor", categorySlug: "spor", trustScore: 0.95 },
  { name: "AA — Teknoloji", url: "https://www.aa.com.tr/tr/rss/default?cat=bilim-teknoloji", categorySlug: "teknoloji", trustScore: 0.95 },
  { name: "AA — Dünya", url: "https://www.aa.com.tr/tr/rss/default?cat=dunya", categorySlug: "dunya", trustScore: 0.95 },

  // TRT Haber
  { name: "TRT Haber — Gündem", url: "https://www.trthaber.com/rss/gundem.xml", categorySlug: "gundem", trustScore: 0.94 },
  { name: "TRT Haber — Ekonomi", url: "https://www.trthaber.com/rss/ekonomi.xml", categorySlug: "ekonomi", trustScore: 0.93 },
  { name: "TRT Haber — Spor", url: "https://www.trthaber.com/rss/spor.xml", categorySlug: "spor", trustScore: 0.93 },
  { name: "TRT Haber — Teknoloji", url: "https://www.trthaber.com/rss/teknoloji.xml", categorySlug: "teknoloji", trustScore: 0.92 },
  { name: "TRT Haber — Dünya", url: "https://www.trthaber.com/rss/dunya.xml", categorySlug: "dunya", trustScore: 0.93 },

  // NTV
  { name: "NTV — Gündem", url: "https://www.ntv.com.tr/gundem.rss", categorySlug: "gundem", trustScore: 0.91 },
  { name: "NTV — Ekonomi", url: "https://www.ntv.com.tr/ekonomi.rss", categorySlug: "ekonomi", trustScore: 0.9 },
  { name: "NTV — Spor", url: "https://www.ntv.com.tr/spor.rss", categorySlug: "spor", trustScore: 0.9 },
  { name: "NTV — Teknoloji", url: "https://www.ntv.com.tr/teknoloji.rss", categorySlug: "teknoloji", trustScore: 0.89 },
  { name: "NTV — Dünya", url: "https://www.ntv.com.tr/dunya.rss", categorySlug: "dunya", trustScore: 0.9 },

  // Habertürk
  { name: "Habertürk — Gündem", url: "https://www.haberturk.com/rss/kategori/gundem.xml", categorySlug: "gundem", trustScore: 0.9 },
  { name: "Habertürk — Ekonomi", url: "https://www.haberturk.com/rss/kategori/ekonomi.xml", categorySlug: "ekonomi", trustScore: 0.89 },
  { name: "Habertürk — Spor", url: "https://www.haberturk.com/rss/kategori/spor.xml", categorySlug: "spor", trustScore: 0.89 },
  { name: "Habertürk — Teknoloji", url: "https://www.haberturk.com/rss/kategori/teknoloji.xml", categorySlug: "teknoloji", trustScore: 0.88 },
  { name: "Habertürk — Dünya", url: "https://www.haberturk.com/rss/kategori/dunya.xml", categorySlug: "dunya", trustScore: 0.89 },

  // CNN Türk
  { name: "CNN Türk", url: "https://www.cnnturk.com/feed/rss/all/news", categorySlug: "gundem", trustScore: 0.9 },

  // Uluslararası Türkçe
  { name: "BBC Türkçe", url: "https://www.bbc.com/turkce/index.xml", categorySlug: "dunya", trustScore: 0.92 },
  { name: "DW Türkçe", url: "https://www.dw.com/tr/rss/rss-turkce", categorySlug: "dunya", trustScore: 0.9 },
  { name: "Euronews Türkçe", url: "https://tr.euronews.com/rss", categorySlug: "dunya", trustScore: 0.88 },

  // Google News — Türkiye manşetleri (diğer sitelerin haberlerini toplar)
  { name: "Google News — Türkiye", url: "https://news.google.com/rss?hl=tr&gl=TR&ceid=TR:tr", categorySlug: "gundem", trustScore: 0.85 },
  { name: "Google News — Son Dakika", url: "https://news.google.com/rss/search?q=son+dakika+t%C3%BCrkiye&hl=tr&gl=TR&ceid=TR:tr", categorySlug: "gundem", trustScore: 0.84 },
  { name: "Google News — Ekonomi", url: "https://news.google.com/rss/search?q=t%C3%BCrkiye+ekonomi&hl=tr&gl=TR&ceid=TR:tr", categorySlug: "ekonomi", trustScore: 0.84 },
  { name: "Google News — Spor", url: "https://news.google.com/rss/search?q=t%C3%BCrkiye+spor&hl=tr&gl=TR&ceid=TR:tr", categorySlug: "spor", trustScore: 0.84 },
  { name: "Google News — Teknoloji", url: "https://news.google.com/rss/search?q=t%C3%BCrkiye+teknoloji&hl=tr&gl=TR&ceid=TR:tr", categorySlug: "teknoloji", trustScore: 0.83 },

  // Resmi / bakanlık RSS
  { name: "T.C. İletişim Başkanlığı", url: "https://www.iletisim.gov.tr/rss", categorySlug: "gundem", trustScore: 0.98 },
  { name: "T.C. Sağlık Bakanlığı", url: "https://www.saglik.gov.tr/rss", categorySlug: "saglik", trustScore: 0.97 },
  { name: "T.C. Hazine ve Maliye", url: "https://www.hmb.gov.tr/rss", categorySlug: "ekonomi", trustScore: 0.96 },
];
