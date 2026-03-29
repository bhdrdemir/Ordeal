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
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Blueprint grid background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
      }} />

      <Sidebar user={{ name: session.user.name, email: session.user.email, image: session.user.image }} />
      <main className="flex-1 ml-64 p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
