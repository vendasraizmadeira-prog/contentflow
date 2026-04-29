"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { useAdminClient } from "./AdminClientContext";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  calendario: "Calendário",
  gravacoes: "Gravações",
  metricas: "Métricas",
  notificacoes: "Notificações",
  briefings: "Briefings",
};

const sectionTitle: Record<string, string> = {
  roteiros: "Roteiros",
  producao: "Produção",
  perfil: "Perfil",
};

function getPlusAction(pathname: string, clientId: string | null): string | null {
  if (clientId) {
    if (pathname.includes("/roteiros") && !pathname.includes("/novo") && !pathname.match(/roteiros\/[^/]+$/)) {
      return `/admin/clientes/${clientId}/roteiros/novo`;
    }
  }
  return null;
}

export default function AdminTopBar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { selectedClientId, selectedClient, setSelectedClient } = useAdminClient();

  const segs = pathname.split("/").filter(Boolean);
  const lastSeg = segs[segs.length - 1];
  const isInsideClient = segs[1] === "clientes" && segs[2] && segs[2] !== "novo";
  const section = sectionTitle[lastSeg] ?? pageTitles[lastSeg] ?? (isInsideClient ? "Conta" : "Admin");
  const plusAction = getPlusAction(pathname, selectedClientId);

  const handleDeselect = () => {
    setSelectedClient(null);
    router.push("/admin/clientes");
  };

  const avatarUrl = selectedClient?.avatar;
  const clientName = selectedClient?.name ?? "";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: "rgba(14,14,22,0.94)",
        borderBottom: "1px solid #1A1A28",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {selectedClient && (
        <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5" style={{ borderBottom: "1px solid #1A1A28" }}>
          <button onClick={handleDeselect} className="flex items-center gap-1.5 flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            <span className="text-xs" style={{ color: "#6B7280" }}>Todos</span>
          </button>
          <div className="flex items-center gap-2 flex-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#7B4DFF22", color: "#7B4DFF" }}>
                {clientName.charAt(0)}
              </div>
            )}
            <span className="text-sm font-semibold truncate">{clientName}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4" style={{ height: 48 }}>
        {selectedClient ? (
          <span className="text-sm font-semibold" style={{ color: "#7B4DFF" }}>{section}</span>
        ) : (
          <Logo size={24} />
        )}

        <span className="text-sm font-semibold" style={{ color: selectedClient ? "#9CA3AF" : "#7B4DFF" }}>
          {selectedClient ? "" : section}
        </span>

        {plusAction ? (
          <Link href={plusAction}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: "#7B4DFF" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </Link>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>
    </header>
  );
}
