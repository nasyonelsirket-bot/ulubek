# Ulubek Medya - Production Haber Platformu

Next.js 15 + PostgreSQL + Prisma + Shadcn UI ile production seviyesinde haber platformu.

## Kurulum

### 1. PostgreSQL başlat

```bash
npm run docker:up
```

Docker yoksa yerel PostgreSQL kurun ve `.env` dosyasındaki `DATABASE_URL` değerini güncelleyin.

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Migration ve seed

```bash
npm run db:migrate
npm run db:seed
```

Migration dosyaları `prisma/migrations/` klasöründe hazır.

### 4. Geliştirme sunucusu

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Admin Giriş

| Alan | Değer |
|------|-------|
| E-posta | admin@ulubekmedya.com |
| Şifre | Admin123! |

## Admin Panel Özellikleri

- Haber listeleme ve arama
- Haber düzenleme
- Haber gizleme / yayınlama
- Haber silme
- Dashboard istatistikleri

## Veritabanı Şeması

| Tablo | Açıklama |
|-------|----------|
| users | Admin kullanıcıları |
| categories | Haber kategorileri |
| tags | Etiketler |
| sources | Haber kaynakları |
| articles | Haberler |
| article_tags | Haber-etiket ilişkisi |

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run db:migrate` | Migration uygula |
| `npm run db:seed` | Örnek veri yükle |
| `npm run db:studio` | Prisma Studio |
| `npm run docker:up` | PostgreSQL başlat |
| `npm run docker:down` | PostgreSQL durdur |
| `npm run rss:fetch` | RSS kaynaklarını tara (cron script) |
| `npm run ai:process` | Bekleyen haberleri AI ile işle |

## AI Haber Motoru

RSS'ten gelen haberler otomatik AI motorundan geçer:

1. **Analiz** — konu ve güven skoru
2. **Kategorize** — otomatik kategori atama
3. **Tarafsızlaştır** — propaganda/yorum dili temizleme
4. **SEO yeniden yazım** — başlık, meta, içerik optimizasyonu
5. **Yayınla** — `PUBLISHED` durumuna geçir

**Motor:** `OPENAI_API_KEY` varsa GPT-4o-mini, yoksa yerel kural tabanlı motor.

```
RSS Tarama → DRAFT (ham) → AI Motor → PUBLISHED (yayına hazır)
```

`.env` ayarı:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## RSS Haber Toplama

### Admin Panelden Kaynak Ekleme
1. `/admin/sources` sayfasına gidin
2. **RSS Kaynağı Ekle** butonuna tıklayın
3. Kaynak adı, RSS URL, kategori ve tarama aralığını girin

### Periyodik Tarama

**Yerel / VPS cron:**
```bash
# Her 15 dakikada bir
*/15 * * * * cd /path/to/project && npm run rss:fetch
```

**HTTP Cron (Netlify/Vercel):**
```bash
curl -X POST https://yourdomain.com/api/cron/rss \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

`.env` dosyasına `CRON_SECRET` ekleyin.

### Kopya Haber Engelleme

Sistem aşağıdaki kontrolleri yapar:
- Aynı kaynak URL (`sourceUrl`)
- Aynı RSS GUID (`externalId` + kaynak)
- Başlık hash (`contentHash`)
- Benzer başlık (son 7 gün)

### API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/admin/sources` | Kaynak ekle |
| `PATCH /api/admin/sources/[id]` | Kaynak güncelle |
| `DELETE /api/admin/sources/[id]` | Kaynak sil |
| `POST /api/admin/sources/[id]/fetch` | Tek kaynağı tara |
| `POST /api/admin/sources/fetch-all` | Tüm kaynakları tara |
| `GET/POST /api/cron/rss` | Periyodik cron endpoint |

## Teknolojiler

- Next.js 15 (App Router)
- TypeScript
- PostgreSQL + Prisma ORM
- Shadcn UI + Tailwind CSS 4
- JWT Authentication
