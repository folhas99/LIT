import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import SessionProvider from "@/components/admin/SessionProvider";

export const metadata = {
  title: "Admin | LIT Coimbra",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Allow login page without auth
  if (!session) {
    return (
      <SessionProvider>
        <div className="min-h-screen bg-jungle-950">{children}</div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-jungle-950">
        <Sidebar />
        <div className="lg:ml-64">
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}
