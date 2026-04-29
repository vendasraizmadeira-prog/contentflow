"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MobileBottomNav from "./MobileBottomNav";
import MobileTopBar from "./MobileTopBar";

export default function ClientNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNav = pathname === "/briefing";

  return (
    <div className="flex-1 flex flex-col min-h-screen min-w-0">
      {!noNav && <MobileTopBar />}
      <main className={`flex-1 overflow-auto ${noNav ? "" : "pt-[50px] pb-[60px] md:pt-0 md:pb-0"}`}>
        {children}
      </main>
      {!noNav && (
        <>
          <Link
            href="/ideias"
            className="fixed z-40 md:hidden cursor-pointer"
            style={{ bottom: 72, right: 16 }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "#D4FF3F",
                boxShadow: "0 4px 24px rgba(212,255,63,0.4)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B0B0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </Link>
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}
