import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";

export const metadata = {
  title: "Dashboard - Ordeal",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={{ name: session.user.name, email: session.user.email, image: session.user.image }} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
