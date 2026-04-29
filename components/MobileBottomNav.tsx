"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/dashboard", label: "Início",
    match: (p: string) => p === "/dashboard",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/conteudos", label: "Conteúdos",
    match: (p: string) => p.startsWith("/conteudos") || p === "/posts" || p.startsWith("/post/") || p.startsWith("/reels"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: "/roteiros", label: "Roteiros",
    match: (p: string) => p.startsWith("/roteiros"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/calendario", label: "Agenda",
    match: (p: string) => p.startsWith("/calendario"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/metricas", label: "Perfil",
    match: (p: string) => p.startsWith("/metricas"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: "rgba(12,12,24,0.97)",
        borderTop: "1px solid #17172A",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        height: 60,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map(tab => {
        const active = tab.match(pathname);
        return (
          <Link key={tab.href} href={tab.href} className="flex-1">
            <div
              className="relative flex flex-col items-center justify-center h-full gap-1 select-none"
              style={{ color: active ? "#D4FF3F" : "#4A4A6A" }}
            >
              {active && (
                <span
                  className="absolute top-0 rounded-full"
                  style={{
                    width: 32,
                    height: 2,
                    background: "#D4FF3F",
                    boxShadow: "0 0 10px rgba(212,255,63,0.7)",
                  }}
                />
              )}
              {tab.icon(active)}
              <span className="font-medium leading-none" style={{ fontSize: 9, letterSpacing: "0.01em" }}>
                {tab.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
