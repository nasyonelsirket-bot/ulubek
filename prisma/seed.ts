import { PrismaClient, UserRole, SourceType, ArticleStatus } from "@prisma/client";
import { TURKISH_RSS_FEEDS } from "../src/data/turkish-rss-feeds";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Gündem", slug: "gundem", description: "Türkiye ve dünyadan en güncel haberler", color: "#dc2626", sortOrder: 1 },
  { name: "Ekonomi", slug: "ekonomi", description: "Piyasalar, finans ve iş dünyası haberleri", color: "#059669", sortOrder: 2 },
  { name: "Spor", slug: "spor", description: "Futbol, basketbol ve tüm spor dallarından haberler", color: "#2563eb", sortOrder: 3 },
  { name: "Teknoloji", slug: "teknoloji", description: "Yapay zeka, mobil ve dijital dünya haberleri", color: "#7c3aed", sortOrder: 4 },
  { name: "Sağlık", slug: "saglik", description: "Sağlık, tıp ve yaşam haberleri", color: "#0891b2", sortOrder: 5 },
  { name: "Dünya", slug: "dunya", description: "Uluslararası gelişmeler ve global haberler", color: "#d97706", sortOrder: 6 },
  { name: "Kültür-Sanat", slug: "kultur-sanat", description: "Sinema, müzik, edebiyat ve sanat haberleri", color: "#db2777", sortOrder: 7 },
];

const categorySlugMap: Record<string, string> = {
  "1": "gundem",
  "2": "ekonomi",
  "3": "spor",
  "4": "teknoloji",
  "5": "saglik",
  "6": "dunya",
  "7": "kultur-sanat",
};

const sources = TURKISH_RSS_FEEDS.map((feed) => ({
  name: feed.name,
  url: feed.url,
  type: SourceType.RSS,
  trustScore: feed.trustScore,
  categorySlug: feed.categorySlug,
}));

const articles = [
  {
    title: "Türkiye'de Yeni Ekonomik Paket Açıklandı: İş Dünyasından Olumlu Tepkiler",
    slug: "turkiye-yeni-ekonomik-paket-aciklandi",
    excerpt: "Hükümetin açıkladığı yeni ekonomik paket, KOBİ'lere yönelik destekler ve istihdam teşviklerini içeriyor.",
    content: `<p>Hükümet, ekonomik büyümeyi desteklemek ve istihdamı artırmak amacıyla kapsamlı bir ekonomik paket açıkladı.</p><p>Ekonomi Bakanlığı yetkilileri, paketin önümüzdeki üç yıl boyunca uygulanacağını belirtti.</p>`,
    categoryId: "2",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=675&fit=crop",
    publishedAt: new Date("2026-05-30T08:30:00"),
    readTime: 4,
    featured: true,
    breaking: true,
    tags: ["ekonomi", "hükümet", "KOBİ"],
  },
  {
    title: "Milli Takım Avrupa Şampiyonası Elemelerinde Tarihi Galibiyet Aldı",
    slug: "milli-takim-avrupa-sampiyonasi-elemelerinde-galibiyet",
    excerpt: "A Milli Futbol Takımı, deplasmanda oynadığı kritik maçta 3-1'lik skorla galip gelerek grupta liderliğe yükseldi.",
    content: `<p>A Milli Futbol Takımı, Avrupa Şampiyonası eleme grubundaki kritik deplasman maçında rakibini 3-1 mağlup ederek grupta liderliğe yükseldi.</p>`,
    categoryId: "3",
    image: "https://images.unsplash.com/photo-1574629810360-7efbc5751737?w=1200&h=675&fit=crop",
    publishedAt: new Date("2026-05-30T07:15:00"),
    readTime: 3,
    featured: true,
    breaking: true,
    tags: ["futbol", "milli takım"],
  },
  {
    title: "Yapay Zeka Düzenlemelerinde Avrupa ve ABD Arasında Yeni İş Birliği",
    slug: "yapay-zeka-duzenlemelerinde-is-birligi",
    excerpt: "AB ve ABD, yapay zeka teknolojilerinin güvenli gelişimi için ortak standartlar belirlemek üzere anlaşma imzaladı.",
    content: `<p>Avrupa Birliği ile Amerika Birleşik Devletleri, yapay zeka teknolojilerinin güvenli gelişimi için tarihi bir iş birliği anlaşması imzaladı.</p>`,
    categoryId: "4",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
    publishedAt: new Date("2026-05-29T16:45:00"),
    readTime: 5,
    featured: true,
    breaking: false,
    tags: ["yapay zeka", "AB", "ABD"],
  },
  {
    title: "İstanbul'da Ulaşım Projelerinde Yeni Dönem Başlıyor",
    slug: "istanbul-ulasim-projelerinde-yeni-donem",
    excerpt: "Büyükşehir Belediyesi, metro hatları ve deniz ulaşımını kapsayan kapsamlı ulaşım planını duyurdu.",
    content: `<p>İstanbul Büyükşehir Belediyesi, şehrin ulaşım altyapısını güçlendirmek amacıyla kapsamlı bir proje paketi açıkladı.</p>`,
    categoryId: "1",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=675&fit=crop",
    publishedAt: new Date("2026-05-29T14:20:00"),
    readTime: 4,
    featured: false,
    breaking: false,
    tags: ["istanbul", "ulaşım"],
  },
  {
    title: "Sağlık Bakanlığı'ndan Mevsim Geçişlerinde Bağışıklık Uyarısı",
    slug: "saglik-bakanligi-bagisiklik-uyarisi",
    excerpt: "Uzmanlar, mevsim geçişlerinde bağışıklık sistemini güçlendirmek için alınması gereken önlemleri açıkladı.",
    content: `<p>Sağlık Bakanlığı, mevsim geçişlerinde artan hastalık vakalarına karşı vatandaşları uyardı.</p>`,
    categoryId: "5",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop",
    publishedAt: new Date("2026-05-29T11:00:00"),
    readTime: 3,
    featured: false,
    breaking: false,
    tags: ["sağlık", "bağışıklık"],
  },
  {
    title: "BM İklim Zirvesi'nde Karbon Emisyon Hedefleri Yeniden Belirlendi",
    slug: "bm-iklim-zirvesi-karbon-emisyon-hedefleri",
    excerpt: "195 ülke temsilcisi, 2030 yılına kadar karbon emisyonlarını %45 azaltma taahhüdünde bulundu.",
    content: `<p>Birleşmiş Milletler İklim Değişikliği Konferansı'nda 195 ülke, karbon emisyonlarını azaltma taahhüdünde bulundu.</p>`,
    categoryId: "6",
    image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=1200&h=675&fit=crop",
    publishedAt: new Date("2026-05-28T18:30:00"),
    readTime: 5,
    featured: false,
    breaking: false,
    tags: ["iklim", "BM"],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@ulubekmedya.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: UserRole.SUPER_ADMIN,
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const dbCategories = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(dbCategories.map((c) => [c.slug, c.id]));

  for (const src of sources) {
    const categoryId = src.categorySlug ? categoryBySlug[src.categorySlug] : undefined;
    const existing = await prisma.source.findFirst({ where: { url: src.url } });
    if (!existing) {
      await prisma.source.create({
        data: {
          name: src.name,
          url: src.url,
          type: src.type,
          trustScore: src.trustScore,
          categoryId,
          fetchIntervalMinutes: 1,
          isActive: true,
        },
      });
    }
  }

  for (const article of articles) {
    const categorySlug = categorySlugMap[article.categoryId];
    const categoryId = categoryBySlug[categorySlug];
    if (!categoryId) continue;

    const created = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        featured: article.featured,
        breaking: article.breaking,
        readTime: article.readTime,
        status: ArticleStatus.PUBLISHED,
      },
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        categoryId,
        publishedAt: article.publishedAt,
        readTime: article.readTime,
        featured: article.featured,
        breaking: article.breaking,
        status: ArticleStatus.PUBLISHED,
      },
    });

    for (const tagName of article.tags) {
      const tagSlug = slugify(tagName);
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: tagName, slug: tagSlug },
      });

      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: created.id, tagId: tag.id } },
        update: {},
        create: { articleId: created.id, tagId: tag.id },
      });
    }
  }

  console.log("Seed completed.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
