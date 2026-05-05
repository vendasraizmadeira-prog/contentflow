import InstagramSidebar from "@/components/InstagramSidebar";
import ClientNavWrapper from "@/components/ClientNavWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#000" }}>
      <InstagramSidebar />
      <ClientNavWrapper>{children}</ClientNavWrapper>
    </div>
  );
}
