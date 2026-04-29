"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/metricas",
    label: "Home",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    active: (p: string) => p === "/metricas" || p.startsWith("/metricas/"),
  },
  {
    href: "/roteiros",
    label: "Roteiros",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    active: (p: string) => p.startsWith("/roteiros"),
  },
  {
    href: "/posts",
    label: "Post",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    active: (p: string) => p === "/posts" || p.startsWith("/post/"),
  },
  {
    href: "/reels",
    label: "Reels",
    icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    active: (p: string) => p.startsWith("/reels"),
  },
  {
    href: "/calendario",
    label: "Agenda",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    active: (p: string) => p.startsWith("/calendario"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around md:hidden"
      style={{
        background: "#0F0F17",
        borderTop: "1px solid #1E1E2A",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((item) => {
        const active = item.active(pathname ?? "");
        return (
          <Link key={item.href} href={item.href}>
            <div className="flex flex-col items-center gap-1 px-3 py-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#D4FF3F" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="text-xs" style={{ color: active ? "#D4FF3F" : "#6B7280", fontSize: 10 }}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
