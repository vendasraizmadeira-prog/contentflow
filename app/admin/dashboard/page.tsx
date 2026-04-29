"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Recording = { id: string; client: string; date: string; time: string };

function getStatus(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff <= 1) return "tomorrow";
  if (diff <= 3) return "soon";
  return "later";
}

const statusColors: Record<string, string> = { review: "#FBBF24", approved: "#22C55E", scheduled: "#818CF8", posted: "#6B7280" };
const statusLabels: Record<string, string> = { review: "Em Revisão", approved: "Aprovados", scheduled: "Agendados", posted: "Postados" };
const typeColors: Record<string, string> = { review: "#FBBF24", recording: "#FF6B6B", briefing: "#7B4DFF", approved: "#22C55E" };

export default function AdminDashboard() {
  const [clientCount, setClientCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ em_revisao: 0, aprovado: 0, agendado: 0, postado: 0 });
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [clientRes, producaoRes, recRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("producao_items").select("status"),
        supabase.from("calendar_events")
          .select("id, event_date, event_time, profiles!client_id(name)")
          .eq("type", "recording")
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date")
          .limit(3),
      ]);

      setClientCount(clientRes.count ?? 0);

      const items = producaoRes.data ?? [];
      setStatusCounts({
        em_revisao: items.filter(i => i.status === "em_revisao").length,
        aprovado: items.filter(i => i.status === "aprovado").length,
        agendado: items.filter(i => i.status === "agendado").length,
        postado: items.filter(i => i.status === "postado").length,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRecordings((recRes.data ?? []).map((e: any) => ({
        id: e.id,
        client: (Array.isArray(e.profiles) ? e.profiles[0]?.name : e.profiles?.name) ?? "—",
        date: e.event_date ? new Date(e.event_date + "T12:00:00").toLocaleDateString("pt-BR") : "—",
        time: e.event_time ?? "",
      })));

      setLoading(false);
    };
    load();
  }, []);

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
  const displayCounts = {
    review: statusCounts.em_revisao,
    approved: statusCounts.aprovado,
    scheduled: statusCounts.agendado,
    posted: statusCounts.postado,
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Geral</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Visão geral de todos os clientes</p>
        </div>
        <Link href="/admin/conteudos/novo">
          <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "#7B4DFF", color: "#fff" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Novo conteúdo
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Clientes Ativos", value: clientCount, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "#D4FF3F" },
          { label: "Conteúdos em Revisão", value: statusCounts.em_revisao, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "#FBBF24" },
          { label: "Aprovações Pendentes", value: statusCounts.aprovado, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#22C55E" },
          { label: "Posts Agendados", value: statusCounts.agendado, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "#818CF8" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.color}20` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.icon}/></svg>
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-16 rounded-lg animate-pulse" style={{ background: "#22223A" }} />
            ) : (
              <p className="text-3xl font-bold">{k.value}</p>
            )}
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Donut chart */}
        <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <h3 className="font-semibold mb-4">Conteúdos por Status</h3>
          {loading ? (
            <div className="h-24 animate-pulse rounded-xl" style={{ background: "#22223A" }} />
          ) : (
            <div className="flex items-center gap-6">
              <div className="relative" style={{ width: 100, height: 100 }}>
                <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return Object.entries(displayCounts).map(([key, count]) => {
                      const pct = (count / total) * 100;
                      const el = (
                        <circle key={key} cx="21" cy="21" r="15.915" fill="none" stroke={statusColors[key]} strokeWidth="6"
                          strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset}/>
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold">{total}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>Total</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(displayCounts).map(([key, count]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[key] }}/>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{statusLabels[key]}</span>
                    <span className="text-xs font-medium ml-auto">{Math.round((count / total) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <h3 className="font-semibold mb-4">Acesso Rápido</h3>
          <div className="flex flex-col gap-2">
            {[
              { label: "Gerenciar Clientes", href: "/admin/clientes", color: "#D4FF3F", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Ver Calendário", href: "/admin/calendario", color: "#818CF8", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { label: "Gravações", href: "/admin/gravacoes", color: "#FF6B6B", icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
              { label: "Métricas", href: "/admin/metricas", color: "#FBBF24", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80" style={{ background: "#0B0B0F", border: "1px solid #22223A" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recordings */}
        <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Próximas gravações</h3>
            <Link href="/admin/gravacoes"><span className="text-xs" style={{ color: "#7B4DFF" }}>Ver calendário</span></Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: "#22223A" }} />)}
            </div>
          ) : recordings.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "#4B5563" }}>Nenhuma gravação agendada</p>
          ) : (
            recordings.map(r => {
              const s = getStatus(r.date);
              return (
                <div key={r.id} className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,107,0.15)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.client}</p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{r.date} — {r.time}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{
                    background: s === "tomorrow" ? "rgba(251,191,36,0.15)" : s === "soon" ? "rgba(129,140,248,0.15)" : "rgba(107,114,128,0.15)",
                    color: s === "tomorrow" ? "#FBBF24" : s === "soon" ? "#818CF8" : "#9CA3AF",
                  }}>
                    {s === "tomorrow" ? "Amanhã" : s === "soon" ? "Em breve" : "Agendado"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
