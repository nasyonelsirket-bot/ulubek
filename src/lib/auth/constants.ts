export const AUTH_COOKIE = "ulubek_admin_token";

/** Tek kaynak — middleware ve API aynı secret kullanmalı */
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ulubek-medya-jwt-secret-v1"
);

export const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ulubekmedya.com";
