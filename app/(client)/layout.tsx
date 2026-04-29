import ClientSidebar from "@/components/ClientSidebar";
import ClientNavWrapper from "@/components/ClientNavWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#0B0B0F" }}>
      <div className="hidden md:flex">
        <ClientSidebar />
      </div>
      <ClientNavWrapper>{children}</ClientNavWrapper>
    </div>
  );
}
