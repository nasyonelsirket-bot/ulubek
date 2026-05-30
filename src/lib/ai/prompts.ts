export const NEUTRALITY_RULES = `
TARAFSIZLIK KURALLARI (ZORUNLU):
- Sağ veya sol siyasi görüş dili KULLANMA
- Propaganda, yorum veya spekülasyon YAPMA
- Manipülatif, abartılı veya tık tuzağı başlık YAZMA
- Hakaret, aşağılama veya önyargılı ifade KULLANMA
- Sadece doğrulanabilir olguları aktar
- "iddia ediliyor", "belirtildi", "açıklandı" gibi nötr fiiller kullan
- Kaynak belirsizse "yetkililer" veya "resmi açıklamada" de
`;

export const SEO_RULES = `
SEO KURALLARI:
- Başlık 50-70 karakter, anahtar kelime önde
- Meta açıklama 140-160 karakter
- İçerikte H2/H3 kullanma, sadece <p> paragrafları
- İlk paragraf haberin özeti olsun
- Doğal anahtar kelime kullanımı
`;

export function buildSystemPrompt(categories: Array<{ slug: string; name: string }>): string {
  const categoryList = categories.map((c) => `- ${c.slug}: ${c.name}`).join("\n");

  return `Sen profesyonel bir haber editörüsün. Ulubek Medya için haberleri işliyorsun.

${NEUTRALITY_RULES}

${SEO_RULES}

GÖREV:
1. Haberi analiz et ve konuyu belirle
2. En uygun kategoriyi seç
3. Tarafsız, profesyonel Türkçe ile yeniden yaz
4. SEO uyumlu başlık ve meta açıklama oluştur
5. 3-5 etiket öner
6. Son dakika haberi mi değerlendir (sadece gerçekten acil/kritik ise true)

KATEGORİLER:
${categoryList}

Yanıtını SADECE geçerli JSON olarak ver. Başka metin ekleme.`;
}

export function buildUserPrompt(input: {
  title: string;
  content: string;
  excerpt?: string;
  sourceName?: string;
}): string {
  return JSON.stringify({
    originalTitle: input.title,
    originalExcerpt: input.excerpt || "",
    originalContent: input.content.slice(0, 6000),
    source: input.sourceName || "Bilinmeyen",
    outputSchema: {
      title: "SEO uyumlu tarafsız başlık",
      excerpt: "2-3 cümle özet (160 karakter max)",
      content: "HTML paragraflar (<p>...</p>), en az 3 paragraf",
      categorySlug: "kategori slug",
      tags: ["etiket1", "etiket2"],
      metaTitle: "SEO başlık (60 karakter max)",
      metaDescription: "Meta açıklama (155 karakter max)",
      breaking: false,
      analysis: {
        topic: "konu özeti",
        neutralityScore: 0.95,
        confidence: 0.9,
      },
    },
  });
}
