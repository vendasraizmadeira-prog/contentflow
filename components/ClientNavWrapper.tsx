"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MobileBottomNav from "./MobileBottomNav";
import MobileTopBar from "./MobileTopBar";

export default function ClientNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNav = pathname === "/briefing";

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {!noNav && <MobileTopBar />}
      <main className={`flex-1 overflow-auto ${noNav ? "" : "pt-14 pb-20 md:pt-0 md:pb-0"}`}>
        {children}
      </main>
      {!noNav && (
        <>
          <Link
            href="/ideias"
            className="fixed md:hidden z-40 cursor-pointer active:scale-95 transition-all duration-150"
            style={{ bottom: 78, right: 16 }}
          >
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center"
              style={{
                width: 52,
                height: 52,
                background: "#D4FF3F",
                boxShadow: "0 4px 20px rgba(212,255,63,0.35), 0 0 0 1px rgba(212,255,63,0.2)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B0B0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </Link>
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}
