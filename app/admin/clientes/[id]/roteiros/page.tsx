"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Roteiro = {
  id: string;
  title: string;
  type: string;
  status: string;
  content: string;
  created_at: string;
  history: unknown[];
  producao_id: string | null;
};

const typeLabel: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColor: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  rascunho:   { label: "Rascunho",   color: "#6B7280", bg: "#6B728022" },
  enviado:    { label: "Enviado",    color: "#FBBF24", bg: "#FBBF2422" },
  em_revisao: { label: "Em revisão", color: "#818CF8", bg: "#818CF822" },
  aprovado:   { label: "Aprovado",   color: "#10B981", bg: "#10B98122" },
};

const filters = [
  { key: "todos", label: "Todos" },
  { key: "rascunho", label: "Rascunho" },
  { key: "enviado", label: "Enviado" },
  { key: "aprovado", label: "Aprovado" },
];

export default function ClienteRoteiros() {
  const { id } = useParams() as { id: string };
  const [filter, setFilter] = useState("todos");
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [rRes, pRes] = await Promise.all([
        supabase.from("roteiros").select("*").eq("client_id", id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("name").eq("id", id).single(),
      ]);
      setRoteiros(rRes.data ?? []);
      setClientName(pRes.data?.name ?? "");
      setLoading(false);
    };
    load();
  }, [id]);

  const filtered = filter === "todos" ? roteiros : roteiros.filter((r) => r.status === filter);

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      {/* Desktop-only back button — mobile has AdminTopBar breadcrumb */}
      <Link href={`/admin/clientes/${id}`} className="hidden md:flex items-center gap-2 mb-4 w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="text-sm" style={{ color: "#6B7280" }}>{clientName || "Voltar"}</span>
      </Link>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Roteiros</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{roteiros.length} roteiro{roteiros.length !== 1 ? "s" : ""} no total</p>
        </div>
        {/* Desktop-only new button — mobile has AdminTopBar + button */}
        <Link href={`/admin/clientes/${id}/roteiros/novo`} className="hidden md:block">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#7B4DFF", color: "#fff" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Novo
          </button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {filters.map((f) => {
          const count = f.key === "todos" ? roteiros.length : roteiros.filter((r) => r.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: filter === f.key ? "#7B4DFF" : "#1A1A22",
                color: filter === f.key ? "#fff" : "#9CA3AF",
                border: filter === f.key ? "none" : "1px solid #2A2A38",
              }}
            >
              {f.label} <span className="ml-1 opacity-70 text-xs">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1A1A22", height: 110 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum roteiro encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <Link key={r.id} href={`/admin/clientes/${id}/roteiros/${r.id}`}>
              <div className="rounded-2xl p-4 transition-all active:scale-[0.98]" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${typeColor[r.type] ?? "#7B4DFF"}22`, color: typeColor[r.type] ?? "#7B4DFF" }}>
                      {typeLabel[r.type] ?? r.type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: statusConfig[r.status]?.bg ?? "#6B728022", color: statusConfig[r.status]?.color ?? "#6B7280" }}>
                      {statusConfig[r.status]?.label ?? r.status}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
                <p className="font-semibold mb-1">{r.title}</p>
                <p className="text-sm" style={{ color: "#9CA3AF" }}>{(r.content ?? "").slice(0, 100).replace(/\n/g, " ")}…</p>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #2A2A38" }}>
                  <span className="text-xs" style={{ color: "#6B7280" }}>
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="text-xs" style={{ color: "#6B7280" }}>
                    {(r.history as unknown[]).length} entrada{(r.history as unknown[]).length !== 1 ? "s" : ""}
                    {r.producao_id && <span className="ml-2" style={{ color: "#D4FF3F" }}>· Em produção</span>}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
