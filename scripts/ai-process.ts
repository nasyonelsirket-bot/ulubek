import { PrismaClient } from "@prisma/client";
import { processPendingArticles } from "../src/lib/ai/processor";

const prisma = new PrismaClient();

async function main() {
  console.log(`[AI] Bekleyen haberler işleniyor: ${new Date().toISOString()}`);

  const results = await processPendingArticles(50);

  if (results.length === 0) {
    console.log("[AI] İşlenecek haber yok.");
    return;
  }

  for (const r of results) {
    if (r.success) {
      console.log(`[AI] ✓ ${r.articleId} (${r.engine})`);
    } else {
      console.log(`[AI] ✗ ${r.articleId}: ${r.error}`);
    }
  }

  const ok = results.filter((r) => r.success).length;
  console.log(`[AI] Tamamlandı: ${ok}/${results.length} başarılı`);
}

main()
  .catch((err) => {
    console.error("[AI] Kritik hata:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
