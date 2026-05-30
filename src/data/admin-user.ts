import type { MockAdminUser } from "./types";

export const adminUser: MockAdminUser = {
  id: "admin-1",
  email: "admin@ulubekmedya.com",
  password: "Admin123!",
  name: "Ulubek Admin",
  role: "ADMIN",
};

export function validateAdminCredentials(email: string, password: string): MockAdminUser | null {
  if (email === adminUser.email && password === adminUser.password) {
    return adminUser;
  }
  return null;
}
