"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ClientOption = { id: string; name: string };
type ProducaoItem = {
  id: string;
  type: string;
  status: string;
  images: string[];
  caption: string;
  roteiro_title: string;
  client_id: string;
  clientName: string;
  scheduled_date: string | null;
};

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  aguardando:  { bg: "rgba(251,191,36,0.15)",  text: "#FBBF24", label: "Aguardando upload" },
  em_revisao:  { bg: "rgba(129,140,248,0.15)", text: "#818CF8", label: "Em revisão" },
  aprovado:    { bg: "rgba(34,197,94,0.15)",   text: "#22C55E", label: "Aprovado" },
  agendado:    { bg: "rgba(212,255,63,0.15)",  text: "#D4FF3F", label: "Agendado" },
};
const typeLabels: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColors: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };

const filterStatuses: Record<string, string | null> = {
  "Todos": null,
  "Em revisão": "em_revisao",
  "Aprovado": "aprovado",
  "Agendado": "agendado",
};

export default function AdminConteudos() {
  const [items, setItems] = useState<ProducaoItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [clientFilter, setClientFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [itemRes, cliRes] = await Promise.all([
        supabase.from("producao_items")
          .select("id, type, status, images, caption, roteiro_title, client_id, scheduled_date, profiles!client_id(name)")
          .order("id", { ascending: false }),
        supabase.from("profiles").select("id, name").eq("role", "client").order("name"),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems((itemRes.data ?? []).map((e: any) => ({
        id: e.id,
        type: e.type,
        status: e.status,
        images: e.images ?? [],
        caption: e.caption ?? "",
        roteiro_title: e.roteiro_title ?? "",
        client_id: e.client_id,
        clientName: (Array.isArray(e.profiles) ? e.profiles[0]?.name : e.profiles?.name) ?? "—",
        scheduled_date: e.scheduled_date,
      })));

      setClients(cliRes.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = items.filter(item => {
    const matchStatus = filterStatuses[filter] === null || item.status === filterStatuses[filter];
    const matchClient = clientFilter === "all" || item.client_id === clientFilter;
    return matchStatus && matchClient;
  });

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Conteúdos</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Gerencie todos os conteúdos em produção</p>
        </div>
        <Link href="/admin/conteudos/novo">
          <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "#7B4DFF", color: "#fff" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Novo conteúdo
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {Object.keys(filterStatuses).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{
            background: filter === f ? "rgba(123,77,255,0.15)" : "transparent",
            color: filter === f ? "#7B4DFF" : "#6B7280",
            border: filter === f ? "1px solid rgba(123,77,255,0.3)" : "1px solid transparent",
          }}>{f}</button>
        ))}
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="ml-auto px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "#0F0F1E", border: "1px solid #22223A", color: "#fff" }}>
          <option value="all">Todos os clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#0F0F1E", height: 240 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum conteúdo encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(item => {
            const st = statusMap[item.status] ?? statusMap.em_revisao;
            const tc = typeColors[item.type] ?? "#7B4DFF";
            return (
              <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                <div className="relative" style={{ height: 160 }}>
                  {item.images[0] ? (
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "#0B0B0F" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22223A" strokeWidth="2" strokeLinecap="round">
                        {item.type === "reel"
                          ? <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                          : <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        }
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${tc}22`, color: tc }}>{typeLabels[item.type] ?? item.type}</span>
                    <span className="text-xs truncate ml-2" style={{ color: "#6B7280" }}>{item.clientName}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate">{item.roteiro_title || "Sem título"}</h3>
                  {item.caption && <p className="text-xs mb-2 line-clamp-2" style={{ color: "#6B7280" }}>{item.caption}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
