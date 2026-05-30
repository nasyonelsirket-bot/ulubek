export const APP_TIMEZONE = "Europe/Istanbul";

export function toIsoString(date: string | Date): string {
  return typeof date === "string" ? date : date.toISOString();
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** SSR/client-safe static date — "now" kullanmaz */
export function formatDateStable(dateString: string | Date): string {
  return formatDate(dateString);
}
