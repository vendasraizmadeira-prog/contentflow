"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type ClientMetric = { id: string; name: string; instagram: string; avatar: string; followers: number; following: number; posts: number; growth: number };

export default function AdminMetricas() {
  const [clients, setClients] = useState<ClientMetric[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await createClient()
        .from("profiles")
        .select("id, name, instagram, avatar, followers, following, posts, growth")
        .eq("role", "client")
        .order("name");
      const list = (data ?? []) as ClientMetric[];
      setClients(list);
      if (list.length > 0) setSelectedId(list[0].id);
      setLoading(false);
    };
    load();
  }, []);

  const client = clients.find(c => c.id === selectedId);
  const followers = client?.followers ?? 0;
  const growth = client?.growth ?? 0;

  const chartW = 500, chartH = 160;
  const chartPoints = Array.from({ length: 6 }, (_, i) => {
    const factor = i / 5;
    const val = Math.round(followers * (1 - growth / 100) + followers * (growth / 100) * factor);
    return { x: 30 + factor * (chartW - 60), y: chartH - 30 - factor * (chartH - 60) * 0.6, val };
  });
  const polyline = chartPoints.map(p => `${p.x},${p.y}`).join(" ");
  const months = ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"];

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Métricas</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Visão geral das métricas</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "#0F0F1E", border: "1px solid #22223A", color: "#fff" }}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "#0F0F1E", border: "1px solid #22223A", color: "#fff" }}>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#0F0F1E", height: 100 }} />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Seguidores", value: followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : String(followers), growth: growth > 0 ? `+${growth}%` : `${growth}%`, color: "#D4FF3F" },
              { label: "Seguindo", value: String(client?.following ?? 0), growth: "—", color: "#7B4DFF" },
              { label: "Posts", value: String(client?.posts ?? 0), growth: "—", color: "#22C55E" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                <p className="text-xs mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs mt-1" style={{ color: s.color }}>{s.growth !== "—" ? `${s.growth} vs mês anterior` : "—"}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 mb-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <h3 className="font-semibold mb-4">Crescimento de Seguidores — {client?.name}</h3>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: 160 }}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4FF3F" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#D4FF3F" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polygon points={`${chartPoints[0].x},${chartH-30} ${polyline} ${chartPoints[chartPoints.length-1].x},${chartH-30}`} fill="url(#ag2)"/>
              <polyline points={polyline} fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {chartPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#D4FF3F" stroke="#0B0B0F" strokeWidth="1.5"/>
                  <text x={p.x} y={chartH - 10} textAnchor="middle" fontSize="9" fill="#6B7280">{months[i]}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <h3 className="font-semibold mb-4">Visão geral — Todos os clientes</h3>
            <div className="grid grid-cols-2 gap-3">
              {clients.map(c => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className="rounded-xl p-4 flex items-center gap-3 text-left transition-all" style={{ background: selectedId === c.id ? "rgba(212,255,63,0.08)" : "#0B0B0F", border: `1px solid ${selectedId === c.id ? "#D4FF3F44" : "#22223A"}` }}>
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0"/>
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: "#D4FF3F22", color: "#D4FF3F" }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs truncate" style={{ color: "#6B7280" }}>{c.instagram || "—"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{c.followers >= 1000 ? `${(c.followers / 1000).toFixed(1)}K` : c.followers}</p>
                    <p className="text-xs" style={{ color: "#22C55E" }}>{c.growth > 0 ? `+${c.growth}%` : `${c.growth}%`}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
