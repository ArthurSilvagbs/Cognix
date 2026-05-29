import Sidebar from "@/components/Sidebar";
import StoreInitializer from "@/components/StoreInitializer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <StoreInitializer />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
