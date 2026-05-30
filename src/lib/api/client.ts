export async function readApiJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    return { success: false, error: "Sunucu boş yanıt döndü" } as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return { success: false, error: "Geçersiz JSON yanıtı" } as T;
  }
}

export function apiFailed(data: { success?: boolean; error?: string }, res: Response): boolean {
  return !res.ok || data.success === false;
}
