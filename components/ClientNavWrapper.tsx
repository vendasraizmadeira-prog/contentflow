"use client";
import { usePathname } from "next/navigation";
import InstagramBottomNav from "./InstagramBottomNav";

export default function ClientNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNav = pathname === "/briefing";
  const isReels = pathname === "/reels" || (pathname?.startsWith("/reels/") && pathname !== "/reels");

  return (
    <div className="flex-1 flex flex-col min-h-screen min-w-0" style={{ background: "#000" }}>
      <main
        className={`flex-1 overflow-auto ${noNav ? "" : isReels ? "md:pt-0 md:pb-0" : "pb-[49px] md:pb-0"}`}
        style={{ background: "#000" }}
      >
        {children}
      </main>
      {!noNav && <InstagramBottomNav />}
    </div>
  );
}
