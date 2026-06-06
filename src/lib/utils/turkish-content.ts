/** Türkçe içerik tespiti — İngilizce haberleri pipeline'dan eler. */
const TURKISH_CHARS = /[ğüşıöçĞÜŞİÖÇ]/;
const TURKISH_WORDS =
  /\b(ve|bir|için|ile|olan|olarak|daha|son|göre|yeni|türkiye|türk|de|da|bu|şu|haber|bakan|cumhurbaşkan|açıkladı|dedi|etti|oldu|yapılan|karar|sonra|gün|yıl|bin|milyon|lira|dolar|spor|ekonomi|gündem)\b/gi;
const ENGLISH_MARKERS =
  /\b(the|and|of|to|in|for|with|on|at|from|by|was|were|has|have|will|says|said|after|before|over|under|into|about|against|between|through|during|without|within|along|following|across|behind|beyond|plus|except|but|or|not|you|that|this|these|those|their|they|them|what|when|where|which|while|who|whom|whose|why|how)\b/gi;

export function isTurkishContent(title: string, content = ""): boolean {
  const combined = `${title} ${content}`.trim();
  if (combined.length < 12) return false;

  if (TURKISH_CHARS.test(combined)) return true;

  const trMatches = combined.match(TURKISH_WORDS)?.length ?? 0;
  const enMatches = combined.match(ENGLISH_MARKERS)?.length ?? 0;

  if (trMatches >= 2) return true;
  if (enMatches >= 3 && trMatches === 0) return false;

  // Latin-only başlıklar: en az 1 Türkçe kelime gerekli
  return trMatches >= 1;
}

export function skipReasonNonTurkish(title: string): string {
  return `"${title.slice(0, 60)}…" Türkçe değil — atlandı`;
}
