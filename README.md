# Ulubek Medya - Profesyonel Haber Sitesi

Türkiye'nin güvenilir dijital haber platformu. Next.js 15, TypeScript ve Tailwind CSS ile geliştirilmiştir.

## Özellikler

- **Ana Sayfa**: Öne çıkan haberler, kategori kartları, son haberler
- **Kategori Sayfaları**: Gündem, Ekonomi, Spor, Teknoloji, Sağlık, Dünya, Kültür-Sanat
- **Haber Detay**: Tam haber içeriği, yazar bilgisi, paylaşım butonları, ilgili haberler
- **Arama**: Anahtar kelime ile haber arama
- **Son Dakika Bandı**: Kayan son dakika haberleri
- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu
- **SEO**: Meta etiketleri ve Open Graph desteği

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Production build oluşturur |
| `npm run start` | Production sunucusunu başlatır |
| `npm run lint` | ESLint kontrolü yapar |

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── page.tsx            # Ana sayfa
│   ├── kategori/[slug]/    # Kategori sayfaları
│   ├── haber/[slug]/       # Haber detay sayfaları
│   ├── arama/              # Arama sayfası
│   └── ...
├── components/
│   ├── layout/             # Header, Footer, Sidebar
│   ├── news/               # Haber bileşenleri
│   └── ui/                 # UI bileşenleri
├── lib/
│   ├── data/               # Haber, kategori, yazar verileri
│   └── utils/              # Yardımcı fonksiyonlar
└── types/                  # TypeScript tipleri
```

## Teknolojiler

- [Next.js 15](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [React 19](https://react.dev/)
