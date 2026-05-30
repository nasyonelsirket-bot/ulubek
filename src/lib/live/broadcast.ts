import type { LiveEvent } from "./types";
import { getBroadcastApiUrl, getBroadcastSecret } from "./config.server";

export async function broadcastLiveEvent(event: LiveEvent): Promise<void> {
  const url = getBroadcastApiUrl();
  if (!url) return;

  const secret = getBroadcastSecret();

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Live] WebSocket broadcast başarısız:", err instanceof Error ? err.message : err);
    }
  }
}
