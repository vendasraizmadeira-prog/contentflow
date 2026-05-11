import InstagramSidebar from "@/components/InstagramSidebar";
import ClientNavWrapper from "@/components/ClientNavWrapper";
import PushNotificationSetup from "@/components/PushNotificationSetup";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#000" }}>
      <InstagramSidebar />
      <ClientNavWrapper>{children}</ClientNavWrapper>
      <PushNotificationSetup />
    </div>
  );
}
