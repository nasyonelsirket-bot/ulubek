import { NextRequest } from "next/server";
import {
  adminErr,
  adminOk,
  parseJsonBody,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { getPublicSettings, saveSettings } from "@/lib/settings/store";
import { buildSettingsPartial } from "@/lib/settings/apply-partial";

async function handleUpdate(request: NextRequest) {
  const { unauthorized } = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await parseJsonBody<Record<string, unknown>>(request);
  const partial = buildSettingsPartial(body);
  saveSettings(partial);
  return adminOk({ data: getPublicSettings() });
}

export async function GET() {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;
    return adminOk({ data: getPublicSettings() });
  } catch (err) {
    console.error("[admin/settings GET]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await handleUpdate(request);
  } catch (err) {
    console.error("[admin/settings PUT]", err);
    return adminErr(toErrorMessage(err));
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handleUpdate(request);
  } catch (err) {
    console.error("[admin/settings POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
