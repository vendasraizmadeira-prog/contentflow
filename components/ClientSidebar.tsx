"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { mockClient } from "@/lib/mock-data";

const nav = [
  { href: "/metricas", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/roteiros", label: "Roteiros", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/posts", label: "Posts", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/reels", label: "Reels", icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { href: "/calendario", label: "Calendário", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/ideias", label: "Ideias & Refs", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { href: "/notificacoes", label: "Notificações", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { href: "/briefing", label: "Briefing", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

export default function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen flex-shrink-0" style={{ background: "#0F0F17", borderRight: "1px solid #1E1E2A" }}>
      <div className="p-5 pb-4">
        <Logo size={30} />
        <p className="text-xs mt-1 ml-1" style={{ color: "#6B7280" }}>Portal do Cliente</p>
      </div>

      <nav className="flex-1 px-3 py-2">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            pathname?.startsWith(item.href + "/") ||
            (item.href === "/posts" && pathname?.startsWith("/post/")) ||
            (item.href === "/reels" && pathname?.startsWith("/reels/"));
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all" style={{
                background: active ? "rgba(212,255,63,0.12)" : "transparent",
                color: active ? "#D4FF3F" : "#9CA3AF",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                <span className="text-sm font-medium">{item.label}</span>
                {item.label === "Notificações" && (
                  <span className="ml-auto text-xs font-bold rounded-full px-1.5 py-0.5" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>2</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "#1E1E2A" }}>
        <div className="flex items-center gap-3">
          <img src={mockClient.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{mockClient.name}</p>
            <p className="text-xs truncate" style={{ color: "#6B7280" }}>{mockClient.instagram}</p>
          </div>
          <Link href="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
