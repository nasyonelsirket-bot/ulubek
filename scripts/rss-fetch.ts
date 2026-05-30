import { PrismaClient } from "@prisma/client";
import { fetchAllActiveRssSources } from "../src/lib/rss/importer";

const prisma = new PrismaClient();

async function main() {
  console.log(`[RSS] Tarama başladı: ${new Date().toISOString()}`);

  const results = await fetchAllActiveRssSources();

  if (results.length === 0) {
    console.log("[RSS] Taranacak kaynak yok (hepsi güncel veya pasif).");
    return;
  }

  for (const r of results) {
    if (r.error) {
      console.log(`[RSS] ${r.sourceName}: HATA - ${r.error}`);
    } else {
      console.log(
        `[RSS] ${r.sourceName}: ${r.fetched} taranan, ${r.created} yeni, ${r.skipped} atlandı`
      );
    }
  }

  const total = results.reduce((s, r) => s + r.created, 0);
  console.log(`[RSS] Tamamlandı. Toplam ${total} yeni haber.`);
}

main()
  .catch((err) => {
    console.error("[RSS] Kritik hata:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
