import type { MockAdminUser } from "./types";
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
} from "@/lib/auth/constants";

export const adminUser: MockAdminUser = {
  id: "admin-1",
  email: DEFAULT_ADMIN_EMAIL,
  password: DEFAULT_ADMIN_PASSWORD,
  name: "Ulubek Admin",
  role: "ADMIN",
};

export function validateAdminCredentials(
  identifier: string,
  password: string
): MockAdminUser | null {
  const id = identifier.trim().toLowerCase();
  const validIdentifier =
    id === DEFAULT_ADMIN_USERNAME.toLowerCase() ||
    id === DEFAULT_ADMIN_EMAIL.toLowerCase();

  if (validIdentifier && password === DEFAULT_ADMIN_PASSWORD) {
    return adminUser;
  }
  return null;
}
