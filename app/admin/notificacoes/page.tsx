"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type ClientOption = { id: string; name: string };
type Notif = { id: string; title: string; client: string; type: string; active: boolean };

const initialNotifs: Notif[] = [
  { id: "1", title: "Conteúdo pronto para revisão", client: "all", type: "review", active: true },
  { id: "2", title: "Dia de gravação", client: "all", type: "recording", active: true },
  { id: "3", title: "Post vai ao ar hoje", client: "all", type: "post", active: true },
  { id: "4", title: "Lembrete de stories", client: "all", type: "story", active: false },
];

const typeColors: Record<string, string> = { review: "#FBBF24", recording: "#FF6B6B", post: "#D4FF3F", story: "#7B4DFF" };
const typeLabels: Record<string, string> = { review: "Revisão", recording: "Gravação", post: "Postagem", story: "Stories" };

export default function AdminNotificacoes() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", type: "review", client: "all" });

  useEffect(() => {
    createClient().from("profiles").select("id, name").eq("role", "client").order("name")
      .then(({ data }) => setClients(data ?? []));
  }, []);

  const toggle = (id: string) => setNotifs(notifs.map(n => n.id === id ? { ...n, active: !n.active } : n));

  const create = () => {
    if (!form.title.trim()) return;
    setNotifs([...notifs, { id: Date.now().toString(), ...form, active: true }]);
    setShowNew(false);
    setForm({ title: "", type: "review", client: "all" });
  };

  const clientName = (clientId: string) => {
    if (clientId === "all") return "Todos os clientes";
    return clients.find(c => c.id === clientId)?.name ?? clientId;
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Gerencie alertas automáticos para clientes</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "#7B4DFF", color: "#fff" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Nova notificação
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {notifs.map(n => (
          <div key={n.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38", opacity: n.active ? 1 : 0.5 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${typeColors[n.type]}20` }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[n.type]} strokeWidth="2" strokeLinecap="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{n.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${typeColors[n.type]}20`, color: typeColors[n.type] }}>{typeLabels[n.type]}</span>
                <span className="text-xs" style={{ color: "#6B7280" }}>{clientName(n.client)}</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" checked={n.active} onChange={() => toggle(n.id)} className="sr-only peer"/>
              <div className="w-10 h-6 rounded-full peer transition-all" style={{ background: n.active ? "#D4FF3F" : "#2A2A38" }}>
                <div className="absolute top-1 w-4 h-4 bg-black rounded-full transition-all" style={{ left: n.active ? "calc(100% - 20px)" : "4px" }}/>
              </div>
            </label>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <h3 className="font-bold mb-4">Nova notificação</h3>
            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>TÍTULO</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Post vai ao ar hoje" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}/>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>TIPO</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>CLIENTE</label>
                <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                  <option value="all">Todos os clientes</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: "1px solid #2A2A38" }}>Cancelar</button>
              <button onClick={create} disabled={!form.title.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: "#7B4DFF", color: "#fff" }}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
