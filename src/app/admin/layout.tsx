import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin Panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Login page renders without sidebar (handled by route group logic via session check)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-white px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Hoş geldiniz, <span className="font-medium text-foreground">{session.name}</span>
          </p>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
