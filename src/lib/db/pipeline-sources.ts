import { checkDatabaseConnection } from "./prisma";
import { listSourcesFromDb } from "./sources";
import { getAllSourcesFromStore } from "@/lib/ai-engine/store";
import type { MockSource } from "@/data/types";

/** Pipeline için aktif kaynakları döndürür — önce Supabase/Prisma, yoksa JSON store. */
export async function getActiveSourcesForPipeline(): Promise<MockSource[]> {
  if (await checkDatabaseConnection()) {
    const dbSources = await listSourcesFromDb();
    if (dbSources.length > 0) {
      return dbSources.filter((s) => s.isActive);
    }
  }
  return getAllSourcesFromStore().filter((s) => s.isActive);
}
