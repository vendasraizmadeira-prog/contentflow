"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/metricas",
    label: "Home",
    active: (p: string) => p === "/metricas" || p.startsWith("/metricas/"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    href: "/roteiros",
    label: "Roteiros",
    active: (p: string) => p.startsWith("/roteiros"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    href: "/conteudos",
    label: "Conteúdos",
    active: (p: string) => p.startsWith("/conteudos") || p === "/posts" || p.startsWith("/post/") || p.startsWith("/reels"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },
  {
    href: "/calendario",
    label: "Agenda",
    active: (p: string) => p.startsWith("/calendario"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    href: "/ideias",
    label: "Ideias",
    active: (p: string) => p.startsWith("/ideias"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around md:hidden"
      style={{
        background: "rgba(14,14,22,0.96)",
        borderTop: "1px solid #1A1A28",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((item) => {
        const isActive = item.active(pathname ?? "");
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div
              className="flex flex-col items-center justify-center h-full gap-1 cursor-pointer transition-all duration-150 relative"
              style={{ color: isActive ? "#D4FF3F" : "#6B7280" }}
            >
              {/* Active dot indicator */}
              {isActive && (
                <span
                  className="absolute top-1.5 w-5 h-0.5 rounded-full"
                  style={{ background: "#D4FF3F", boxShadow: "0 0 8px rgba(212,255,63,0.6)" }}
                />
              )}
              {item.icon}
              <span className="font-medium" style={{ fontSize: 9, letterSpacing: "0.01em" }}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
