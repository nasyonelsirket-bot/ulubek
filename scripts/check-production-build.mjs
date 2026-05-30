/**
 * Production build çıktısında localhost referansı olmamalı.
 * Kullanım: npm run build && node scripts/check-production-build.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
/** Tarayıcıya gönderilen client bundle — localhost olmamalı */
const OUT_DIRS = [path.join(ROOT, ".next", "static")];
const PATTERNS = [/localhost:3001/i, /ws:\/\/localhost/i, /http:\/\/localhost:3001/i];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(js|json|html|rsc)$/.test(entry)) files.push(full);
  }
  return files;
}

if (!OUT_DIRS.some((dir) => statSync(dir, { throwIfNoExists: false }))) {
  console.error("❌ .next bulunamadı. Önce npm run build çalıştırın.");
  process.exit(1);
}

const hits = [];

for (const outDir of OUT_DIRS) {
  if (!statSync(outDir, { throwIfNoExists: false })) continue;
  for (const file of walk(outDir)) {
  const rel = path.relative(ROOT, file);
  if (rel.includes(`${path.sep}cache${path.sep}`)) continue;

  const content = readFileSync(file, "utf-8");
  for (const pattern of PATTERNS) {
    if (pattern.test(content)) {
      hits.push({ file: rel, pattern: pattern.source });
      break;
    }
  }
  }
}

if (hits.length === 0) {
  console.log("✅ Production build temiz — localhost:3001 referansı yok.");
  process.exit(0);
}

console.error(`❌ ${hits.length} dosyada localhost referansı bulundu:\n`);
for (const { file, pattern } of hits) {
  console.error(`  • ${file}  (${pattern})`);
}
console.error(
  "\nÇözüm: Netlify/production ortamında NEXT_PUBLIC_WS_URL ve WS_BROADCAST_URL tanımlamayın",
  "veya localhost yerine gerçek wss:// / https:// URL kullanın.",
);
process.exit(1);
