import "server-only";
import { isLocalhostUrl } from "./config";

export function getWebSocketClientUrl(): string | null {
  const configured =
    process.env.WS_CLIENT_URL?.trim() || process.env.NEXT_PUBLIC_WS_URL?.trim();

  if (configured) {
    if (process.env.NODE_ENV === "production" && isLocalhostUrl(configured)) return null;
    return configured;
  }

  if (process.env.NODE_ENV === "development") {
    return "ws://localhost:3001/live";
  }

  return null;
}

export function getBroadcastApiUrl(): string | null {
  const configured = process.env.WS_BROADCAST_URL?.trim();
  if (configured) {
    if (process.env.NODE_ENV === "production" && isLocalhostUrl(configured)) return null;
    return configured;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001/broadcast";
  }

  return null;
}

export function getBroadcastSecret(): string {
  return process.env.WS_BROADCAST_SECRET || "ulubek-ws-dev-secret";
}
