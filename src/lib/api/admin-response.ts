import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export function adminOk<T extends Record<string, unknown>>(
  data: T = {} as T,
  status = 200
) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function adminErr(error: string, status = 500) {
  return NextResponse.json({ success: false, error }, { status });
}

export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Sunucu hatası";
}

export async function requireAdminSession() {
  try {
    const session = await getSession();
    if (!session) {
      return { session: null, unauthorized: adminErr("Yetkisiz", 401) };
    }
    return { session, unauthorized: null as null };
  } catch (err) {
    console.error("[requireAdminSession]", err);
    return { session: null, unauthorized: adminErr(toErrorMessage(err), 500) };
  }
}

export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Geçersiz JSON gövdesi");
  }
}
