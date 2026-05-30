import { runAutoNewsPipeline } from "@/lib/ai-engine/pipeline";

async function main() {
  console.log(`[AI Motor] Tarama başladı: ${new Date().toISOString()}`);
  const summary = await runAutoNewsPipeline();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(console.error);
