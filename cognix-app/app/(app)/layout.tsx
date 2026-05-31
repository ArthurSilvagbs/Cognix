import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import MobileTopBar from "@/components/MobileTopBar";
import StoreInitializer from "@/components/StoreInitializer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <StoreInitializer />
      <Sidebar />
      <main className="app-main flex-1 overflow-y-auto">
        <MobileTopBar />
        {children}
      </main>
    </div>
  );
}
