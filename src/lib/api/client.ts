export async function readApiJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    return { success: false, error: "Sunucu boş yanıt döndü" } as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const hint = text.trimStart().startsWith("<")
      ? "Sunucu zaman aşımına uğradı veya HTML hata sayfası döndü"
      : "Geçersiz JSON yanıtı";
    return { success: false, error: hint } as T;
  }
}

export function apiFailed(data: { success?: boolean; error?: string }, res: Response): boolean {
  return !res.ok || data.success === false;
}
