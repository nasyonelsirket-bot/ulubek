import type { LiveEvent } from "./types";

export async function broadcastLiveEvent(event: LiveEvent): Promise<void> {
  const url = process.env.WS_BROADCAST_URL || "http://localhost:3001/broadcast";
  const secret = process.env.WS_BROADCAST_SECRET || "ulubek-ws-dev-secret";

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
    console.warn("[Live] WebSocket broadcast başarısız:", err instanceof Error ? err.message : err);
  }
}
