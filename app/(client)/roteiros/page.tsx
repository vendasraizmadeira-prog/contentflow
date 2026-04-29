"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Roteiro = {
  id: string;
  title: string;
  type: string;
  status: string;
  content: string;
  created_at: string;
  history: unknown[];
};

const typeLabel: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColor: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  rascunho:   { label: "Rascunho",   color: "#6B7280", bg: "#6B728022" },
  enviado:    { label: "Enviado",    color: "#FBBF24", bg: "#FBBF2422" },
  em_revisao: { label: "Em revisão", color: "#818CF8", bg: "#818CF822" },
  aprovado:   { label: "Aprovado",   color: "#10B981", bg: "#10B98122" },
};

export default function Roteiros() {
  const [filter, setFilter] = useState<"pendente" | "revisado">("pendente");
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("roteiros")
        .select("id, title, type, status, content, created_at, history")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setRoteiros(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const pending = roteiros.filter((r) => r.status === "enviado" || r.status === "em_revisao");
  const reviewed = roteiros.filter((r) => r.status === "aprovado" || r.status === "rascunho");
  const filtered = filter === "pendente" ? pending : reviewed;

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Roteiros</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Revise e aprove os roteiros enviados</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pendente", "revisado"] as const).map((tab) => {
          const count = tab === "pendente" ? pending.length : reviewed.length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: filter === tab ? "#D4FF3F" : "#1A1A22",
                color: filter === tab ? "#0B0B0F" : "#9CA3AF",
                border: filter === tab ? "none" : "1px solid #2A2A38",
              }}
            >
              {tab === "pendente" ? "Pendentes" : "Revisados"}
              <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: filter === tab ? "rgba(0,0,0,0.15)" : "#2A2A38", color: filter === tab ? "#0B0B0F" : "#6B7280" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1A1A22", height: 110 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40" strokeLinecap="round">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p className="text-sm">Nenhum roteiro {filter === "pendente" ? "pendente" : "revisado"}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => {
            const color = typeColor[r.type] ?? "#7B4DFF";
            const st = statusConfig[r.status] ?? statusConfig.enviado;
            const preview = (r.content ?? "").slice(0, 120).replace(/\n/g, " ") + ((r.content ?? "").length > 120 ? "…" : "");
            return (
              <Link key={r.id} href={`/roteiros/${r.id}`}>
                <div className="rounded-2xl p-4 transition-all active:scale-[0.98]" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
                        {typeLabel[r.type] ?? r.type}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                  <p className="font-semibold mb-1.5">{r.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>{preview}</p>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #2A2A38" }}>
                    <span className="text-xs" style={{ color: "#6B7280" }}>
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-xs" style={{ color: "#6B7280" }}>
                      {(r.history as unknown[]).length} {(r.history as unknown[]).length === 1 ? "entrada" : "entradas"}
                    </span>
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
