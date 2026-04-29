import AdminSidebar from "@/components/AdminSidebar";
import AdminTopBar from "@/components/AdminTopBar";
import AdminBottomNav from "@/components/AdminBottomNav";
import { AdminClientProvider } from "@/components/AdminClientContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminClientProvider>
      <div className="flex min-h-screen" style={{ background: "#0B0B0F" }}>
        <AdminSidebar />
        <AdminTopBar />
        <main className="flex-1 overflow-auto pt-14 pb-20 md:pt-0 md:pb-0">
          {children}
        </main>
        <AdminBottomNav />
      </div>
    </AdminClientProvider>
  );
}
