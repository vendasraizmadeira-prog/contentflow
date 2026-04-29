"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminClient } from "./AdminClientContext";

export default function AdminBottomNav() {
  const pathname = usePathname() ?? "";
  const { selectedClientId, selectedClient } = useAdminClient();
  const id = selectedClientId;

  const clientItems = id ? [
    { href: `/admin/clientes/${id}/roteiros`, label: "Roteiros", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: `/admin/clientes/${id}/producao`, label: "Produção", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: `/admin/clientes/${id}/perfil`,   label: "Perfil",   icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { href: "/admin/calendario",              label: "Agenda",   icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/admin/briefings",               label: "Briefing", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ] : [
    { href: "/admin/dashboard", label: "Home",     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/admin/clientes",  label: "Clientes", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { href: "/admin/calendario", label: "Agenda",  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/admin/gravacoes", label: "Gravações", icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
    { href: "/admin/briefings", label: "Briefings", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col"
      style={{
        background: "rgba(14,14,22,0.96)",
        borderTop: "1px solid #1A1A28",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Selected client strip */}
      {selectedClient && (
        <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "#1A1A28", background: "rgba(123,77,255,0.06)" }}>
          {selectedClient.avatar ? (
            <img src={selectedClient.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "rgba(123,77,255,0.2)", color: "#A78BFA" }}>
              {selectedClient.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold" style={{ color: "#C4B5FD" }}>{selectedClient.name}</span>
          <span className="text-xs ml-1" style={{ color: "#7B4DFF" }}>selecionado</span>
        </div>
      )}

      <div className="flex items-stretch justify-around" style={{ height: 64 }}>
        {clientItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className="flex flex-col items-center justify-center h-full gap-1 cursor-pointer transition-all duration-150 relative"
                style={{ color: active ? "#A78BFA" : "#6B7280" }}
              >
                {active && (
                  <span
                    className="absolute top-1.5 w-5 h-0.5 rounded-full"
                    style={{ background: "#7B4DFF", boxShadow: "0 0 8px rgba(123,77,255,0.6)" }}
                  />
                )}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span className="font-medium" style={{ fontSize: 9, letterSpacing: "0.01em" }}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
