"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; type: string; status: string; images: string[]; caption: string | null; created_at: string; };

const statusTabs = [
  { key: "all",        label: "Todos" },
  { key: "aguardando", label: "Aguardando" },
  { key: "em_revisao", label: "Em revisão" },
  { key: "aprovado",   label: "Aprovados" },
  { key: "agendado",   label: "Agendados" },
];

const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
  aguardando: { label: "Aguardando", bg: "rgba(107,114,128,0.7)", color: "#fff" },
  em_revisao: { label: "Em revisão", bg: "#F59E0B",              color: "#0B0B0F" },
  aprovado:   { label: "Aprovado",   bg: "#10B981",              color: "#0B0B0F" },
  agendado:   { label: "Agendado",   bg: "#7B4DFF",              color: "#fff" },
};

export default function ReelsList() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("producao_items")
        .select("id, type, status, images, caption, created_at")
        .eq("client_id", user.id)
        .eq("type", "reel")
        .order("created_at", { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeStatus === "all" ? items : items.filter((c) => c.status === activeStatus);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Reels</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Vídeos para revisão</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {statusTabs.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStatus(s.key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeStatus === s.key ? "#7B4DFF" : "#0F0F1E",
              color: activeStatus === s.key ? "#fff" : "#9CA3AF",
              border: activeStatus === s.key ? "none" : "1px solid #22223A",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#0F0F1E", aspectRatio: "9/16" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <p className="text-sm">Nenhum reel encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c) => {
            const thumbnail = c.images?.[0] ?? "";
            const badge = statusBadge[c.status] ?? statusBadge.aguardando;
            return (
              <Link key={c.id} href={`/reels/${c.id}`}>
                <div className="relative rounded-2xl overflow-hidden active:scale-[0.97] transition-transform" style={{ background: "#0F0F1E", aspectRatio: "9/16" }}>
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "#0B0B0F" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />
                  <div className="absolute top-2 right-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M5 3l14 9-14 9V3z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
