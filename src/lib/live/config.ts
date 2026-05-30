const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return LOCAL_HOSTNAMES.has(hostname);
  } catch {
    return /\blocalhost\b|127\.0\.0\.1/.test(url);
  }
}

/** Client tarafında WebSocket URL doğrulama — localhost string'i bundle'a gömülmez */
export function sanitizeWebSocketUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (process.env.NODE_ENV === "production" && isLocalhostUrl(trimmed)) return null;
  return trimmed;
}

export function isWebSocketUrlEnabled(url: string | null | undefined): boolean {
  return sanitizeWebSocketUrl(url) !== null;
}
